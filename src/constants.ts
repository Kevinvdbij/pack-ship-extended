// Values that more than one module needs to agree on.

export const PACKING_PORTAL_URL = "https://retailvista.net/outdoor/packship";

export const SHOPWARE_URL = "https://www.kampeerhalroden.nl";

// The environment ("Omgeving") picker the portal renders in its footer. Note
// the portal's own spelling of "Enviroment" — matching it is not a typo here.
export const ENVIRONMENT_FORM_SELECTOR = "form#selectEnviroment";
export const ENVIRONMENT_SELECT_SELECTOR = "select#EnviromentId";

// The language picker the portal renders beside the environment one. Unlike
// the environment, this is never configurable: the portal is only ever used in
// Dutch here, so the control is hidden for good and the choice is forced.
export const LANGUAGE_FORM_SELECTOR = "form#selectLanguage";
export const LANGUAGE_SELECT_SELECTOR = "select#LanguageId";

// Portal regions we mount into. They double as cloak targets, so they have to
// be selectors rather than element lookups: the cloak is written before the
// portal's markup has been parsed.
export const CONTAINER_SELECTOR = ".container";
export const PARCEL_CONTAINER_PARENT_SELECTOR = "#ReservationOverview > div:nth-child(2) > div.col-9";

// The portal's search block, and the only child `.container` has of its own on
// that page. Our block goes directly after it, which is the same position as
// appending to the container but expressed against an element instead of
// against "the end", so it is exact while the document is still being parsed.
export const SEARCH_BLOCK_SELECTOR = ".container > div.row.justify-content-md-center";

// The footer cell we put our own controls into. The environment label sits in
// the same row, so anything we add here late pushes it sideways -- which is why
// the footer is mounted during the parse rather than at DOM-ready.
export const FOOTER_SLOT_SELECTOR = "footer > div > div > div.col-auto.mr-auto.text-left > div";

// The portal renders this container with an id that contains a space, so the
// space has to be escaped for querySelector to accept it.
export const RESERVATION_SUMMARY_SELECTOR = "#ReservationSummary\\ mb-2";

// Keys used with the GM value store.
export const STORAGE_KEYS = {
	settings: "PSE_Settings",
	reservationCache: "PSE_Reservation_Cache",
	lastOpenReservation: "PSE_Last_Open_Reservation",
	lastCompletedReservation: "PSE_Last_Completed_Reservation",
	currentUser: "PSE_Current_User",
	swClientId: "PSE_Shopware_Client_Id",
	swClientSecret: "PSE_Shopware_Client_Secret",
	// Suffixed with a reservation number, one key per mass complete entry.
	massCompleteEntryPrefix: "PSE_MCEntry_",
} as const;

export function massCompleteEntryKey(reservationNumber: string) {
	return `${STORAGE_KEYS.massCompleteEntryPrefix}${reservationNumber}`;
}
