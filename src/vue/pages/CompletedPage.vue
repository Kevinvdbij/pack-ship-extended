<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue';
import * as RVUtils from '../../retailVistaUtils.ts';
import Settings from '../../settings.ts';
import { MassCompleteStatus } from '../../interfaces.ts';
import { afterPaint, afterReveal } from '../../reveal.ts';
import { standInForPortalPage } from '../../standIn.ts';
import { COMPLETED_CONTAINER_SELECTOR, COMPLETED_PROCEED_SELECTOR, VENDOR_BAND_LOGO_SELECTOR } from '../../constants.ts';

// The last screen of a reservation: it has been packed, its parcels have been
// announced, and all that is left is the portal's own confirmation and the one
// button that closes it off and goes back to the search.
//
// With automatic handling on, nobody reads it -- the button is pressed for them
// and the page is gone in a moment. That is exactly why it needed a face: behind
// the cloak it was another blank screen in the middle of the flow, and blank is
// what the operator was left looking at every time a reservation finished.
//
// So the portal's block is taken off the page and this stands in its place: the
// same card the rest of the extension is built from, saying which reservation
// finished, and either that it is closing itself or the one button that does.
//
// The portal's block is hidden rather than removed. Its button is what actually
// finishes the reservation -- ours only clicks it -- and its hidden inputs are
// where the reservation's number and id are read from.

// Nothing of ours is shown until the portal's page has been recognised. If the
// block this stands in for is not there, this is not the page we think it is,
// and the operator is better off with the vendor's screen than with a card of
// ours over a page we have not understood.
const replaced = ref(false);

// Off while automatic handling is on: the button is about to be pressed anyway,
// and offering it as well invites a second press into a page that is already
// navigating.
const finalizing = ref(false);

const reservationNumber = ref("");

// Whatever the portal calls it. This is its button being pressed, so it is its
// word that goes on ours -- and a label read off the page cannot drift from what
// the control actually does the way a copy of it here would.
const proceedLabel = ref("Afronden");

// Our own block, once it is in the document: what the rest of the portal's page
// is hidden around. See `standInForPortalPage`.
const root = useTemplateRef<HTMLElement>("root");

// Puts the portal's page back, for the one path that gives up on this screen.
let restorePortalPage: (() => void) | null = null;

onMounted(() => {
	const container = document.querySelector(COMPLETED_CONTAINER_SELECTOR);

	if (!container) {
		return;
	}

	// Read before anything is hidden: both come out of the portal's own inputs,
	// which stay in the document either way, but there is no reason to depend on
	// that ordering.
	reservationNumber.value = readReservationNumber();
	proceedLabel.value = proceedButton()?.textContent?.trim() || proceedLabel.value;

	updateAutoComplete();

	container.classList.add("pse-portal-replaced");

	// And with it everything else the portal laid out in this cell -- the
	// reservation sidebar above all, which otherwise stands there beside a card
	// that has been pushed below the whole page it replaces.
	if (root.value) {
		restorePortalPage = standInForPortalPage(root.value);
	}

	// This page is served without a header band, and carries the vendor's small
	// wordmark in its place. Our own band is mounted above it by `main.ts`, so
	// what is left is a second header under the first.
	document.querySelector(VENDOR_BAND_LOGO_SELECTOR)?.closest(".row")
		?.classList.add("pse-portal-replaced");

	replaced.value = true;

	RVUtils.setLastCompletedReservation({
		id: RVUtils.getCurrentReservationId(),
		number: RVUtils.getCurrentReservationNumber()
	});

	if (!Settings.autoMasterSwitch) {
		return;
	}

	finalizing.value = true;

	// Queued behind the reveal and then behind the paint, so the card saying the
	// reservation is done is actually on screen before the click navigates away
	// from it -- and, on a page nobody is looking at, so there is no wait at all.
	// A mass complete finishes every one of its reservations on this page in a
	// background tab, where frames never come; see `afterPaint`.
	afterReveal(() => afterPaint(finalize));
});

function readReservationNumber(): string {
	try {
		return RVUtils.getCurrentReservationNumber();
	} catch {
		return "";
	}
}

function proceedButton(): HTMLButtonElement | null {
	return document.querySelector<HTMLButtonElement>(COMPLETED_PROCEED_SELECTOR);
}

// The portal's own button, pressed. Guarded rather than assumed: this is the
// last step of a reservation, and a selector that has moved should leave the
// operator on a screen they can finish by hand rather than throwing.
function finalize() {
	const button = proceedButton();

	if (!button) {
		console.error("Pack&Ship Extended could not find the button that finishes the reservation.");

		// Back to the state that offers it, since there is nothing else left to
		// press and the operator has to be able to get out of here.
		finalizing.value = false;
		replaced.value = false;
		document.querySelector(COMPLETED_CONTAINER_SELECTOR)?.classList.remove("pse-portal-replaced");
		restorePortalPage?.();
		restorePortalPage = null;

		return;
	}

	button.click();
}

