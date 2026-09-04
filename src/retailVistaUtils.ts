import { GM_deleteValues, GM_getValue, GM_listValues, GM_setValue } from "$";
import { MassCompleteEntry, ModalProductDetails, ModalReservationDetails, ProductDetails, ReservationDefinition, ReservationDetails, ReservationSearchResponseType, ReservationSelectionModalData } from "./interfaces";
import { CONTAINER_SELECTOR, massCompleteEntryKey, HEADER_SELECTOR, SEARCH_BLOCK_SELECTOR, PACKING_PORTAL_URL, PARCEL_CONTAINER_PARENT_SELECTOR, RESERVATION_SUMMARY_SELECTOR, STORAGE_KEYS } from "./constants.ts";
import { debug } from "./logger.ts";
import { afterReveal } from "./reveal.ts";

export function getContainer():Element | null {
	return document.querySelector(CONTAINER_SELECTOR);
}

export function getSearchBlock():Element | null {
	return document.querySelector(SEARCH_BLOCK_SELECTOR);
}

// Moves an element the portal rendered into a host of ours.
//
// Our layout then owns where the element sits while the portal keeps owning the
// element itself, which is the difference between restyling a region and
// rebuilding it: the portal's own inputs stay the inputs, so its form still
// serialises them and every helper that looks one up by id still finds it.
// Only the class list is ours, because the portal's is the styling being
// replaced.
export function adoptElement(host: Element, target: Element | null, className?: string) {
	if (!target) {
		return null;
	}

	if (className != undefined) {
		target.className = className;
	}

	host.append(target);

	return target;
}

export function getPortalHeader():Element | null {
	return document.querySelector(HEADER_SELECTOR);
}

export function getParcelContainerParent():Element | null {
	return document.querySelector(PARCEL_CONTAINER_PARENT_SELECTOR)
}

export function getReservationDetailsFromOverview(ReservationOverview?:HTMLFormElement):ReservationDetails| null {
	const target = ReservationOverview ? ReservationOverview : document;
	let reservationId = (target.querySelector("input[name='Reservation.ReservationNumber']") as HTMLInputElement).value;
	
	// One hidden input group per row, indexed from 0. Read the ItemId inputs to
	// learn which indices exist rather than probing until one is missing.
	const products:Array<ProductDetails> = Array
		.from(target.querySelectorAll<HTMLInputElement>("input[name^='ReservationRowsNotInCarriers['][name$='].ItemId']"))
		.map((itemIdInput) => {
			const index = rowIndexFromName(itemIdInput.name);
			const field = (name: string) =>
				(target.querySelector(`input[name^='ReservationRowsNotInCarriers[${index}].${name}']`) as HTMLInputElement).value;

			return {
				itemId: itemIdInput.value,
				number: field("ProductNumber"),
				description: field("ProductDescription"),
				mainBarcode: field("ProductMainBarcode"),
				requiredQuantity: Number(field("ProductQuantity").split(",").shift()),
				verifiedQuantity: 0
			};
		});

	return {
		id: reservationId,
		products: products
	};
}

// Pulls the numeric index out of a name like "ReservationRowsNotInCarriers[3].ItemId".
function rowIndexFromName(name: string) {
	return name.split("[").pop()!.split("]").shift()!;
}

export function cacheReservationDetails(reservationDetails:ReservationDetails) {
	let cacheData = (GM_getValue(STORAGE_KEYS.reservationCache, []) as Array<ReservationDetails>);

	let existingIndex = cacheData.findIndex((reservation) => reservation.id == reservationDetails.id)

	// if there is not currently a reservation matching the given reservation, cache the new reservation and remove the oldest.
	if (existingIndex == -1) {
		if (cacheData.push(reservationDetails) > 50) {
			cacheData.shift();
		}
	} else {
		// overwrite if there is
		cacheData[existingIndex] = reservationDetails;
	}
	
	GM_setValue(STORAGE_KEYS.reservationCache, cacheData);
	debug("Cached reservation product details:", cacheData);
}

