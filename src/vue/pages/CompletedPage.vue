<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue';
import * as RVUtils from '../../retailVistaUtils.ts';
import Settings from '../../settings.ts';
import { MassCompleteStatus } from '../../interfaces.ts';
import { afterPaint, afterReveal } from '../../reveal.ts';
import { standInForPortalPage } from '../../standIn.ts';
import {
	COMPLETED_CONTAINER_SELECTOR, COMPLETED_HEADING_SELECTOR, COMPLETED_PROCEED_SELECTOR,
	COMPLETED_STEP_DETAIL_SELECTOR, COMPLETED_STEP_ERROR_SELECTOR, COMPLETED_STEP_SELECTOR,
	PACKING_PORTAL_URL, VENDOR_BAND_LOGO_SELECTOR
} from '../../constants.ts';

// One step of the portal's own account of what it did with the reservation.
interface Failure {
	// "announced parcels - Failed", as the portal names and translates it.
	step: string;
	// What the carrier said, where the portal passes it on. This is the part
	// worth reading: it is the difference between a label that will come out on
	// a retry and one that never will.
	detail: string;
}

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
//
// Not every reservation gets here having gone out. The announcement is a call to
// the carrier and the carrier can refuse it, and when it does the portal renders
// this same screen with the failure written into it instead. That is the one
// thing on this page nobody may click through: automatic handling used to press
// the button straight past it, which finished a reservation whose parcel has no
// label and left the operator with no sign that anything had gone wrong.
//
// So a failure stops the automatic step, keeps the screen, and says what was
// refused in the portal's own words. The way out is the way back -- the parcels
// page, where the parcel can be changed and announced again -- and finishing
// anyway stays available, one deliberate press away, because the operator is the
// one who knows whether the label came out of the printer.

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

// The steps the portal refused, read off its own list. Empty is the ordinary
// case: the reservation went out and this screen is a receipt.
const failures = ref<Failure[]>([]);

const failed = computed(() => failures.value.length > 0);

// The portal's heading for this screen. It already says which of the two
// outcomes this is, in the language the portal is running in, so it is read
// rather than written -- and only used where the outcome is the failure, since
// the success case has a line of our own that says more than "completed".
const heading = ref("");

