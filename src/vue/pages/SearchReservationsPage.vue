<script setup lang="ts">
import { onMounted, ref, Transition } from "vue";
import { ReservationSearchResponseType, ReservationSelectionModalData } from "../../interfaces.ts";
import Modal from "../components/ReservationSelectionModal.vue";
import * as RVUtils from "../../retailVistaUtils.ts";
import { PACKING_PORTAL_URL } from "../../constants.ts";

const show = ref(false);
const showModal = ref(false);

const modalData = ref<ReservationSelectionModalData>();
const lastOpenReservation = ref(RVUtils.getLastOpenReservation());
const lastCompletedReservation = ref(RVUtils.getLastCompletedReservation());

onMounted(() => {
	show.value = true;
	RVUtils.focusBarcodeInput();
});

(<HTMLFormElement>document.querySelector("#frmReservations"))
	.addEventListener("submit", ((e) => {
		e.preventDefault();
		onSearchReservation();
		RVUtils.focusBarcodeInput();
	}))

async function onSearchReservation() {
	const formData = $("#frmReservations").serialize();
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
			RVUtils.setBusy(false);
			break;

		case ReservationSearchResponseType.RefreshMain:
			document.querySelector("#messages")!.parentElement!.innerHTML =
				responseElement.querySelector("#alert")!.parentElement!.parentElement!.innerHTML;

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

function reopenReservation(reservationId: string) {
	window.location.href = `${PACKING_PORTAL_URL}/Parcels?reservationId=${reservationId}&allowCashOnDelivery=False`;
}

function openAddParcels(reservationNumber: string) {
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
			<Modal :modal-data="modalData!" v-if="showModal" @close="showModal = false"
				@open="(reservationId: string) => openReservation(reservationId)" />
		</Transition>
	</Teleport>
	<Transition>
		<div class="extension-container" v-if="show">
			<div class="row justify-content-md-center">
				<div class="col-12 mx-5">
					<div class="row justify-content-md-center extension-content">
						<div class="col-md-5">
							<div class="form-group pt-3">
								<button type="submit" class="btn btn-primary btn-block" :disabled="!lastOpenReservation ||
									lastOpenReservation.id == '' ||
									lastCompletedReservation && lastOpenReservation.id == lastCompletedReservation.id"
									@click="reopenReservation(lastOpenReservation.id)">Laatst geopende
									reservering</button>
							</div>
						</div>
						<div class="col-md-1 p-2">
							<div class="vr" style="height:100%;"></div>
						</div>
						<div class="col-md-5">
							<div class="form-group pt-3">
								<button type="submit" class="btn btn-primary btn-block"
									:disabled="!lastCompletedReservation || lastCompletedReservation.id == ''"
									@click="openAddParcels(lastCompletedReservation.number)">Laatst voltooide
									reservering</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</Transition>
</template>

<style scoped>
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