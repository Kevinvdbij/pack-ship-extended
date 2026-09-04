<script setup lang="ts">
import { computed, onMounted, ref, Transition, useTemplateRef } from "vue";
import { ReservationSearchResponseType, ReservationSelectionModalData } from "../../interfaces.ts";
import Modal from "../components/ReservationSelectionModal.vue";
import SearchPanel from "../components/SearchPanel.vue";
import SearchField from "../components/SearchField.vue";
import ResumeButton from "../components/ResumeButton.vue";
import * as RVUtils from "../../retailVistaUtils.ts";
import { PACKING_PORTAL_URL } from "../../constants.ts";

// The portal's own search form. It stays in the document -- hidden, emptied of
// its inputs -- because it is still what carries the search: our fields are
// re-associated with it by id, so whatever else it holds (tokens, defaults) is
// serialised along with them.
const RESERVATION_FORM_ID = "frmReservations";
const RESERVATION_NUMBER_INPUT = "#ReservationNumber";
const BARCODE_INPUT = "#Productbarcode";

const showModal = ref(false);
const modalData = ref<ReservationSelectionModalData>();

const lastOpenReservation = ref(RVUtils.getLastOpenReservation());
const lastCompletedReservation = ref(RVUtils.getLastCompletedReservation());

// The reservation to add a parcel to. This form is ours end to end -- it only
// ever navigates to a URL -- so unlike the search fields there is no portal
// element behind it.
const addParcelsNumber = ref("");

// Set for as long as a search is in flight. Most searches end in a navigation,
// so the button stays in this state until the next page takes over; the ones
// that come back to us clear it themselves.
const searching = ref(false);

const messages = useTemplateRef<HTMLElement>("messages");

// Nothing to go back to, or the last thing opened is the last thing finished --
// in which case the other shortcut is the one that applies, and offering this
// one as well would put two buttons on the same reservation.
const canReopen = computed(() => Boolean(lastOpenReservation.value?.id)
	&& lastOpenReservation.value.id != lastCompletedReservation.value?.id);

const canAddToCompleted = computed(() => Boolean(lastCompletedReservation.value?.id));

onMounted(() => {
	replacePortalSearchBlock();
	keepScannerFocused();

	RVUtils.focusBarcodeInput();
});

// The scanner types into whatever has the cursor and presses return, so a
// cursor that is not in the barcode field means the next scan is dropped with
// nothing on screen to say so. Clicking anywhere that is not itself a control
// -- the card, the page margin -- is enough to lose it.
//
// So focus leaving the field is allowed to settle, and taken back only if
// nothing else claimed it. Moving to the other form's field, to a button or to
// the modal is someone going somewhere on purpose; landing on `body` is not.
function keepScannerFocused() {
	document.addEventListener("focusout", (event) => {
		if (event.target != document.querySelector(BARCODE_INPUT)) {
			return;
		}

		// Where focus went is not known until the browser has moved it, which
		// happens after this event.
		setTimeout(() => {
			if (showModal.value || document.activeElement != document.body) {
				return;
			}

			RVUtils.focusBarcodeInput();
		});
	});
}

// Whatever the operator picked in the modal, the page underneath is a search
// again the moment it closes -- so the cursor goes back where a scan can be
// caught rather than being left on the dismissed dialog.
function closeModal() {
	showModal.value = false;

	RVUtils.focusBarcodeInput();
}

// Our card renders in place of the portal's search block: the two inputs are
// lifted out of it into our fields, anything the portal has to say is lifted
// out with them, and what is left is taken off the page.
//
// This is a swap rather than an addition, so it only holds together while the
// page is still hidden -- see `src/reveal.ts`. That is also why the route
// mounts at DOM-ready: the block has to be complete before it can be taken
// apart.
function replacePortalSearchBlock() {
	const block = RVUtils.getSearchBlock();

	if (!block) {
		return;
	}

	// The portal renders its messages row inside the block on some responses and
	// above it on others. Moved when it is inside, left where it is when it is
	// not: either way an alert about the search ends up directly above the
	// search, and the element the response handler writes into still exists.
	const portalMessages = block.querySelector("#messages")?.parentElement;

	if (portalMessages && messages.value) {
		RVUtils.adoptElement(messages.value, portalMessages);
	}

	block.classList.add("pse-portal-replaced");

	// Out of the form and into our fields, then back into the form by id. A
	// control carries its form association in an attribute, so it does not have
	// to be a descendant of the form to be submitted with it.
	for (const selector of [RESERVATION_NUMBER_INPUT, BARCODE_INPUT]) {
		document.querySelector(selector)?.setAttribute("form", RESERVATION_FORM_ID);
	}

	// Both our submit button and a return key pressed in either field go through
	// the form's submit event, so there is one way in and one handler on it.
	document.querySelector("#" + RESERVATION_FORM_ID)?.addEventListener("submit", (e) => {
		e.preventDefault();
		onSearchReservation();
		RVUtils.focusBarcodeInput();
	});
}

