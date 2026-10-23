import { GM_deleteValue, GM_getValue, GM_setValue } from "$";
import {
	BIN_CODE_PATTERN, binLabel, binParcelsKey, PACKING_PORTAL_URL, PARCEL_CONTAINER_SELECTOR, PARCEL_TABS_SELECTOR,
	PARCELS_ANNOUNCE_BUTTON_SELECTOR
} from "./constants.ts";
import * as RVUtils from "./retailVistaUtils.ts";
import { claimBin, unclaimBin } from "./putWall.ts";
import { switchSessionEnvironment } from "./environment.ts";
import {
	getRenderedParcels, isParcelFormStale, isRepairingParcelArea, parcelAreaSettled, parcelExists
} from "./parcelArea.ts";
import { toast } from "./vue/toast.ts";
import { playSound } from "./sounds.ts";
import { debug } from "./logger.ts";
import Settings from "./settings.ts";

// Bins for the CVP, on the parcels page.
//
// An order with a product that already has its own shipping box is split at the
// manual station: the boxed product gets a label here, and the rest goes into a
// put wall bin and on to the CVP-500. The portal announces a reservation once,
// every parcel together, so the split is made in its parcels: a bin is a portal
// parcel like any other, and what makes it a bin is this record of which parcel
// it is.
//
// Scanning a `BK` code is how a bin is added. The put wall hands it out -- it
// owns the bins and knows which are in use -- and a portal parcel is created for
// it, which the rest of the order is then scanned into. The announcement runs
// under the NOPRINT environment, so nothing prints there; the completed screen
// sends each label to where its parcel is going. See `src/binLabels.ts`.
//
// The record is kept outside the page, because nothing of ours survives inside
// the parcel area -- the portal's `refresh()` replaces it after every scan --
// and because the completed screen, a page later, is where it is read.

export interface BinParcel {
	bin: string;
	// The portal parcel the bin is, by its own id: the one the parcels form
	// carries as `Items[n].ItemId` and the ERP's label dialog lists.
	parcelId: string;
}

export interface BinRecord {
	reservationNumber: string;
	bins: BinParcel[];
	// Every parcel of the reservation, as it stood when the announcement was
	// pressed. The completed screen names its parcels by number and the ERP by
	// id; this is what turns one into the other.
	parcels: Array<{ id: string; number: string }>;
	// How far the labels have got, so a completed screen that is reloaded does
	// not print a second label or tell the wall twice.
	printed: string[];
	reported: string[];
}

export function getBinRecord(reservationId: string): BinRecord | undefined {
	return GM_getValue<BinRecord | undefined>(binParcelsKey(reservationId), undefined);
}

export function saveBinRecord(reservationId: string, record: BinRecord) {
	GM_setValue(binParcelsKey(reservationId), record);
}

export function clearBinRecord(reservationId: string) {
	GM_deleteValue(binParcelsKey(reservationId));
}

function emptyRecord(reservationNumber: string): BinRecord {
	return { reservationNumber, bins: [], parcels: [], printed: [], reported: [] };
}

// ---- The parcels page ----

const SCAN_INPUT = "#productBarcode";
const SCAN_BUTTON = "#verifyProduct";

// Ours inside the portal's tab strip. Put back after every refresh, since the
// strip is replaced with everything else in the parcel area.
const BIN_TAB_CLASS = "pse-bin-tab";
const BIN_CODE_CLASS = "pse-bin-code";
const BIN_DIVIDER_CLASS = "pse-bin-divider";
const BIN_HINT_CLASS = "pse-bin-hint";

// What the scan field says while bins are on: it takes both, and a bin is
// added by nothing else than scanning it.
const SCAN_PLACEHOLDER = "Scan een artikel of bak";
const BIN_CARD_CLASS = "pse-bin-card";
const BIN_NOTE_CLASS = "pse-bin-note";

// How long a new parcel may take to appear after it has been saved. The portal
// answers a refresh in well under a second; this is the far end of a slow one.
const NEW_PARCEL_TIMEOUT_MS = 10_000;

// How long a bin that could not be handed back waits before it is tried again.
// Every redraw of the parcel area looks for deleted bins, and a put wall that is
// down should not be asked -- or complained about -- on every scan.
const HAND_BACK_RETRY_MS = 30_000;

// Looking for deleted bins again after the parcel area has been put right.
const RECHECK_PAUSE_MS = 250;
const RECHECK_LIMIT = 20;

