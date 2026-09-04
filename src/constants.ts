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

// The portal's header band: a photo, the vendor's logo and the RetailVista
// wordmark. Replaced wholesale by a header of ours, so this is both what we
// hide and what we hang our own band off.
export const HEADER_SELECTOR = ".row.nfmlcomp";

// The footer cell we put our own controls into. The environment label sits in
// the same row, so anything we add here late pushes it sideways -- which is why
// the footer is mounted during the parse rather than at DOM-ready.
export const FOOTER_SLOT_SELECTOR = "footer > div > div > div.col-auto.mr-auto.text-left > div";

// The login page is served with a bare layout, and its footer with it: one
// container holding a copyright line instead of the row of controls above.
// There is nothing in it to mount beside, so `LoginPage.vue` lays the container
// out itself and makes the slot the minimal bar goes into.
export const LOGIN_FOOTER_CONTAINER_SELECTOR = "footer > div.container";

// The portal renders this container with an id that contains a space, so the
// space has to be escaped for querySelector to accept it.
export const RESERVATION_SUMMARY_SELECTOR = "#ReservationSummary\\ mb-2";

// The column that block sits in, which is what the sidebar mounts into. The
// block itself is read for its fields and then hidden rather than removed:
// `getCurrentOrderNumber()` still reads the sale order reference straight out
// of it, and `#ReservationId` is one of its children.
export const RESERVATION_SIDEBAR_SELECTOR = "#ReservationOverview > div:nth-child(2) > div.col-3";

// The portal's parcel area on the parcels page: the tab strip and the panes
// under it. Both are served empty and filled in after DOMContentLoaded by the
// portal's own `init()`, which fetches the carriers over AJAX -- so this is the
// one region of that page that cannot be part of the reveal, and gets a
// skeleton instead. See `CreateParcelsPage.vue`.
export const PARCEL_GROUP_SELECTOR = "#parcelsGroup";
export const PARCEL_TABS_SELECTOR = "#tabs-parcels";

// The portal's own product scan dialog on the parcels page.
export const PRODUCT_SCAN_DIALOG_SELECTOR = ".searchProductDialog";

// The flex column every portal page lays its rows out in: the header band, the
// page content, the footer. Used as the fallback anchor for our own header band
// on the pages the portal serves without one -- the parcels page among them.
// See `mountHeader()` in `src/main.ts`.
export const PAGE_COLUMN_SELECTOR = ".retailvista-packing-ui .container-fluid > div.d-flex.flex-column";

// The cell inside that column which holds the page itself, between the band and
// the footer. Where a page of ours goes when it stands in for the portal's --
// see `VerifyProductsPage.vue`.
export const MAIN_CONTENT_SELECTOR = "div.col-12.mainContent";

// The vendor's small wordmark and the back control, which the pages without a
// header band carry instead of one. Addressed by the image because the row
// around it has nothing else to name it by.
export const VENDOR_BAND_LOGO_SELECTOR = "img.nfLogoSmall";

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