async function onSearchReservation() {
	searching.value = true;

	const formData = $("#" + RESERVATION_FORM_ID).serialize();
	const response = await RVUtils.reservationSearchRequest(formData);

	handleResponse(response)
}

async function handleResponse(response: string) {
	const responseElement = document.createElement("div");
	responseElement.innerHTML = response;

	switch (RVUtils.evaluateSearchResponse(responseElement)) {
		case ReservationSearchResponseType.ContinueVerification:
			responseElement.setAttribute("hidden", "")
			document.body.append(responseElement);

			let responseOverview = <HTMLFormElement>responseElement.querySelector("#ReservationOverview");
			if (responseOverview) {
				RVUtils.cacheReservationDetails(RVUtils.getReservationDetailsFromOverview(responseOverview)!);
			}
			RVUtils.skipVerification(responseElement);
			break;

		case ReservationSearchResponseType.SelectionModal:
			modalData.value = RVUtils.retrieveModalData(responseElement);
			showModal.value = true;
			searching.value = false;
			RVUtils.setBusy(false);
			break;

		case ReservationSearchResponseType.RefreshMain:
			document.querySelector("#messages")!.parentElement!.innerHTML =
				responseElement.querySelector("#alert")!.parentElement!.parentElement!.innerHTML;

			searching.value = false;
			RVUtils.setBusy(false);
			break;

		case ReservationSearchResponseType.UnfinishedRun:
			RVUtils.handleUnfinishedRun(responseElement).then(() => {
				// Run function again to re-evaluate
				onSearchReservation();
			});
			break;
	}
}

// Both of these leave for another page, and the page they leave for takes a
// moment to answer. Until it does the browser keeps this one on screen, looking
// untouched -- which reads as a click that did not land, and gets clicked
// again. The overlay is what says the click was taken; it goes away with the
// page it was put on.
function reopenReservation(reservationId: string) {
	RVUtils.setBusy(true);

	window.location.href = `${PACKING_PORTAL_URL}/Parcels?reservationId=${reservationId}&allowCashOnDelivery=False`;
}

function openAddParcels(reservationNumber: string) {
	if (!reservationNumber) {
		return;
	}

	RVUtils.setBusy(true);

	window.location.href = `${PACKING_PORTAL_URL}/AddParcels/Search?ReservationNumber=${reservationNumber}`;
}

function openReservation(url: string) {
	RVUtils.fetchReservation(url).then((response) => {
		handleResponse(response);
	});
}
</script>

<template>
	<Teleport to="body">
		<Transition name="modal">
			<Modal :modal-data="modalData!" v-if="showModal" @close="closeModal()"
				@open="(reservationId: string) => openReservation(reservationId)" />
		</Transition>
	</Teleport>

	<div class="pse-search">
		<!-- Whatever the portal has to say about the last search, in the place it
		     is about. Empty on a page that has nothing to report, and collapsed
		     to nothing when it is. -->
		<div class="pse-messages" ref="messages"></div>

		<div class="pse-card">
			<SearchPanel title="Zoek reservering" subtitle="Scan een product of vul een reserveringsnummer in.">
				<template #icon>
					<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
						stroke-linecap="round" stroke-linejoin="round">
						<circle cx="11" cy="11" r="7" />
						<path d="M20 20l-3.6-3.6" />
					</svg>
				</template>

				<SearchField label="Reservering nr" :adopt="RESERVATION_NUMBER_INPUT" />
				<SearchField label="Product barcode" :adopt="BARCODE_INPUT" />

				<button type="submit" class="pse-submit pse-submit-end" :form="RESERVATION_FORM_ID"
					:disabled="searching">
					<span class="pse-spinner" v-if="searching" aria-hidden="true"></span>
					{{ searching ? "Bezig met zoeken" : "Zoek" }}
				</button>
			</SearchPanel>

			<span class="pse-card-split" aria-hidden="true"></span>

			<SearchPanel title="Pakket toevoegen" subtitle="Voor een reservering die al verwerkt is.">
				<template #icon>
					<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
						stroke-linecap="round" stroke-linejoin="round">
						<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
						<path d="M4 7.5l8 4.5 8-4.5" />
						<path d="M12 12v9" />
					</svg>
				</template>

				<!-- A form of ours, so a return key here submits this panel and not
				     the search beside it. -->
				<form class="pse-form" @submit.prevent="openAddParcels(addParcelsNumber)">
					<SearchField label="Reservering nr" placeholder="Bijv. 1234567" v-model="addParcelsNumber" />

					<button type="submit" class="pse-submit pse-submit-end" :disabled="!addParcelsNumber">
						Zoek
					</button>
				</form>
			</SearchPanel>
		</div>

		<div class="pse-resume-row">
			<ResumeButton label="Laatst geopende reservering" :reservation-number="lastOpenReservation?.number"
				:disabled="!canReopen" @click="reopenReservation(lastOpenReservation.id)">
				<template #icon>
					<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
						stroke-linecap="round" stroke-linejoin="round">
						<path d="M3.5 12a8.5 8.5 0 1 0 2.9-6.4" />
						<path d="M3 4v4.5h4.5" />
					</svg>
				</template>
			</ResumeButton>

			<ResumeButton label="Laatst voltooide reservering" :reservation-number="lastCompletedReservation?.number"
				:disabled="!canAddToCompleted" @click="openAddParcels(lastCompletedReservation.number)">
				<template #icon>
					<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
						stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="8.5" />
						<path d="M12 8.5v7M8.5 12h7" />
					</svg>
				</template>
			</ResumeButton>
		</div>
	</div>
