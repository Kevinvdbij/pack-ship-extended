import * as RVUtils from "./retailVistaUtils.ts";
import {
	COMPLETED_PARCEL_FIELD_SELECTOR, COMPLETED_PARCEL_SELECTOR, COMPLETED_PARCEL_TITLE_SELECTOR,
	COMPLETED_STEP_DETAIL_SELECTOR, COMPLETED_STEP_ERROR_SELECTOR, COMPLETED_STEP_SELECTOR, PACKING_PORTAL_URL,
	PARCELS_RETURN_HASH, RESERVATION_SUMMARY_SELECTOR
} from "./constants.ts";
import { type ModalReservationDetails, ReservationSearchResponseType } from "./interfaces.ts";
import { getSessionEnvironmentName, isCvpEnvironment } from "./environment.ts";
import { sendHint } from "./cvpBridge.ts";
import { debug } from "./logger.ts";

// One scan, one finished order: the CVP station's product scan, carried from the
// search to the announcement without leaving the page.
//
// At an ordinary workplace the same thing is a walk through four pages -- the
// search, the verification step, the parcels page, the completed screen -- each
// of them pressed through by the extension. Here it is done the way the put wall
// service completes a bin (`put-wall-service/server/portal/packship-driver.ts`):
// the requests behind those pages, made from this one, with the pages read as
// markup and never shown. Nothing navigates, so the next scan can land the
// moment the last one is announced, and the station's screen never changes
// under the operator.
//
// The label prints on the announcement, on the printer of the session's
// environment. On the CVP station that is the bridge's push port, so the label
// is at the machine before this resolves -- which is why the environment is
// checked before the first write, and why nothing is written under any other.
//
// Only an order of one product goes through here, and of that product as many
// units as the workplace lets the machine take in one box (`cvpMaxUnits`). A
// single scan vouches for one item in the operator's hand, so an order of more
// is put to the operator before it is touched -- they count the units onto the
// belt -- and refused when they say no. Anything else is refused before it is
// touched and packed the ordinary way.

export type CvpStep = "search" | "open" | "verify" | "parcel" | "announce";

export interface CvpOrder {
	reservationId: string;
	reservationNumber: string;
	orderReference: string;
	customer: string;
	product: string;
	// How many of the product the order is for.
	units: number;
}

export interface CvpCompleted extends CvpOrder {
	// The carrier's barcodes, read off the result of the announcement.
	trackings: string[];
}

// The order could not go to the machine. `tone` is how the station says it: a
// warning is a scan that does not belong here (a pickup, a multi-line order,
// nothing found); an error is a step that failed.
//
// `parcelsUrl` is set once something has been written: the reservation is part
// way through and the parcels page is where it is finished by hand.
export class CvpRefusal extends Error {
	constructor(
		message: string,
		readonly tone: "warning" | "error" = "warning",
		readonly order?: CvpOrder,
		readonly parcelsUrl?: string,
	) {
		super(message);
	}
}

export interface CvpCompletionOptions {
	// Reservation numbers this station has already failed on. A reservation that
	// stopped half way is still listed for its product, and would otherwise be
	// picked again by the next scan of the same thing and fail again.
	skip: ReadonlySet<string>;
	// The most units of the product an order may be for (`cvpMaxUnits`).
	maxUnits: number;
	onStep: (step: CvpStep, order?: CvpOrder) => void;
	// Asked for an order of more than one unit, before anything is written:
	// whether the operator has put that many on the belt. No refuses the order
	// with nothing touched.
	confirmUnits: (order: CvpOrder) => Promise<boolean>;
}

// Ordinary portal pages, as the rest of the extension allows them.
const REQUEST_TIMEOUT_MS = 30_000;

// The announcement is a call to the carrier: measured at 12.5 s for one parcel
// on the test portal, nearly all of it the carrier.
const ANNOUNCE_TIMEOUT_MS = 90_000;

const parser = new DOMParser();

