<script setup lang="ts">
import { ModalReservationDetails } from "../../interfaces.ts";
import { isAmountStringComplete, matchShopwareOrderNumber } from "../../retailVistaUtils.ts";
import ShopwareNote from "./ShopwareNote.vue";

// One card per reservation in the selection modal. The three groups differ only
// in which parts they switch on: singleline reservations get a progress bar and
// no product table, invalid ones get no Open button and their incomplete rows
// highlighted.
const props = defineProps<{
	reservation: ModalReservationDetails;
	showProducts?: boolean;
	showOpenButton?: boolean;
	highlightIncomplete?: boolean;
	showProgressBar?: boolean;
	progressClass?: string;
	// Singleline reservations never show a note: their order data is not fetched.
	showNote?: boolean;
	noteEnabled?: boolean;
}>();

defineEmits<{
	open: [url: string];
	saveNote: [];
}>();

function hasShopwareNote() {
	return matchShopwareOrderNumber(props.reservation.saleOrderReference);
}

function productRowClass(amount: string) {
	return props.highlightIncomplete && !isAmountStringComplete(amount)
		? "row nfTableRow bg-warning text-dark"
		: "row nfTableRow";
}
</script>

<template>
	<div class="card mb-2">
		<div class="card-header">
			<div class="row">
				<div class="col-10">
					<div class="row">
						<div class="col-4">
							<div>Reservering: <b>{{ reservation.reservationNumber }}</b></div>
							<div>Verkooporder referentiecode: <b>{{ reservation.saleOrderReference }}</b></div>
						</div>
						<div class="col-4">
							<div>Status: <b>{{ reservation.status }}</b></div>
							<div>Logistieke status: <b>{{ reservation.deliveryStatus }}</b></div>
						</div>
						<div class="col-4">
							<div> Klant: <b>{{ reservation.customer }}</b></div>
						</div>
					</div>
				</div>
				<div class="col-2">
					<div class="float-right">
						<Transition>
							<a href="javascript: void(0)" class="btn btn-primary" v-show="showOpenButton"
								v-on:click="$emit('open', reservation.url)">Open&nbsp;<span
									class="material-icons">chevron_right</span></a>
						</Transition>
					</div>
				</div>
			</div>
		</div>

		<div class="card-body" v-if="showProducts">
			<div class="reservation-rows">
				<div class="row nfTableHeader">
					<div class="col-3">Artikel nr</div>
					<div class="col-3">Omschrijving</div>
					<div class="col-3">Hoofd barcode</div>
					<div class="col-3">Geraapt aantal</div>
				</div>
				<div class="reservation-rows">
					<div v-for="(product, index) in reservation.products" :key="index"
						:class="productRowClass(product.amount)">
						<div class="col-3">{{ product.number }}</div>
						<div class="col-3">{{ product.description }}</div>
						<div class="col-3">{{ product.barcode }}</div>
						<div :class="highlightIncomplete ? 'col-3 font-weight-bold' : 'col-3'">{{ product.amount }}</div>
					</div>
				</div>
			</div>
		</div>

		<ShopwareNote v-if="showNote && hasShopwareNote()" :order-data="reservation.swOrderData"
			:enabled="!!noteEnabled" @save="$emit('saveNote')" />

		<Transition>
			<div class="mc-progress-bar" v-show="showProgressBar">
				<div :class="progressClass"></div>
			</div>
		</Transition>
	</div>
</template>

<style scoped>
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
	background-color: #4ea0f7;
	width: 66%;
	height: 100%;
}

.mc-progress-finished {
	background-color: #56e656;
	width: 100%;
	height: 100%;
}

.mc-progress-failed {
	background-color: #ff0000;
	width: 100%;
	height: 100%;
}
</style>
