<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import * as Shopware from "../../shopware.ts";
import { saveOrderComment } from "../../shopwareComments.ts";
import * as RVUtils from "../../retailVistaUtils.ts";
import { ErpSignedOutError, readReservationNotes } from "../../reservationNote.ts";
import { findReservationId } from "../../reservationLookup.ts";
import { createSlotHandle, SlotHandle } from "../slotHandle.ts";
import { erpStore } from "../erpStore.ts";
import { MassCompleteEntry, MassCompleteStatus, ModalReservationDetails, ReservationSelectionModalData } from "../../interfaces.ts";
import Settings from "../../settings.ts";
import ModalShell from "./ModalShell.vue";
import ReservationCard from "./ReservationCard.vue";
import ReservationRow from "./ReservationRow.vue";
import MassCompletePanel from "./MassCompletePanel.vue";
import CopyButton from "./CopyButton.vue";
import { GM, GM_addValueChangeListener } from "$";

const emit = defineEmits(["open", "close"]);
const props = defineProps<{
	modalData: ReservationSelectionModalData;
}>();

const swToken = ref<Shopware.ShopwareToken>();
const swCommentBoxesEnabled = ref(false);

const countdown = ref(2);
let saveTimeoutId: number;

const massCompleteShowDialog = ref(false);
const massCompleteStarted = ref(false);
const massCompleteAmount = ref(100);
const massCompleteMax = 50;
const massCompleteThreshold = 2;
const massCompleteStatus = ref<MassCompleteEntry[]>();

// ---- The rack bays on the cards ----
//
// On every card, which is both groups that get one: an order of several lines,
// or of several of one product, is the order that waits in the rack while the
// rest of it comes in -- and the packer deciding which of these to carry on with
// wants to know which of them is already standing somewhere, and to park what is
// in their hands before opening anything.
//
// The reservations that are not fully picked are included, and they are the ones
// this is most useful for: a half-picked order is exactly what has to stand
// somewhere until the rest turns up. They cost an extra step to identify, which
// is what `findReservationId()` is for -- the portal tells us nothing at all
// about them, not even an id.
//
// A handle per card, made here and now rather than when its note arrives: the
// list is known before the first render, and a card that grows a control a
// second later is worse than one that shows it waiting. Each starts out
// unsettled, so every panel is turning until it has an answer.
const slotReservations = props.modalData.validReservations.concat(props.modalData.invalidReservations);

const slotHandles = new Map<number, SlotHandle>(
	slotReservations.map((reservation) => [reservation.reservationNumber, createSlotHandle()])
);

function slotsFor(reservationNumber: number): SlotHandle | undefined {
	return slotHandles.get(reservationNumber);
}

// A run that was cut short by a reservation the carrier refused. The rest of
// the run is not attempted: whatever stopped the one is likely to stop the next
// -- a carrier that is down, an account that is out of labels -- and a run that
// carries on regardless turns one reservation to sort out into twenty.
const massCompleteStopped = ref(false);

// Before the first render rather than on mount: whether there is a mass complete
// to offer decides whether the countdown notice is shown, and worked out a tick
// later it is shown and then taken away again -- which on a dialog that has just
// appeared reads as a flicker at the top of the list.
initMassComplete();

onMounted(() => {
	loadSlots();

	Shopware.shopwareInitialize().then((token) => {
		swToken.value = token;
		retrieveCommentData();
		autoSelectReservationCountdown();
	});
});

function onSaveButtonClick(orderData: Shopware.ShopwareOrderEntry, orderNumber: string) {
	if (swToken.value) {
		saveOrderComment(swToken.value, orderData, orderNumber);
	}

	swCommentBoxesEnabled.value = false;
	if (saveTimeoutId) { clearTimeout(saveTimeoutId) }
	saveTimeoutId = setTimeout(() => {
		swCommentBoxesEnabled.value = true;
	}, 250);
}

