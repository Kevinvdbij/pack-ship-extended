<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue";
import { clearCurrentUser, setCurrentUser } from "../../currentUser.ts";
import { adoptElement, setBusy } from "../../retailVistaUtils.ts";
import { afterReveal } from "../../reveal.ts";
import { LOGIN_FOOTER_CONTAINER_SELECTOR } from "../../constants.ts";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import SearchPanel from "../components/SearchPanel.vue";
import SearchField from "../components/SearchField.vue";

// The portal's own login form. Like the search block on the search page it
// stays in the document -- hidden, emptied of its inputs -- because it is still
// what carries the login: our fields are re-associated with it by id, so the
// antiforgery token it holds is posted along with them.
const LOGIN_FORM_ID = "account";
const COMPANY_INPUT = "#Input_CompanyNumber";
const USER_NAME_INPUT = "#Input_UserName";
const PASSWORD_INPUT = "#Input_Password";

// Landing on this page means there is no usable session: a fresh visit, a
// rejected login (the portal re-renders this page) or an expiry redirect. Drop
// whatever name was stored so nothing stale can outlive the session.
clearCurrentUser();

// Where the minimal footer bar mounts. Built here rather than in `main.ts`
// because this page owns its whole layout: the portal serves it with a bare
// footer of its own instead of the row of controls the other pages carry, so
// there is no slot of the portal's to wait for -- only one to make.
//
// Before render, not in `onMounted`: a `<Teleport>` needs its target to exist
// the first time it renders, and this component mounts at DOM-ready, so the
// footer is already there to prepare.
const footerSlot = prepareFooter();

const errors = useTemplateRef<HTMLElement>("errors");

onMounted(() => {
	replacePortalLoginBlock();

	// The cloak hides the page with `visibility: hidden`, and a hidden element
	// cannot take focus -- see `src/reveal.ts`. The portal marks the user name
	// field `autofocus`, which the browser drops for the same reason, so the
	// cursor is put back once the page is on screen.
	afterReveal(() => document.querySelector<HTMLInputElement>(USER_NAME_INPUT)?.focus());
});

// Our card renders in place of the portal's login dialog: the three inputs are
// lifted out of it into our fields, its validation summary is lifted out with
// them, and the bare layout they sat in -- the vendor's wordmark, the NedFox
// logo, the dialog itself -- is taken off the page.
//
// A swap rather than an addition, so it only holds together while the page is
// still hidden, and it waits for a finished document: a half-parsed form has
// only half the inputs to lift.
function replacePortalLoginBlock() {
	// Whatever the portal has to say about the last attempt -- a rejected login
	// re-renders this page with the reason in here. Moved above the fields it is
	// about, and still the element the portal's own validation writes into.
	adoptElement(errors.value!, document.querySelector(`#${LOGIN_FORM_ID} .text-danger`));

	// Out of the form and into our fields, then back into the form by id. A
	// control carries its form association in an attribute, so it does not have
	// to be a descendant of the form to be submitted with it.
	for (const selector of [COMPANY_INPUT, USER_NAME_INPUT, PASSWORD_INPUT]) {
		document.querySelector(selector)?.setAttribute("form", LOGIN_FORM_ID);
	}

	// Everything the portal renders on this page lives in one wrapper, and by
	// now the parts of it worth keeping are ours. The form goes with it and
	// keeps working: a hidden form still serialises and still submits, and the
	// submit button left inside it is what a return key in a field still finds.
	document.querySelector(".mainContainer")?.classList.add("pse-portal-replaced");

	// Store the submitted name. If the login is rejected the page reloads and
	// the clear above runs again, so only a successful login leaves a name
	// behind. Nothing here prevents the default: the portal's own post is what
	// logs in, this only listens in on it.
	document.querySelector(`#${LOGIN_FORM_ID}`)?.addEventListener("submit", () => {
		// The portal's post takes a moment and the browser keeps this page up
		// until it answers, so the overlay is what says the sign-in was taken.
		// This page is served without one of the portal's, so `setBusy` supplies
		// the markup -- see `ensureBusyOverlay`.
		setBusy(true);

		const userName = document.querySelector<HTMLInputElement>(USER_NAME_INPUT)?.value.trim();
		const companyNumber = document.querySelector<HTMLInputElement>(COMPANY_INPUT)?.value.trim() ?? "";

		if (userName) {
			setCurrentUser({ userName, companyNumber, loggedInAt: Date.now() });
		} else {
			clearCurrentUser();
		}
	});
}

// The portal's footer here is one line of its own text in a container, so it is
// laid out the way the other pages' band is: our bar at the left end, the
// vendor's reference text collected at the right.
//
// Returns the element the bar mounts into, or null when the portal has not
// served a footer -- in which case the bar is simply not rendered, rather than
// being dropped somewhere it was not meant to go.
function prepareFooter() {
	const container = document.querySelector(LOGIN_FOOTER_CONTAINER_SELECTOR);

	if (!container) {
		return null;
	}

	// The container's contents are bare text nodes and a link, which as flex
	// items would each be spaced separately. Gathered into one element first, so
	// the row is our bar and their line and nothing else.
	const vendor = document.createElement("span");
	vendor.className = "pse-footer-end";
	vendor.append(...container.childNodes);

	// The portal prints its build numbers inside the login dialog, which is
	// about to be hidden along with the rest of it. It is worth keeping --
	// support asks for it now and then -- so it joins the copyright line here,
	// which puts the two pieces of "which system is this" information together.
	const build = document.querySelector(".mainContainer .text-muted");

	if (build?.textContent?.trim()) {
		const moved = document.createElement("span");
		moved.className = "pse-vendor";
		moved.textContent = build.textContent.trim();
		vendor.append(moved);
	}

	const slot = document.createElement("div");

	container.classList.add("pse-footer-login");
	container.append(slot, vendor);

	return slot;
}
</script>

