<script setup lang="ts">
import { computed, onMounted, ref, Transition, useTemplateRef } from "vue";
import { ReservationSearchResponseType, ReservationSelectionModalData } from "../../interfaces.ts";
import Modal from "../components/ReservationSelectionModal.vue";
import SearchPanel from "../components/SearchPanel.vue";
import SearchField from "../components/SearchField.vue";
import SearchNotice from "../components/SearchNotice.vue";
import ResumeButton from "../components/ResumeButton.vue";
import CompletedHistoryPanel from "../components/CompletedHistoryPanel.vue";
import * as RVUtils from "../../retailVistaUtils.ts";
import { PACKING_PORTAL_URL, SETTINGS_SAVED_EVENT } from "../../constants.ts";
import Settings from "../../settings.ts";
import { playSound } from "../../sounds.ts";
import { debug } from "../../logger.ts";

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

// What this workplace has finished, newest first. Read once: nothing on this
// page adds to it -- the entries are written on the completed screen, which is
// a page away and arrives here as a fresh load.
const completedHistory = ref(RVUtils.getCompletedHistory());

// Whether the log is shown, which is the only thing the setting decides -- the
// entries are written on the completed screen regardless, so a workplace that
// switches it back on finds everything packed in the meantime already in it.
const showHistory = ref(Settings.showCompletedHistory);

// The panel is there when it is switched on and has something in it. An empty
// log is a column of nothing beside the card, and the card is better off with
// the width.
const hasHistory = computed(() => showHistory.value && completedHistory.value.length > 0);

// The reservation to add a parcel to. This form is ours end to end -- it only
// ever navigates to a URL -- so unlike the search fields there is no portal
// element behind it.
const addParcelsNumber = ref("");

// What is typed or scanned into the search panel's reservation field.
//
// A field of ours rather than the portal's `#ReservationNumber` taken over. The
// portal's element was adopted so the form would serialise it, and that is the
// part that never held: whatever we were reading and wiring there, it was not
// the input on screen -- the value never reached the portal and a return key in
// it did nothing. The query is built by hand now, so the field has no reason to
// be the portal's, and this way what is sent is what is shown.
const searchNumber = ref("");

// Set for as long as a search is in flight. Most searches end in a navigation,
// so the button stays in this state until the next page takes over; the ones
// that come back to us clear it themselves.
const searching = ref(false);

const messages = useTemplateRef<HTMLElement>("messages");

// The portal's alert, read off its markup and said again in our own words. Null
// on a page that has nothing to report, which is the ordinary load.
const notice = ref<Notice>();

// Nothing to go back to, or the last thing opened is the last thing finished --
// in which case the other shortcut is the one that applies, and offering this
// one as well would put two buttons on the same reservation.
const canReopen = computed(() => Boolean(lastOpenReservation.value?.id)
	&& lastOpenReservation.value.id != lastCompletedReservation.value?.id);

const canAddToCompleted = computed(() => Boolean(lastCompletedReservation.value?.id));

onMounted(() => {
	replacePortalSearchBlock();

	// The dialog that carries the switch is the footer's mount, not this one, so
	// the change arrives as an event rather than as a value this page can watch.
	// Without it the panel would only answer the switch on the next page load,
	// which on this screen can be a whole shift away.
	document.addEventListener(SETTINGS_SAVED_EVENT, () => showHistory.value = Settings.showCompletedHistory);

	// Placed once, as the page opens, and after that the cursor is the
	// operator's. It used to be taken back from anywhere it was not wanted --
	// every click that was not on a control put it straight back here -- which
	// on a screen people sit in front of all day argues with them rather than
	// helping. Nothing rewrites this field out from under the cursor the way the
	// parcel area does, so there is nothing else to answer: the other two
	// placements below are a finished search and a dismissed dialog, which are
	// both the operator's own action handing the screen back.
	RVUtils.focusBarcodeInput();
});

interface Notice {
	title: string;
	detail?: string;
	tone: "notice" | "alert";
}

