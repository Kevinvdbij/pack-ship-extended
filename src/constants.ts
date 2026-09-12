// Values that more than one module needs to agree on.

export const PACKING_PORTAL_URL = "https://retailvista.net/outdoor/packship";

export const SHOPWARE_URL = "https://www.kampeerhalroden.nl";

// The ERP the packing portal is a front for, and which owns the reservation
// itself. The same origin as the portal -- `/outdoor/packship` is a sub
// application of `/outdoor` -- which is the whole reason the rack bays can be
// kept on the reservation at all: a page of ours can load an ERP page in a
// frame and read it, with no CORS to negotiate and no credentials of its own.
//
// It is not, however, the same session. Signing into the portal does not sign
// anyone into the ERP, so `src/erpSession.ts` signs in a second time with the
// credentials the login form was given. See `LoginPage.vue`.
export const ERP_URL = "https://retailvista.net/outdoor";

// The ERP's WebForms login, and the three fields on it. Named in full because
// they are posted by name: the sign-in is a form post rather than a call to an
// interface meant for one.
export const ERP_LOGIN_PATH = "/Login.aspx";
export const ERP_LOGIN_FIELDS = {
	companyNumber: "ctl00$MasterContent$txtCompanyNumber$TextBox",
	userName: "ctl00$MasterContent$txtUsername$TextBox",
	password: "ctl00$MasterContent$txtPassword$TextBox",
	submit: "ctl00$MasterContent$cmdLogin",
} as const;

// The ERP's application page. `RetailVista.aspx` is only a launcher -- it
// redirects to `Index.aspx`, which pops the application into a window of its
// own -- so the page that actually holds the application is this one, addressed
// by the id of the screen wanted.
//
// 374 is reservation maintenance. The ids are the ERP's own, read off the menu
// markup `Default.aspx` serves; they are stable for a given release and are
// worth checking after a RetailVista update.
export const ERP_PAGE_PATH = "/Default.aspx";
export const ERP_RESERVATION_PAGE_ID = 374;

// ---- Finding a reservation by the number an operator reads ----
//
// The maintenance screen loads a record by internal id and cannot look one up by
// number. The ERP's own answer is the search form behind the magnifier on that
// screen -- an ordinary page of its own, which is how it is used here: opened
// bare like any other screen, filled in, and its results read off the grid it
// renders.
//
// Deliberately *not* through the application launcher that would normally open
// it as a dialog. See the warning in CLAUDE.md: loading `RetailVista.aspx` frames
// `Login.aspx`, and that signs the workplace out.
//
// The screen publishes the page id of its own search form, so the form is not
// named here -- it is asked for.
export const ERP_SEARCH_PAGE_ID_VARIABLE = "navigationIconsSearchPageId";
export const ERP_SEARCH_NUMBER_SELECTOR = "[id$='rvcReservationNumber_TextBox']";
export const ERP_SEARCH_SUBMIT_SELECTOR = "[id$='ctl00_cmdSearch']";

// What the search form expects to find on the window above it.
//
// Every ERP screen reaches for `window.top.getMainWindow()` -- the application
// launcher, which is what a screen is normally framed by. Most screens only do
// so when something asks for a dialog, which is why the note screen works in a
// bare frame; the search form does it as it loads, and without an answer it
// throws and comes back empty. It was that, rather than anything about the
// search, that made this look impossible at first.
//
// So the page above it -- ours -- answers. The stub is the small part of the
// launcher the form actually touches, and nothing else: see `erpFrame.ts`.
export const ERP_MAIN_WINDOW_FUNCTION = "getMainWindow";

// How the search hands its answer back.
//
// Not by us reading its results: the search form calls the window above it when
// a record is settled on, which for a search on one reservation number is the
// single row it found. From `Scripts/search.js`:
//
//     window.top.SetMainItemId(source, itemId, destinationField, modus)
//
// So the id arrives as the second argument, from the ERP's own statement of
// which record the search means -- rather than from a column counted off a grid.
// The grid is still read if this never fires; see `reservationLookup.ts`.
export const ERP_MAIN_ITEM_FUNCTION = "SetMainItemId";

