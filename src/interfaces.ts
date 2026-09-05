import { ShopwareOrderEntry } from "./shopware";

export interface ReservationDetails {
	id: string,
	products: Array<ProductDetails>
}

export interface ProductDetails {
	itemId: string,
	number: string,
	description: string,
	mainBarcode: string,
	requiredQuantity: number,
	verifiedQuantity: number,
}

// One row of the parcels page, as the portal serves it: one per picking
// instruction, so a product picked from more than one location arrives as
// several rows for the same `productId`, each with its own `itemId`.
export interface VerificationRow extends ProductDetails {
	rowIndex: string,
	productId: string,
	// What the instruction asked for. `requiredQuantity` is what was picked.
	requestedQuantity: number,
}

// One product in one parcel, as the portal serves it under
// `Items[p].Items[i]`. What has actually been scanned into a box, tied back to
// the reservation row it was scanned against.
export interface ParcelItem {
	rowId: string,
	mainBarcode: string,
	amount: number,
}

// What the parcels table shows: the rows of one product folded together, so a
// split pick is one line with the whole of what has to go in the box.
export interface ProductLine {
	key: string,
	productId: string,
	description: string,
	mainBarcode: string,
	requiredQuantity: number,
	verifiedQuantity: number,
	rows: VerificationRow[],
}

export enum ReservationSearchResponseType {
	ContinueVerification = 1,
	RefreshMain,
	SelectionModal,
	UnfinishedRun
}

export interface ReservationSelectionModalData {
	searchProductName: string,
	searchProductBarcode: string,
	searchProductAmount: number,
	searchProductImageUrl: string,

	singleLineReservations: ModalReservationDetails[],
	validReservations: ModalReservationDetails[],
	invalidReservations: ModalReservationDetails[],
}

export interface ModalReservationDetails {
	reservationNumber: number,
	saleOrderReference: string,
	status: string,
	deliveryStatus: string,
	customer: string,
	products: ModalProductDetails[],
	url: string,
	swOrderData: ShopwareOrderEntry
}

export interface ModalProductDetails {
	number: number,
	description: string,
	barcode: string,
	amount: string
}

export interface ReservationDefinition {
	id: string,
	number: string
}

export interface MassCompleteEntry {
	reservationNumber: string,
	status: MassCompleteStatus,
	// Only set for entries owned by the tab that started the mass complete run.
	close?: () => void
}

export enum MassCompleteStatus {
	idle = 0,
	started = 1,
	finished = 2,
	failed = 3,
	// Not a verdict on the reservation but on the run: one of the others failed,
	// the run was stopped, and this reservation's tab was closed before it got
	// anywhere. It is untouched and can be packed normally.
	stopped = 4
}