// The portal's own alerts, translated where we recognise them.
//
// Only the messages the operator actually meets are listed. Anything else is
// shown as the portal wrote it -- English on a Dutch screen is worse than the
// alternative only until the alternative is a message that has been dropped,
// and a search can be answered with something we have not seen.
const NOTICES: { pattern: RegExp; notice: (match: RegExpMatchArray) => Notice }[] = [
	{
		// "Reservation 395361 is not processed yet. Parcels can be added through
		// the 'Search reservation' routine." -- the answer to a number typed into
		// the add-parcels form that has not been packed yet. The way forward is
		// the other form, named rather than pointed at: the card stacks on a
		// narrow screen and "the one beside it" is then the one below it.
		pattern: /reservation\s+(\d+)\s+is\s+not\s+processed\s+yet/i,
		notice: (match) => ({
			title: `Reservering ${match[1]} is nog niet ingepakt.`,
			detail: "Pak de reservering eerst in via \"Zoek reservering\". Pakketten toevoegen kan pas als de reservering is afgerond.",
			tone: "notice",
		}),
	},
];

// Reads whatever the portal left in `#messages` and renders it as ours.
//
// The element itself stays in the document and off the screen: the portal's
// response handler and ours both write into it, so it has to keep existing and
// keep being the thing that is written to. This turns it into something to look
// at rather than replacing it.
function readNotice() {
	const alert = messages.value?.querySelector(".alert");

	if (!alert) {
		notice.value = undefined;

		return;
	}

	// The dismiss button the portal renders inside the alert is not part of what
	// it says.
	const copy = alert.cloneNode(true) as Element;
	copy.querySelectorAll("button").forEach((button) => button.remove());

	const text = copy.textContent?.replace(/\s+/g, " ").trim();

	if (!text) {
		notice.value = undefined;

		return;
	}

	const known = NOTICES.map((entry) => {
		const match = text.match(entry.pattern);

		return match ? entry.notice(match) : undefined;
	}).find(Boolean);

	notice.value = known ?? {
		title: text,
		// The portal marks its own severity, and the only distinction our card
		// draws is between "read this" and "this went wrong".
		tone: alert.classList.contains("alert-danger") ? "alert" : "notice",
	};

	// A search that came back with something to read is not a scan that landed
	// wrong -- the scan was of the barcode field and the field is fine -- so a
	// plain notice stays quiet. What the portal marks as an error is the process
	// failing, and gets the sound for that.
	if (notice.value.tone == "alert") {
		playSound("error");
	}
}

// Dismissing takes the portal's alert with it, so a message that has been read
// cannot come back when the next response leaves the element alone.
function dismissNotice() {
	messages.value?.querySelector(".alert")?.remove();

	notice.value = undefined;
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
	// above it on others. Taken either way, so the row we read from and the row
	// the response handler writes into are the same one wherever the portal put
	// it -- and so a raw alert of theirs cannot be left standing above our card.
	const portalMessages = (block.querySelector("#messages") ?? document.querySelector("#messages"))
		?.parentElement;

	if (portalMessages && messages.value) {
		// Hidden as it is adopted: the row is kept for what writes into it, and
		// what it says is rendered again above the card as ours.
		RVUtils.adoptElement(messages.value, portalMessages, "pse-portal-replaced");
	}

	if (messages.value) {
		// A search that comes back to this page rewrites the row rather than
		// reloading, so our reading of it follows the element instead of being
		// taken once.
		new MutationObserver(readNotice).observe(messages.value, { childList: true, subtree: true });

		readNotice();
	}

	block.classList.add("pse-portal-replaced");

	// Out of the form and into our fields, then back into the form by id -- a
	// control carries its form association in an attribute, so it does not have
	// to be a descendant of the form to be submitted with it.
	//
	// Kept so the form serialises the barcode along with its own hidden fields,
	// which is what `buildSearchQuery` starts from. Nothing is relied on it: the
	// query sets both criteria by name afterwards, the search button no longer
	// goes through the form at all, and the return key below is answered on
	// keydown rather than left to implicit submission.
	for (const selector of [BARCODE_INPUT]) {
		const input = document.querySelector(selector);

		if (!input) {
			continue;
		}

		input.setAttribute("form", RESERVATION_FORM_ID);

		// The scanner ends every scan with a return, and this is the one thing
		// on the page that has to answer it. `preventDefault` also stands in for
		// the implicit submission it replaces, so a field that *is* associated
		// does not search twice.
		input.addEventListener("keydown", (event) => {
			if ((event as KeyboardEvent).key != "Enter") {
				return;
			}

			event.preventDefault();
			onSearchReservation();
		});
	}

	// A safety net, not the way the search is started.
	//
	// The portal has its own submit handler on this form -- it is what writes
	// into the messages row we adopted above, so it is demonstrably still bound.
	// `preventDefault` stops the browser's own submission and nothing else: the
	// portal's handler runs on the same event, serialises the form, and finds
	// only the barcode there, because the reservation number the operator typed
	// is in a field of ours that the form does not own. An empty barcode and an
	// empty `#ReservationNumber` is a search with nothing in it, which the portal
	// answers with "geen zoekcriteria opgegeven" -- written straight into the
	// messages row and rendered as an alert over a search of ours that was fine.
	//
	// `stopImmediatePropagation` covers a handler bound after ours; a handler
	// bound before ours it cannot reach. So the real answer is that nothing here
	// fires a submit event on this form any more -- the button is a button and
	// the return key in the barcode field is answered on keydown. This stays for
	// anything that reaches the form another way.
	document.querySelector("#" + RESERVATION_FORM_ID)?.addEventListener("submit", (e) => {
		e.preventDefault();
		e.stopImmediatePropagation();
		onSearchReservation();
	});
}