export interface BinsHandle {
	// Whether a bin is being added. The automatic announcement waits for it:
	// announcing in the middle would leave a claimed bin with no parcel.
	busy(): boolean;
}

// Everything bins do on the parcels page. Nothing at all unless bins are
// switched on for this workplace -- not a tab, not a listener -- so a station
// that does not use them packs exactly as it did.
//
// Switched on is enough for the row to show. Whether the set-up behind it is
// complete is checked when a bin is asked for, and said then: a row that only
// appears once every field is right gives no hint which one is not.
export function armBins(): BinsHandle {
	if (!Settings.binsEnabled) {
		return { busy: () => false };
	}

	const reservationId = RVUtils.getCurrentReservationId();
	const reservationNumber = RVUtils.getCurrentReservationNumber();

	if (!reservationId || RVUtils.isMassCompleteReservation(reservationNumber)) {
		return { busy: () => false };
	}

	let adding = false;
	// Set once the session is on the NOPRINT environment, so the press that is
	// replayed after the switch goes through rather than being caught again.
	let announcing = false;

	// Bins whose parcel has gone missing and are being checked and handed back,
	// so a redraw during that does not start a second hand-back of the same bin.
	const handingBack = new Map<string, Promise<void>>();
	// When a hand-back last failed, per bin.
	const handBackFailedAt = new Map<string, number>();
	// Whether a look for deleted bins is waiting for the area to settle, and how
	// many times in a row it has had to.
	let recheckQueued = false;
	let rechecks = 0;

	const record = () => getBinRecord(reservationId) ?? emptyRecord(reservationNumber);

	// ---- Scans ----
	//
	// A `BK` code in the portal's scan field is a bin, not a product. Caught on
	// the document in the capture phase, ahead of the portal's own handlers --
	// its Enter handler on the field and its click handler on the Scan button,
	// either of which would post the code as a product and answer that no
	// product has that barcode.
	const takeBinScan = (event: Event) => {
		const input = document.querySelector<HTMLInputElement>(SCAN_INPUT);
		const code = input?.value.trim().toUpperCase() ?? "";

		if (!BIN_CODE_PATTERN.test(code)) {
			return;
		}

		event.preventDefault();
		event.stopImmediatePropagation();

		input!.value = "";

		void addBin(code);
	};

	document.addEventListener("keypress", (event) => {
		if (event.key == "Enter" && event.target == document.querySelector(SCAN_INPUT)) {
			takeBinScan(event);
		}
	}, true);

	document.addEventListener("click", (event) => {
		if ((event.target as Element | null)?.closest?.(SCAN_BUTTON)) {
			takeBinScan(event);
		}
	}, true);

	// False, with the reason on screen, when the set-up is not complete.
	function readyForBins(): boolean {
		const missing = Settings.binsMissing();

		if (missing.length == 0) {
			return true;
		}

		playSound("warning");
		toast.error(`Bakken zijn nog niet ingesteld. Vul in bij Instellingen: ${missing.join(", ")}.`);

		return false;
	}

	async function addBin(code: string) {
		if (!readyForBins()) {
			return;
		}

		if (adding) {
			toast.info("Er wordt al een bak toegevoegd.");

			return;
		}

		await parcelAreaSettled();

		const existing = record().bins.find((entry) => entry.bin == code);

		if (existing) {
			// The same bin again: the packer is going back to it, which is the
			// tab being opened rather than a second parcel.
			if (getRenderedParcels().some((parcel) => parcel.id == existing.parcelId)) {
				showParcel(existing.parcelId);

				return;
			}

			// Its parcel is gone. Settled first -- handed back if it really is
			// deleted -- so the claim below starts from the wall's own answer.
			await handBack(existing);

			if (record().bins.some((entry) => entry.bin == code)) {
				toast.error(`${binLabel(code)} hoort nog bij een pakket dat niet meer te zien is. Laad de pagina opnieuw.`);

				return;
			}
		}

		adding = true;
		RVUtils.setBusy(true);

		try {
			await claimBin(code, {
				reservationId: Number(reservationId),
				reservationNumber: Number(reservationNumber),
				orderReference: RVUtils.getCurrentOrderNumber() ?? "",
				customer: RVUtils.getCurrentCustomerName(),
			});
		} catch (error) {
			adding = false;
			RVUtils.setBusy(false);
			playSound("warning");
			toast.error((error as Error).message);

			return;
		}

		try {
			const parcelId = await createParcel();
			const current = record();

			current.bins.push({ bin: code, parcelId });
			saveBinRecord(reservationId, current);

			debug(`Bin ${code} is parcel ${parcelId}`);

			decorate();
			showParcel(parcelId);
			playSound("success");
			toast.success(`${binLabel(code)} toegevoegd. Scan wat erin gaat.`);
		} catch (error) {
			console.error("Pack&Ship Extended could not add a parcel for the bin.", error);
			playSound("error");
			toast.error(`Er kon geen pakket voor ${binLabel(code)} gemaakt worden.`);

			// Handed back, so the bin is not left in use for a parcel that does
			// not exist.
			unclaimBin(code, Number(reservationId)).catch((unclaimError) =>
				console.error("Pack&Ship Extended could not hand the bin back.", unclaimError));
		} finally {
			adding = false;
			RVUtils.setBusy(false);
			RVUtils.focusBarcodeInput(SCAN_INPUT);
		}
	}

	// ---- The parcel area ----
	//
	// Bins are drawn into the portal's own tab strip: they are its parcels, and
	// the tab is what decides where the next scan lands -- the portal posts the
	// whole form and fills the parcel whose tab is active. So a bin is a tab
	// like any other, set apart after the portal's own add button, with its
	// number on it -- and after the bins, how to add one: scanning it. There is
	// no button for it, because a bin cannot be added without its barcode.
	//
	// Idempotent, because it answers its own changes: the observer that calls it
	// sees what it did, calls it again, and that pass has to find nothing to do.
	function decorate() {
		const tabs = document.querySelector(PARCEL_TABS_SELECTOR);

		if (!tabs || tabs.childElementCount == 0) {
			return;
		}

		const current = record();

		lookForDeletedBins(current);

		let divider = tabs.querySelector<HTMLElement>(`.${BIN_DIVIDER_CLASS}`);

		if (!divider) {
			divider = document.createElement("li");
			divider.className = `nav-item ${BIN_DIVIDER_CLASS}`;
			divider.setAttribute("role", "presentation");
			divider.textContent = "Bakken";
		}

		let hint = tabs.querySelector<HTMLElement>(`.${BIN_HINT_CLASS}`);

		if (!hint) {
			hint = document.createElement("li");
			hint.className = `nav-item ${BIN_HINT_CLASS}`;
			hint.setAttribute("role", "presentation");
			hint.innerHTML = '<span class="material-icons" aria-hidden="true">qr_code_scanner</span>'
				+ "Scan een bak om hem toe te voegen";
		}

		const input = document.querySelector<HTMLInputElement>(SCAN_INPUT);

		if (input && input.placeholder != SCAN_PLACEHOLDER) {
			input.placeholder = SCAN_PLACEHOLDER;
		}

		// The order the strip should end in: the portal's parcels and its add
		// button, then the bins and the hint. Only moved when out of place, so
		// the pass that follows a move finds nothing to move.
		const binItems = current.bins
			.map((entry) => markBinTab(entry))
			.filter((item): item is HTMLElement => Boolean(item));
		const wanted = [divider, ...binItems, hint];
		const tail = Array.from(tabs.children).slice(-wanted.length);

		if (wanted.some((item, index) => tail[index] != item)) {
			tabs.append(...wanted);
		}

		for (const entry of current.bins) {
			markBinCard(entry);
		}
	}

	function markBinTab(entry: BinParcel): HTMLElement | null {
		const tab = document.querySelector<HTMLElement>(`#parcel-nav-${entry.parcelId}`);

		if (!tab) {
			return null;
		}

		if (!tab.classList.contains(BIN_TAB_CLASS)) {
			tab.classList.add(BIN_TAB_CLASS);
		}

		if (!tab.querySelector(`.${BIN_CODE_CLASS}`)) {
			const code = document.createElement("span");

			code.className = BIN_CODE_CLASS;
			code.textContent = binLabel(entry.bin);
			tab.append(code);
		}

		return tab.closest("li");
	}

	function markBinCard(entry: BinParcel) {
		const pane = document.querySelector(`#parcels-content-${entry.parcelId}`);
		const card = pane?.querySelector(".card");
		const title = card?.querySelector(".card-header .card-title");

		if (!card || !title) {
			return;
		}

		if (!card.classList.contains(BIN_CARD_CLASS)) {
			card.classList.add(BIN_CARD_CLASS);
		}

		if (!card.querySelector(`.${BIN_NOTE_CLASS}`)) {
			const note = document.createElement("div");

			note.className = `card-text ${BIN_NOTE_CLASS}`;
			note.textContent = `${binLabel(entry.bin)} · label naar de CVP`;
			title.insertAdjacentElement("afterend", note);
		}
	}

	// A bin whose parcel is gone was deleted with the portal's own Verwijder,
	// and is handed back to the wall.
	//
	// Only judged on an area that is in step: while the portal is still filling
	// it, or while a stale form is being reloaded, a parcel can be missing from
	// the page without having been deleted. And only handed back once the portal
	// itself says the parcel is gone -- a bin freed in error is a bin another
	// order can be put in while this one's items are still in it.
	function lookForDeletedBins(current: BinRecord) {
		if (isRepairingParcelArea() || isParcelFormStale()) {
			// Looked at again once the area is right. The reload that puts it
			// right may be the last change the area sees for a while, and a
			// deleted bin must not wait for the next scan to be noticed.
			//
			// A short pause after it settles, and a limit: an area the reload
			// could not put right stays out of step, and this must not spin on it.
			if (!recheckQueued && rechecks < RECHECK_LIMIT) {
				recheckQueued = true;
				rechecks++;
				parcelAreaSettled()
					.then(() => new Promise((resolve) => setTimeout(resolve, RECHECK_PAUSE_MS)))
					.then(() => {
						recheckQueued = false;
						decorate();
					});
			}

			return;
		}

		rechecks = 0;

		const present = new Set(getRenderedParcels().map((parcel) => parcel.id));
		const now = performance.now();

		for (const entry of current.bins) {
			if (present.has(entry.parcelId) || handingBack.has(entry.bin)) {
				continue;
			}

			if (now - (handBackFailedAt.get(entry.bin) ?? -Infinity) < HAND_BACK_RETRY_MS) {
				continue;
			}

			void handBack(entry);
		}
	}

	function handBack(entry: BinParcel): Promise<void> {
		const running = handingBack.get(entry.bin);

		if (running) {
			return running;
		}

		const work = (async () => {
			const exists = await parcelExists(entry.parcelId);

			// Still there, or no definite answer: kept, and looked at again on
			// the next redraw.
			if (exists !== false) {
				return;
			}

			debug(`Bin ${entry.bin} lost its parcel ${entry.parcelId}, handing it back`);

			try {
				await unclaimBin(entry.bin, Number(reservationId));
			} catch (error) {
				handBackFailedAt.set(entry.bin, performance.now());
				toast.error(`${binLabel(entry.bin)} kon niet vrijgegeven worden: ${(error as Error).message}`);

				return;
			}

			handBackFailedAt.delete(entry.bin);

			const current = record();

			current.bins = current.bins.filter((candidate) => candidate.bin != entry.bin);
			saveBinRecord(reservationId, current);

			toast.info(`${binLabel(entry.bin)} is weer vrij.`);
			decorate();
		})().finally(() => handingBack.delete(entry.bin));

		handingBack.set(entry.bin, work);

		return work;
	}

	const container = document.querySelector(PARCEL_CONTAINER_SELECTOR);

	if (container) {
		new MutationObserver(decorate).observe(container, { childList: true, subtree: true });
		decorate();
	}

	// ---- The announcement ----
	//
	// An order with a bin is announced under the NOPRINT environment: the
	// portal prints every label of an announcement on one printer, and this one
	// has labels for two places. Caught on the document in the capture phase,
	// ahead of the button's own handler -- which navigates -- and replayed once
	// the session has been switched. The automatic announcement is a click like
	// any other and comes through here the same way.
	//
	// The parcels are written down at the same moment, by id and number, for the
	// completed screen to match its cards against.
	document.addEventListener("click", (event) => {
		const button = (event.target as Element | null)?.closest?.("button");
		const announce = document.querySelector(PARCEL_CONTAINER_SELECTOR)
			?.querySelector<HTMLButtonElement>(PARCELS_ANNOUNCE_BUTTON_SELECTOR);

		if (!button || button != announce || announcing) {
			return;
		}

		const current = record();

		if (current.bins.length == 0) {
			return;
		}

		event.preventDefault();
		event.stopImmediatePropagation();

		// Bins added while the set-up was complete, and a field cleared since.
		// Announced anyway, a bin's label would come out at this bench.
		if (!readyForBins()) {
			return;
		}

		RVUtils.setBusy(true);

		// Written down from the area as it really is: the hidden inputs carry
		// the wrong ids after a parcel has been deleted. See `src/parcelArea.ts`.
		parcelAreaSettled()
			.then(() => {
				const settled = record();

				settled.parcels = getRenderedParcels();
				saveBinRecord(reservationId, settled);

				return switchSessionEnvironment(Settings.noPrintEnvironmentId);
			})
			.then(() => {
				announcing = true;
				announce?.click();
			})
			.catch((error) => {
				console.error("Pack&Ship Extended could not switch to the NOPRINT environment.", error);
				RVUtils.setBusy(false);
				playSound("error");
				toast.error("Aanmelden is gestopt: de omgeving zonder printer kon niet gekozen worden.");
			});
	}, true);

	return { busy: () => adding };
}