export async function completeSingleLine(barcode: string, options: CvpCompletionOptions): Promise<CvpCompleted> {
	options.onStep("search");

	const opened = await findOrder(barcode, options.skip, options.maxUnits);
	const { order } = opened;

	options.onStep("open", order);

	const parcelsUrl = `${PACKING_PORTAL_URL}/Parcels?reservationId=${encodeURIComponent(order.reservationId)}`
		+ "&allowCashOnDelivery=False";

	// Refusals from here on carry the order, and once something has been
	// written, the way back into it.
	let written = false;
	const refuse = (message: string, tone: "warning" | "error" = "error") =>
		new CvpRefusal(message, tone, order, written ? parcelsUrl + PARCELS_RETURN_HASH : undefined);

	try {
		// Read before the first write: the label prints under the session's
		// environment, and the one place this page can still say no is here.
		assertCvpEnvironment(opened.page, refuse);

		// The scan stands for one item. For more, the operator's count is the
		// only thing that ties the label to what is on the belt.
		if (order.units > 1 && !await options.confirmUnits(order)) {
			throw refuse(`${order.reservationNumber} is niet naar de CVP gestuurd. Pak de order met de hand.`, "warning");
		}

		RVUtils.setLastOpenReservation({ id: order.reservationId, number: order.reservationNumber });

		const details = RVUtils.getReservationDetailsFromOverview(overviewOf(opened.page));

		if (details) {
			RVUtils.cacheReservationDetails(details);
		}

		// The verification step: every row ticked and the whole form posted to
		// Update, as `skipVerification` does on the page. The first write.
		options.onStep("verify", order);

		const verification = overviewOf(opened.page);

		verification.querySelectorAll<HTMLInputElement>("input[id^='ReservationRowsNotInCarriers_'][id$='__Collected']")
			.forEach((collected) => collected.value = "true");

		written = true;

		let page = await portalPage(`${PACKING_PORTAL_URL}/Reservations/Update`, "De verificatie",
			{ method: "POST", body: formBody(verification) });

		if (page.querySelector("#ReservationId")?.getAttribute("value") != order.reservationId
			|| !page.querySelector("#ParcelsContainer")) {
			throw refuse(`De verificatie van ${order.reservationNumber} kwam niet uit op de pakketpagina.`);
		}

		assertCvpEnvironment(page, refuse);

		if (readParcels(page).some((parcel) => parcel.announced || parcel.barcode)) {
			throw refuse(`Een pakket van ${order.reservationNumber} is al aangemeld. Rond de order af in Pack & Ship.`);
		}

		options.onStep("parcel", order);

		page = await shapeOneEmptyParcel(page, order, parcelsUrl, refuse);
		page = await fillParcel(page, order, refuse);

		options.onStep("announce", order);

		const result = await announce(page, order, refuse);

		RVUtils.setLastCompletedReservation({ id: order.reservationId, number: order.reservationNumber });
		RVUtils.recordCompletedReservation({
			id: order.reservationId,
			number: order.reservationNumber,
			completedAt: Date.now(),
			customer: order.customer,
			parcels: result.parcels,
			failed: result.failure != undefined,
		});

		if (result.failure) {
			throw refuse(`Aanmelden van ${order.reservationNumber} geweigerd: ${result.failure}`);
		}

		return { ...order, trackings: result.trackings };
	} catch (error) {
		if (error instanceof CvpRefusal) {
			throw error;
		}

		console.error(`Pack&Ship Extended could not complete ${order.reservationNumber} for the CVP.`, error);

		throw refuse(error instanceof Error ? error.message : String(error));
	}
}

// ---- Finding the order ----

interface OpenedOrder {
	order: CvpOrder;
	// The verification screen, `Reservations/Index/<id>`, as served.
	page: Document;
}