// The search as a query string, built rather than serialised.
//
// The form's own fields first -- the anti-forgery token and whatever else it
// carries -- and then our two on top of them by name, read straight off the
// elements. `set` rather than `append`, so a field the form does own is written
// once and with the value that is on screen.
//
// This is the part that used to be `$(form).serialize()` alone. That answer is
// only right while the form owns the two inputs, and they sit in our card now.
function buildSearchQuery(): string {
	const form = document.querySelector<HTMLFormElement>("#" + RESERVATION_FORM_ID);
	const params = new URLSearchParams();

	if (form) {
		for (const [key, value] of new FormData(form)) {
			if (typeof value == "string") {
				params.append(key, value);
			}
		}
	}

	// The barcode is still the portal's own element -- it is what the scanner is
	// aimed at and what `focusBarcodeInput` puts the cursor in -- so it is read
	// where it stands. The reservation number is ours and is read from the model.
	//
	// The names: the element's own where there is an element, since that is what
	// it would have been submitted under, and the id the portal derives its
	// names from otherwise.
	const barcode = document.querySelector<HTMLInputElement>(BARCODE_INPUT);

	params.set(barcode?.name || BARCODE_INPUT.slice(1), barcode?.value ?? "");

	params.set(
		document.querySelector<HTMLInputElement>(RESERVATION_NUMBER_INPUT)?.name
			|| RESERVATION_NUMBER_INPUT.slice(1),
		searchNumber.value,
	);

	return params.toString();
}

// The query the search in flight was made with.
//
// Kept because a search can have to be asked twice: a reservation in an
// unfinished picking run is answered with the run rather than the reservation,
// and the same question is put again once the run has been finished off. It
// cannot be rebuilt at that point -- the fields were emptied the moment the
// first request went out, so a rebuilt query is an empty one, which the portal
// answers with "no search criteria specified". So the retry resends this.
let searchQuery = "";

// Whether the search in flight has already had a picking run finished off for
// it, so the same answer twice is reported rather than chased.
let finishedRun = false;

// Whether a query asks the portal anything at all.
//
// The two criteria by the names they were written under, so this reads the
// query that is actually about to be sent rather than the fields it came from
// -- a retry carries its own copy and has no fields behind it any more.
function hasSearchCriteria(formData: string): boolean {
	const params = new URLSearchParams(formData);
	const named = (selector: string, fallback: string) =>
		params.get(document.querySelector<HTMLInputElement>(selector)?.name || fallback)?.trim() ?? "";

	return Boolean(named(BARCODE_INPUT, BARCODE_INPUT.slice(1))
		|| named(RESERVATION_NUMBER_INPUT, RESERVATION_NUMBER_INPUT.slice(1)));
}