export function retrieveCachedReservationDetails():Array<ReservationDetails> {
	try {
		let cacheData = GM_getValue(STORAGE_KEYS.reservationCache, []) as Array<ReservationDetails>;
	
		debug("Retrieved cached reservation details:", cacheData);

		return cacheData;
	} 
	catch(error) {
		console.error(`Failed to retrieve cached reservation details: ${error}`)
		
		return [];
	}
}

export function setLastOpenReservation(reservationDefinition: ReservationDefinition) {
	return GM_setValue(STORAGE_KEYS.lastOpenReservation, reservationDefinition);
}

export function getLastOpenReservation():ReservationDefinition {
	return GM_getValue(STORAGE_KEYS.lastOpenReservation);
}

export function setLastCompletedReservation(reservationDefinition: ReservationDefinition) {
	return GM_setValue(STORAGE_KEYS.lastCompletedReservation, reservationDefinition);
}

export function getLastCompletedReservation():ReservationDefinition {
	return GM_getValue(STORAGE_KEYS.lastCompletedReservation);
}

export function getCurrentReservationNumber() {
	return (document.querySelector("input[name='Reservation.ReservationNumber']") as HTMLInputElement).value;
}

export function getCurrentReservationId() {
	return getReservationId(document.body);
}

export function getCurrentOrderNumber() {
	return document.querySelector<HTMLElement>(`${RESERVATION_SUMMARY_SELECTOR} > div:nth-child(3)`)!.innerHTML.split(" ")[2];
}

export function getReservationId(target: HTMLElement) {
	return (target.querySelector("#ReservationId") as HTMLInputElement).value;
}

export async function fetchReservationDetails(reservationId: string):Promise<ReservationDetails | null> {
	try {
		const response = await fetch(`${PACKING_PORTAL_URL}/Reservations/Index/${reservationId}`);
		const result = await response.text();

		let resultElement = document.createElement("div");
		resultElement.innerHTML = result;

		let overview = getReservationDetailsFromOverview(resultElement.querySelector("#ReservationOverview") as HTMLFormElement);

		return overview;
		
	} catch(error){
		console.error(error);

		return null;
	}
}

export function getReservationRowIndexFromItemId(itemId: string) {
	const itemIdInput = Array.from(document.querySelectorAll<HTMLInputElement>(
		"input[name^='VerificationReservationRows['][name$='].ItemId']")).find((x) => x.value == itemId);

	return itemIdInput?.getAttribute("name")?.split("VerificationReservationRows[").pop()?.split("].ItemId").shift()
}

export async function fetchReservation(url:string): Promise<string> {
		return new Promise((resolve) => {
		$.ajax({
			url: url,
			type: "GET",
			success: function(data: string) {
				resolve(data);
			},
		});
	});
}

// Request that retrieves reservations from submitted data
export async function reservationSearchRequest(formData: string): Promise<string> {
	return new Promise((resolve) => {
		$.ajax({
			url: "/outdoor/packship/Reservations/Search",
			type: "GET",
			data: formData,
			success: function(data: string) {
				resolve(data);
			},
		});
	});
}

// Evaluate the state of the given response
export function evaluateSearchResponse(element: HTMLElement): ReservationSearchResponseType {
	const reservationOverview = element.querySelector("#ReservationOverview");
	const selectionModal = element.querySelector("#productReservationsModal");
	const unfinishedRunButton = element.querySelector("button[data-target='#unfinishedOrderPickingRunsModal']");

	switch(true) {
		case reservationOverview != undefined:
			return ReservationSearchResponseType.ContinueVerification;

		case unfinishedRunButton != undefined:
			return ReservationSearchResponseType.UnfinishedRun;

		case selectionModal != undefined:
			return ReservationSearchResponseType.SelectionModal;

		default:
			return ReservationSearchResponseType.RefreshMain;
	}
}

