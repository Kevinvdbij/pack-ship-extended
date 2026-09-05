<script setup lang="ts">
import { computed, onMounted, ref, Transition } from 'vue';
import * as RVUtils from '../../retailVistaUtils.ts';
import { domReady, mountApp } from '../mount.ts';
import {
	PACKING_PORTAL_URL,
	PARCEL_GROUP_SELECTOR,
	PARCEL_TABS_SELECTOR,
	PARCELS_RETURN_HASH,
} from '../../constants.ts';
import { debug } from '../../logger.ts';
import addIconUrl from "../../assets/add.svg";
import imageIconUrl from "../../assets/image.svg";
import { MassCompleteStatus, ParcelItem, VerificationRow } from '../../interfaces.ts';
import ReservationSidebar from '../components/ReservationSidebar.vue';
import CopyButton from '../components/CopyButton.vue';
import ImageModal from '../components/ImageModal.vue';
import Settings from '../../settings.ts';
import * as Shopware from "../../shopware.ts";

const showRows = ref(false);

// Sent back here by the completed screen after the carrier refused the
// announcement. Everything this page does on its own is off for the trip: the
// parcels are kept rather than cleared, and nothing is announced or scanned
// until the operator says so. They came back to change something, and a page
// that empties the boxes and immediately re-announces them would carry them
// straight to the same error with the same parcel.
const returning = window.location.hash == PARCELS_RETURN_HASH;

// The portal's scan field on this page, which it names differently from the one
// on the search page.
const SCAN_INPUT = "#productBarcode";

// The table is the portal's own rows, read straight out of the hidden inputs
// it serves this page with -- one `VerificationReservationRows[n]` group per
// picking instruction, each carrying what was picked and what has been
// scanned -- then folded into one line per product. Nothing is joined to a
// second list, and nothing is fetched.
//
// The fold is the point. A product picked from two locations is served as two
// or three rows, each with what that instruction asked for rather than what it
// got, and the portal spreads the scans over them. Shown row by row that reads
// "11 van 8, 11 van 6, 11 van 3" for an order of eleven; folded it reads
// "11 van 11". The scanned side is counted from the parcel items -- what is in
// the boxes -- rather than from the rows, so it does not depend on which row
// the portal credited a scan to.
//
// The rows are in the served markup, so the table has its data before anything
// ours has run; the skeleton below only ever stands in for the parcel clearing
// this page does on entry.
//
// Read once here, in the first paint, and again at DOM-ready if this look came
// up empty: this page mounts as soon as its anchor is parsed, which can be
// before the parser has reached the inputs.
const rows = ref<VerificationRow[]>(RVUtils.getVerificationRows());
const parcelItems = ref<ParcelItem[]>(RVUtils.getParcelItems());
const lines = computed(() => RVUtils.groupVerificationRows(rows.value, parcelItems.value));
const showImageModal = ref(false);
const imageModalUrl = ref("");

onMounted(() => {
	domReady()
		.then(() => {
			if (rows.value.length == 0) {
				rows.value = RVUtils.getVerificationRows();
			}

			return returning ? undefined : removeParcelItems();
		})
		.then(() => {
			updateVerifiedQuantities();
			showRows.value = true;

			// After the parcels have been cleared, not before: clearing runs
			// the portal's own update through the page, and anything focused
			// ahead of it loses the cursor again when the answer lands.
			RVUtils.focusBarcodeInput(SCAN_INPUT);

			processAutoComplete();
			observeParcelContainer();
		});

	setupSidebar();
	markParcelsLoading();
	keepScannerFocused();

	RVUtils.setLastOpenReservation({
		id: RVUtils.getCurrentReservationId(),
		number: RVUtils.getCurrentReservationNumber()
	});
});

function onClickAddProduct(barcode: string) {
	let barcodeInput = document.querySelector("#productBarcode") as HTMLInputElement;
	let scanButton = document.querySelector("#verifyProduct") as HTMLInputElement;

	barcodeInput.value = barcode;
	scanButton.click();
}

async function onClickShowImage(productEAN: string) {
	const productURL = await Shopware.getImageUri(productEAN);

	imageModalUrl.value = productURL;
	showImageModal.value = true;
}

