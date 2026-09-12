import {
	ERP_APP_MARKER, ERP_LOGIN_FIELDS, ERP_LOGIN_MARKER, ERP_LOGIN_PATH, ERP_LOGOUT_TARGET, ERP_PAGE_PATH, ERP_URL
} from "./constants.ts";
import { debug } from "./logger.ts";

// The second session.
//
// The rack bays live on the reservation, and the reservation lives in the ERP --
// which shares an origin with the packing portal but not a login. Signing into
// the portal signs nobody into `/outdoor`; ask it for a page without a session
// and it answers with its login form rather than with a status.
//
// So the portal's sign-in is followed by one of ours, with the same three values
// the operator just typed. Nothing is kept: the password is used for the length
// of one request and never reaches the value store. When the ERP session later
// lapses -- it expires on its own clock, and the portal's does not keep it alive
// -- there is nothing here to sign in with again, and the operator is asked.
// That is deliberate, and it is the reason a stored password is not needed.

// What `/outdoor` answers for this browser profile right now.
//
// Asked of the application page rather than of anything cheaper: the ERP has no
// endpoint that answers this, so what we can do is fetch a page that requires a
// session and recognise what came back.
//
// Three answers, not two, and the third is the one that matters for anything
// that runs on its own: an ERP that cannot be reached is not an ERP that has
// signed us out, and treating it as one would raise a sign-in prompt for a
// network blip -- on a station whose packing does not depend on the ERP at all.
//
// "alive" is settled both ways round, and deliberately. Asking only whether the
// login form is absent says yes to the error page a half-started session
// produces -- see `ERP_APP_MARKER` -- so what settles it is the application's
// own furniture being there. A page that is neither is not a session.
export type ErpSessionState = "alive" | "signed-out" | "unreachable";

export async function probeErpSession(): Promise<ErpSessionState> {
	try {
		const response = await fetch(`${ERP_URL}${ERP_PAGE_PATH}`, { credentials: "include", cache: "no-store" });
		const body = await response.text();

		if (response.ok && !body.includes(ERP_LOGIN_MARKER) && body.includes(ERP_APP_MARKER)) {
			return "alive";
		}

		return body.includes(ERP_LOGIN_MARKER) ? "signed-out" : "unreachable";
	} catch (error) {
		debug("Could not determine the ERP session state.", error);

		return "unreachable";
	}
}

// Whether `/outdoor` currently has a session in this browser profile. The
// yes-or-no form of the question above, for the callers whose answer to
// "signed out" and "unreachable" is the same: either way the note cannot be read.
export async function hasErpSession(): Promise<boolean> {
	return (await probeErpSession()) == "alive";
}

// A sign-out that is still on its way, so a sign-in started behind it waits.
//
// Both run from the login page: the sign-out when it loads, the sign-in when the
// form is submitted. Fast typing -- or a password manager -- can put the second
// on the wire before the first has posted, and a sign-out that lands after the
// sign-in it was meant to precede takes the new session down with it.
let signingOut: Promise<void> = Promise.resolve();

// Signs into the ERP with the credentials the portal was given.
//
// A WebForms post, which means the form has to be carried across whole from a
// freshly served render: the view state is signed and the event validation is a
// whitelist of what that particular render will accept, so neither can be
// invented here or cached from an earlier page -- and the rest of the form
// matters as much as those two, for the reason `serializeForm` sets out.
//
// Resolves to whether a session now exists rather than to what the post replied.
// A rejected sign-in re-renders the login form with a 200, so the status line
// says nothing -- what settles it is asking the question this module opens with.
export async function erpLogin(companyNumber: string, userName: string, password: string): Promise<boolean> {
	try {
		await signingOut;

		const form = await fetch(`${ERP_URL}${ERP_LOGIN_PATH}`, { credentials: "include" });
		const body = await form.text();

		const payload = serializeForm(body);

		payload.set(ERP_LOGIN_FIELDS.companyNumber, companyNumber);
		payload.set(ERP_LOGIN_FIELDS.userName, userName);
		payload.set(ERP_LOGIN_FIELDS.password, password);
		// The button posts its own name, which is how WebForms knows which
		// control was pressed. Its caption is what the server compares against,
		// and it is read off the form rather than written here: the page is
		// served in whichever language the browser asked for.
		payload.set(ERP_LOGIN_FIELDS.submit, submitCaption(body));

		await fetch(`${ERP_URL}${ERP_LOGIN_PATH}`, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: payload.toString(),
		});

		const signedIn = await hasErpSession();

		debug(signedIn ? "Signed into the ERP." : "The ERP refused the sign-in.");

		return signedIn;
	} catch (error) {
		console.error("Pack&Ship Extended could not sign into the ERP.", error);

		return false;
	}
}