// The parcels page for this reservation: the step before this one, and the
// only place a refused announcement can be put right.
const parcelsUrl = ref("");

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
	failures.value = readFailures(container);
	heading.value = document.querySelector(COMPLETED_HEADING_SELECTOR)?.textContent?.trim() ?? "";
	parcelsUrl.value = readParcelsUrl();

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

	// A refused reservation is where the automatic run stops, switch or no
	// switch. Everything after this screen assumes the parcels are on their way,
	// and they are not.
	if (failed.value || !Settings.autoMasterSwitch) {
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

// The portal's account of what it did, filtered down to the steps it marked as
// failed. The mark is the icon's class: the wording is translated and the step
// names are the portal's, so the class is the only part of the row that means
// the same thing in every language.
function readFailures(container: Element): Failure[] {
	const failures: Failure[] = [];

	for (const step of container.querySelectorAll(COMPLETED_STEP_SELECTOR)) {
		if (!step.querySelector(COMPLETED_STEP_ERROR_SELECTOR)) {
			continue;
		}

		const detail = step.querySelector(COMPLETED_STEP_DETAIL_SELECTOR);

		failures.push({
			// The step's name is the text of the row itself; the detail is a
			// block within it, so it is taken out before the name is read
			// rather than trimmed off the end of it afterwards.
			step: rowName(step, detail),
			detail: detail?.textContent?.trim() ?? "",
		});
	}

	return failures;
}

// The step's own name, without the detail block nested inside it and without
// the icon -- which is a `material-icons` ligature, so its text is the literal
// word "error" and reads as part of the sentence if it is left in.
//
// Taken from a copy of the row, so nothing is removed from the portal's page:
// that page is hidden rather than gone, and the operator may yet be handed it
// back.
function rowName(step: Element, detail: Element | null): string {
	const scope = (detail?.parentElement ?? step).cloneNode(true) as Element;

	for (const part of scope.querySelectorAll(`${COMPLETED_STEP_DETAIL_SELECTOR}, .material-icons`)) {
		part.remove();
	}

	return (scope.textContent ?? "").replace(/\s+/g, " ").trim();
}

// The parcels page for this reservation. The portal puts the reservation on this
// screen's own query string, which is where it is taken from -- the page's
// inputs carry the reservation's number rather than the id the parcels page
// wants, and the id in the summary block is not on this page at all.
function readParcelsUrl(): string {
	const reservationId = new URLSearchParams(window.location.search).get("reservationId");

	if (!reservationId) {
		return "";
	}

	return `${PACKING_PORTAL_URL}/Parcels?reservationId=${encodeURIComponent(reservationId)}&allowCashOnDelivery=False`;
}

// Back to the step that can be repeated. The page it leaves for takes a moment
// to answer and the browser keeps this one up meanwhile, so the click is
// acknowledged the way the search page acknowledges its own.
function backToParcels() {
	if (!parcelsUrl.value) {
		return;
	}

	RVUtils.setBusy(true);

	window.location.href = parcelsUrl.value;
}

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

	if (!RVUtils.isMassCompleteReservation(orderNumber)) {
		return;
	}

	// A refused reservation reported as finished is worse than no report at
	// all: the run's summary counts it among the ones that went out, and the
	// one screen that said otherwise has been navigated away from.
	RVUtils.updateMassCompleteStatus({
		reservationNumber: orderNumber,
		status: failed.value ? MassCompleteStatus.failed : MassCompleteStatus.finished
	});
}
</script>

<template>
	<!-- Always rendered, even when nothing is shown in it: this is the element
	     the portal's page is hidden around, so it has to exist before there is
	     anything to put in it. -->
	<div ref="root">
		<div class="pse-done" v-if="replaced">
			<!-- Two cards, not one card with the failure written into it: the
			     screens say opposite things and are acted on differently, and
			     the operator has to be able to tell them apart from a step back
			     without reading either. -->
			<div class="pse-done-card" :class="{ 'is-failed': failed }">
				<!-- The mark is the message: at a glance, from a step back, this
				     screen says the reservation is off the bench -- or that it
				     is not. -->
				<span class="pse-done-mark" :class="{ 'is-working': finalizing, 'is-failed': failed }"
					aria-hidden="true">
					<svg v-if="failed" viewBox="0 0 24 24" width="30" height="30" fill="none"
						stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12 8v5" />
						<path d="M12 16.6v.1" />
						<path d="M10.3 3.9L2.6 17.2A2 2 0 004.3 20.2h15.4a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
					</svg>
					<svg v-else-if="!finalizing" viewBox="0 0 24 24" width="30" height="30" fill="none"
						stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
						<path d="M5 12.5l4.5 4.5L19 7.5" />
					</svg>
					<span v-else class="pse-done-spinner"></span>
				</span>

				<h1 class="pse-done-title">{{ failed ? (heading || "Reservering niet verzonden") : "Reservering afgerond" }}</h1>

				<p class="pse-done-number" v-if="reservationNumber">{{ reservationNumber }}</p>

				<!-- The portal's own account of what was refused. It is the only
				     thing on this screen that says what to do next, so it is set
				     to be read rather than tucked under an icon. -->
				<ul class="pse-done-failures" v-if="failed">
					<li class="pse-done-failure" v-for="(failure, index) in failures" :key="index">
						<span class="pse-done-failure-step" v-if="failure.step">{{ failure.step }}</span>
						<span class="pse-done-failure-detail" v-if="failure.detail">{{ failure.detail }}</span>
					</li>
				</ul>

				<p class="pse-done-text" v-if="failed">
					De pakketten zijn niet aangemeld. Ga terug naar de pakketten om het opnieuw te
					proberen.
				</p>
				<p class="pse-done-text" v-else-if="finalizing">
					Wordt afgesloten en gaat terug naar zoeken...
				</p>
				<p class="pse-done-text" v-else>
					De pakketten zijn aangemeld. Sluit de reservering af om verder te gaan.
				</p>

				<!-- On a failure the way back is the offer, and finishing anyway
				     is kept as the quiet one beside it: it is a real thing to
				     want -- the label may have come out regardless -- but it is
				     not what this screen is recommending. -->
				<div class="pse-done-actions" v-if="failed">
					<button v-if="parcelsUrl" type="button" class="pse-done-button" @click="backToParcels()">
						Terug naar pakketten
					</button>
					<button type="button" class="pse-done-button is-quiet" @click="finalize()">
						{{ proceedLabel }}
					</button>
				</div>

				<!-- One control, and only when it is the operator's to press. -->
				<button v-else-if="!finalizing" type="button" class="pse-done-button" @click="finalize()">
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