// Which record a card is about.
//
// A reservation that is ready to pack carries a link to itself, and the page
// behind it holds `#ReservationId` -- a plain portal request, and the cheap case.
// One that is not fully picked carries no link at all, and the portal will not
// discuss it: those are looked up by number through the ERP's own search form,
// which is one job with the application per card.
//
// Ordered cheap-first on purpose. The ERP lookups queue behind each other
// anyway, and the ready cards -- the ones the packer is actually choosing
// between -- should not wait on them.
function identify(reservation: ModalReservationDetails): Promise<string> {
	if (reservation.url) {
		return RVUtils.fetchReservationId(reservation.url);
	}

	return findReservationId(String(reservation.reservationNumber))
		.catch((error) => {
			if (error instanceof ErpSignedOutError) {
				throw error;
			}

			// One card we could not place is one panel that says so, not a
			// dialog-wide failure.
			console.error("Pack&Ship Extended could not find reservation "
				+ reservation.reservationNumber + " in RetailVista.", error);

			return "";
		});
}

// The bays of every card, in two passes.
//
// The ids come first -- see `identify()` -- and the notes are then read in one
// ERP job rather than one job each: see `readReservationNotes()`, which opens the
// ERP screen once and changes only which record it is showing.
//
// A reservation whose id or note cannot be read is settled with nothing, which
// is what its panel then renders as "not available". That is deliberate: an
// empty bay and a bay we failed to read look identical, and the more dangerous
// of the two to get wrong is the one that reads as "this order is not in the
// rack".
function loadSlots() {
	const reservations = slotReservations;

	if (reservations.length == 0) {
		return;
	}

	Promise.all(reservations.map(identify))
		.then(async (ids) => {
			const notes = await readReservationNotes(ids.filter(Boolean));

			reservations.forEach((reservation, index) => {
				slotHandles.get(reservation.reservationNumber)
					?.adopt(ids[index], String(reservation.reservationNumber), notes.get(ids[index]));
			});
		})
		.catch((error) => {
			// Nothing was read, so every panel has to stop claiming to be busy. A
			// sign-out is worth the prompt: it will not come back on its own, and
			// every bay on the dialog is dead until somebody answers for it.
			if (error instanceof ErpSignedOutError) {
				erpStore.reportSignedOut();
			}

			console.error("Pack&Ship Extended could not read the rack bays of the listed reservations.", error);

			reservations.forEach((reservation) => {
				slotHandles.get(reservation.reservationNumber)
					?.adopt("", String(reservation.reservationNumber), undefined);
			});
		});
}

function retrieveCommentData() {
	const reservationsToFetch:ModalReservationDetails[] = props.modalData.invalidReservations.concat(props.modalData.validReservations);

	Promise.all(reservationsToFetch.map((reservation) => Shopware.shopwareGetOrderData(swToken.value!, reservation.saleOrderReference))).then((responses) => {
		responses.forEach((response, index) => {
			reservationsToFetch[index].swOrderData = response.data[0];
		});
	}).then(() => {
		swCommentBoxesEnabled.value = true;
	});
}

function autoSelectReservationCountdown() {
	if (!canAutoProceed()){
		return;
	}

	let countdownInterval = setInterval(() => {
		countdown.value--;

		if (countdown.value <= 0) {
			clearInterval(countdownInterval);

			autoSelectReservation();
		}
	}, 1000)
}

function autoSelectReservation() {
	if (props.modalData.singleLineReservations.length > 0) {
		emit("open", props.modalData.singleLineReservations[0].url)
		return;
	}

	if (props.modalData.validReservations.length > 0) {
		emit("open", props.modalData.validReservations[0].url);
		return;
	}
}

function canAutoProceed():boolean {
	// Stop auto proceeding if the auto master switch is disabled.
	if (!Settings.autoMasterSwitch){
		return false;
	}

	// Stop auto proceeding if there is no valid reservations
	if (props.modalData.singleLineReservations.length <= 0 && props.modalData.validReservations.length <= 0) {
		return false;
	}

	// Stop auto proceeding if there is a mass complete dialog
	if (massCompleteShowDialog.value == true) {
		return false;
	}

	return true;
}

function initMassComplete() {
	if (props.modalData.singleLineReservations && props.modalData.singleLineReservations.length >= massCompleteThreshold) {
		setMassCompleteAmount(props.modalData.singleLineReservations.length);
		massCompleteShowDialog.value = true;
	}
}