</template>

<style scoped>
/* Colours come from the shared palette in `src/style.css` -- the header is a
   separate mount and draws on the same one. */
.pse-search {
	box-sizing: border-box;
	/* Narrower than the portal's full-width container: two forms and two
	   shortcuts do not need the whole screen, and holding them to a column keeps
	   the fields at a length that can be taken in at a glance. */
	max-width: 980px;
	margin: 28px auto 56px;
	padding: 0 24px;
	color: var(--pse-ink);
	/* The portal wraps the page in `.container-fluid.text-center`, which reaches
	   in here and centres every label and heading in the card. Stated once at the
	   root of our block rather than fought field by field. */
	text-align: left;
}

.pse-search :deep(*) {
	box-sizing: border-box;
}

/* No margin of its own: the portal's alerts carry Bootstrap's, and a wrapper
   that reserved space for messages that are not there would open a gap above
   the card on every ordinary load. */
.pse-messages:empty {
	display: none;
}

/* One card holding both forms, rather than two panels side by side. They are
   the same job asked two ways -- find a reservation -- so they share a surface
   and are separated by a line rather than by a gutter. */
.pse-card {
	display: grid;
	grid-template-columns: 1fr auto 1fr;
	gap: 34px;
	padding: 30px 34px;
	border: 1px solid var(--pse-line);
	border-radius: 20px;
	background-color: #ffffff;
	/* A close, tight shadow for the edge and a wide, soft one for the lift, so
	   the card sits on the page rather than being outlined on it. */
	box-shadow: 0 1px 2px rgba(20, 48, 33, 0.04), 0 18px 40px -28px rgba(20, 48, 33, 0.45);
}

.pse-card-split {
	width: 1px;
	background-color: var(--pse-line);
}

.pse-form {
	display: flex;
	flex-direction: column;
	gap: 18px;
	margin: 0;
	/* The panel is a flex column and this form is one of its items; stretching it
	   lets the button inside reach the bottom the way the other panel's does. */
	flex: 1;
}

.pse-submit {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 9px;
	width: 100%;
	height: 48px;
	margin: 0;
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

/* The one item in each panel that is pinned to the bottom, so the two buttons
   line up across the split however many fields sit above them. */
.pse-submit-end {
	margin-top: auto;
}

.pse-submit:hover:not(:disabled) {
	background-color: var(--pse-brand-ink-strong);
	box-shadow: 0 10px 22px -14px rgba(20, 48, 33, 0.8);
	transform: translateY(-1px);
}

.pse-submit:active:not(:disabled) {
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

.pse-submit:disabled {
	background-color: #cfdbd4;
	color: #ffffff;
	cursor: not-allowed;
}

.pse-spinner {
	width: 15px;
	height: 15px;
	flex: none;
	border: 2px solid rgba(255, 255, 255, 0.4);
	border-top-color: #ffffff;
	border-radius: 50%;
	animation: pse-spin 0.7s linear infinite;
}

@keyframes pse-spin {
	to {
		transform: rotate(360deg);
	}
}

/* Outside the card and on the page's own background: these are not searches,
   and putting them on the card would make them look like a third form. */
.pse-resume-row {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 14px;
	margin-top: 18px;
}

/* Below this the two columns are narrower than the fields in them are useful,
   so the card stacks: same order, one column, and the split turns from a
   vertical rule into a horizontal one. */
@media (max-width: 860px) {
	.pse-search {
		padding: 0 16px;
	}

	.pse-card {
		grid-template-columns: 1fr;
		gap: 26px;
		padding: 26px 22px;
	}

	.pse-card-split {
		width: auto;
		height: 1px;
	}

	/* The pin only earns its keep while there is a second button to line up
	   with. Stacked, it would push this one away from the fields it belongs to. */
	.pse-submit-end {
		margin-top: 0;
	}

	.pse-resume-row {
		grid-template-columns: 1fr;
	}
}
</style>
