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
import HeaderExtension from './vue/components/Header.vue';
import Settings from "./settings.ts"
import { applyConfiguredEnvironment, getEnvironmentSelect, hideEnvironmentPicker, lockEnvironmentPicker } from './environment.ts';
import { applyDutchLanguage, hideLanguagePicker } from './language.ts';
import { ENVIRONMENT_FORM_SELECTOR, FOOTER_SLOT_SELECTOR } from './constants.ts';
import { armReveal, reveal } from './reveal.ts';
// The portal's own elements first, ours second, so a tie between the two is
// settled the way it reads: our markup wins on the page it is on. Both go up at
// document-start, which is behind the cloak -- see `src/styles/cloak.css`.
import "./styles/portal.css";
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
	// The login page is served with a bare layout: no header band to replace, no
	// footer of the shape the other pages carry, and no session for the
	// environment and language to be corrected on. It renders its own header and
	// its own minimal footer instead -- see `LoginPage.vue`.
	bareLayout?: boolean;
}

const appendToBody = (host: HTMLDivElement) => document.body.append(host);

// First match wins, so the catch-all search page has to come last.
const routes: Route[] = [
	{
		pattern: /outdoor\/packship\/Identity\/Account\/Login/,
		component: LoginPage,
		// Ahead of the portal's footer rather than at the end of the body: this
		// page is rendered end to end, so its band, its card and the footer have
		// to come out in that order. Appending would put the page under its own
		// footer.
		attach: (host) => document.querySelector("footer")?.insertAdjacentElement("beforebegin", host)
			?? document.body.append(host),
		bareLayout: true,
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
		// Directly after the portal's search block, which the page then takes
		// apart: it lifts the portal's own inputs into its own card and hides
		// what is left, so this is the block's position rather than a position
		// beside it.
		//
		// No anchor, unlike the routes above. An anchor exists as soon as its
		// opening tag is parsed, and a block that is only half parsed has only
		// half the inputs to lift -- so this one waits for a finished document.
		// It costs nothing: the reveal is gated on DOM-ready regardless, so
		// nothing of the portal's version is on screen either way.
		attach: (host) => RVUtils.getSearchBlock()?.insertAdjacentElement("afterend", host),
	},
];

Settings.load();

const path = window.location.pathname;
const pathWithQuery = path + window.location.search;

const route = routes.find((candidate) => candidate.pattern.test(candidate.matchQuery ? pathWithQuery : path));

// Armed first, before anything that can fail: the cloak hides the page whether
// or not the rest of this runs, so something has to be guaranteed to show it.
armReveal();

// Each of these waits on a different piece of the portal's markup, so they run
// concurrently and the page is shown once the last of them is done. None of
// them waits on the network: work that does renders a skeleton and fills it in
// after the reveal, because holding the whole page on a request is reliably
// worse than a region that arrives late.
Promise.all([lockPicker(), lockLanguage(), mountHeader(), mountFooter(), boot()])
	.catch((error) => console.error("Pack&Ship Extended failed to start.", error))
	// One more frame for Vue to flush what the mounts queued, so the page is
	// shown finished rather than mid-render.
	.then(() => nextTick())
	.then(reveal);

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
	if (route?.bareLayout || !(Settings.environmentId > 0)) {
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
	if (route?.bareLayout) {
		return;
	}

	hideLanguagePicker();
}

// The portal's header band is replaced rather than restyled: everything in it
// goes, and our own band takes its place. Both happen against the same element,
// so this waits for that element and nothing else -- the logo is bundled, so
// there is no image to fetch and nothing to render late.
//
// Mounted during the parse. The band is the first thing in the document, so it
// is parsed almost immediately and our version is in the portal's first paint;
// there is no half-built state to wait out, because nothing is lifted out of
// the portal's markup here.
async function mountHeader() {
	// The login page uses a bare layout with no band to replace.
	if (route?.bareLayout) {
		return;
	}

	const header = await whenPresent(RVUtils.getPortalHeader);

	if (!header) {
		return;
	}

	header.classList.add("pse-portal-replaced");

	mountApp(HeaderExtension, (host) => header.insertAdjacentElement("beforebegin", host));
}