function setMassCompleteAmount(value: number) {
	const totalReservations = props.modalData.singleLineReservations.length;
	const clampedVal = Math.min(Math.min(Math.max(2, value), massCompleteMax), totalReservations);

	massCompleteAmount.value = clampedVal;
}

async function startMassComplete() {
	setMassCompleteAmount(massCompleteAmount.value);
	massCompleteStarted.value = true;

	let startedReservations: MassCompleteEntry[] = [];

	for(let i = 0; i < massCompleteAmount.value; i++) {
		const reservation = props.modalData.singleLineReservations[i];

		let tab = await GM.openInTab(reservation.url, { active: false });

		const entry: MassCompleteEntry = {
			reservationNumber: String(reservation.reservationNumber),
			status: MassCompleteStatus.idle,
			close: tab.close
		};

		startedReservations.push(entry);
		monitorMassCompleteEntry(entry);
	}

	RVUtils.initMassCompleteStatus(startedReservations);
	massCompleteStatus.value = startedReservations;
}

function monitorMassCompleteEntry(entry: MassCompleteEntry) {
	GM_addValueChangeListener(`PSE_MCEntry_${entry.reservationNumber}`, (_key, _oldValue, newValue, _remote) => {
		if (massCompleteStatus.value) {
			const entryIndex = massCompleteStatus.value.findIndex((statusEnt) => statusEnt.reservationNumber == entry.reservationNumber);

			if (entryIndex != -1) {
				massCompleteStatus.value[entryIndex].status = newValue;
			}

			if (newValue == MassCompleteStatus.finished) {
				entry.close?.();
			}

			if (newValue == MassCompleteStatus.failed) {
				stopMassComplete(entry);
			}
		}
	});
}

// Stops the run around the reservation that failed.
//
// Its own tab is left open -- it is the screen that says what the carrier
// refused, and the only place the announcement can be tried again. The tabs
// that had not finished are closed, and the reservations in them are marked as
// what they are: not attempted.
//
// A tab closed mid-flight may have got as far as building its parcels, so the
// mark says stopped rather than untouched. The reservation itself is not
// finished either way, and the operator picks it up from the list like any
// other.
function stopMassComplete(failed: MassCompleteEntry) {
	if (massCompleteStopped.value) {
		return;
	}

	massCompleteStopped.value = true;

	for (const entry of massCompleteStatus.value ?? []) {
		if (entry.reservationNumber == failed.reservationNumber) {
			continue;
		}

		if (entry.status == MassCompleteStatus.finished || entry.status == MassCompleteStatus.failed) {
			continue;
		}

		entry.close?.();
		entry.status = MassCompleteStatus.stopped;
	}
}

// A reservation's place in the run, or nothing at all when there is no run or
// when it was not one of the ones taken -- the operator can ask for fewer than
// the list holds, and the rest are left alone rather than shown as waiting for
// something that will never come.
function statusFor(reservationNumber: number): MassCompleteStatus | undefined {
	return massCompleteStatus.value?.find((entry) => entry.reservationNumber == String(reservationNumber))?.status;
}

// The run as a whole, which is what the panel reports. Counted off the same
// entries the rows read, so the tally and the list can never disagree.
const massCompleteFinished = computed(() => countStatus(MassCompleteStatus.finished));
const massCompleteFailed = computed(() => countStatus(MassCompleteStatus.failed));

function countStatus(status: MassCompleteStatus): number {
	return massCompleteStatus.value?.filter((entry) => entry.status == status).length ?? 0;
}
</script>

