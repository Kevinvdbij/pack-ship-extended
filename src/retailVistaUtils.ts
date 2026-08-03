import { GM_deleteValues, GM_getValue, GM_listValues, GM_setValue } from "$";
import { MassCompleteEntry, ModalProductDetails, ModalReservationDetails, ProductDetails, ReservationDefinition, ReservationDetails, ReservationSearchResponseType, ReservationSelectionModalData } from "./interfaces";

export function getContainer():Element | null {
	return document.querySelector(".container");
}

export function getParcelContainerParent():Element | null {
	return document.querySelector("#ReservationOverview > div:nth-child(2) > div.col-9")
}

export function getReservationDetailsFromOverview(ReservationOverview?:HTMLFormElement):ReservationDetails| null {
	const target = ReservationOverview ? ReservationOverview : document;
	let reservationId = (target.querySelector("input[name='Reservation.ReservationNumber']") as HTMLInputElement).value;
	
	let products:Array<ProductDetails> = [];

	for(let i = 0; i < 200; i++){
		if (target.querySelector(`input[name^='ReservationRowsNotInCarriers[${i}]']`)) {
			products.push({
				itemId: (target.querySelector(`input[name^='ReservationRowsNotInCarriers[${i}].ItemId']`) as HTMLInputElement).value,
				number: (target.querySelector(`input[name^='ReservationRowsNotInCarriers[${i}].ProductNumber']`) as HTMLInputElement).value,
				description: (target.querySelector(`input[name^='ReservationRowsNotInCarriers[${i}].ProductDescription']`) as HTMLInputElement).value,
				mainBarcode: (target.querySelector(`input[name^='ReservationRowsNotInCarriers[${i}].ProductMainBarcode']`) as HTMLInputElement).value,
				requiredQuantity: Number(((target.querySelector(`input[name^='ReservationRowsNotInCarriers[${i}].ProductQuantity']`) as HTMLInputElement).value).split(",").shift()),
				verifiedQuantity: 0
			});
		} 
		else {
			break;
		}
	}
	return {
		id: reservationId,
		products: products
	};
}

export function cacheReservationDetails(reservationDetails:ReservationDetails) {
	let cacheData = (GM_getValue("PSE_Reservation_Cache", []) as Array<ReservationDetails>);

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
	
	GM_setValue("PSE_Reservation_Cache", cacheData);
	console.log("Cached reservation product details:");
	console.log(cacheData)
}

export function retrieveCachedReservationDetails():Array<ReservationDetails> {
	try {
		let cacheData = GM_getValue("PSE_Reservation_Cache", []) as Array<ReservationDetails>;
	
		console.log("Retrieved cached reservation details:");
		console.log(cacheData)

		return cacheData;
	} 
	catch(error) {
		console.log(`Failed to retrieve cached reservation details: ${error}`)
		
		return [];
	}
}

export function setLastOpenReservation(reservationDefinition: ReservationDefinition) {
	return GM_setValue("PSE_LastOpenReservation", reservationDefinition);
}

export function getLastOpenReservation():ReservationDefinition {
	return GM_getValue("PSE_LastOpenReservation");
}

export function setLastCompletedReservation(reservationDefinition: ReservationDefinition) {
	return GM_setValue("PSE_LastCompletedReservation", reservationDefinition);
}

export function getLastCompletedReservation():ReservationDefinition {
	return GM_getValue("PSE_LastCompletedReservation");
}

export function getCurrentReservationNumber() {
	return (document.querySelector("input[name='Reservation.ReservationNumber']") as HTMLInputElement).value;
}

export function getCurrentReservationId() {
	return getReservationId(document.body);
}

export function getCurrentOrderNumber() {
	return document.querySelector<HTMLElement>("#ReservationSummary\\ mb-2 > div:nth-child(3)")!.innerHTML.split(" ")[2];
}

export function getReservationId(target: HTMLElement) {
	return (target.querySelector("#ReservationId") as HTMLInputElement).value;
}

export async function fetchReservationDetails(reservationId: string):Promise<ReservationDetails | null> {
	try {
		const response = await fetch(`https://retailvista.net/bztrs/packingportal/Reservations/Index/${reservationId}`);
		const result = await response.text();

		let resultElement = document.createElement("div");
		resultElement.innerHTML = result;

		let overview = getReservationDetailsFromOverview(resultElement.querySelector("#ReservationOverview") as HTMLFormElement);

		return overview;
		
	} catch(error){
		console.log(error);

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
			url: "/bztrs/packingportal/Reservations/Search",
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
	for (let i = 0; i < 200; i++) {
		const collected = target.querySelector<HTMLInputElement>("#ReservationRowsNotInCarriers_" + i + "__Collected");

		if (collected) {
			collected.value = "true";
		}
		else {
			break;
		}
	}

	const form = target.querySelector("#ReservationOverview") as HTMLFormElement;
	form.action = "/bztrs/packingportal/Reservations/Update";
	form.submit();
}

export function focusBarcodeInput() {
	document.querySelector<HTMLInputElement>("#Productbarcode")!.focus();
	document.querySelector<HTMLInputElement>("#Productbarcode")!.value = "";
}

export function removeBusy() {
	let bodyClass = document.body.getAttribute("class")?.replace("busy", "");

	document.body.setAttribute("class", bodyClass!)
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
	const mcEntries = GM_listValues().filter((x) => x.startsWith("PSE_MCEntry_"));
	if (mcEntries) {
		GM_deleteValues(mcEntries);
	}

	entries.forEach((entry) => {
		GM_setValue(`PSE_MCEntry_${entry.reservationNumber}`, entry.status);
	})
}

export function updateMassCompleteStatus(entry: MassCompleteEntry) {
	GM_setValue(`PSE_MCEntry_${entry.reservationNumber}`, entry.status);
}

export function isMassCompleteReservation(reservationNumber: string) {
	const entry = GM_getValue(`PSE_MCEntry_${reservationNumber}`, undefined);

	return entry != undefined;
}