async function findOrder(barcode: string, skip: ReadonlySet<string>, maxUnits: number): Promise<OpenedOrder> {
	let answer = await portalPage(`${PACKING_PORTAL_URL}/Reservations/Search?${searchQuery(barcode)}`,
		"De zoekopdracht");

	// A reservation in an unfinished picking run is answered with the run. It is
	// finished off and the question put again, once, as the search screen does.
	if (RVUtils.evaluateSearchResponse(answer.body) == ReservationSearchResponseType.UnfinishedRun) {
		await RVUtils.handleUnfinishedRun(answer.body);

		answer = await portalPage(`${PACKING_PORTAL_URL}/Reservations/Search?${searchQuery(barcode)}`,
			"De zoekopdracht");
	}

	switch (RVUtils.evaluateSearchResponse(answer.body)) {
		case ReservationSearchResponseType.ContinueVerification: {
			// One reservation with this product, answered with its verification
			// screen straight away.
			const verdict = judge(answer, "", maxUnits);

			if (typeof verdict == "string") {
				throw new CvpRefusal(verdict);
			}

			if (skip.has(verdict.order.reservationNumber)) {
				throw new CvpRefusal(`${verdict.order.reservationNumber} is hier al eens mislukt. Rond hem af in Pack & Ship.`);
			}

			return verdict;
		}

		case ReservationSearchResponseType.SelectionModal:
			return pickFromList(answer, skip, maxUnits);

		case ReservationSearchResponseType.UnfinishedRun:
			throw new CvpRefusal("De raapronde van deze reservering kon niet worden afgerond. Rond hem af in RetailVista.",
				"error");

		default: {
			const alert = alertText(answer);

			throw new CvpRefusal(alert || "Geen open order met dit product.");
		}
	}
}

// The portal's list of reservations with this product. Its single-line group is
// where a CVP order is -- with the extension's own addition of one product plus
// shipping costs, see `retrieveModalData` -- and the first of those that turns
// out to be few enough units and not a collection order is the one.
//
// That addition only moves an order of one unit. An order of several of the
// product plus shipping costs stays in the valid group, so with the station
// taking more than one unit those are candidates as well. The fewest units go
// first: an operator with one item in their hand is far more often holding a
// one-unit order than a part of a larger one, and is then not asked to count.
async function pickFromList(answer: Document, skip: ReadonlySet<string>, maxUnits: number): Promise<OpenedOrder> {
	const list = RVUtils.retrieveModalData(answer.body);

	const physical = (reservation: ModalReservationDetails) => reservation.products
		.filter((product) => !/verzendkosten/i.test(product.description));
	const listedUnits = (reservation: ModalReservationDetails) => physical(reservation)
		.reduce((sum, product) => sum + quantity(product.amount), 0);

	const singleProduct = [
		...list.singleLineReservations,
		...(maxUnits > 1 ? list.validReservations.filter((reservation) => physical(reservation).length == 1) : []),
	];

	const candidates = singleProduct
		.filter((reservation) => reservation.url && !skip.has(String(reservation.reservationNumber)))
		.sort((first, second) => listedUnits(first) - listedUnits(second));

	if (candidates.length == 0) {
		if (singleProduct.length > 0) {
			throw new CvpRefusal("De orders met dit product zijn hier al eens mislukt, of nog niet volledig geraapt.");
		}

		throw new CvpRefusal(list.validReservations.length + list.invalidReservations.length > 0
			? "Dit product staat alleen in orders met meer artikelen. Die gaan niet over de CVP."
			: "Geen open order met dit product.");
	}

	const reasons: string[] = [];

	for (const candidate of candidates) {
		const page = await portalPage(candidate.url, "Het openen van de reservering");
		const verdict = judge(page, candidate.saleOrderReference, maxUnits);

		if (typeof verdict != "string") {
			return verdict;
		}

		debug(`CVP: passing over ${candidate.reservationNumber}:`, verdict);
		reasons.push(verdict);
	}

	// Every one of them was passed over. When they were all passed over for the
	// same reason, that reason is the answer.
	const distinct = [...new Set(reasons)];

	throw new CvpRefusal(distinct.length == 1 ? distinct[0] : "Geen order met dit product kan over de CVP.");
}