// Opens a parcel's tab, which is what makes it the one the next scan fills: the
// portal's own tab handler marks the parcel active in its form.
function showParcel(parcelId: string) {
	document.querySelector<HTMLElement>(`#parcel-nav-${parcelId}`)?.click();
}

// A new parcel on this reservation, made the way the portal's own add button
// makes one -- its create form, saved as served -- and then waited for in the
// parcel area, where its id is read off.
//
// The portal's button opens that form in a dialog for the packer to fill in. A
// bin needs nothing filled in: the carrier is the reservation's own, and the
// weight is left at the carrier's default, which is what PostNL weighs anyway.
async function createParcel(): Promise<string> {
	await parcelAreaSettled();

	const before = new Set(getRenderedParcels().map((parcel) => parcel.id));
	const args = newParcelArguments();

	if (!args) {
		throw new Error("The portal's add-parcel button is not on this page.");
	}

	const query = new URLSearchParams({
		reservationId: args.reservationId,
		parcelServiceId: args.parcelServiceId,
		parcelServiceCarrierId: args.parcelServiceCarrierId,
		cashOnDelivery: args.cashOnDelivery,
	});
	const created = await fetch(`${PACKING_PORTAL_URL}/Parcels/Create?${query}`);

	if (!created.ok) {
		throw new Error(`Parcels/Create answered ${created.status}.`);
	}

	const holder = document.createElement("div");

	holder.innerHTML = await created.text();

	const form = holder.querySelector<HTMLFormElement>("#parcelForm");

	if (!form) {
		throw new Error("Parcels/Create served no parcel form.");
	}

	const body = new URLSearchParams();

	for (const [name, value] of new FormData(form)) {
		body.append(name, String(value));
	}

	// The portal fills the weight in from the carrier when the dialog's carrier
	// field changes, which a form that is never shown never does. Taken from a
	// parcel already on the page when the form came without one.
	if (!body.get("GrossWeightGrams")) {
		const known = document.querySelector<HTMLInputElement>("input[name$='.GrossWeightGrams']")?.value;

		body.set("GrossWeightGrams", known || "1000");
	}

	const saved = await fetch(`${PACKING_PORTAL_URL}/Parcels/Edit`, { method: "POST", body });

	if (!saved.ok) {
		throw new Error(`Parcels/Edit answered ${saved.status}.`);
	}

	const appeared = waitForNewParcel(before);

	// The page's own refresh, so the parcel area is redrawn the way it is after
	// the portal's dialog saves. Called the way the page calls its own
	// functions elsewhere: in the page's world, not ours.
	location.href = "javascript:void(refresh());";

	return appeared;
}