<template>
	<!-- The band the other pages carry, rendered rather than teleported: this
	     page is served with a bare layout, so there is no header of the portal's
	     for it to be mounted against. The component itself is the same one, so
	     the logo is in the same place before and after signing in. -->
	<Header :linked="false" />

	<div class="pse-login">
		<div class="pse-login-card">
			<SearchPanel title="Inloggen" subtitle="Meld je aan om te beginnen met inpakken.">
				<template #icon>
					<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
						stroke-linecap="round" stroke-linejoin="round">
						<rect x="4" y="10.5" width="16" height="10.5" rx="2.5" />
						<path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
					</svg>
				</template>

				<!-- Empty on a first visit, and collapsed to nothing when it is. -->
				<div class="pse-login-errors" ref="errors"></div>

				<SearchField label="Bedrijf nr" :adopt="COMPANY_INPUT" />
				<SearchField label="Gebruikersnaam" :adopt="USER_NAME_INPUT" />
				<SearchField label="Wachtwoord" :adopt="PASSWORD_INPUT" />

				<button type="submit" class="pse-submit" :form="LOGIN_FORM_ID">
					Inloggen
				</button>
			</SearchPanel>
		</div>
	</div>

	<!-- Nothing the full bar carries applies while logged out: the automatic
	     handling and the Shopware credentials are for work that needs a session,
	     and there is no one signed in to name. What is left is which build is
	     running, which is the one thing worth having on a page somebody is
	     looking at because something went wrong. -->
	<Footer v-if="footerSlot" minimal :to="footerSlot" />
</template>

<style scoped>
/* The card is the only thing on the page, so it is centred in what is left of
   the viewport rather than left sitting under the band. The minimum keeps the
   footer at the bottom of a tall window instead of riding up against the card. */
.pse-login {
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: calc(100vh - 200px);
	padding: 48px 24px;
	color: var(--pse-ink);
	text-align: left;
}

.pse-login :deep(*) {
	box-sizing: border-box;
}

/* The search page's card, held to one panel's width: three short fields do not
   need more, and a login box that spans the screen reads as an unfinished page
   rather than as a deliberate one. */
.pse-login-card {
	width: 100%;
	max-width: 420px;
	padding: 30px 34px;
	border: 1px solid var(--pse-line);
	border-radius: 20px;
	background-color: #ffffff;
	/* A close, tight shadow for the edge and a wide, soft one for the lift, so
	   the card sits on the page rather than being outlined on it. */
	box-shadow: 0 1px 2px rgba(20, 48, 33, 0.04), 0 18px 40px -28px rgba(20, 48, 33, 0.45);
}

/* The portal's validation summary, which is served on every load and filled in
   on a rejected attempt. It is never absent and never empty -- there is always
   a hidden placeholder item in it -- so what says whether it has anything to
   report is the class the framework swaps between `validation-summary-valid`
   and `validation-summary-errors`, which is what this asks about. */
.pse-login-errors:not(:has(.validation-summary-errors)) {
	display: none;
}

.pse-login-errors :deep(ul) {
	margin: 0;
	padding: 12px 14px;
	border: 1px solid rgba(176, 58, 46, 0.28);
	border-radius: 12px;
	background-color: rgba(176, 58, 46, 0.06);
	list-style: none;
	font-size: 13px;
	line-height: 1.45;
	color: #a3372c;
}

/* The company number is a number field, and its stepper is of no use to
   somebody typing a branch code they already know -- it only puts a control in
   the corner of the field that belongs to nothing else on the card. */
.pse-login :deep(input[type="number"]) {
	-moz-appearance: textfield;
	appearance: textfield;
}

.pse-login :deep(input[type="number"]::-webkit-outer-spin-button),
.pse-login :deep(input[type="number"]::-webkit-inner-spin-button) {
	margin: 0;
	appearance: none;
}

/* The search page's submit, restated for the one button on this page. */
.pse-submit {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 48px;
	margin: 4px 0 0;
	padding: 0 18px;
	border: 0;
	border-radius: 12px;
	background-color: var(--pse-brand-ink);
	font: inherit;
	font-size: 14.5px;
	font-weight: 650;
	color: #ffffff;
	cursor: pointer;
	transition: background-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.pse-submit:hover {
	background-color: var(--pse-brand-ink-strong);
	box-shadow: 0 10px 22px -14px rgba(20, 48, 33, 0.8);
	transform: translateY(-1px);
}

.pse-submit:active {
	transform: translateY(0);
	box-shadow: none;
}

.pse-submit:focus {
	outline: none;
}

.pse-submit:focus-visible {
	outline: none;
	box-shadow: 0 0 0 3px var(--pse-brand-ring);
}

@media (max-width: 860px) {
	.pse-login {
		padding: 32px 16px;
	}

	.pse-login-card {
		padding: 26px 22px;
	}
}
</style>
