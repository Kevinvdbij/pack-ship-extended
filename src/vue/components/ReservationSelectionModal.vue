<script setup lang="ts">
import { onMounted, ref, Transition } from "vue";
import * as RVUtils from "../../retailVistaUtils.ts";
import ShopwareLogoIconUrl from "../../assets/shopware.svg"
import * as Shopware from "../../shopware";
import { MassCompleteEntry, MassCompleteStatus, ReservationSelectionModalData } from "../../interfaces.ts";
import Settings from "../../settings.ts";
import { GM, GM_addValueChangeListener } from "$";

const emit = defineEmits(["open", "close"]);
const props = defineProps({
	modalData: { type: Object, required: true }
});

const swToken = ref();
const swCommentBoxesEnabled = ref(false);

const countdown = ref(2);
let saveTimeoutId: number;

const massCompleteShowDialog = ref(false);
const massCompleteStarted = ref(false);
const massCompleteAmount = ref(100);
const massCompleteMax = 50;
const massCompleteThreshold = 3;
const massCompleteStatus = ref<MassCompleteEntry[]>();

onMounted(() => {
	Shopware.shopwareInitialize().then((token) => {
		swToken.value = token;
		retrieveCommentData();
		autoSelectReservationCountdown();
	});

	initMassComplete();
});

function onSaveButtonClick(orderData: Shopware.ShopwareOrderEntry) {
	if (swToken) {
		Shopware.shopwareUpdateOrderComment(swToken.value, orderData);
	}

	swCommentBoxesEnabled.value = false;
	if (saveTimeoutId) { clearTimeout(saveTimeoutId) }
	saveTimeoutId = setTimeout(() => {
		swCommentBoxesEnabled.value = true;
	}, 250);
}