// How a record is opened on that page.
//
// Not by query string: `itemId=` is ignored, and the page comes up empty with
// it. The page loads its own record through a function of its own, which is
// called on the frame's window -- and being the page's own function it does the
// postback, carries the view state and leaves us nothing to reimplement.
//
// The argument is the reservation's internal id -- `#ReservationId` on the
// portal's pages -- and not the reservation number the operator reads.
export const ERP_SET_ITEM_FUNCTION = "SetDisplayItemId";

// The note field on that screen, and the two controls that make it writable and
// then save it. The note is `readOnly` until the record is put into edit mode.
//
// Matched on the tail of the name rather than written out in full: the control
// is nested several naming containers deep and the prefix is a fact about where
// the page puts its content, which is exactly the part most likely to shift.
export const ERP_NOTE_SELECTOR = '[name$="rvcNote$TextBox"]';
export const ERP_EDIT_BUTTON_ID = "ctl00_ctl00_MasterContent_NavigationIcons_ctl00_cmdEdit";

// The save is the navigation bar's, beside the edit it undoes -- not the one on
// the tab control. There are three controls on this page whose id contains
// `cmdSave` and only this one is ever visible; the other two belong to the tab
// strip and are rendered whether or not anything can be saved. Picking by name
// alone found one of those, and pressing it did nothing that reached the record.
export const ERP_SAVE_BUTTON_ID = "ctl00_ctl00_MasterContent_NavigationIcons_ctl00_cmdSave";

// What a page served to a signed-out browser has on it. The ERP answers an
// unauthenticated request with its login form rather than with a status, so
// "is there a session" starts by looking for the company number box.
export const ERP_LOGIN_MARKER = "txtCompanyNumber";

// The application page's own logout control, which posts back by name. Ending
// the ERP session is a `__doPostBack` on this -- see `erpLogout()`.
export const ERP_LOGOUT_TARGET = "ctl00$ctl00$MasterContent$CurrentUser$ctl00$cmdLogout";

// ---- Reprinting a parcel service label ----
//
// The ERP's own "print parcel service label" task. It is a dialog on the
// reservation screen, but it is also an ordinary page: the link that opens it
// only calls `ShowModalDialog('default.aspx?pageId=708&itemId=<reservation>')`,
// so it can be loaded directly and driven without any of the modal machinery.
//
// Unlike the reservation screen, this one *does* take its record from the query
// string -- `itemId` is the reservation's internal id -- and comes up with the
// reservation filled in and its parcel selected when there is only one.
//
// A note on why every id here is a number rather than a caption. The ERP serves
// this installation's page chrome in Dutch and these same task links in English,
// in one session, and which language a given string comes back in is not ours to
// predict. Nothing in this flow reads a label: the task's own link id encodes its
// page id (`lnk708`), the controls are named, and the printer is matched on a
// description that is RetailVista's own data rather than its user interface.
export const ERP_PARCEL_LABEL_PAGE_ID = 708;

// The dialog's controls. Matched on the tail of the id: they sit several naming
// containers deep, and the prefix is a fact about where the page puts its
// content -- the part most likely to move.
export const ERP_LABEL_PARCEL_SELECTOR = '[id$="rvcReservationParcel_ListBox"]';
export const ERP_LABEL_PRINTER_SELECTOR = '[id$="rvcPrinter_ListBox"]';
export const ERP_LABEL_PRINT_SELECTOR = '[id$="btnPrint"]';