// Re-reads the parcel items, and with them the rows' own counts. The portal
// rewrites the whole parcel container on every parcel change, so both are read
// afresh rather than patched.
function updateVerifiedQuantities() {
	parcelItems.value = RVUtils.getParcelItems();
	rows.value = RVUtils.getVerificationRows();
}

function observeParcelContainer() {
	const parcelContainerElement = document.querySelector("#ParcelsContainer");

	if (parcelContainerElement) {
		const config = { attributes: true, childList: true, subtree: true };
		const observer = new MutationObserver(() => {
			updateVerifiedQuantities();
			restoreScannerFocus();
			autoAnnounceParcels(parcelContainerElement);
		});
		observer.observe(parcelContainerElement, config);
	}
}
// The parcel area is the one region of this page that cannot be part of the
// reveal. The portal serves `#tabs-parcels` and its panes empty and fills them
// in from `init()`, which runs on document-ready and fetches the carriers over
// AJAX -- so holding the page back for it would mean holding the whole screen
// on a request, and letting it through unmarked means revealing a page with a
// gap where the parcels go.
//
// So the gap is furnished instead: a class on the portal's own element, which
// `src/styles/portal.css` draws a placeholder into, taken off again the moment
// the tabs have something in them.
//
// Marked by class rather than by mounting something of ours in there, because
// the portal's `refresh()` replaces the entire contents of `#ParcelsContainer`
// with a fresh render on every parcel change. Anything of ours inside it would
// be thrown away with the markup it was next to -- and so is this class, which
// is why the observer puts it back rather than only ever removing it.
function markParcelsLoading() {
	const container = document.querySelector("#ParcelsContainer");

	if (!container) {
		return;
	}

	const sync = () => {
		const group = document.querySelector(PARCEL_GROUP_SELECTOR);
		const tabs = document.querySelector(PARCEL_TABS_SELECTOR);

		if (!group) {
			return;
		}

		group.classList.toggle("pse-parcels-loading", !tabs || tabs.childElementCount == 0);
	};

	sync();

	new MutationObserver(sync).observe(container, { childList: true, subtree: true });
}

// The cursor belongs in the scan field for the whole of this step, whether or
// not anything is handling itself: this is where the packer works, the scanner
// types into whatever has the cursor, and a scan that lands anywhere else is
// lost with nothing on screen to say so.
//
// Two things take it away. The portal rewrites the whole parcel area after every
// parcel change -- `refresh()` -- and the cursor goes with the markup it was in;
// and a click on the page rather than on a control leaves focus on `body`.
// Neither is someone going somewhere on purpose, so the field takes it back.
function keepScannerFocused() {
	document.addEventListener("focusout", (event) => {
		if (event.target != document.querySelector(SCAN_INPUT)) {
			return;
		}

		// Where focus went is not known until the browser has moved it, which
		// happens after this event.
		setTimeout(restoreScannerFocus);
	});
}

// Only from nowhere. Landing on another field, a button or a dialog is the
// operator going there, and taking the cursor off them mid-edit would be worse
// than a missed scan -- the parcel's weight is typed into one of those fields.
function restoreScannerFocus() {
	if (document.activeElement && document.activeElement != document.body) {
		return;
	}

	if (showImageModal.value) {
		return;
	}

	RVUtils.focusBarcodeInput(SCAN_INPUT);
}

// The column beside the parcels: which reservation this is, who it is for, and
// the customer's note. Mounted ahead of the portal's own summary block, which
// `ReservationSidebar` reads for its fields and then hides.
//
// The portal's back control goes with it: the sidebar renders that link itself,
// so the row it sat in is hidden rather than relabelled. It pointed at the
// carrier list, which is not a step in this flow -- the way back from a
// reservation here is a new search.
function setupSidebar() {
	const overviewElement = document.querySelector("#ReservationOverview");

	overviewElement?.querySelector(":scope > div:nth-child(1)")?.classList.add("pse-portal-replaced");

	const column = RVUtils.getReservationSidebarColumn();

	if (!column) {
		return;
	}

	mountApp(ReservationSidebar, (host) => column.insertAdjacentElement("afterbegin", host));
}

