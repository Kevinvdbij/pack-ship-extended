// Values that more than one module needs to agree on.

export const PACKING_PORTAL_URL = "https://retailvista.net/bztrs/packingportal";

export const SHOPWARE_URL = "https://www.kampeerhalroden.nl";

// The portal renders this container with an id that contains a space, so the
// space has to be escaped for querySelector to accept it.
export const RESERVATION_SUMMARY_SELECTOR = "#ReservationSummary\\ mb-2";

// Keys used with the GM value store.
export const STORAGE_KEYS = {
	settings: "PSE_Settings",
	reservationCache: "PSE_Reservation_Cache",
	lastOpenReservation: "PSE_Last_Open_Reservation",
	lastCompletedReservation: "PSE_Last_Completed_Reservation",
	swClientId: "PSE_Shopware_Client_Id",
	swClientSecret: "PSE_Shopware_Client_Secret",
	// Suffixed with a reservation number, one key per mass complete entry.
	massCompleteEntryPrefix: "PSE_MCEntry_",
} as const;

export function massCompleteEntryKey(reservationNumber: string) {
	return `${STORAGE_KEYS.massCompleteEntryPrefix}${reservationNumber}`;
}