export function skipVerification(target:HTMLElement) {
	target.querySelectorAll<HTMLInputElement>("input[id^='ReservationRowsNotInCarriers_'][id$='__Collected']")
		.forEach((collected) => collected.value = "true");

	const form = target.querySelector("#ReservationOverview") as HTMLFormElement;
	form.action = "/outdoor/packship/Reservations/Update";
	form.submit();
}

// Puts the cursor back in the barcode field and empties it, so the next scan
// lands there whole. The scanner types and presses return; if the cursor is
// anywhere else the scan is lost, and if the field still holds the last one the
// two run together -- so this is what keeps a run going without the mouse.
//
// Deferred until the page is on screen. Under the cloak the field is
// `visibility: hidden` and cannot be focused at all: the call is dropped and
// the focus does not arrive later when the cloak lifts. That is invisible from
// here -- `focus()` reports nothing -- so it is handled once, for every caller,
// rather than left for each to remember. Already-visible callers, which is
// every call made during a packing run, are unaffected: `afterReveal` runs them
// on the spot.
export function focusBarcodeInput() {
	afterReveal(() => {
		const barcodeInput = document.querySelector<HTMLInputElement>("#Productbarcode");

		if (!barcodeInput) {
			return;
		}

		barcodeInput.focus();
		barcodeInput.value = "";
	});
}

export function setBusy(state: boolean) {
	if (state == true) {
		$("body").addClass("busy");
	}
	else {
		$("body").removeClass("busy");
	}
}

export function retrieveModalData(modalElement:HTMLElement):ReservationSelectionModalData {
	const amount = (<HTMLElement>modalElement.querySelector("#productReservationsModal > div > div > div.modal-header > h5")).innerText.trimStart()[0];
	const barcode = (<HTMLElement>modalElement.querySelector("#productReservationsModal > div > div > div.modal-header > h5")).innerText.split("'")[1];
	const name = (<HTMLElement>modalElement.querySelector("#productReservationsModal > div > div > div.modal-body > div > div > div.row.text-success > div:nth-child(1) > h3")).innerText.split("'")[1];
	const imgUrl = (<HTMLImageElement>modalElement.querySelector("#productReservationsModal > div > div > div.modal-body > div > div > div.row.text-success > div:nth-child(2) > div > div.col-3.product-image > div > img")).src;

	const singleLineElement = <HTMLElement>modalElement.querySelector(
		"#productReservationsModal > div > div > div.modal-body > div > div > div.singleline-reservations");

	const validReservationElement = <HTMLElement>modalElement.querySelector(
	"#productReservationsModal > div > div > div.modal-body > div > div > div.valid-reservations");

	const invalidReservationElement = <HTMLElement>modalElement.querySelector(
		"#productReservationsModal > div > div > div.modal-body > div > div > div.invalid-reservations");
	
	const singleReservations:ModalReservationDetails[] = iterateModalContainer(singleLineElement);
	const validReservations:ModalReservationDetails[] = iterateModalContainer(validReservationElement);
	const invalidReservations:ModalReservationDetails[] = iterateModalContainer(invalidReservationElement);

	const movedReservations:ModalReservationDetails[] = [];
	// Add reservations with only shipping costs as a 2nd item to single line reservations
	validReservations.forEach((reservation) => {
		if (reservation.products.length == 2) {
			let shippingCostsProduct = reservation.products.find((x) => x.description == "verzendkosten");
			let searchProduct = reservation.products.find((x) => x.barcode == barcode);

			if (shippingCostsProduct && searchProduct && parseInt(searchProduct.amount) == 1) {
				let index = reservation.products.indexOf(shippingCostsProduct)
				reservation.products.splice(index, 1);

				singleReservations.push(reservation);
				movedReservations.push(reservation);
			}
		}
	})

	// remove the reservations added to single line from valid reservations afterwards
	movedReservations.forEach((reservation) => {
		let reservationIndex = validReservations.indexOf(reservation);
		validReservations.splice(reservationIndex, 1)
	});

	return {
		searchProductName: name,
		searchProductBarcode: barcode,
		searchProductAmount: parseInt(amount!),
		searchProductImageUrl: imgUrl,

		singleLineReservations: singleReservations,
		validReservations: validReservations,
		invalidReservations: invalidReservations
	}
}

