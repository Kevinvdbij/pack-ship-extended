<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as Shopware from "../../shopware.ts";
import { saveOrderComment } from "../../shopwareComments.ts";
import * as RVUtils from "../../retailVistaUtils.ts";
import { MassCompleteEntry, MassCompleteStatus, ModalReservationDetails, ReservationSelectionModalData } from "../../interfaces.ts";
import Settings from "../../settings.ts";
import ReservationCard from "./ReservationCard.vue";
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

onMounted(() => {
	Shopware.shopwareInitialize().then((token) => {
		swToken.value = token;
		retrieveCommentData();
		autoSelectReservationCountdown();
	});

	initMassComplete();
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
		}
	});
}

function getMassCompleteClass(reservationNumber: number) {
	if (!massCompleteStatus.value) {
		return undefined;
	}

	const mcEntry = massCompleteStatus.value.find((x) => x.reservationNumber == String(reservationNumber));

	switch(mcEntry?.status) {
		case MassCompleteStatus.idle:
			return "mc-progress-idle";

		case MassCompleteStatus.started:
			return "mc-progress-started";

		case MassCompleteStatus.finished:
			return "mc-progress-finished";

		default:
			return "mc-progress-failed";
	}
}
</script>

<template>
	<div class="pse-selection-backdrop">
		<div class="modal show" id="productReservationsModal" tabindex="-1" role="dialog" data-backdrop="static"
			aria-modal="true" style="display: block;">
			<div class="modal-dialog modal-xl" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">
							{{ modalData.searchProductAmount }} reserveringen gevonden met product barcode '{{
								modalData.searchProductBarcode }}'
						</h5>
						<button type="button" class="close" data-dismiss="modal" aria-label="Close"
							@click="$emit('close')">
							<span aria-hidden="true">×</span>
						</button>
					</div>
					<div class="modal-body">
						<div class="container my-2 text-left">
							<div class="row text-success">
								<div class="col-6">
									<h3>
										Succesvol product '{{ modalData.searchProductName }}' gevonden
									</h3>
									<p>Het product komt voor in {{ modalData.searchProductAmount }} reserveringen.</p>
								</div>
								<div class="col-6">
									<div class="row product border border-success rounded">
										<div class="col-9 product-details">
											<h4 class="card-title">{{ modalData.searchProductName }}</h4>
											<p class="card-text">{{ modalData.searchProductBarcode }}</p>
										</div>
										<div class="col-3 product-image">
											<div class="float-right">
												<img :src="modalData.searchProductImageUrl" class="img-fluid"
													loading="lazy">
											</div>
										</div>
									</div>
								</div>
							</div>

							<div v-if="canAutoProceed()">
								<div class="auto-select-countdown-container">
									<hr>
									<h4>Gaat automatisch verder over {{ countdown }} seconden...</h4>
									<hr>
								</div>
							</div>

							<div v-show="modalData.singleLineReservations.length > 0">
								<div class="row">
									<div class="col">
										<h4>{{ modalData.singleLineReservations.length }} singleline reserveringen</h4>
										<p>Deze reserveringen bevatten 1 stuk van het product.</p>
									</div>
								</div>

								<div class="card mb-2" v-if="massCompleteShowDialog">
									<div class="card-header">
										<div class="row">
											<div class="col-6">
												<h4>Massa voltooien</h4>
											</div>
											<div class="col-2 pr-0">
												<input type="number" class="form-control pr-0 combiInputButtonLeft"
													v-model.number="massCompleteAmount" :disabled="massCompleteStarted"
													@focusout="setMassCompleteAmount(massCompleteAmount)">
											</div>
											<div class="col-1 pl-0 pr-0 mc-amount-btn">
												<button
													class="btn btn-primary btn-block px-0 combiInputButtonRight combiInputButtonLeft"
													@click="setMassCompleteAmount(massCompleteAmount - 1)"
													:disabled="massCompleteStarted">-</button>
											</div>
											<div class="col-1 pl-0 pr-0 mc-amount-btn">
												<button class="btn btn-primary btn-block px-0 combiInputButtonRight"
													@click="setMassCompleteAmount(massCompleteAmount + 1)"
													:disabled="massCompleteStarted">+</button>
											</div>
											<div class="col-3">
												<button type="button" class="btn btn-primary btn-right btn-block"
													@click="startMassComplete()"
													:disabled="massCompleteStarted">Start voltooien</button>
											</div>
										</div>
									</div>
								</div>

								<div class="singleline-reservations">
									<ReservationCard v-for="reservation in modalData.singleLineReservations"
										:key="reservation.reservationNumber" :reservation="reservation"
										:show-open-button="!massCompleteStarted" :show-progress-bar="massCompleteStarted"
										:progress-class="getMassCompleteClass(reservation.reservationNumber)"
										@open="(url) => emit('open', url)" />
								</div>
							</div>

							<hr
								v-show="modalData.singleLineReservations.length > 0 && modalData.validReservations.length > 0">

							<div v-show="modalData.validReservations.length > 0">
								<div class="row">
									<div class="col">
										<h4>{{ modalData.validReservations.length }} Reserveringen</h4>
									</div>
								</div>

								<div class="valid-reservations">
									<ReservationCard v-for="reservation in modalData.validReservations"
										:key="reservation.reservationNumber" :reservation="reservation" show-products
										:show-open-button="!massCompleteStarted" show-note
										:note-enabled="swCommentBoxesEnabled" @open="(url) => emit('open', url)"
										@save-note="onSaveButtonClick(reservation.swOrderData, reservation.saleOrderReference)" />
								</div>
							</div>

							<hr
								v-show="modalData.validReservations.length > 0 && modalData.invalidReservations.length > 0">

							<div class="row" v-show="modalData.invalidReservations.length > 0">
								<div class="col">
									<h4>{{ modalData.invalidReservations.length }} reserveringen zijn nog niet
										volledig geraapt.</h4>
									<div class="alert alert-danger">Onderstaande reserveringen bevatten het product,
										maar hebben niet de juiste logistieke status, of zijn nog niet volledig
										geraapt.</div>
								</div>
							</div>

							<div class="invalid-reservations">
								<ReservationCard v-for="reservation in modalData.invalidReservations"
									:key="reservation.reservationNumber" :reservation="reservation" show-products
									highlight-incomplete show-note :note-enabled="swCommentBoxesEnabled"
									@save-note="onSaveButtonClick(reservation.swOrderData, reservation.saleOrderReference)" />
							</div>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-primary" data-dismiss="modal"
							@click="$emit('close')">Sluiten</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