// ---- Which printer ----
//
// The environment maintenance screen, which is where the workplace's printers
// are configured: 1992 is the search grid, 1993 the record itself. `itemId` is
// the environment id -- the same id the packing portal's own "Omgeving" picker
// uses, which is worth saying plainly because it is not obvious and it is what
// makes this join possible at all.
//
// Of the ten printer fields on that record, the parcel service label goes to
// this one. Not the default printer and not the default label printer: those are
// a colour laser at the service desk on the workplace this was read from, and a
// shipping label sent there is a label nobody at the bench will see.
export const ERP_ENVIRONMENT_PAGE_ID = 1993;
export const ERP_ENVIRONMENT_PARCEL_PRINTER_SELECTOR = '[id$="rvcParcelServicePrinterId_Textbox"]';

// ...and is not finished by it. There is a third thing the ERP can serve: a
// short page with an empty title that is neither the login form nor the
// application -- what comes back when the session exists but the application
// could not start, which is what a sign-in that lost the culture produces. It
// has no company number box on it, so "not the login form" reads as signed in
// and everything downstream then fails for reasons that make no sense.
//
// So the question is asked the other way round, of something only the working
// application has: the quick navigation box, which is on every page of it.
export const ERP_APP_MARKER = "QuickNavigation";

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

// The reservation's own facts, as the portal lays them out beside its pages.
//
// Matched on the start of the id rather than on the whole of it: the parcels
// page renders it as `ReservationSummary mb-2` -- an id with a space in it,
// which is the portal's doing -- and the completed page renders the same block
// as plain `ReservationSummary`. Written out in full it matched one page and
// silently missed the other, which is why the completed screen had no sidebar
// of ours and showed the portal's raw block underneath instead.
export const RESERVATION_SUMMARY_SELECTOR = "[id^='ReservationSummary']";

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
// The portal's pane per parcel, and the parcel's own id inside the pane's id:
// `parcels-content-876733`. That id is the same one the ERP's label dialog lists
// its parcels by, so the box a reprint means is named rather than counted.
// The portal's parcel region. Served empty and filled in by its own init over
// AJAX, then replaced wholesale after every parcel change -- which is why
// nothing of ours may be moved into it, and why anything of ours added to it has
// to be put back afterwards.
export const PARCEL_CONTAINER_SELECTOR = "#ParcelsContainer";

export const PARCEL_PANE_PREFIX = "parcels-content-";
export const PARCEL_PANE_SELECTOR = `[id^='${PARCEL_PANE_PREFIX}']`;

// The heading in the right-hand cell of the portal's parcel card header -- the
// one reading "Barcode: 3SGESK0090473". The reprint goes beside it rather than
// under it: the cell's next two lines are when the parcel was announced and
// printed, and a button dropped between the barcode and those read as belonging
// to neither.
//
// Addressed by position because there is nothing else to name the cell by, and
// by position within the card rather than within the pane, so a change to what
// surrounds the card does not move it.
export const PARCEL_BARCODE_HEADING_SELECTOR = ".card .card-header .row > div:nth-child(2) .card-title";

// Put on that heading while a reprint is sitting in it, which is what
// `src/styles/portal.css` hangs the row layout off. The portal's own heading is
// a block with one string in it; two things side by side is ours to arrange, and
// only while there are two.
export const PARCEL_BARCODE_HEADING_CLASS = "pse-has-reprint";

// The reprint button's own class. Named here rather than only in the component
// because the mount tests for it: a pane that already carries one is left alone,
// which is what stops a render inside the parcel region from being answered with
// a remount.
export const PARCEL_BUTTON_CLASS = "pse-reprint";

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

// The completed page's own block, and the button in it that closes a finished
// reservation off and goes back to the search. `CompletedPage.vue` stands in for
// the block and clicks the button; both stay in the document, since the button
// is what actually does the work and the block carries the hidden inputs the
// reservation's number and id are read from.
//
// The button is addressed by its position, which is how the portal's own
// markup gives it to us -- there is nothing else on it to name it by. Every
// use of it is guarded: a position that moves should leave the operator on the
// vendor's screen, which they can finish by hand, rather than on ours with a
// button that does nothing.
export const COMPLETED_CONTAINER_SELECTOR = "#ReservationContainer";