function waitForNewParcel(before: Set<string>): Promise<string> {
	const container = document.querySelector(PARCEL_CONTAINER_SELECTOR);

	return new Promise((resolve, reject) => {
		if (!container) {
			reject(new Error("There is no parcel area on this page."));

			return;
		}

		const observer = new MutationObserver(() => {
			const added = getRenderedParcels().find((parcel) => !before.has(parcel.id));

			if (added) {
				observer.disconnect();
				clearTimeout(timer);
				resolve(added.id);
			}
		});

		const timer = setTimeout(() => {
			observer.disconnect();
			reject(new Error("The new parcel did not appear."));
		}, NEW_PARCEL_TIMEOUT_MS);

		observer.observe(container, { childList: true, subtree: true });
	});
}

// What the portal's own add button would pass to its `newParcel`, read off the
// button: `javascript:newParcel(8243, 6, 216, false)`.
function newParcelArguments() {
	const href = document.querySelector<HTMLAnchorElement>("#add-parcel")?.getAttribute("href") ?? "";
	const match = href.match(/newParcel\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\w+)\s*\)/);

	if (!match) {
		return null;
	}

	return {
		reservationId: match[1],
		parcelServiceId: match[2],
		parcelServiceCarrierId: match[3],
		cashOnDelivery: match[4],
	};
}