// Ends the ERP session, so it goes when the portal's does.
//
// The two sessions are created together at sign-in -- see `LoginPage.vue` -- but
// nothing ends them together: the portal's sign-out is a form post to its own
// identity pages and the ERP knows nothing of it. Left alone, the ERP session
// outlives the portal's in the browser profile, and the next person to sign into
// the portal on this station inherits it. Their bays and reprints would then be
// written under the previous name whenever the sign-in that should replace it
// is slow, refused or times out -- which is precisely when nobody is looking.
//
// The ERP's own logout is a WebForms postback, `cmdLogout` on the application
// page, so it is driven the way the sign-in is: the page is fetched, the whole
// form is carried across, and the event target is set to that control.
//
// Never throws, and never worth waiting long for: a sign-out is not something
// to hold a page on. Resolves once it is done either way, so a sign-in can
// order itself behind it.
export function erpLogout(): Promise<void> {
	const work = (async () => {
		try {
			const response = await fetch(`${ERP_URL}${ERP_PAGE_PATH}`, { credentials: "include", cache: "no-store" });
			const body = await response.text();

			if (body.includes(ERP_LOGIN_MARKER) || !body.includes(ERP_APP_MARKER)) {
				// No session to end, or no application to end it through.
				return;
			}

			const payload = serializeForm(body);

			payload.set("__EVENTTARGET", ERP_LOGOUT_TARGET);
			payload.set("__EVENTARGUMENT", "");

			await fetch(`${ERP_URL}${ERP_PAGE_PATH}`, {
				method: "POST",
				credentials: "include",
				// Survives the navigation a sign-out is usually followed by.
				keepalive: true,
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: payload.toString(),
			});

			debug("Signed out of the ERP.");
		} catch (error) {
			debug("Could not sign out of the ERP.", error);
		}
	})();

	signingOut = work;

	return work;
}

// The whole login form, exactly as the browser would have posted it.
//
// Every named control, not just the `__VIEWSTATE` family -- and that distinction
// is the whole of this function. Posting only the view state and the three
// credentials signs in successfully and then lands on a page that throws:
//
//   Culture is not supported. Parameter name: name
//   -1 is an invalid culture identifier.
//   at NedFox.RetailVista.Default.Page_PreInit
//
// The login form carries a language picker, and the ERP takes the session's
// culture from it on the very next request. Left out, it arrives as -1 and the
// application page fails to initialise -- which looks exactly like a refused
// sign-in from the outside, since what comes back is not the application. The
// same trap is waiting behind every other control on the form, so the answer is
// to stop choosing which ones matter.
//
// Parsed rather than regexed out: the view state is base64 and runs to tens of
// kilobytes, and a pattern that has to stop at the closing quote of an attribute
// is one escaping surprise away from carrying half a field.
function serializeForm(body: string): URLSearchParams {
	const page = new DOMParser().parseFromString(body, "text/html");
	const payload = new URLSearchParams();

	const form = page.querySelector("form");

	if (!form) {
		return payload;
	}

	for (const field of Array.from(form.querySelectorAll<HTMLElement>("input, select, textarea"))) {
		const name = field.getAttribute("name");

		if (!name) {
			continue;
		}

		// By tag name, not by `instanceof`. This document came out of
		// `DOMParser`, which has no browsing context at all -- `defaultView` is
		// null on it, so reaching through it for a constructor throws before the
		// sign-in has even been attempted, and every caller sees the failure as
		// credentials being refused.
		if (field.tagName == "SELECT") {
			// `value` on a parsed select is the option carrying `selected`, or
			// the first one when none does -- which is what the browser would
			// have posted from the same markup.
			payload.set(name, (field as HTMLSelectElement).value);

			continue;
		}

		const input = field as HTMLInputElement;
		const type = (input.getAttribute("type") ?? "text").toLowerCase();

		// Unticked boxes post nothing at all, and a submit control posts only
		// when it is the one that was pressed -- which is set by the caller, for
		// the one we mean.
		if ((type == "checkbox" || type == "radio") && !input.hasAttribute("checked")) {
			continue;
		}

		if (type == "submit" || type == "button" || type == "image") {
			continue;
		}

		payload.set(name, input.value);
	}

	return payload;
}

// What the sign-in button is captioned on the form we were just served.
//
// Empty when it cannot be found, which posts an empty value rather than a guess.
// WebForms only needs the button's *name* present to know it was the one pressed
// -- the value is not what dispatches -- so this is belt and braces rather than
// the thing the post turns on.
function submitCaption(body: string): string {
	const page = new DOMParser().parseFromString(body, "text/html");
	const button = page.querySelector<HTMLInputElement>(`[name="${ERP_LOGIN_FIELDS.submit}"]`);

	return button?.value ?? "";
}