// Whether a verification screen is an order for the machine. The order when it
// is, the reason it is not otherwise.
function judge(page: Document, orderReference: string, maxUnits: number): OpenedOrder | string {
	const overview = page.querySelector<HTMLFormElement>("#ReservationOverview");

	if (!overview) {
		// "Reservering ... is nog niet volledig geraapt en mag nog niet verstuurd
		// worden", most often.
		return alertText(page) || "De reservering kon niet worden geopend.";
	}

	const details = RVUtils.getReservationDetailsFromOverview(overview);
	const physical = (details?.products ?? []).filter((product) => !/verzendkosten/i.test(product.description));
	const units = physical.reduce((sum, product) => sum + product.requiredQuantity, 0);

	if (physical.length != 1) {
		return "Dit product staat alleen in orders met meer artikelen. Die gaan niet over de CVP.";
	}

	if (units < 1) {
		return "De reservering noemt geen aantal voor dit product.";
	}

	if (units > maxUnits) {
		return maxUnits == 1
			? `Deze order is voor ${units} stuks. Op deze CVP gaan alleen orders van één stuk.`
			: `Deze order is voor ${units} stuks. Op deze CVP gaan orders van ten hoogste ${maxUnits}.`;
	}

	if (RVUtils.isStorePickup(RVUtils.getCurrentTransport(page))) {
		return "Dit is een afhaalorder. Die gaat niet over de CVP.";
	}

	return {
		page,
		order: {
			reservationId: page.querySelector("#ReservationId")?.getAttribute("value") ?? "",
			reservationNumber: details!.id,
			orderReference: orderReference || readOrderReference(page),
			customer: RVUtils.getCurrentCustomerName(page),
			product: physical[0].description,
			units,
		},
	};
}

// The search, asked the way the search screen asks it: the portal's own form for
// whatever it carries, with the barcode set and the number left empty.
function searchQuery(barcode: string): string {
	const params = new URLSearchParams();
	const form = document.querySelector<HTMLFormElement>("#frmReservations");

	if (form) {
		for (const [key, value] of new FormData(form)) {
			if (typeof value == "string") {
				params.append(key, value);
			}
		}
	}

	params.set(document.querySelector<HTMLInputElement>("#Productbarcode")?.name || "Productbarcode", barcode);
	params.set(document.querySelector<HTMLInputElement>("#ReservationNumber")?.name || "ReservationNumber", "");

	return params.toString();
}

// ---- The parcels page ----

interface PageParcel {
	index: number;
	itemId: string;
	announced: boolean;
	barcode: string;
}

interface PageItem {
	parcel: number;
	index: number;
	amount: number;
}

// The parcels, off the hidden `Items[n].*` inputs. Right on a page served fresh;
// after a parcel is deleted they are not (see `src/parcelArea.ts`), which is why
// every delete and create below is followed by a plain GET of the page rather
// than by the portal's `refresh()`.
function readParcels(page: Document): PageParcel[] {
	const fields = new Map<number, Record<string, string>>();

	for (const input of page.querySelectorAll<HTMLInputElement>("input[name^='Items[']")) {
		const match = input.name.match(/^Items\[(\d+)\]\.(\w+)$/);

		if (match) {
			const index = Number(match[1]);

			fields.set(index, { ...fields.get(index), [match[2]]: input.value.trim() });
		}
	}

	return [...fields.entries()]
		.filter(([, parcel]) => parcel.ItemId != undefined)
		.sort(([first], [second]) => first - second)
		.map(([index, parcel]) => ({
			index,
			itemId: parcel.ItemId,
			announced: /^true$/i.test(parcel.Announced ?? ""),
			barcode: parcel.Barcode ?? "",
		}));
}

// What has been put into the parcels so far.
function readItems(page: Document): PageItem[] {
	const items: PageItem[] = [];

	for (const input of page.querySelectorAll<HTMLInputElement>("input[name^='Items['][name$='].Amount']")) {
		const match = input.name.match(/^Items\[(\d+)\]\.Items\[(\d+)\]\.Amount$/);
		const amount = quantity(input.value);

		if (match && amount > 0) {
			items.push({ parcel: Number(match[1]), index: Number(match[2]), amount });
		}
	}

	return items;
}