/* The dimmed page behind the reservation picker.
 *
 * The picker itself is still the portal-shaped markup it was built from -- one
 * card per reservation, laid out by `ReservationCard.vue` -- so it is not one of
 * the dialogs rebuilt on `ModalShell.vue`. What it can share is the scrim, which
 * is what makes a dialog look like it belongs to the same program as the one
 * before it. Taken from the same token, at the same depth, with the same blur.
 *
 * `fixed` rather than `absolute`: the page behind this scrolls, and an absolute
 * backdrop is only as tall as the document was when it opened. */
.pse-selection-backdrop {
	position: fixed;
	inset: 0;
	z-index: 100;
	overflow-y: auto;
	background-color: var(--pse-scrim);
	backdrop-filter: blur(3px);
	-webkit-backdrop-filter: blur(3px);
}

.modal {
	overflow-y: auto;
}

.mc-amount-btn {
	-ms-flex: 0 0 4%;
	flex: 0 0 4%;
	max-width: 4%;
}

.btn-primary:disabled {
	color: #fff;
	background-color: #ccc;
	border-color: #bbb;
}

.form-control:disabled {
	background-color: #eff6f3;
	border: 1px solid #ced4da;
}

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
	-webkit-appearance: none;
	-moz-appearance: none;
	appearance: none;
	margin: 0;
}
</style>
