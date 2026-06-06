<script setup lang="ts">
import { onMounted, ref, Transition } from "vue";
import { ReservationSearchResponseType, ReservationSelectionModalData } from "../interfaces.ts";
import Modal from "./components/ReservationSelectionModal.vue";
import * as PSUtils from "../retailVistaUtils.ts";

const show = ref(false);
const showModal = ref(false);

const modalData= ref<ReservationSelectionModalData>();
const lastOpenReservation = ref(PSUtils.getLastOpenReservation());
const lastCompletedReservation = ref(PSUtils.getLastCompletedReservation());

onMounted(() => {
	show.value = true;
	focusBarcodeInput();
});

(<HTMLFormElement>document.querySelector("#frmReservations"))
	.addEventListener("submit", ((e) => {
		e.preventDefault();
		onSearchReservation();
		focusBarcodeInput();
	}))

async function onSearchReservation() {
	const formData = $("#frmReservations").serialize();
	const response = await PSUtils.reservationSearchRequest(formData);

	handleResponse(response)
}

async function handleResponse(response: string) {
	const responseElement = document.createElement("div");
	responseElement.innerHTML = response;

	switch(PSUtils.evaluateSearchResponse(responseElement)) {
		case ReservationSearchResponseType.ContinueVerification:
			responseElement.setAttribute("hidden", "")
			document.body.append(responseElement);

			let responseOverview = <HTMLFormElement>responseElement.querySelector("#ReservationOverview");
			if (responseOverview) {
				PSUtils.cacheReservationDetails(PSUtils.GetReservationDetailsFromOverview(responseOverview)!);
			}
			PSUtils.skipVerification(responseElement);
			break;

		case ReservationSearchResponseType.SelectionModal:
			modalData.value = await PSUtils.RetrieveModalData(responseElement);
			showModal.value = true;
			PSUtils.removeBusy();
			break;

		case ReservationSearchResponseType.RefreshMain:
			document.querySelector("#messages")!.parentElement!.innerHTML = 
			responseElement.querySelector("#alert")!.parentElement!.parentElement!.innerHTML;

			PSUtils.removeBusy();
			break;

		case ReservationSearchResponseType.UnfinishedRun:
			PSUtils.handleUnfinishedRun(responseElement).then(() => {
				// Run function again to re-evaluate
				onSearchReservation();
			});
			break;
	}
}

function reopenReservation(reservationId: string) {
	window.location.href = `https://retailvista.net/bztrs/packingportal/Parcels?reservationId=${reservationId}&allowCashOnDelivery=False`;
}

function openAddParcels(reservationNumber: string) {
	window.location.href = `https://retailvista.net/bztrs/packingportal/AddParcels/Search?ReservationNumber=${reservationNumber}`;
}

function openReservation(url: string) {
	PSUtils.fetchReservation(url).then((response) => {
		handleResponse(response);
	});
}

function focusBarcodeInput() {
	const barcodeInput = document.querySelector("#Productbarcode") as HTMLInputElement;
	barcodeInput.focus();
	barcodeInput.value = "";
}
</script>

<template>
	<Teleport to="body">
		<Transition name="modal">
			<Modal :modal-data="modalData!" v-if="showModal" @close="showModal = false" @open="(reservationId: string) => openReservation(reservationId)"/>
		</Transition>
	</Teleport>
	<Transition>
		<div class="extension-container" v-if="show">
			<div class="row justify-content-md-center">
                <div class="col-12 mx-5">
                    <div class="row justify-content-md-center extension-content">
                        <div class="col-md-5">
							<div class="form-group pt-3">
								<button type="submit" class="btn btn-primary btn-block" :disabled="!lastOpenReservation || lastOpenReservation.id == '' || lastOpenReservation.id == lastCompletedReservation.id" @click="reopenReservation(lastOpenReservation.id)">Laatst geopende reservering</button>
							</div>
                        </div>
                        <div class="col-md-1 p-2">
                            <div class="vr" style="height:100%;"></div>
                        </div>
                        <div class="col-md-5">
							<div class="form-group pt-3">
								<button type="submit" class="btn btn-primary btn-block" :disabled="!lastCompletedReservation || lastCompletedReservation.id == ''" @click="openAddParcels(lastCompletedReservation.number)">Laatst voltooide reservering</button>
							</div>
                        </div>
                    </div>
                </div>
            </div>
		</div>
	</Transition>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.25s ease, transform 0.1s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: scaleY(0);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease, transform 0.1s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.extension-container {
	margin-top: 15px;
}

.extension-content {
	background-color: #EFF6F3;
	padding-left: 25px;
	padding-right: 25px;
	border-radius: 15px;
}
</style>