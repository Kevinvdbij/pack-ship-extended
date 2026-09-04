import { Component, nextTick } from 'vue';
import * as RVUtils from "./retailVistaUtils";
import { domReady, mountApp, whenPresent } from './vue/mount.ts';
import SearchReservationsPage from './vue/pages/SearchReservationsPage.vue';
import VerifyProductsPage from './vue/pages/VerifyProductsPage.vue';
import CreateParcelsPage from './vue/pages/CreateParcelsPage.vue';
import CompletedPage from './vue/pages/CompletedPage.vue';
import AddParcelsPage from './vue/pages/AddParcelsPage.vue';
import LoginPage from './vue/pages/LoginPage.vue';
import LogoutPage from './vue/pages/LogoutPage.vue';
import FooterExtension from './vue/components/Footer.vue';
import Settings from "./settings.ts"
import { applyConfiguredEnvironment, getEnvironmentSelect, hideEnvironmentPicker, lockEnvironmentPicker } from './environment.ts';
import { applyDutchLanguage, hideLanguagePicker } from './language.ts';
import { FOOTER_SLOT_SELECTOR } from './constants.ts';
import "./style.css";
import "vue3-toastify/dist/index.css";

interface Route {
	pattern: RegExp;
	// Matched against the pathname, or against pathname + query string when the
	// route is only recognisable by its parameters.
	matchQuery?: boolean;
	// A route with no component is one the portal handles by itself.
	component?: Component;
	attach?: (host: HTMLDivElement) => void;
	// A specific portal element to hang the host off, rather than a position
	// within one. Set it and the route mounts as soon as that element is
	// parsed, which puts our UI in the portal's first paint -- but only an
	// anchor whose placement is exact mid-parse qualifies. "Append to the end
	// of X" does not: mid-parse the end of X is wherever the parser has got to,
	// so the host lands above content that has not streamed in yet. Those
	// routes leave this unset and mount once the document is complete.
	anchor?: () => Element | null;
	// The login page uses a bare layout without the footer we extend.
	noFooter?: boolean;
}

const appendToBody = (host: HTMLDivElement) => document.body.append(host);

// First match wins, so the catch-all search page has to come last.
const routes: Route[] = [
	{
		pattern: /outdoor\/packship\/Identity\/Account\/Login/,
		component: LoginPage,
		attach: appendToBody,
		noFooter: true,
	},
	{
		pattern: /outdoor\/packship\/Identity\/Account\/Logout/,
		component: LogoutPage,
		attach: appendToBody,
	},
	{
		pattern: /outdoor\/packship\/CompleteReservations/,
		component: CompletedPage,
		attach: appendToBody,
	},
	{
		pattern: /outdoor\/packship\/Parcels/,
		component: CreateParcelsPage,
		// afterbegin of a specific element, so the position is the same
		// whether the parser has filled it in yet or not.
		attach: (host) => RVUtils.getParcelContainerParent()?.insertAdjacentElement("afterbegin", host),
		anchor: RVUtils.getParcelContainerParent,
	},
	{
		pattern: /outdoor\/packship\/Reservations\/Index\//,
		component: VerifyProductsPage,
		attach: appendToBody,
	},
	{
		pattern: /outdoor\/packship\/AddParcels\/Search\?ReservationNumber=/,
		matchQuery: true,
		component: AddParcelsPage,
		attach: appendToBody,
	},
	{
		pattern: /outdoor\/packship\/AnnounceParcels/,
	},
	{
		pattern: /outdoor\/packship/,
		component: SearchReservationsPage,
		// Directly after the portal's search block rather than at the end of the
		// container: same place, but pinned to an element, so it is correct
		// mid-parse and our block is in the portal's first paint.
		attach: (host) => RVUtils.getSearchBlock()?.insertAdjacentElement("afterend", host),
		anchor: RVUtils.getSearchBlock,
	},
];

Settings.load();

const path = window.location.pathname;
const pathWithQuery = path + window.location.search;

const route = routes.find((candidate) => candidate.pattern.test(candidate.matchQuery ? pathWithQuery : path));

lockPicker();
lockLanguage();
mountFooter();
boot();

// Takes the portal's environment dropdown off the page before the parser has
// reached it, and puts our label in its place once it has.
//
// The stylesheet goes up first and stays up: an environment is configured, so
// the dropdown has no part to play on this page and there is no moment at which
// showing it would be right. That leaves nothing to get the timing of. The
// label arrives whenever it arrives -- late at worst, never preceded by the
// control it replaces -- and fades in on its own.
async function lockPicker() {
	// Nothing configured: the portal's dropdown is the interface, and hiding it
	// would take away the only way to set one.
	if (route?.noFooter || !(Settings.environmentId > 0)) {
		return;
	}

	hideEnvironmentPicker();

	// Only the element itself, not its contents: the label text comes from the
	// stored setting, so there is nothing to wait for the parser to fill in.
	await whenPresent(getEnvironmentSelect);

	lockEnvironmentPicker();
}

// The language picker has no configured state to check: Dutch is the only
// language this portal is used in, so the control is hidden unconditionally at
// document-start and never put back. Nothing of ours replaces it, so there is
// no label to wait for either -- only the session to correct, which happens at
// DOM-ready along with the environment.
function lockLanguage() {
	if (route?.noFooter) {
		return;
	}

	hideLanguagePicker();
}

// The footer row holds the environment label, so our controls have to be in it
// before it is first laid out -- added afterwards they reflow the row and shove
// the label sideways, which is the flicker they appear to cause. Everything the
// footer renders comes from the GM value store, so waiting for its slot to be
// parsed is the only wait it needs.
async function mountFooter() {
	if (route?.noFooter) {
		return;
	}

	await whenPresent(() => document.querySelector(FOOTER_SLOT_SELECTOR));

	mountApp(FooterExtension, appendToBody);
}

async function boot() {
	try {
		// A route that named an anchor mounts as soon as that anchor exists,
		// which is mid-parse and therefore in the first paint. The rest place
		// themselves relative to a finished document and have to wait for one.
		if (route?.component && route.attach && route.anchor) {
			await whenPresent(route.anchor);

			mountApp(route.component, route.attach);
		}

		// Everything below mounts into markup the portal serves, so it waits
		// for that markup to be complete. The portal has painted its own page
		// by then and that is fine: our blocks are appended past the end of
		// what it renders, so they fill space that was empty rather than
		// replacing anything, and nothing above them moves.
		await domReady();

		if (route?.component && route.attach && !route.anchor) {
			mountApp(route.component, route.attach);
		}

		if (!route?.noFooter) {
			// Corrects the portal session over AJAX, without a reload. Left
			// until the document is ready because it goes through the portal's
			// own jQuery change handler.
			applyConfiguredEnvironment();
			applyDutchLanguage();
		}

		await nextTick();
	} catch (error) {
		console.error("Pack&Ship Extended failed to start.", error);
	}
}