<template>
	<!-- Not dismissable by a click on the page behind it. This dialog is the
	     result of a scan, and a stray click while reading down a list of twenty
	     reservations would throw the search away -- and, once a mass complete is
	     running, take the run's only progress readout with it. -->
	<ModalShell :title="`${modalData.searchProductAmount} reserveringen met dit product`" size="xl"
		:dismissable="false" @close="emit('close')">
		<!-- What was scanned, at the top, because everything under it is a list
		     of places this product turned up and the question being answered is
		     always "of this one?". -->
		<section class="pse-found">
			<div class="pse-found-image">
				<img v-if="modalData.searchProductImageUrl" :src="modalData.searchProductImageUrl" alt=""
					loading="lazy" />
			</div>

			<div class="pse-found-text">
				<h3 class="pse-found-name">{{ modalData.searchProductName }}</h3>
				<p class="pse-found-barcode pse-copy-cell">
					{{ modalData.searchProductBarcode }}
					<CopyButton :value="modalData.searchProductBarcode" label="Barcode" />
				</p>
			</div>

			<div class="pse-found-count">
				<span class="pse-found-count-number">{{ modalData.searchProductAmount }}</span>
				<span class="pse-found-count-label">reserveringen</span>
			</div>
		</section>

		<!-- The one thing on this screen that happens without being asked, so it
		     is said plainly and where the eye already is. -->
		<Transition>
			<p class="pse-countdown" v-if="canAutoProceed()">
				<span class="pse-countdown-mark" aria-hidden="true"></span>
				Gaat automatisch verder over {{ countdown }} seconden...
			</p>
		</Transition>

		<section class="pse-group" v-if="modalData.singleLineReservations.length > 0">
			<header class="pse-group-head">
				<h3 class="pse-group-title">
					Singleline
					<span class="pse-group-count">{{ modalData.singleLineReservations.length }}</span>
				</h3>
				<p class="pse-group-note">Deze reserveringen bevatten 1 stuk van het product.</p>
			</header>

			<MassCompletePanel v-if="massCompleteShowDialog"
				:total="modalData.singleLineReservations.length" :max="massCompleteMax"
				:amount="massCompleteAmount" :started="massCompleteStarted"
				:finished="massCompleteFinished" :failed="massCompleteFailed"
				:stopped="massCompleteStopped"
				@update:amount="setMassCompleteAmount" @start="startMassComplete()" />

			<div class="pse-rows">
				<ReservationRow v-for="reservation in modalData.singleLineReservations"
					:key="reservation.reservationNumber" :reservation="reservation"
					:status="statusFor(reservation.reservationNumber)"
					:show-open="!massCompleteStarted"
					@open="(url) => emit('open', url)" />
			</div>
		</section>

		<section class="pse-group" v-if="modalData.validReservations.length > 0">
			<header class="pse-group-head">
				<h3 class="pse-group-title">
					Reserveringen
					<span class="pse-group-count">{{ modalData.validReservations.length }}</span>
				</h3>
				<p class="pse-group-note">Klaar om verwerkt te worden.</p>
			</header>

			<ReservationCard v-for="reservation in modalData.validReservations"
				:key="reservation.reservationNumber" :reservation="reservation" show-products
				:show-open-button="!massCompleteStarted" show-note :note-enabled="swCommentBoxesEnabled"
				:slot-handle="slotsFor(reservation.reservationNumber)"
				@open="(url) => emit('open', url)"
				@save-note="onSaveButtonClick(reservation.swOrderData, reservation.saleOrderReference)" />
		</section>

		<section class="pse-group" v-if="modalData.invalidReservations.length > 0">
			<header class="pse-group-head">
				<h3 class="pse-group-title">
					Nog niet volledig geraapt
					<span class="pse-group-count">{{ modalData.invalidReservations.length }}</span>
				</h3>
				<p class="pse-group-note">
					Deze reserveringen bevatten het product, maar hebben niet de juiste logistieke status of
					zijn nog niet volledig geraapt. Ze kunnen hier niet geopend worden.
				</p>
			</header>

			<ReservationCard v-for="reservation in modalData.invalidReservations"
				:key="reservation.reservationNumber" :reservation="reservation" show-products
				highlight-incomplete show-note :note-enabled="swCommentBoxesEnabled"
				:slot-handle="slotsFor(reservation.reservationNumber)"
				@save-note="onSaveButtonClick(reservation.swOrderData, reservation.saleOrderReference)" />
		</section>

		<template #footer>
			<button type="button" class="pse-dialog-btn pse-dialog-btn-quiet" @click="emit('close')">
				Sluiten
			</button>
		</template>
	</ModalShell>
</template>