// The portal's own heading for this screen, which says whether the reservation
// went out or was refused. Taken off the page rather than written here, the way
// the finish button's label is: it is the portal's verdict, in the portal's
// words, and a copy of it here would drift.
// Marks a trip back to the parcels page as a return rather than a fresh entry.
//
// The parcels page clears the boxes it finds on the way in -- a reservation is
// packed from empty, and a leftover parcel from an abandoned attempt would be
// shipped with the next one. Coming back from a refused announcement is the one
// case where that is exactly wrong: the parcels are the work that was just done,
// the announcement is all that failed, and clearing them means packing the order
// twice.
//
// A hash rather than a query parameter: the portal reads its own query string on
// this page and this is nothing to do with it, so it goes where the server never
// sees it.
export const PARCELS_RETURN_HASH = "#pse-return";

export const COMPLETED_HEADING_SELECTOR = "#ReservationContainer h3";

// What the portal did with the reservation, one list item per step -- announced
// the parcels, sent the reservation -- each with an icon that carries the
// verdict, the step's name, and a line of detail when there is one.
//
// The failed ones are marked by the icon's class rather than by their wording,
// which is translated, and the detail is what actually says why. This is the
// screen the operator is held on when a step fails, so both are read out and
// shown rather than summarised: "it did not go out" is not enough to act on.
export const COMPLETED_STEP_SELECTOR = "#ReservationContainer li.list-group-item";

// The parcels as this screen renders them: one card each, with the parcel's own
// number and carrier as its title, a row of `Label: value` cells under it, and a
// table of what is in it. Read out and re-rendered as ours -- on a refused
// reservation this is what the operator is looking at while deciding what to
// change, and the vendor's version of it under a card of ours is the seam that
// made this screen look like two pages stacked.
//
// Two shapes, because two pages render it. The completed screen wraps the cards
// in `.parcels`; the announce screen the add-parcels flow ends on lays the same
// cards out in a plain `.container` instead. Both are named rather than reduced
// to `#ReservationContainer .card`, which would also take in any card the portal
// adds to either page for something that is not a parcel.
export const COMPLETED_PARCEL_SELECTOR =
	"#ReservationContainer .parcels .card, #ReservationContainer .container .card";
export const COMPLETED_PARCEL_TITLE_SELECTOR = ".card-title";
// The `Label: value` cells. Addressed as the divs that hold text rather than as
// the direct children of `.card-text`, which on the announce screen are the two
// Bootstrap columns the cells are laid out in -- reading those gave one field
// per column with both of its lines run together.
export const COMPLETED_PARCEL_FIELD_SELECTOR = ".card-text div:not(:has(div))";
export const COMPLETED_STEP_ERROR_SELECTOR = ".material-icons.text-error";
export const COMPLETED_STEP_DETAIL_SELECTOR = ".pl-2";
export const COMPLETED_PROCEED_SELECTOR = "#ReservationContainer > div:nth-child(11) > div > button";

// The same button on the announce screen, where the block above it is laid out
// differently and the position does not hold. Tried after the position rather
// than merged into one selector list: a comma list is answered in document
// order, so a page with a second primary button somewhere above would hand back
// the wrong one.
export const COMPLETED_PROCEED_FALLBACK_SELECTOR = "#ReservationContainer button.btn-primary";

// The vendor's small wordmark and the back control, which the pages without a
// header band carry instead of one. Addressed by the image because the row
// around it has nothing else to name it by.
export const VENDOR_BAND_LOGO_SELECTOR = "img.nfLogoSmall";

// Dispatched on `document` when the settings dialog has written its changes.
//
// The dialog lives in the footer's mount and the pages live in their own, so a
// setting one of them shows cannot be reached from the other by any of Vue's
// own means. What crosses between two apps on the same document is an event.
export const SETTINGS_SAVED_EVENT = "pse:settings-saved";