function updateAutoComplete() {
	const orderNumber = RVUtils.getCurrentReservationNumber();

	if (RVUtils.isMassCompleteReservation(orderNumber)) {
		RVUtils.updateMassCompleteStatus( { reservationNumber: orderNumber, status: MassCompleteStatus.finished });
	}
}
</script>

<template>
	<!-- Always rendered, even when nothing is shown in it: this is the element
	     the portal's page is hidden around, so it has to exist before there is
	     anything to put in it. -->
	<div ref="root">
		<div class="pse-done" v-if="replaced">
			<div class="pse-done-card">
				<!-- The mark is the message: at a glance, from a step back, this
				     screen says the reservation is off the bench. -->
				<span class="pse-done-mark" :class="{ 'is-working': finalizing }" aria-hidden="true">
					<svg v-if="!finalizing" viewBox="0 0 24 24" width="30" height="30" fill="none"
						stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
						<path d="M5 12.5l4.5 4.5L19 7.5" />
					</svg>
					<span v-else class="pse-done-spinner"></span>
				</span>

				<h1 class="pse-done-title">Reservering afgerond</h1>

				<p class="pse-done-number" v-if="reservationNumber">{{ reservationNumber }}</p>

				<p class="pse-done-text" v-if="finalizing">
					Wordt afgesloten en gaat terug naar zoeken...
				</p>
				<p class="pse-done-text" v-else>
					De pakketten zijn aangemeld. Sluit de reservering af om verder te gaan.
				</p>

				<!-- One control, and only when it is the operator's to press. -->
				<button v-if="!finalizing" type="button" class="pse-done-button" @click="finalize()">
					{{ proceedLabel }}
				</button>
			</div>
		</div>
	</div>
</template>

<style scoped>
.pse-done {
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: center;
	/* The band and the footer are the rest of the window; this fills what is
	   between them so the card sits in the middle of the screen rather than
	   under the header. */
	min-height: calc(100vh - 260px);
	padding: 48px 24px;
	color: var(--pse-ink);
	/* The portal wraps the page in `.container-fluid.text-center`. */
	text-align: left;
}

.pse-done :deep(*) {
	box-sizing: border-box;
}

/* Centred, unlike every other card in the extension. This one is not read, it
   is recognised: there is one fact on it and it is the same fact every time, so
   the shape of the card can carry it. */
.pse-done-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
	max-width: 460px;
	padding: 34px 34px 30px;
	border: 1px solid var(--pse-line);
	border-radius: 20px;
	background-color: #ffffff;
	text-align: center;
	box-shadow: 0 1px 2px rgba(20, 48, 33, 0.04), 0 18px 40px -28px rgba(20, 48, 33, 0.45);
}

.pse-done-mark {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 62px;
	height: 62px;
	margin-bottom: 18px;
	border-radius: 50%;
	background-color: var(--pse-brand-soft);
	color: var(--pse-brand-ink);
}

/* While the page is closing itself the mark is the wait rather than the verdict:
   the reservation is done, but this screen is not finished with it yet. */
.pse-done-mark.is-working {
	background-color: var(--pse-well);
}

/* The same ring every other wait in the extension draws. */
.pse-done-spinner {
	width: 26px;
	height: 26px;
	border: 3px solid var(--pse-brand-ring);
	border-top-color: var(--pse-brand);
	border-radius: 50%;
	animation: pse-done-spin 0.7s linear infinite;
}

@keyframes pse-done-spin {
	to {
		transform: rotate(360deg);
	}
}

.pse-done-title {
	margin: 0;
	font-size: 20px;
	font-weight: 700;
	line-height: 1.25;
	color: var(--pse-ink);
}

/* The one thing on this screen worth reading twice, and the thing that gets
   written on a note or typed into something else -- so it is set in the tabular
   face and given room of its own. */
.pse-done-number {
	margin: 8px 0 0;
	font-size: 26px;
	font-weight: 700;
	font-variant-numeric: tabular-nums;
	letter-spacing: 0.01em;
	line-height: 1.1;
	color: var(--pse-brand-ink);
}

.pse-done-text {
	margin: 12px 0 0;
	max-width: 34ch;
	font-size: 13.5px;
	line-height: 1.5;
	color: var(--pse-ink-soft);
}

.pse-done-button {
	width: 100%;
	height: 48px;
	margin-top: 22px;
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

.pse-done-button:hover {
	background-color: var(--pse-brand-ink-strong);
	box-shadow: 0 10px 22px -14px rgba(20, 48, 33, 0.8);
	transform: translateY(-1px);
}

.pse-done-button:active {
	transform: translateY(0);
	box-shadow: none;
}

.pse-done-button:focus {
	outline: none;
}

.pse-done-button:focus-visible {
	outline: none;
	box-shadow: 0 0 0 3px var(--pse-brand-ring);
}

@media (prefers-reduced-motion: reduce) {
	.pse-done-spinner {
		animation-duration: 1.6s;
	}
}

@media (max-width: 860px) {
	.pse-done {
		padding: 32px 16px;
	}

	.pse-done-card {
		padding: 28px 22px 24px;
	}
}
</style>
