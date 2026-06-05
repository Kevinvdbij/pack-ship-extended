<script setup lang="ts">
import { createApp, onMounted, ref, Transition } from 'vue';
import { fetchReservationDetails, getCurrentReservationId, getCurrentReservationNumber, getReservationRowIndexFromItemId, retrieveCachedReservationDetails, setLastOpenReservation } from '../utilities';
import addIconUrl from "../assets/add.svg";
import { ReservationDetails } from '../interfaces';
import ReservationSummary from './components/ReservationSummary.vue';

const show = ref(false);

const cachedReservations = retrieveCachedReservationDetails();
let reservationDetails = ref<ReservationDetails>();

const cacheHit = cachedReservations.find((reservation) => reservation.id == getCurrentReservationNumber());
if (cacheHit) {
	reservationDetails.value = cacheHit;
	console.log("cache hit!")
} else{
	fetchReservationDetails(getCurrentReservationId()).then((details) => {
		reservationDetails.value = details!;
		console.log("cache miss!")
	});
}

onMounted(() => {
	show.value = true;
	updateVerifiedQuantities();
	observeParcelContainer();
	setupSummary();
	
	setLastOpenReservation({
		id: getCurrentReservationId(),
		number: getCurrentReservationNumber()
	});
});

function onClickAddProduct(barcode: string) {
	let barcodeInput = document.querySelector("#productBarcode") as HTMLInputElement;
	let scanButton = document.querySelector("#verifyProduct") as HTMLInputElement;

	barcodeInput.value = barcode;
	scanButton.click();
}

function updateVerifiedQuantities() {
	reservationDetails.value?.products.forEach((product) => {
		const itemId = getReservationRowIndexFromItemId(product.itemId);
		const quantity = <HTMLInputElement>document.querySelector(`input[name='VerificationReservationRows[${itemId}].VerifiedQuantity']`);
			
		product.verifiedQuantity = parseInt(quantity.value)
	})
}

function observeParcelContainer() {
	const parcelContainerElement = document.querySelector("#ParcelsContainer");
	
	if (parcelContainerElement) {
		const config = { attributes: true, childList: true, subtree: true };
		const observer = new MutationObserver(() => {
			updateVerifiedQuantities();
			announceParcels(parcelContainerElement);
		});
		observer.observe(parcelContainerElement, config);
	}
}

function setupSummary() {
	const overviewElement = <HTMLElement>document.querySelector("#ReservationOverview");
	const backButton = <HTMLLinkElement>overviewElement.querySelector("div:nth-child(1) > div > a")
	
	backButton.href = "https://retailvista.net/bztrs/packingportal";
	backButton.innerHTML = "<span class='material-icons'>chevron_left</span>Nieuwe zoekopdracht";
	
	createApp(ReservationSummary).mount(
		(() => {
			const app = document.createElement('div');
			document.querySelector("#ReservationSummary\\ mb-2")!.insertAdjacentElement("beforeend", app);
			return app;
		})(),
	);
}

function announceParcels(parcelContainerElement: Element) {
	const announceButton = parcelContainerElement?.querySelector("div > div:nth-child(4) > div > button") as HTMLButtonElement;
	if (!announceButton?.hasAttribute("disabled")) {
		announceButton?.click();
	}
}
</script>

<template>
	<Transition>
		<div v-if="show && reservationDetails" id="ReservationContainer">
			<div class="reservation">
				<h4>Producten</h4>
				<div class="container my-2">
					<div class="row">
						<div class="col">
							<table class="table">
								<tbody>
									<tr>
										<th>Omschrijving</th>
										<th>Hoofd barcode</th>
										<th>Gescand</th>
										<th>Verzameld</th>
										<th>Actie</th>
									</tr>
									<template v-for="product in reservationDetails?.products">
										<tr>
											<td>
												<span>{{ product.description }}</span>
											</td>
											<td>
												<span>{{ product.mainBarcode }}</span>
											</td>
											<td>
												<span>{{ product.verifiedQuantity }} van {{ product.requiredQuantity }}</span>
											</td>
											<td>
												<span v-if="product.verifiedQuantity < product.requiredQuantity" class="text-warning"><span class="material-icons">close</span></span>
												<span v-if="product.verifiedQuantity >= product.requiredQuantity" class="text-success"><span class="material-icons">done</span></span>
											</td>
											<td>
												<button @click="onClickAddProduct(product.mainBarcode)" type="button" class="btn btn-primary add-button" v-bind:disabled="product.verifiedQuantity >= product.requiredQuantity">
													<img class="add-icon" :src="addIconUrl" width="26" height="26" />
												</button>
											</td>
										</tr>
									</template>
								</tbody>
							</table>
							<div class="mt-2 alert alert-info">Om producten te verzamelen, scan of voer de barcode in</div>
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

.container {
	margin-right: 0px;
	margin-left: 0px;
}

.add-button {
	width:26px;
	height:26px;
	display: flex;
	justify-content: center;
	align-items: center;
}

.add-icon {
	filter: invert(1);
}
</style>