import { LANGUAGE_FORM_SELECTOR, LANGUAGE_SELECT_SELECTOR } from "./constants.ts";
import { debug } from "./logger.ts";

// The language picker, handled like the environment one but with the decision
// already made: the portal is only ever used in Dutch here, so there is nothing
// to configure and nothing to show. The field is taken off the page for good
// and the session is corrected to Dutch on every page.
//
// Same reasoning as the environment picker for hiding it with a stylesheet
// rather than the `hidden` attribute: an author `display` rule from Bootstrap
// outranks the UA one, and a rule of ours with `!important` does not lose that
// argument. Same reasoning for injecting it at document-start, too -- the page
// is cloaked until the boot is done, so there is no window in which the control
// could be painted.
//
// It is kept in this module rather than in `src/styles/portal.css` only to sit
// beside the code that forces the language. Unlike the environment there is no
// configured state gating it, so it could equally have been a plain rule.
//
// The whole field goes, label and all -- unlike the environment field, nothing
// of ours takes its place, so leaving its space reserved would leave a hole.

// The portal's option value for Dutch. A locale string rather than an id, so
// unlike the environment's numeric ids there is nothing here that the portal
// might renumber underneath us and it is safe to pin.
const DUTCH_LANGUAGE_VALUE = "nl-NL";

let pickerStyle: HTMLStyleElement | undefined;

export function hideLanguagePicker() {
	if (!pickerStyle) {
		pickerStyle = document.createElement("style");

		// document.head does not exist at document-start; documentElement does.
		document.documentElement.append(pickerStyle);
	}

	pickerStyle.textContent = `
		${LANGUAGE_FORM_SELECTOR}, ${LANGUAGE_SELECT_SELECTOR} { display: none !important; }
	`;
}

export function getLanguageSelect(): HTMLSelectElement | null {
	return document.querySelector<HTMLSelectElement>(LANGUAGE_SELECT_SELECTOR);
}

// Pushes Dutch into the portal. Like the environment, the portal's own change
// handler posts the picker over AJAX and leaves the page standing, so this
// costs a request and nothing else.
export function applyDutchLanguage() {
	const select = getLanguageSelect();

	if (!select) {
		return;
	}

	if (select.value == DUTCH_LANGUAGE_VALUE) {
		return;
	}

	if (!Array.from(select.options).some((option) => option.value == DUTCH_LANGUAGE_VALUE)) {
		console.warn(`Dutch (${DUTCH_LANGUAGE_VALUE}) is not offered by the portal, leaving the session as it is.`);

		return;
	}

	debug(`Applying Dutch language, was (${select.value}).`);

	select.value = DUTCH_LANGUAGE_VALUE;
	// Through the portal's own jQuery change handler, which is what posts it.
	$(select).trigger("change");
}