// The footer row holds the environment label, so our controls have to be in it
// before it is first laid out -- added afterwards they reflow the row and shove
// the label sideways, which is the flicker they appear to cause. Everything the
// footer renders comes from the GM value store, so waiting for its slot to be
// parsed is the only wait it needs.
async function mountFooter() {
	if (route?.bareLayout) {
		return;
	}

	const slot = await whenPresent(() => document.querySelector(FOOTER_SLOT_SELECTOR));

	centreFooterRow(slot);

	mountApp(FooterExtension, appendToBody);

	// After the mount, not before: our bar is what the slot was waited on for,
	// and the vendor line only has somewhere to go once the far end of the
	// footer has been parsed as well.
	await moveVendorBuildLine();
}

// The portal's footer cells let their contents sit where the line box puts
// them, which was fine when everything in the band was one size of text. Our
// bar is taller than the text beside it, so the logout link and the version
// line ended up riding high against it. Centring the row and the cell we mount
// into settles all three against the same middle.
//
// Classes rather than inline styles, so the rules are in the stylesheet with
// the rest of the footer's and a look at the DOM shows what is ours.
function centreFooterRow(slot: Element | null) {
	const cell = slot?.parentElement;

	if (!cell) {
		return;
	}

	cell.classList.add("pse-footer-cell");
	cell.parentElement?.classList.add("pse-footer-row");
}

// The portal prints its own build numbers into the same footer cell we mount
// into, which put two versions side by side with nothing to say which one was
// ours. It is still worth having -- support asks for it now and then -- so it
// is moved to the far end of the footer beside the environment label rather
// than dropped, which clears the space in front of our bar and puts the two
// pieces of "which system is this" information together.
//
// Found by walking for the text rather than by a selector: the portal renders
// it as a bare node among others in that cell, so there is nothing to address.
// Only text nodes are touched, so no element of theirs is hidden or moved and
// the logout link beside it cannot be caught by the match.
async function moveVendorBuildLine() {
	// The environment picker sits at the far end of the same footer row, so it
	// doubles as the wait for that end having been parsed and as the anchor the
	// line is moved to. Without it there is nowhere better for the line to go,
	// so it stays where the portal put it -- out of the way is not worth losing
	// it over.
	const target = (await whenPresent(() => document.querySelector(ENVIRONMENT_FORM_SELECTOR)))?.parentElement;
	const footer = document.querySelector("footer");

	if (!target || !footer) {
		return;
	}

	const vendor = /NedFox|retail platform/i;
	const walker = document.createTreeWalker(footer, NodeFilter.SHOW_TEXT);
	const lines: Text[] = [];

	for (let node = walker.nextNode(); node; node = walker.nextNode()) {
		if (vendor.test(node.nodeValue ?? "")) {
			lines.push(node as Text);
		}
	}

	if (lines.length == 0) {
		return;
	}

	const moved = document.createElement("span");
	moved.className = "pse-vendor";
	moved.textContent = lines.map((line) => line.nodeValue?.trim()).filter(Boolean).join(" ");

	for (const line of lines) {
		line.nodeValue = "";
	}

	// Both halves of the footer's right end are reference text, so the cell is
	// laid out as one muted line rather than left as two things that happen to
	// have landed in the same box -- see `.pse-footer-end`.
	target.classList.add("pse-footer-end");

	// Ahead of the environment, which is the one thing in the footer that is
	// read on purpose rather than glanced at.
	target.prepend(moved);
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

		if (!route?.bareLayout) {
			// Corrects the portal session over AJAX, without a reload. Left
			// until the document is ready because it goes through the portal's
			// own jQuery change handler.
			applyConfiguredEnvironment();
			applyDutchLanguage();
		}

		await nextTick();
	} catch (error) {
		console.error("Pack&Ship Extended failed to mount.", error);
	}
}
