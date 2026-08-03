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
	close: () => void
}

export enum MassCompleteStatus {
	idle = 0,
	started = 1,
	finished = 2,
	failed = 3
}