// The script on Greasy Fork, and the metadata block of its published version.
//
// Greasy Fork rather than the GitHub release, even though the release is the
// earlier signal: this is the copy Tampermonkey installs from, so it is the one
// that decides whether an update is actually available to a workplace. A chip
// pointing at a version Greasy Fork has not synced yet is a chip nobody can
// act on.
//
// The filename in the URL is decoration -- Greasy Fork answers on the id alone
// -- but it is kept accurate so the URL is recognisable in a network log.
export const GREASYFORK_SCRIPT_ID = "594401";
export const GREASYFORK_META_URL =
	`https://update.greasyfork.org/scripts/${GREASYFORK_SCRIPT_ID}/Pack%26Ship%20Extended.meta.js`;

// Where a workplace is sent to fetch it: the script itself, not a page about
// it. Tampermonkey claims `.user.js` and answers this URL with its own install
// screen, so the chip is one click and one confirmation rather than a release
// page to read and an asset to find. See `src/update.ts`.
export const UPDATE_INSTALL_URL =
	`https://update.greasyfork.org/scripts/${GREASYFORK_SCRIPT_ID}/Pack%26Ship%20Extended.user.js`;

// How long an update check stands before another is made. The metadata block is
// a few hundred bytes and Greasy Fork does not meter it, so this is about not
// asking on every page rather than about a quota.
export const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000;

// Keys used with the GM value store.
export const STORAGE_KEYS = {
	settings: "PSE_Settings",
	reservationCache: "PSE_Reservation_Cache",
	lastOpenReservation: "PSE_Last_Open_Reservation",
	lastCompletedReservation: "PSE_Last_Completed_Reservation",
	// One key per finished reservation, suffixed with its number.
	//
	// Not one key holding the list: a mass complete finishes up to fifty
	// reservations in tabs that all reach the completed screen within a second
	// of each other, and a list would have every one of them read it, add
	// itself, and write the whole thing back -- so all but the last write would
	// be overwritten by a copy taken before it. Separate keys cannot collide,
	// which is the same reason the run's own state is stored this way.
	completedEntryPrefix: "PSE_Completed_",
	currentUser: "PSE_Current_User",
	// What the last update check found, shared by every tab on the machine.
	updateCheck: "PSE_Update_Check",
	// When this machine was last touched by somebody, and whether a sign-out is
	// owed. Both are shared by every tab in the profile: the tabs are one
	// workplace, so a packer working in one of them keeps all of them signed in,
	// and a sign-out that could not be carried out on one page is carried out on
	// the next. See `src/idleLogout.ts`.
	idleActivity: "PSE_Idle_Activity",
	pendingLogout: "PSE_Pending_Logout",
	// When the ERP session was last touched on purpose, shared so that every tab
	// on the machine counts as one keep-alive rather than one each. See
	// `src/erpKeepAlive.ts`.
	erpKeepAlive: "PSE_Erp_KeepAlive",
	swClientId: "PSE_Shopware_Client_Id",
	swClientSecret: "PSE_Shopware_Client_Secret",
	// Suffixed with a reservation number, one key per mass complete entry.
	massCompleteEntryPrefix: "PSE_MCEntry_",
} as const;

// How many finished reservations the search screen keeps.
//
// Comfortably more than the fifty a single mass complete can finish, so a run
// that size cannot push the whole of the morning's work out of the list in one
// go and leave nothing but itself.
//
// It is also what keeps the store from growing: one key is written per
// reservation and the oldest beyond this count are deleted as new ones arrive.
export const COMPLETED_HISTORY_LIMIT = 80;

export function completedEntryKey(reservationNumber: string) {
	return `${STORAGE_KEYS.completedEntryPrefix}${reservationNumber}`;
}

export function massCompleteEntryKey(reservationNumber: string) {
	return `${STORAGE_KEYS.massCompleteEntryPrefix}${reservationNumber}`;
}