// Exactly one parcel with nothing in it, whatever an earlier attempt or somebody
// at another station left on the page: the items taken out, a parcel too many
// deleted, a missing one created.
async function shapeOneEmptyParcel(page: Document, order: CvpOrder, parcelsUrl: string,
	refuse: (message: string) => CvpRefusal): Promise<Document> {
	// Each round sets every item that is left to 0, so a portal that takes one
	// per update still gets there.
	const leftovers = readItems(page).length;

	for (let round = 0; readItems(page).length > 0; round++) {
		if (round >= leftovers) {
			throw refuse(`De artikelen in de pakketten van ${order.reservationNumber} gaan er niet uit.`);
		}

		const items = readItems(page);

		page = await postParcelForm(page, "Update", refuse, (form) => {
			for (const item of items) {
				setField(form, `Items[${item.parcel}].Items[${item.index}].Amount`, "0");
				setField(form, `Items[${item.parcel}].Items[${item.index}].Active`, "True");
			}
		});
	}

	const surplus = readParcels(page).slice(1).reverse();

	for (const parcel of surplus) {
		const response = await portalFetch(
			`${PACKING_PORTAL_URL}/Parcels/Delete?itemId=${encodeURIComponent(parcel.itemId)}`,
			"Een pakket verwijderen", { method: "DELETE" });

		if (!response.ok) {
			throw refuse(`Een pakket van ${order.reservationNumber} verwijderen gaf HTTP ${response.status}.`);
		}
	}

	if (surplus.length > 0) {
		page = await portalPage(parcelsUrl, "De pakketpagina");
	}

	if (readParcels(page).length == 0) {
		// The "Pakket toevoegen" tab: `newParcel(reservationId, parcelServiceId,
		// parcelServiceCarrierId, cashOnDelivery)`, which the dialog is asked with.
		const add = (page.querySelector("#add-parcel")?.getAttribute("href") ?? "")
			.match(/newParcel\(\s*\d+\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(true|false)\s*\)/i);

		if (!add) {
			throw refuse(`De pakketpagina van ${order.reservationNumber} heeft geen pakket en geen manier om er een te maken.`);
		}

		const query = new URLSearchParams({
			reservationId: order.reservationId,
			parcelServiceId: add[1],
			parcelServiceCarrierId: add[2],
			cashOnDelivery: add[3].toLowerCase(),
		});

		const dialog = await portalPage(`${PACKING_PORTAL_URL}/Parcels/Create?${query}`, "Een pakket maken");
		const parcelForm = dialog.querySelector<HTMLFormElement>("#parcelForm");

		if (!parcelForm) {
			throw refuse(`Een pakket maken voor ${order.reservationNumber} gaf geen formulier.`);
		}

		const saved = await portalFetch(`${PACKING_PORTAL_URL}/Parcels/Edit`, "Het pakket opslaan",
			{ method: "POST", body: formBody(parcelForm) });

		if (!saved.ok) {
			throw refuse(`Een pakket opslaan voor ${order.reservationNumber} gaf HTTP ${saved.status}.`);
		}

		page = await portalPage(parcelsUrl, "De pakketpagina");
	}

	const parcels = readParcels(page);

	if (parcels.length != 1 || readItems(page).length > 0) {
		throw refuse(`De pakketpagina van ${order.reservationNumber} heeft ${parcels.length} pakketten en `
			+ `${readItems(page).length} artikelen erin, verwacht één leeg pakket.`);
	}

	return page;
}

// The order's units into the one parcel, where the portal wants products scanned
// into parcels at all (`SpecifyProductsInReservationParcels`). A scan lands in the
// parcel whose tab is open, which the page keeps in `Items[n].Active`.
//
// One `VerifyProduct` per unit, as the page's script posts one per scan -- unless
// the portal answers the first with a question for the amount, which is then
// answered with all of them. The put wall fills its bins the same way
// (`packship-driver.ts`); with more than one unit neither path has been watched
// on a portal, and the count afterwards is what catches either going wrong.
async function fillParcel(page: Document, order: CvpOrder,
	refuse: (message: string) => CvpRefusal): Promise<Document> {
	const specify = page.querySelector<HTMLInputElement>("input[name='SpecifyProductsInReservationParcels']");

	if (!/^true$/i.test(specify?.value ?? "")) {
		return page;
	}

	const row = RVUtils.getVerificationRows(page)
		.find((candidate) => !/verzendkosten/i.test(candidate.description));

	if (!row?.mainBarcode) {
		throw refuse(`De pakketpagina van ${order.reservationNumber} noemt het product niet.`);
	}

	const parcel = readParcels(page)[0];

	for (let unit = 0; unit < order.units; unit++) {
		page = await postParcelForm(page, "VerifyProduct", refuse, (form) => {
			setField(form, `Items[${parcel.index}].Active`, "True");

			const scan = form.querySelector<HTMLInputElement>("#productBarcode");

			if (scan) {
				scan.value = row.mainBarcode;
			}
		});

		// The portal asks how many instead of taking a scan per unit. The total
		// is sent, as the put wall does: whether it means the total or the rest
		// is not seen, and the count below catches the wrong reading.
		if (page.querySelector("#VerificationAmount")) {
			page = await postParcelForm(page, "VerifyProductAmount", refuse, (form) => {
				setField(form, `Items[${parcel.index}].Active`, "True");

				const amount = form.querySelector<HTMLInputElement>("#VerificationAmount");

				if (amount) {
					amount.value = String(order.units);
				}
			});

			break;
		}
	}

	const inParcel = readItems(page).reduce((sum, item) => sum + item.amount, 0);

	if (inParcel != order.units) {
		throw refuse(`Na het scannen zitten er ${inParcel} artikelen in het pakket van ${order.reservationNumber}, `
			+ `verwacht ${order.units}.`);
	}

	return page;
}