function retrieveCommentData() {
	(<ReservationSelectionModalData>props.modalData).invalidReservations.forEach((reservation) => {
		Shopware.shopwareGetOrderData(swToken.value, reservation.saleOrderReference).then((response) => {
			reservation.swOrderData = response.data[0]
		});

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
	if (!Settings.autoMasterSwitch){
		return false;
	}

	if (props.modalData.singleLineReservations.length <= 0 && props.modalData.validReservations <= 0) {
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

function startMassComplete() {
	setMassCompleteAmount(massCompleteAmount.value);
	massCompleteStarted.value = true;

	let startedReservations = [];

	for(let i = 0; i < massCompleteAmount.value; i++) {
		const reservation = props.modalData.singleLineReservations[i];

		GM.openInTab(reservation.url, { active: false });

		const entry = <MassCompleteEntry> { reservationNumber: reservation.reservationNumber, status: MassCompleteStatus.idle }

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
		}
	});
}

function getMassCompleteClass(reservationNumber: string) {
	if (massCompleteStatus.value) {
		const mcEntry = massCompleteStatus.value.find((x) => x.reservationNumber == reservationNumber)

		if (mcEntry) {
			switch(mcEntry.status) {
				case MassCompleteStatus.idle:
					return "mc-progress-idle";

				case MassCompleteStatus.started:
					return "mc-progress-started";

				case MassCompleteStatus.finished:
					return "mc-progress-finished";

				case MassCompleteStatus.failed:
					return "mc-progress-failed";

				default:
					return "mc-progress-failed";
			}
		} 
		else {
			return "mc-progress-failed";
		}
	}
}
</script>

<template>
	<div class="settings-modal">
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
						<div class="modal-body">


							<div class="container my-2 text-left">
								<div class="row text-success ">
									<div class="col-6">
										<h3>
											Succesvol product '{{ modalData.searchProductName }}' gevonden
										</h3>
										<p>Het product komt voor in {{ modalData.searchProductAmount }} reserveringen.
										</p>
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
											<h4>{{ modalData.singleLineReservations.length }} singleline reserveringen</h4>											<p>Deze reserveringen bevatten 1 stuk van het product.</p>
										</div>
									</div>


									<div class="card mb-2" v-if="massCompleteShowDialog">
										<div class="card-header">
											<div class="row">
												<div class="col-6">
													<h4>Massa voltooien</h4>
												</div>
												<div class="col-2 pr-0">
													<input type="number" class="form-control pr-0 combiInputButtonLeft" v-model.number="massCompleteAmount" :disabled="massCompleteStarted" @focusout="setMassCompleteAmount(massCompleteAmount)" >
												</div>
												<div class="col-1 pl-0 pr-0 mc-amount-btn">
													<button class="btn btn-primary btn-block px-0 combiInputButtonRight combiInputButtonLeft" @click="setMassCompleteAmount(massCompleteAmount - 1)" :disabled="massCompleteStarted">-</button>
												</div>
												<div class="col-1 pl-0 pr-0 mc-amount-btn">
													<button class="btn btn-primary btn-block px-0 combiInputButtonRight" @click="setMassCompleteAmount(massCompleteAmount + 1)" :disabled="massCompleteStarted">+</button>
												</div>
												<div class="col-3">
													<button type="button" class="btn btn-primary btn-right btn-block" @click="startMassComplete()" :disabled="massCompleteStarted">Start voltooien</button>
												</div>
											</div>
										</div>
									</div>


									<div class="singleline-reservations">
										<template v-for="reservation in modalData.singleLineReservations">
											<div class="card mb-2">
												<div class="card-header">
													<div class="row">
														<div class="col-10">
															<div class="row">
																<div class="col-4">
																	<div>Reservering: <b>{{
																		reservation.reservationNumber }}</b></div>
																	<div>Verkooporder referentiecode: <b>{{
																		reservation.saleOrderReference }}</b></div>

																</div>
																<div class="col-4">
																	<div>Status: <b>{{ reservation.status }}</b></div>
																	<div>Logistieke status: <b>{{
																		reservation.deliveryStatus }}</b></div>
																</div>
																<div class="col-4">
																	<div> Klant: <b>{{ reservation.customer }}</b></div>
																</div>
															</div>
														</div>
														<div class="col-2">
															<div class="float-right">
																<Transition>
																	<a :href="reservation.url"
																		class="btn btn-primary"
																		v-show="!massCompleteStarted"
																		>Open&nbsp;<span
																			class="material-icons">chevron_right</span></a>
																</Transition>
															</div>
														</div>

													</div>
												</div>
												<Transition>
												<div class="mc-progress-bar" v-show="massCompleteStarted">
													<div :class="getMassCompleteClass(reservation.reservationNumber)"></div>
												</div>
												</Transition>
											</div>
										</template>
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
										<template v-for="reservation in modalData.validReservations">
											<div class="card mb-2">
												<div class="card-header">
													<div class="row">
														<div class="col-10">
															<div class="row">
																<div class="col-4">
																	<div>Reservering: <b>{{
																		reservation.reservationNumber }}</b></div>
																	<div>Verkooporder referentiecode: <b>{{
																		reservation.saleOrderReference }}</b></div>

																</div>
																<div class="col-4">
																	<div>Status: <b>{{ reservation.status }}</b></div>
																	<div>Logistieke status: <b>{{
																		reservation.deliveryStatus }}</b></div>
																</div>
																<div class="col-4">
																	<div> Klant: <b>{{ reservation.customer }}</b></div>
																</div>
															</div>
														</div>
														<div class="col-2">
															<div class="float-right">
																<a :href="reservation.url"
																	class="btn btn-primary">Open&nbsp;<span
																		class="material-icons">chevron_right</span></a>
															</div>
														</div>

													</div>
												</div>
												<div class="card-body">
													<div class="reservation-rows reservation-rows">
														<div class="row nfTableHeader">
															<div class="col-3 ">Artikel nr</div>
															<div class="col-3">Omschrijving</div>
															<div class="col-3">Hoofd barcode</div>
															<div class="col-3">Geraapt aantal</div>
														</div>

														<div class="reservation-rows ">
															<template v-for="product in reservation.products">
																<div class="row nfTableRow ">
																	<div class="col-3">{{ product.number }}</div>
																	<div class="col-3">{{ product.description }}</div>
																	<div class="col-3">{{ product.barcode }}</div>
																	<div class="col-3 ">{{ product.amount }}</div>
																</div>
															</template>
														</div>
													</div>

												</div>
											</div>
										</template>
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

									<template v-for="reservation in modalData.invalidReservations">
										<div class="card mb-2">
											<div class="card-header">
												<div class="row">
													<div class="col-10">
														<div class="row">
															<div class="col-4">
																<div>Reservering: <b>{{ reservation.reservationNumber
																}}</b></div>
																<div>Verkooporder referentiecode: <b>{{
																	reservation.saleOrderReference }}</b></div>

															</div>
															<div class="col-4">
																<div>Status: <b>{{ reservation.status }}</b></div>
																<div>Logistieke status: <b>{{ reservation.deliveryStatus
																}}</b></div>
															</div>
															<div class="col-4">
																<div> Klant: <b>{{ reservation.customer }}</b></div>
															</div>
														</div>
													</div>
													<div class="col-2">
													</div>

												</div>
											</div>
											<div class="card-body">
												<div class="reservation-rows reservation-rows">
													<div class="row nfTableHeader">
														<div class="col-3 ">Artikel nr</div>
														<div class="col-3">Omschrijving</div>
														<div class="col-3">Hoofd barcode</div>
														<div class="col-3">Geraapt aantal</div>
													</div>
													<div class="reservation-rows ">
														<template v-for="product in reservation.products">
															<div
																:class="RVUtils.isAmountStringComplete(product.amount) ? 'row nfTableRow' : 'row nfTableRow bg-warning text-dark'">
																<div class="col-3">{{ product.number }}</div>
																<div class="col-3">{{ product.description }}
																</div>
																<div class="col-3">{{ product.barcode }}</div>
																<div class="col-3 font-weight-bold">{{ product.amount }}
																</div>
															</div>
														</template>
													</div>
												</div>
											</div>
											<div v-if="RVUtils.matchShopwareOrderNumber(reservation.saleOrderReference)">
												<div class="card-body">
													<div class="reservation-rows reservation-rows">
														<div class="row nfTableHeader sw-modal-header">
															<img :src="ShopwareLogoIconUrl"
																style="float: left; width: 25px; height: 25px; margin-right: 8px;" />
															<h4 style="line-height: 22px;">Shopware Notitie</h4>
														</div>
														<div class="reservation-rows ">
															<div class="row nfTableRow sw-modal-body">
																<div class="col">
																	<div v-show="!swCommentBoxesEnabled || !reservation.swOrderData"
																		class="loader"
																		style="height: 20px; margin-top: -20px; top: 30px; justify-self: center; position: relative;">
																	</div>
																	<Transition>
																		<textarea class="sw-modal-textarea"
																			v-if="reservation.swOrderData"
																			v-model="reservation.swOrderData.customerComment"
																			:disabled="!swCommentBoxesEnabled" :placeholder="swCommentBoxesEnabled ? 'Nog geen notitie...' : ''"></textarea>
																	</Transition>
																	<textarea class="sw-modal-textarea"
																		v-if="!reservation.swOrderData" disabled></textarea>
																</div>
																<div class="col-1.5">
																	<button class="sw-btn"
																		@click="onSaveButtonClick(reservation.swOrderData)"
																		:disabled="!swCommentBoxesEnabled">Opslaan</button>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</template>
								</div>

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
.text-area-grow-enter-active,
.text-area-grow-leave-active {
	transition: opacity 0.25s ease, transform 0.1s ease;
}

.text-area-grow-enter-from,
.text-area-grow-leave-to {
	opacity: 0;
	transform: scaleY(0);
}

.settings-modal {
	position: absolute;
	width: 100% !important;
	height: 100% !important;
	left: 0;
	top: 0;
	background: rgba(51, 51, 51, 0.7);
	z-index: 100;
	background-color: rgba(0, 0, 0, 0.5);
}

.settings-modal-content {
	position: absolute;
	background-color: rgb(255, 255, 255);
	min-width: 550px;
	min-height: 300px;
	width: 550px;
	height: 400px;
	max-width: 95%;
	top: 50%;
	justify-self: center;
	-webkit-transform: translateY(-50%);
	-ms-transform: translateY(-50%);
	transform: translateY(-50%);
	padding: 25px;
	font-size: 16px;
	border-radius: 15px;
}

.modal {
	overflow-y: auto;
}

.settings-modal-content-options {
	margin-top: 20px;
	margin-left: 20px;
}

.close-button {
	position: absolute;
	top: 20px;
	right: 15px;
	border: 0;
	width: 50;
	height: 50;
	background-color: transparent;
}

.save-button {
	position: absolute;
	right: 25px;
	bottom: 25px;
	width: 125px;
	height: 45px;
	background-color: #689f69;
	border-radius: 8px;
	border-style: none;
	box-sizing: border-box;
	color: #FFFFFF;
	transition: color 100ms;
	font-weight: 700;
	font-size: 16px;
}

.save-button:hover,
.save-button:focus {
	background-color: #537f5f;
}

.save-icon {
	filter: invert(1);
}

.setting-label {
	padding-left: 10px;
	justify-content: center;
}

input {
	vertical-align: -4px;
}

.sw-btn {
	width: 100%;
	height: 35px;
	background-color: #189eff;

	transition: all .15s ease-out;
	display: inline-block;
	border-radius: 4px;
	padding: 2px 24px;
	font-size: 14px;
	outline: none;
	font-weight: 600;
	white-space: nowrap;
	text-overflow: ellipsis;
	vertical-align: middle;
	text-decoration: none;
	cursor: pointer;
	user-select: none;
	margin: 0;
	position: relative;

	background: #189eff;
	color: #fff;
	line-height: 32px;
	border: 0;
	margin: 3px;
}

.sw-btn:hover {
	background: #118cff;
}

.sw-btn:active {
	background: #0e82ff;
}

.sw-btn:disabled:hover,
.sw-btn:disabled {
	background: #727272;
}

.sw-modal-header {
	background-color: #243758;
	color: #fff;
}

.sw-modal-body {
	background-color: #f9fafb;
	padding-right: 20px;
}

.sw-modal-textarea {
	field-sizing: content;
	min-height: 34px;
	width: 100%;
	margin-top: 4px;
	padding-left: 5px;
	border-radius: 4px;
	font-size: 18px;
}

.mc-amount-btn {
	-ms-flex: 0 0 4%;
	flex: 0 0 4%;
	max-width: 4%;
}

.mc-progress-bar {
	background-color: rgb(211, 211, 211);
	width: 100%;
	height: 15px;
	size: 5px;
}

.mc-progress-idle {
	background-color: #c2b755;
	width: 33.333%;
	height: 100%;
}

.mc-progress-started {
	background-color: #0e82ff;
	width: 66%;
	height: 100%;
}

.mc-progress-finished {
	background-color: #00ff00;
	width: 100%;
	height: 100%;
}

.mc-progress-failed {
	background-color: #ff0000;
	width: 100%;
	height: 100%;
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