function autoAnnounceParcels(parcelContainerElement: Element) {
	if (returning) {
		return;
	}

	if (!Settings.autoMasterSwitch && !RVUtils.isMassCompleteReservation(RVUtils.getCurrentReservationNumber())) {
		return;
	}

	const announceButton = parcelContainerElement?.querySelector("div > div:nth-child(4) > div > button") as HTMLButtonElement;
	if (!announceButton?.hasAttribute("disabled")) {
		announceButton?.click();
		debug("Announcing labels");
	}
}

function processAutoComplete() {
	if (returning) {
		return;
	}

	const orderNumber = RVUtils.getCurrentReservationNumber();

	if (RVUtils.isMassCompleteReservation(orderNumber)) {
		RVUtils.updateMassCompleteStatus( { reservationNumber: orderNumber, status: MassCompleteStatus.started });
		debug("Mass complete started for reservation", orderNumber);

		// What each product still lacks, not what it asks for: a product that
		// arrives partly scanned would otherwise be scanned past its quantity.
		lines.value.forEach((line) => {
			for (let i = line.verifiedQuantity; i < line.requiredQuantity; i++) {
				document.querySelector<HTMLInputElement>("#productBarcode")!.value = line.mainBarcode;
				document.querySelector<HTMLButtonElement>("#verifyProduct")!.click();
			}
		});
	}
}

// How a row's count is set. A single-unit row is the ordinary case and stays
// quiet; a row that needs several of the same product is where a packer loses
// count, so it is called out until it is complete and then marked done.
function countClass(required: number, collected: number): string {
	if (required > 1 && required == collected) {
		return "pse-count pse-count-resolved";
	}

	if (required > 1 && collected == 0) {
		return "pse-count pse-count-alert";
	}

	if (required > 1 && collected > 0) {
		return "pse-count pse-count-warn";
	}

	return "pse-count";
}

async function removeParcelItems(): Promise<void> {
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

		return new Promise(resolve => setTimeout(resolve, 250 + (removeButtons.length * 250)));
	}
}
</script>

<template>
	<Teleport to="body">
		<Transition name="modal">
			<ImageModal v-if="showImageModal && imageModalUrl" :image-url="imageModalUrl"
				@close="showImageModal = false;" />
		</Transition>
	</Teleport>

	<section class="pse-products">
		<header class="pse-products-head">
			<h2 class="pse-products-title">Producten</h2>
			<a class="pse-back" :href="PACKING_PORTAL_URL">
				<span class="material-icons pse-back-icon" aria-hidden="true">chevron_left</span>
				Nieuwe zoekopdracht
			</a>
		</header>

		<div class="pse-products-card">
			<table class="pse-table">
				<thead>
					<tr>
						<th>Omschrijving</th>
						<th>Hoofd barcode</th>
						<th>Gescand</th>
						<th class="pse-table-centre">Verzameld</th>
						<th class="pse-table-right">Actie</th>
					</tr>
				</thead>

				<tbody v-if="showRows">
					<tr v-for="product in lines" :key="product.key">
						<td class="pse-cell-description">{{ product.description }}</td>
						<td class="pse-cell-barcode">
							<span class="pse-copy-cell">
								{{ product.mainBarcode }}
								<CopyButton :value="product.mainBarcode" label="Barcode" />
							</span>
						</td>
						<td>
							<span :class="countClass(product.requiredQuantity, product.verifiedQuantity)">
								{{ product.verifiedQuantity }} van {{ product.requiredQuantity }}
							</span>
						</td>
						<td class="pse-table-centre">
							<span v-if="product.verifiedQuantity >= product.requiredQuantity"
								class="material-icons pse-mark pse-mark-done">check_circle</span>
							<span v-else class="material-icons pse-mark pse-mark-open">radio_button_unchecked</span>
						</td>
						<td class="pse-table-right">
							<div class="pse-actions">
								<button type="button" class="pse-action" title="Product toevoegen"
									:disabled="product.verifiedQuantity >= product.requiredQuantity"
									@click="onClickAddProduct(product.mainBarcode)">
									<img :src="addIconUrl" width="18" height="18" alt="Toevoegen" />
								</button>
								<button type="button" class="pse-action pse-action-quiet" title="Afbeelding tonen"
									@click="onClickShowImage(product.mainBarcode)">
									<img :src="imageIconUrl" width="18" height="18" alt="Afbeelding" />
								</button>
							</div>
						</td>
					</tr>
				</tbody>

				<!-- The same number of rows as the table above, so the real one drops
				     in without moving anything. Shown only while the parcels the page
				     was opened with are being cleared, which is when the counts are
				     changing under it; a reservation opened clean never renders it. -->
				<tbody v-else aria-hidden="true">
					<tr v-for="line in lines" :key="line.key" class="pse-skeleton-row">
						<td v-for="cell in 5" :key="cell"><span class="pse-skeleton-cell"></span></td>
					</tr>
				</tbody>
			</table>
		</div>

		<p class="pse-products-hint">
			<span class="material-icons pse-products-hint-icon" aria-hidden="true">info</span>
			Om producten te verzamelen, scan of voer de barcode in.
		</p>
	</section>
