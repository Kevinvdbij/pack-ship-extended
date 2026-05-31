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

export interface SearchResponseState {
	isAlert: boolean;
	isUnfinished: boolean;
	isProductSelection: Element | null;
}

export enum ReservationSearchResponseType {
	ContinueVerification = 1,
	RefreshMain,
	SelectionModal
}

export interface ReservationSelectionModalData {
	searchProductName: string,
	searchProductBarcode: string,
	searchProductResults: number,
	searchProductImageUrl: string,

	singleLineReservations: ReservationDetails,
	singleLineReservationAmount: number

	multiLineReservations: ReservationDetails,
	multiLineReservationAmount: number

	invalidReservations: ReservationDetails,
	invalidReservationAmount:number
}