async function onSearchReservation(retryOf?: string) {
	// A scanner that fires twice, or a return held down, is one search. The
	// button is disabled while one is in flight; the return key is not.
	//
	// A retry is the search already in flight asking again, not a second one, so
	// it passes the guard -- it is the one caller that is meant to.
	if (searching.value && retryOf === undefined) {
		return;
	}

	// Serialised before the fields are emptied, and both of them are emptied:
	// they are two ways of asking the same form one question, and whichever was
	// just used, the other has to be blank when the next scan lands. A number
	// left standing in the reservation field is sent along with the next barcode
	// and answered first, so the scan appears to be ignored.
	const formData = retryOf ?? buildSearchQuery();

	// Nothing to search for. The portal answers this with "geen zoekcriteria
	// opgegeven", which is a true statement about a request that should not have
	// been made: an empty Zoek is the operator finding out they are on a field
	// they have not typed in yet, and it reads better said here than fetched.
	if (!hasSearchCriteria(formData)) {
		notice.value = {
			title: "Geen zoekcriteria opgegeven.",
			detail: "Vul een reserveringsnummer in of scan een product.",
			tone: "notice",
		};

		RVUtils.focusBarcodeInput();

		return;
	}

	searching.value = true;
	searchQuery = formData;

	if (retryOf === undefined) {
		finishedRun = false;
	}

	clearSearchFields();
	RVUtils.focusBarcodeInput();

	try {
		await handleResponse(await RVUtils.reservationSearchRequest(formData));
	} catch (error) {
		// Whatever went wrong, the button cannot be left spinning: it is
		// disabled while a search is in flight, so a search that ends in a throw
		// takes the form with it and the screen reads as one that ignores scans.
		debug("The reservation search failed:", error);

		notice.value = {
			title: "De zoekopdracht kon niet worden afgerond.",
			detail: "Probeer het opnieuw. Blijft het misgaan, ververs dan de pagina.",
			tone: "alert",
		};

		playSound("error");
		searching.value = false;
		RVUtils.setBusy(false);
	}
}