interface Announced {
	trackings: string[];
	parcels: number;
	// The steps the portal marked as failed, in its own words. The carrier can
	// refuse, and then there is a parcel without a label.
	failure?: string;
}

// "Pakketten aankondigen": a GET of `CompleteReservations`, which announces the
// parcel, prints its label and closes the reservation. The result page's own
// button only goes back to the search.
async function announce(page: Document, order: CvpOrder, refuse: (message: string) => CvpRefusal): Promise<Announced> {
	const container = page.querySelector("#ParcelsContainer");

	const button = Array.from(container?.querySelectorAll("button, a") ?? [])
		.find((element) => /\/CompleteReservations\?/.test(element.getAttribute("onclick") ?? element.getAttribute("href") ?? ""));

	const target = (button?.getAttribute("onclick") ?? button?.getAttribute("href") ?? "")
		.match(/['"]([^'"]*\/CompleteReservations\?[^'"]*)['"]/)?.[1];

	if (!button || !target) {
		throw refuse(`De pakketpagina van ${order.reservationNumber} heeft geen knop om aan te kondigen.`);
	}

	if (button.hasAttribute("disabled")) {
		throw refuse(`Pack & Ship laat ${order.reservationNumber} nog niet aankondigen.`);
	}

	// Ahead of the label, so the bridge can put the order on the machine's screen.
	await sendHint({
		reservation: order.reservationNumber,
		order: order.orderReference,
		customerName: order.customer,
	});

	const result = await portalPage(new URL(target, PACKING_PORTAL_URL).href, "Het aankondigen",
		undefined, ANNOUNCE_TIMEOUT_MS);

	if (!result.querySelector("#ReservationContainer")) {
		throw refuse(`Het resultaat van aankondigen voor ${order.reservationNumber} is niet te lezen. Kijk in Pack & Ship.`);
	}

	const failures = Array.from(result.querySelectorAll(COMPLETED_STEP_SELECTOR))
		.filter((step) => step.querySelector(COMPLETED_STEP_ERROR_SELECTOR))
		.map((step) => {
			const detail = text(step.querySelector(COMPLETED_STEP_DETAIL_SELECTOR));
			const scope = step.cloneNode(true) as Element;

			scope.querySelectorAll(`${COMPLETED_STEP_DETAIL_SELECTOR}, .material-icons`).forEach((part) => part.remove());

			return [text(scope), detail].filter(Boolean).join(": ");
		});

	const cards = Array.from(result.querySelectorAll(COMPLETED_PARCEL_SELECTOR));

	// "Barcode: 3SKRDN0004712", a cell of its own on the parcel's card.
	const trackings = cards
		.map((card) => Array.from(card.querySelectorAll(`${COMPLETED_PARCEL_TITLE_SELECTOR}, ${COMPLETED_PARCEL_FIELD_SELECTOR}`))
			.map((cell) => text(cell).match(/^barcode:\s*(\S+)$/i)?.[1])
			.find(Boolean))
		.filter((tracking): tracking is string => Boolean(tracking));

	return {
		trackings,
		parcels: cards.length,
		failure: failures.length > 0 ? failures.join("; ") : undefined,
	};
}

// Posts the parcels page's form to one of the parcel routes and puts the answer
// where the portal's own script puts it: in `#ParcelsContainer`. An alert in the
// answer is the portal saying no -- a barcode it would not place, most often.
async function postParcelForm(page: Document, route: string, refuse: (message: string) => CvpRefusal,
	fill: (form: HTMLFormElement) => void): Promise<Document> {
	const form = overviewOf(page);

	fill(form);

	const response = await portalFetch(`${PACKING_PORTAL_URL}/Parcels/${route}`, "De pakketpagina",
		{ method: "POST", body: formBody(form) });

	const answer = await response.text();

	if (!response.ok) {
		throw refuse(`Parcels/${route} gaf HTTP ${response.status}.`);
	}

	const container = page.querySelector("#ParcelsContainer");

	if (!container) {
		throw refuse("De pakketpagina is haar pakketten kwijt.");
	}

	container.innerHTML = answer;

	const alert = container.querySelector("#alert");

	if (alert) {
		throw refuse(`De portal weigerde het: ${text(alert).replace(/^×\s*/, "")}`);
	}

	return page;
}

// ---- Reading and writing ----

function assertCvpEnvironment(page: Document, refuse: (message: string, tone?: "warning" | "error") => CvpRefusal) {
	const environment = getSessionEnvironmentName(page);

	// A page without the picker says nothing either way; the station was only
	// opened because the session is on the CVP environment.
	if (environment && !isCvpEnvironment(environment)) {
		throw refuse(`De sessie staat op omgeving "${environment}": het label zou daar printen. Ververs de pagina.`);
	}
}

function overviewOf(page: Document): HTMLFormElement {
	const form = page.querySelector<HTMLFormElement>("#ReservationOverview");

	if (!form) {
		throw new CvpRefusal("De pagina van de reservering is niet te lezen.", "error");
	}

	return form;
}

function setField(form: HTMLFormElement, name: string, value: string) {
	const input = form.querySelector<HTMLInputElement>(`input[name='${name}']`);

	if (input) {
		input.value = value;
	}
}

// A form as the portal's jQuery `serialize()` would send it.
function formBody(form: HTMLFormElement): URLSearchParams {
	const body = new URLSearchParams();

	for (const [key, value] of new FormData(form)) {
		if (typeof value == "string") {
			body.append(key, value);
		}
	}

	return body;
}

async function portalPage(url: string, what: string, init?: RequestInit, timeout = REQUEST_TIMEOUT_MS): Promise<Document> {
	const response = await portalFetch(url, what, init, timeout);

	if (!response.ok) {
		throw new CvpRefusal(`${what} gaf HTTP ${response.status}.`, "error");
	}

	return parser.parseFromString(await response.text(), "text/html");
}

// One request to the portal, from this page's session. A request that ends on
// the login page has found no session: the sign-in is the operator's.
async function portalFetch(url: string, what: string, init?: RequestInit, timeout = REQUEST_TIMEOUT_MS): Promise<Response> {
	let response: Response;

	try {
		response = await fetch(url, { cache: "no-store", ...init, signal: AbortSignal.timeout(timeout) });
	} catch (error) {
		console.error(`Pack&Ship Extended: ${what} failed.`, error);

		throw new CvpRefusal(`${what} lukte niet: de portal reageert niet.`, "error");
	}

	if (/\/Identity\/Account\/Login/i.test(response.url)) {
		throw new CvpRefusal("De sessie van Pack & Ship is verlopen. Log opnieuw in.", "error");
	}

	return response;
}

function alertText(page: Document): string {
	return Array.from(page.querySelectorAll(".alert"))
		.map((alert) => {
			const copy = alert.cloneNode(true) as Element;

			copy.querySelectorAll("button").forEach((button) => button.remove());

			return text(copy);
		})
		.filter(Boolean)
		.join(" ");
}

// The order reference, from the summary block, for a reservation the search
// answered on its own rather than in a list that carried it.
function readOrderReference(page: Document): string {
	return text(page.querySelector(`${RESERVATION_SUMMARY_SELECTOR} > div:nth-child(3)`)).split(" ")[2] ?? "";
}

// "1", "8,000" -- how the portal writes quantities.
function quantity(value: string): number {
	return Number(value.split(",")[0]) || 0;
}

function text(element: Element | null | undefined): string {
	return (element?.textContent ?? "").replace(/\s+/g, " ").trim();
}