/* A refused reservation. The card is the same card -- same shape, same weight --
   and only its accents move off the green, because this is the same moment in
   the same run and not a different kind of screen. */
.pse-done-card.is-failed {
	border-color: var(--pse-alert-soft);
}

.pse-done-mark.is-failed {
	background-color: var(--pse-alert-soft);
	color: var(--pse-alert-ink);
}

/* Wider than the success card: there is a message from the carrier on it, and
   that message is a sentence rather than a number. */
.pse-done-card.is-failed {
	max-width: 560px;
}

.pse-done-card.is-failed .pse-done-number {
	color: var(--pse-alert-ink);
}

/* The success card's line is four words and reads best narrow. This one is a
   sentence with an instruction in it, set to the width of the message above it
   rather than to the width the shorter line wanted. */
.pse-done-card.is-failed .pse-done-text {
	max-width: 46ch;
}

/* The portal's own account of what was refused. Left-aligned inside a centred
   card: it is the one block here that is read line by line. */
.pse-done-failures {
	width: 100%;
	margin: 18px 0 0;
	padding: 0;
	list-style: none;
	text-align: left;
}

.pse-done-failure {
	padding: 12px 14px;
	border: 1px solid var(--pse-alert-soft);
	border-left: 3px solid var(--pse-alert);
	border-radius: 12px;
	background-color: var(--pse-alert-wash);
}

.pse-done-failure + .pse-done-failure {
	margin-top: 8px;
}

.pse-done-failure-step {
	display: block;
	font-size: 13.5px;
	font-weight: 650;
	line-height: 1.35;
	color: var(--pse-alert-ink);
}

/* The carrier's own words, which is what a retry is judged on. Set in the
   reading colour rather than the alert one: it is information, and a whole
   paragraph in red is harder to read for no gain. */
.pse-done-failure-detail {
	display: block;
	margin-top: 4px;
	font-size: 13px;
	line-height: 1.5;
	color: var(--pse-ink-soft);
	overflow-wrap: anywhere;
}

/* Both ways out, side by side while there is room for them. */
.pse-done-actions {
	display: flex;
	gap: 10px;
	width: 100%;
	margin-top: 22px;
}

.pse-done-actions .pse-done-button {
	margin-top: 0;
}

/* The second way out. Available, plainly labelled, and not competing with the
   one the screen is recommending. */
.pse-done-button.is-quiet {
	border: 1px solid var(--pse-line);
	background-color: #ffffff;
	color: var(--pse-ink-soft);
}

.pse-done-button.is-quiet:hover {
	border-color: var(--pse-ink-faint);
	background-color: var(--pse-well);
	color: var(--pse-ink);
	box-shadow: none;
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

	/* At this width the two of them side by side leave neither wide enough to
	   read, so they stack -- the way back first. */
	.pse-done-actions {
		flex-direction: column;
	}

	.pse-done-card {
		padding: 28px 22px 24px;
	}
}
</style>