</template>

<style scoped>
.pse-products {
	box-sizing: border-box;
	margin-bottom: 26px;
	color: var(--pse-ink);
	/* The portal wraps the page in `.container-fluid.text-center`. */
	text-align: left;
}

.pse-products :deep(*) {
	box-sizing: border-box;
}

/* ---- The count ---- *
 * A single-unit row is the ordinary case and stays quiet. A row that needs
 * several of the same product is where a packer loses count, so it is called
 * out until it is complete -- red while none are in the box, amber part way --
 * and then settles into a plain done state rather than staying loud.
 *
 * The old version blinked all three of those at 0.75s. A number that is being
 * read off is the wrong thing to flash: the count is what has to be legible,
 * and it was legible half the time.
 */
.pse-count {
	display: inline-block;
	padding: 3px 9px;
	border-radius: 8px;
	font-size: 13px;
	font-weight: 600;
	font-variant-numeric: tabular-nums;
	white-space: nowrap;
	color: var(--pse-ink);
}

/* The two unfinished states breathe. A row that needs several of the same
   product is where a packer loses count, so it has to catch the eye from across
   the counter -- but the thing being caught is a number that then has to be
   read, which is why this is a slow swell of the badge rather than the 0.75s
   blink it replaced. The colour never leaves and the digits never move. */
.pse-count-warn,
.pse-count-alert {
	animation: pse-count-breathe 2.4s ease-in-out infinite;
}

.pse-count-warn {
	background-color: rgba(226, 160, 46, 0.18);
	color: #8a5a10;
}

.pse-count-alert {
	background-color: rgba(176, 58, 46, 0.12);
	color: #a3372c;
}

@keyframes pse-count-breathe {
	50% {
		background-color: rgba(226, 160, 46, 0.42);
	}
}

/* The one that is genuinely wrong swells further, and in its own colour. */
.pse-count-alert {
	animation-name: pse-count-breathe-alert;
}

@keyframes pse-count-breathe-alert {
	50% {
		background-color: rgba(176, 58, 46, 0.30);
	}
}

.pse-count-resolved {
	background-color: var(--pse-brand-soft);
	color: var(--pse-brand-ink);
}

.pse-mark {
	font-size: 21px;
	vertical-align: middle;
}

.pse-mark-done {
	color: var(--pse-brand);
}

.pse-mark-open {
	color: var(--pse-ink-faint);
}

/* The action buttons are what set a row's height, so the skeleton's cells match
   their box rather than the text next to them. */
.pse-skeleton-row td {
	height: 58px;
}

.pse-skeleton-cell {
	display: block;
	height: 12px;
	border-radius: 6px;
	background-color: var(--pse-line);
	animation: pse-products-pulse 1.4s ease-in-out infinite;
}

@keyframes pse-products-pulse {
	50% {
		opacity: 0.45;
	}
}

.pse-products-hint {
	display: flex;
	align-items: center;
	gap: 8px;
	margin: 12px 0 0;
	padding: 10px 13px;
	border: 1px solid var(--pse-brand-ring);
	border-radius: 12px;
	background-color: var(--pse-brand-soft);
	font-size: 13px;
	font-weight: 550;
	line-height: 1.4;
	color: var(--pse-brand-ink);
}

.pse-products-hint-icon {
	flex: none;
	font-size: 18px;
}

@media (prefers-reduced-motion: reduce) {
	.pse-skeleton-cell,
	.pse-count-warn,
	.pse-count-alert {
		animation: none;
	}
}
</style>
