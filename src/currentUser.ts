import { GM_addValueChangeListener, GM_deleteValue, GM_getValue, GM_setValue } from "$";
import { STORAGE_KEYS } from "./constants.ts";
import { debug } from "./logger.ts";

// Who the portal session belongs to, as far as we can tell.
//
// The portal's auth cookie is HttpOnly, so a script cannot read it and cannot
// tie a name to it directly. What we can observe is every page where the
// session changes: the Login page (fresh login, failed login, expiry redirect)
// and the Logout page. The auth cookie and the GM value store live in the same
// browser profile, so keeping them in step is a matter of clearing the stored
// name whenever one of those pages loads and storing it again when the login
// form is submitted. Reaching any other portal page then implies the last
// login submission succeeded. Whenever that chain is broken the record is
// absent, and the UI shows nothing rather than a stale name.
export interface CurrentUser {
	userName: string;
	companyNumber: string;
	// Epoch milliseconds of the login submission.
	loggedInAt: number;
}

export function getCurrentUser(): CurrentUser | undefined {
	const user = GM_getValue<CurrentUser | undefined>(STORAGE_KEYS.currentUser, undefined);

	return user?.userName ? user : undefined;
}

export function setCurrentUser(user: CurrentUser) {
	GM_setValue(STORAGE_KEYS.currentUser, user);
	debug("Stored current user:", user);
}

export function clearCurrentUser() {
	GM_deleteValue(STORAGE_KEYS.currentUser);
	debug("Cleared current user");
}

// Fires in every open tab when another tab logs in or out, so a page that is
// already open can update its badge without a reload.
export function onCurrentUserChange(callback: (user: CurrentUser | undefined) => void) {
	GM_addValueChangeListener(STORAGE_KEYS.currentUser, () => callback(getCurrentUser()));
}
