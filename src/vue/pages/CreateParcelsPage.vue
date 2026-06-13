<script setup lang="ts">
import { createApp, onMounted, ref, Transition } from 'vue';
import * as RVUtils from '../../retailVistaUtils.ts';
import addIconUrl from "../../assets/add.svg";
import imageIconUrl from "../../assets/image.svg";
import { MassCompleteStatus, ReservationDetails } from '../../interfaces.ts';
import ReservationSummary from '../components/ReservationSummary.vue';
import Settings from '../../settings.ts';

const show = ref(false);

let reservationDetails = ref<ReservationDetails>();

onMounted(() => {
	getReservationDetails().then(() => {
		processAutoComplete();
		updateVerifiedQuantities();
		observeParcelContainer();
	});

	if (!RVUtils.isMassCompleteReservation(RVUtils.getCurrentReservationNumber())) {
		removeParcelItems();
	}
	setupSummary();
	
	RVUtils.setLastOpenReservation({
		id: RVUtils.getCurrentReservationId(),
		number: RVUtils.getCurrentReservationNumber()
	});

	show.value = true;
});

async function getReservationDetails() {
	const cachedReservations = RVUtils.retrieveCachedReservationDetails();

	const cacheHit = cachedReservations.find((reservation) => reservation.id == RVUtils.getCurrentReservationNumber());
	if (cacheHit) {
		reservationDetails.value = cacheHit;
		console.log("Cache hit!");

		return reservationDetails.value;
	}
	else {
		console.log("Cache miss!");
		await RVUtils.fetchReservationDetails(RVUtils.getCurrentReservationId()).then((details) => {
			reservationDetails.value = details!;

			return reservationDetails.value;
		});
	}
}

function onClickAddProduct(barcode: string) {
	let barcodeInput = document.querySelector("#productBarcode") as HTMLInputElement;
	let scanButton = document.querySelector("#verifyProduct") as HTMLInputElement;

	barcodeInput.value = barcode;
	scanButton.click();
}

function updateVerifiedQuantities() {
	reservationDetails.value?.products.forEach((product) => {
		const itemId = RVUtils.getReservationRowIndexFromItemId(product.itemId);
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
			autoAnnounceParcels(parcelContainerElement);
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

function autoAnnounceParcels(parcelContainerElement: Element) {
	if (!Settings.autoMasterSwitch && !RVUtils.isMassCompleteReservation(RVUtils.getCurrentReservationNumber())) {
		return;
	}

	const announceButton = parcelContainerElement?.querySelector("div > div:nth-child(4) > div > button") as HTMLButtonElement;
	if (!announceButton?.hasAttribute("disabled")) {
		announceButton?.click();
		console.log("ANNOUNCE LABELS");
	}
}

function processAutoComplete() {
	const orderNumber = RVUtils.getCurrentReservationNumber();

	console.log(`isMassCompleteReservation: ${RVUtils.isMassCompleteReservation(orderNumber)}`)

	if (RVUtils.isMassCompleteReservation(orderNumber)) {
		RVUtils.updateMassCompleteStatus( { reservationNumber: orderNumber, status: MassCompleteStatus.started });
		console.log({ reservationNumber: orderNumber, status: MassCompleteStatus.started });

		reservationDetails.value?.products.forEach((product) => {
			for(let i = 0; i < product.requiredQuantity; i++) {
				document.querySelector<HTMLInputElement>("#productBarcode")!.value = product.mainBarcode;
				document.querySelector<HTMLButtonElement>("#verifyProduct")!.click();
			}
		});
	}
}

function verifiedClass(required: number, collected: number): string {
	const normal = "collected-text";
	const warn = "collected-text collected-text-warn blinking"
	const alert = "collected-text collected-text-alert blinking";
	const resolved = "collected-text collected-text-resolved"

	if (required > 1 && required == collected) {
		return resolved;
	}
	else if (required > 1 && collected == 0) {
		return alert;
	}
	else if (required > 1 && collected > 0) {
		return warn;
	}
	else {
		return normal;
	}
}

function removeParcelItems(): void {
	// Get all delete buttons for parcel items and start iterating through them
	const removeButtons = Array.from(document.querySelectorAll<HTMLElement>("#button-addon2"));

	// Iterate through found remove buttons from the last with a delay, without this delay the removal fails
	if (removeButtons.length > 0) {
		// Set the class to busy so the user knows actions are happening
		RVUtils.setBusy(true);
		for (let i = 0; i < removeButtons.length; i++) {
			setTimeout(() => {
				RVUtils.setBusy(true);
				// format the onclick event to usable data
				const parcelInfo = removeButtons.pop()!.onclick!.toString().split("(").pop()!.split(")").shift()!.split(",");

				// Get the amount and active controls for the parcel item
				const amountControl = document.querySelector<HTMLInputElement>("#Items_" + parcelInfo[1] + "__Items_" + parcelInfo[2] + "__Amount")!;
				const activeControl = document.querySelector<HTMLInputElement>("#Items_" + parcelInfo[1] + "__Items_" + parcelInfo[2] + "__Active")!;

				// Set the controls to 0 and active, this makes the update remove the parcel items
				amountControl.value = "0";
				activeControl.value = "True";

				// Call the page native function to update the parcel item
				location.href = "javascript:void(update());";
			}, i * 250);
		}
		RVUtils.setBusy(false);
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
												<span
													:class="verifiedClass(product.requiredQuantity, product.verifiedQuantity)">{{
														product.verifiedQuantity }} van {{ product.requiredQuantity
													}}</span>
											</td>
											<td>
												<span v-if="product.verifiedQuantity < product.requiredQuantity"
													class="text-warning"><span
														class="material-icons">close</span></span>
												<span v-if="product.verifiedQuantity >= product.requiredQuantity"
													class="text-success"><span class="material-icons">done</span></span>
											</td>
											<td>
												<div style="display: inline-flex; gap: 5px;">
													<button @click="onClickAddProduct(product.mainBarcode)"
														type="button" class="btn btn-primary action-icon"
														v-bind:disabled="product.verifiedQuantity >= product.requiredQuantity">
														<img class="action-icon-image" :src="addIconUrl" width="26"
															height="26" />
													</button>
													<button
														type="button" class="btn btn-primary action-icon" disabled>
														<img class="action-icon-image" :src="imageIconUrl" width="26"
															height="26" />
													</button>
												</div>
											</td>
										</tr>
									</template>
								</tbody>
							</table>
							<div class="mt-2 alert alert-info">Om producten te verzamelen, scan of voer de barcode in
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

.container {
	margin-right: 0px;
	margin-left: 0px;
}

.action-icon {
	width: 26px;
	height: 26px;
	display: flex;
	justify-content: center;
	align-items: center;
}

.action-icon-image {
	filter: invert(1);
}

.collected-text {
	background-color: transparent;
	color: black;
	padding: 5px;
	padding-inline: 8px;
	font-size: small;
	font-weight: normal;
	border-radius: 6px;
}

.collected-text-warn {
	background-color: #ff8800;
	color: white;
	font-size: medium;
	font-weight: bold;
}

.collected-text-alert {
	background-color: red;
	color: white;
	font-size: medium;
	font-weight: bold;
}

.collected-text-resolved {
	background-color: #ccc;
	color: rgb(255, 255, 255);
	padding: 5px;
	padding-inline: 8px;
	font-size: medium;
	font-weight: bold;
}
</style>