function iterateModalContainer(container:HTMLElement):ModalReservationDetails[] {
	const reservations:ModalReservationDetails[] = [];
	const reservationElement = container;

	if (reservationElement && reservationElement.children.length > 0) {
		Array.from(reservationElement.children).forEach((reservation) => {
			const reservationNumber = (<HTMLElement>reservation.querySelector("div.card-header > div > div.col-10 > div > div:nth-child(1) > div:nth-child(1) > b")).innerText;
			const saleOrderRef = (<HTMLElement>reservation.querySelector("div.card-header > div > div.col-10 > div > div:nth-child(1) > div:nth-child(2) > b")).innerText;
			const status = (<HTMLElement>reservation.querySelector("div.card-header > div > div.col-10 > div > div:nth-child(2) > div:nth-child(1) > b")).innerText;
			const deliveryStatus = (<HTMLElement>reservation.querySelector("div.card-header > div > div.col-10 > div > div:nth-child(2) > div:nth-child(2) > b")).innerText;
			const customer = (<HTMLElement>reservation.querySelector("div.card-header > div > div.col-10 > div > div:nth-child(3) > div > b")).innerText;
			const url = (<HTMLLinkElement>reservation.querySelector("div > div.col-2 > div > a"))?.href;

			const products:ModalProductDetails[] = [];
			const productListElement = (<HTMLElement>reservation.querySelector("div.card-body > div > div.reservation-rows"));
			Array.from(productListElement.children).forEach((product) =>{
				const number = (<HTMLElement>product.querySelector("div > div:nth-child(1)")).innerText;
				const description = (<HTMLElement>product.querySelector("div > div:nth-child(2)")).innerText;
				const barcode = (<HTMLElement>product.querySelector("div > div:nth-child(3)")).innerText;
				const amount = (<HTMLElement>product.querySelector("div > div:nth-child(4)")).innerText;

				products.push({
					number: parseInt(number),
					description: description,
					barcode: barcode,
					amount: amount
				});
			})

			reservations.push({
				reservationNumber: parseInt(reservationNumber),
				saleOrderReference: saleOrderRef,
				status: status,
				deliveryStatus: deliveryStatus,
				customer: customer,
				url: url,
				products: products,
				swOrderData: undefined!
			});
		});
	}

	return reservations;
}

export function parseAmountString(amount:string):number[] {
	return amount.split(" van ").map((x) => parseInt(x))
}

export function isAmountStringComplete(amount:string) {
	const amounts:number[] = parseAmountString(amount);

	return amounts[0] >= amounts[1];
}

// Send http request that sets the orderpickingrun state to finished
export async function handleUnfinishedRun(target:HTMLElement): Promise<string> {
	return new Promise((resolve) => {
		const finishRunUrl = (target.querySelector("[id=unfinishedOrderPickingRunsModal]")!.querySelector(".btn") as HTMLAnchorElement).href;

		$.ajax({
			url: finishRunUrl,
			type: "GET",
			success: function(data: string) {
				resolve(data);
			},
		});
	});
}

export function matchShopwareOrderNumber(value: string):boolean {
	return /^[0-9]{6,6}$/.test(value);
}

export function initMassCompleteStatus(entries: MassCompleteEntry[]) {
	const mcEntries = GM_listValues().filter((x) => x.startsWith(STORAGE_KEYS.massCompleteEntryPrefix));
	if (mcEntries) {
		GM_deleteValues(mcEntries);
	}

	entries.forEach((entry) => {
		GM_setValue(massCompleteEntryKey(entry.reservationNumber), entry.status);
	})
}

export function updateMassCompleteStatus(entry: MassCompleteEntry) {
	GM_setValue(massCompleteEntryKey(entry.reservationNumber), entry.status);
}

export function isMassCompleteReservation(reservationNumber: string) {
	const entry = GM_getValue(massCompleteEntryKey(reservationNumber), undefined);

	return entry != undefined;
}