<style scoped>
/* ---- What was scanned ---- *
 * A strip rather than a card: it is the heading of the list under it, and a card
 * here would be the first of many boxes on a screen that is already a stack of
 * them.
 */
.pse-found {
	display: flex;
	align-items: center;
	gap: 16px;
	margin-bottom: 20px;
	padding: 14px 16px;
	border: 1px solid var(--pse-line);
	border-radius: 14px;
	background-color: var(--pse-well);
}

/* Sized whether or not the photo arrives, so the strip does not resize when a
   product without one is scanned. */
.pse-found-image {
	display: flex;
	align-items: center;
	justify-content: center;
	flex: none;
	width: 58px;
	height: 58px;
	overflow: hidden;
	border: 1px solid var(--pse-line);
	border-radius: 11px;
	background-color: #ffffff;
}

.pse-found-image img {
	max-width: 100%;
	max-height: 100%;
	object-fit: contain;
}

.pse-found-text {
	flex: 1;
	min-width: 0;
}

.pse-found-name {
	margin: 0;
	font-size: 15.5px;
	font-weight: 650;
	line-height: 1.3;
	color: var(--pse-ink);
}

.pse-found-barcode {
	margin: 3px 0 0;
	font-size: 13px;
	font-variant-numeric: tabular-nums;
	color: var(--pse-ink-soft);
}

.pse-found-count {
	display: flex;
	align-items: baseline;
	gap: 6px;
	flex: none;
}

.pse-found-count-number {
	font-size: 22px;
	font-weight: 700;
	font-variant-numeric: tabular-nums;
	line-height: 1;
	color: var(--pse-brand-ink);
}

.pse-found-count-label {
	font-size: 12.5px;
	color: var(--pse-ink-soft);
}

/* ---- The countdown ---- *
 * Green, because nothing is wrong: the extension is about to do the obvious
 * thing, and this is the window in which to stop it by picking something else.
 */
.pse-countdown {
	display: flex;
	align-items: center;
	gap: 9px;
	margin: 0 0 20px;
	padding: 11px 14px;
	border: 1px solid var(--pse-brand);
	border-radius: 12px;
	background-color: var(--pse-brand-soft);
	font-size: 13.5px;
	font-weight: 600;
	color: var(--pse-brand-ink);
}

.pse-countdown-mark {
	width: 8px;
	height: 8px;
	flex: none;
	border-radius: 50%;
	background-color: var(--pse-brand);
	animation: pse-countdown-tick 1s ease-in-out infinite;
}

@keyframes pse-countdown-tick {
	50% {
		opacity: 0.25;
	}
}

@media (prefers-reduced-motion: reduce) {
	.pse-countdown-mark {
		animation: none;
	}
}

/* ---- The three groups ---- *
 * Each is a heading, a line saying what the group is, and its reservations. The
 * groups used to be separated by rules; the space and the heading do that job
 * without drawing anything, which matters on a screen that is already a column
 * of bordered boxes.
 */
.pse-group + .pse-group {
	margin-top: 26px;
}

.pse-group-head {
	margin-bottom: 10px;
}

.pse-group-title {
	display: flex;
	align-items: center;
	gap: 8px;
	margin: 0;
	font-size: 14px;
	font-weight: 650;
	letter-spacing: 0.02em;
	color: var(--pse-ink);
}

/* The count belongs to the heading rather than being read into it, so the
   heading stays a name and the number stays a number. */
.pse-group-count {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 22px;
	height: 20px;
	padding: 0 7px;
	border-radius: 999px;
	background-color: var(--pse-brand-soft);
	font-size: 12px;
	font-weight: 700;
	font-variant-numeric: tabular-nums;
	color: var(--pse-brand-ink);
}

.pse-group-note {
	margin: 4px 0 0;
	font-size: 12.5px;
	line-height: 1.45;
	color: var(--pse-ink-soft);
}

/* One block of rows with one border around the lot -- see `ReservationRow.vue`,
   which draws only the line between one row and the next. */
.pse-rows {
	overflow: hidden;
	border: 1px solid var(--pse-line);
	border-radius: 14px;
	background-color: #ffffff;
}
</style>
