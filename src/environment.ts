import { ENVIRONMENT_FORM_SELECTOR, ENVIRONMENT_SELECT_SELECTOR } from "./constants.ts";
import { debug } from "./logger.ts";
import Settings from "./settings.ts";

export interface EnvironmentOption {
	id: number;
	name: string;
}

// The environment picker ties the session to a workplace, and through it to a
// printer. The portal stores the choice per user session, so someone logging in
// at another workplace carries their old environment along and prints there.
// Pinning it to the machine removes that failure mode: the configured value is
// pushed back into the portal on every page and the dropdown is taken away, so
// there is nothing left to forget to change.

// The portal's dropdown is hidden with a stylesheet rather than with the
// element's `hidden` attribute. That attribute is only a UA-stylesheet
// `display: none`, so any author rule that sets `display` on the select -- which
// is every Bootstrap form class the portal puts on it -- outranks it and the
// control stays on screen. A rule of our own with `!important` does not lose
// that argument.
//
// It is also installed before the select exists and never lifted while an
// environment is configured, so there is no window in which the dropdown is
// eligible to be painted: not during the parse, not on a slow load, not between
// our replacing it and anything else running.
//
// Injected from here rather than kept in a stylesheet, because whether the
// dropdown should be hidden depends on what is configured and CSS cannot know
// that. There is no race to lose: the cloak in `src/styles/cloak.css` keeps the
// page off screen until the boot is done, so a rule that goes up at
// document-start is in force before anything is visible.
//
// The element is appended to `documentElement`, which exists at document-start
// when `document.head` does not, and the rule carries an id and `!important`,
// so it wins wherever in the cascade it lands.
//
// Hidden rather than disabled, either way: a disabled control is left out of the
// serialized form, and that form is what carries the value to the portal.
let pickerStyle: HTMLStyleElement | undefined;

// Only the dropdown, and only ever hidden: it is never coming back on a page
// where an environment is configured. The field around it needs no gating of
// its own -- the page is not shown until the boot has finished, so the label is
// always in place by the time anything is on screen.
export function hideEnvironmentPicker() {
	setPickerStyle(`${ENVIRONMENT_SELECT_SELECTOR} { display: none !important; }`);
}

function setPickerStyle(rule: string) {
	if (!pickerStyle) {
		pickerStyle = document.createElement("style");

		// document.head does not exist at document-start; documentElement does,
		// and appending here also puts the rule after anything the theme
		// injected into the head, so it wins on order.
		document.documentElement.append(pickerStyle);
	}

	pickerStyle.textContent = rule;
}

// Puts the dropdown back with a rule of its own rather than merely dropping the
// one that hides it, so the control returns even if something else on the page
// -- a leftover style, a future rule of ours -- is also hiding it.
export function showEnvironmentPicker() {
	setPickerStyle(`${ENVIRONMENT_SELECT_SELECTOR} { display: inline-block !important; }`);
}

export function getEnvironmentSelect(): HTMLSelectElement | null {
	return document.querySelector<HTMLSelectElement>(ENVIRONMENT_SELECT_SELECTOR);
}

// The portal only renders the picker on pages that carry its footer, so the
// options are read from whatever page happens to be open rather than fetched.
export function getEnvironmentOptions(): EnvironmentOption[] {
	const select = getEnvironmentSelect();

	if (!select) {
		return [];
	}

	return Array.from(select.options)
		.map((option) => ({ id: Number(option.value), name: option.text.trim() }))
		// The portal opens the list with a blank placeholder entry.
		.filter((option) => option.id > 0 && option.name.length > 0);
}

export function getEnvironmentName(environmentId: number): string | undefined {
	return getEnvironmentOptions().find((option) => option.id == environmentId)?.name;
}

// The visual half of the lock, on its own: swaps the portal's dropdown for a
// plain label. It reads the markup and nothing else, so it can run during the
// parse, before the page is painted -- which is what keeps the dropdown from
// being seen at all rather than seen and then replaced.
export function lockEnvironmentPicker() {
	const select = getEnvironmentSelect();

	if (select) {
		syncEnvironmentPicker(select, Settings.environmentId);
	}
}

// Pushes the configured environment into the portal and hides the dropdown.
//
// The portal's own change handler posts the picker to Home/SetEnviroment over
// AJAX and leaves the page standing, so correcting the session costs a request
// and nothing else: no reload, and nothing for callers to wait for.
export function applyConfiguredEnvironment() {
	const select = getEnvironmentSelect();

	if (!select) {
		return;
	}

	const configured = Settings.environmentId;

	// Runs on every call, including the ones that follow a settings change, so
	// the footer shows the current setting straight away.
	syncEnvironmentPicker(select, configured);

	// Nothing configured: the portal's own picker is left in place so the
	// environment can still be set the usual way.
	if (!(configured > 0)) {
		return;
	}

	if (Number(select.value) == configured) {
		return;
	}

	if (!Array.from(select.options).some((option) => Number(option.value) == configured)) {
		console.warn(`Configured environment (${configured}) is not offered by the portal, leaving the session as it is.`);

		return;
	}

	debug(`Applying configured environment (${configured}), was (${select.value}).`);

	select.value = String(configured);
	// The portal posts the picker from a jQuery change handler, so going
	// through that handler keeps us on the path a click would take.
	$(select).trigger("change");
}

// The stored name first: it is the only source available before the portal has
// rendered its dropdown, which is the whole point of keeping it. The options are
// the fallback for a setting saved by a version that did not store the name yet,
// and reading them is also the chance to fill it in for next time.
function environmentLabel(environmentId: number): string {
	if (Settings.environmentName) {
		return Settings.environmentName;
	}

	const name = getEnvironmentName(environmentId);

	if (name) {
		Settings.environmentName = name;
		Settings.save();
	}

	return name ?? `#${environmentId}`;
}

// Shows the configured environment as plain text in place of the dropdown, or
// puts the dropdown back when nothing is configured. Idempotent, so calling it
// again after a settings change updates what the footer shows rather than
// leaving the previous name behind.
function syncEnvironmentPicker(select: HTMLSelectElement, environmentId: number) {
	const container = select.closest<HTMLFormElement>(ENVIRONMENT_FORM_SELECTOR) ?? select.parentElement;

	if (!container) {
		return;
	}

	let label = container.querySelector<HTMLElement>(".pse-environment-locked");

	if (!(environmentId > 0)) {
		showEnvironmentPicker();
		label?.remove();

		return;
	}

	// Covers configuring an environment for the first time on a page that
	// loaded without one, where no stylesheet went up at document-start.
	hideEnvironmentPicker();

	if (!label) {
		label = document.createElement("span");
		label.className = "pse-environment-locked";
		label.title = "Vastgezet in de Pack&Ship Extended instellingen";

		select.insertAdjacentElement("afterend", label);
	}

	label.textContent = environmentLabel(environmentId);

}