// Both search fields emptied. `focusBarcodeInput` already clears the one it
// puts the cursor in; this is the other one, which nothing else touches.
function clearSearchFields() {
	searchNumber.value = "";

	const barcode = document.querySelector<HTMLInputElement>(BARCODE_INPUT);

	if (barcode) {
		barcode.value = "";
	}
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
			// The portal's answer is a message rather than a reservation. It is
			// written into the row we adopted -- the row itself is kept, since it
			// is what the observer above watches and what `readNotice` reads --
			// and rendered as our own card from there.
			//
			// Addressed by class as well as by id, and guarded: the id is what
			// this page has always seen, but a response without either used to
			// throw here, and a throw during a search leaves the button disabled
			// with nothing on screen -- a scan that does nothing at all.
			const alert = responseElement.querySelector("#alert") ?? responseElement.querySelector(".alert");
			const portalMessages = document.querySelector("#messages");

			if (portalMessages) {
				portalMessages.innerHTML = alert?.outerHTML ?? "";
			}

			if (!alert) {
				notice.value = {
					title: "Geen reservering gevonden.",
					detail: "Controleer het reserveringsnummer of scan de barcode opnieuw.",
					tone: "notice",
				};
			}

			searching.value = false;
			RVUtils.setBusy(false);
			break;

		case ReservationSearchResponseType.UnfinishedRun:
			// Finish the picking run off, then put the same question again --
			// awaited, and with the original query, so a run that cannot be
			// finished reaches the caller's error handling instead of leaving the
			// button spinning, and the second search asks what the first one did.
			//
			// Once. A portal that answers the second search with the same run
			// would otherwise be asked forever, which is a spinning button and a
			// request every second -- worse than the stall it replaces.
			if (finishedRun) {
				notice.value = {
					title: "De raapronde van deze reservering kon niet worden afgerond.",
					detail: "Rond de raapronde af in RetailVista en zoek de reservering daarna opnieuw.",
					tone: "alert",
				};

				playSound("error");
				searching.value = false;
				RVUtils.setBusy(false);
				break;
			}

			finishedRun = true;

			await RVUtils.handleUnfinishedRun(responseElement);
			await onSearchReservation(searchQuery);
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

// The list is a convenience and throwing it away costs nothing that cannot be
// packed again, so it goes without a dialog in the way. What it does clear is
// only ours: the portal's own overview is untouched.
function clearHistory() {
	RVUtils.clearCompletedHistory();

	completedHistory.value = [];
}

// A reservation picked out of the selection dialog. The same failure the search
// itself can meet -- the request that reads the reservation can fail now that it
// says so -- and the same answer: the operator is told, rather than left looking
// at a dialog that closed and a page that did nothing.
async function openReservation(url: string) {
	try {
		await handleResponse(await RVUtils.fetchReservation(url));
	} catch (error) {
		debug("The reservation could not be opened:", error);

		notice.value = {
			title: "De reservering kon niet worden geopend.",
			detail: "Probeer het opnieuw. Blijft het misgaan, ververs dan de pagina.",
			tone: "alert",
		};

		playSound("error");
		searching.value = false;
		RVUtils.setBusy(false);
	}
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

		<SearchNotice v-if="notice" :title="notice.title" :detail="notice.detail" :tone="notice.tone"
			@dismiss="dismissNotice()" />

		<div class="pse-layout" :class="{ 'pse-layout-history': hasHistory }">
			<div class="pse-main">
				<div class="pse-card">
					<SearchPanel title="Zoek reservering" subtitle="Scan een product of vul een reserveringsnummer in.">
						<template #icon>
							<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
								stroke-linecap="round" stroke-linejoin="round">
								<circle cx="11" cy="11" r="7" />
								<path d="M20 20l-3.6-3.6" />
							</svg>
						</template>

						<!-- Ours, so a return key here is a return key we can hear. The
						     keydown is caught on the field's root and reaches it by
						     bubbling out of the input inside. -->
						<SearchField label="Reservering nr" placeholder="Bijv. 1234567" v-model="searchNumber"
							@keydown.enter.prevent="onSearchReservation()" />
						<SearchField label="Product barcode" :adopt="BARCODE_INPUT" />

						<!-- Deliberately not a submit button for the portal's form. It was
						     one, and every click fired a submit event the portal answers as
						     well as we do -- with a form that no longer holds the number the
						     operator typed, so its half of it came back "geen zoekcriteria
						     opgegeven". The search is ours to start. -->
						<button type="button" class="pse-submit pse-submit-end" :disabled="searching"
							@click="onSearchReservation()">
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

			<!-- Beside the card rather than under it: it is looked at while the
			     search is being typed, not after it. -->
			<CompletedHistoryPanel v-if="hasHistory" :entries="completedHistory"
				@open="(reservationNumber: string) => openAddParcels(reservationNumber)"
				@clear="clearHistory()" />
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
	   the fields at a length that can be taken in at a glance. The width is set
	   on the layout below, which needs more of it once the log is beside the
	   card -- and exactly this much when it is not. */
	width: 100%;
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

/* The gap the portal's own alert used to hold, now held by ours -- and only
   when there is one, so an ordinary load still opens with the card. */
.pse-search :deep(.pse-notice) {
	margin-bottom: 18px;
}

/* The card and its shortcuts, with the log of finished reservations beside
   them. Without the log this is one column of the width the page always had:
   the search does not spread out because there is nothing to its right. */
.pse-layout {
	display: grid;
	max-width: 980px;
	margin: 0 auto;
}

.pse-layout-history {
	/* The log is a fixed column and the card takes what is left, so the fields
	   keep their length as the screen grows rather than the two sharing the
	   change. */
	grid-template-columns: minmax(0, 1fr) 322px;
	gap: 20px;
	max-width: 1300px;
}

.pse-main {
	min-width: 0;
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
/* Below this the card is squeezed by the column beside it before the fields
   are: the log goes under the card and both take the full width, which is also
   where the panel drops its fixed height. */
@media (max-width: 1120px) {
	.pse-layout-history {
		grid-template-columns: minmax(0, 1fr);
		max-width: 980px;
	}
}

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
