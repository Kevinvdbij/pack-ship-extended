<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import * as RVUtils from "../../retailVistaUtils.ts";
import { PARCEL_CONTAINER_SELECTOR } from "../../constants.ts";
import { getParcelCarriers, type ParcelCarrier } from "../../parcelArea.ts";
import { domReady } from "../mount.ts";

// A reservation the customer collects at a PostNL service point, with a parcel
// that has been put on Smilda. Smilda does not deliver to a service point: the
// address on the reservation is the point's, and a pallet carrier turns up at a
// supermarket counter with it.
//
// The reservation's transport cannot be changed here, only each parcel's
// carrier (Bewerk on its card), so that is where it goes wrong and what is
// watched: the parcels are read again after every change to the parcel area,
// the way `ShippingAdviceBanner.vue` reads them, and the warning stands down
// once no parcel is on Smilda any more.
//
// A warning and nothing more: the announcement is not held back.

const transport = ref("");
const parcelCarriers = ref<ParcelCarrier[]>([]);

// Smilda is named in the card's title ("375608 / Smilda"), its service on the
// carrier line ("Colli - L200 - 60kg"); either part is looked in.
const onSmilda = computed(() => parcelCarriers.value
	.filter((parcel) => /smilda/i.test(`${parcel.provider} ${parcel.service}`)));

const raised = computed(() => RVUtils.isPickupPoint(transport.value) && onSmilda.value.length > 0);

const which = computed(() => {
	const total = parcelCarriers.value.length;
	const count = onSmilda.value.length;

	if (total == 1) {
		return "Het pakket staat op Smilda.";
	}

	return count == total
		? "De pakketten staan op Smilda."
		: `${count} van de ${total} pakketten ${count == 1 ? "staat" : "staan"} op Smilda.`;
});

let parcelObserver: MutationObserver | undefined;

// Only written when the carriers actually differ, so a re-render of our own
// inside the watched area is not answered with another.
function watchParcels() {
	// Off the portal's summary block, which is complete once the page is.
	transport.value = RVUtils.getCurrentTransport();

	if (!RVUtils.isPickupPoint(transport.value)) {
		return;
	}

	const read = () => {
		const carriers = getParcelCarriers();

		if (JSON.stringify(carriers) != JSON.stringify(parcelCarriers.value)) {
			parcelCarriers.value = carriers;
		}
	};

	read();

	const container = document.querySelector(PARCEL_CONTAINER_SELECTOR);

	if (container) {
		parcelObserver = new MutationObserver(read);
		parcelObserver.observe(container, { childList: true, subtree: true });
	}
}

onMounted(() => {
	domReady().then(watchParcels);
});

onBeforeUnmount(() => {
	parcelObserver?.disconnect();
});
</script>

<template>
	<div v-if="raised" class="pse-pickup-point-warning" role="alert">
		<span class="material-icons pse-pickup-point-warning-icon" aria-hidden="true">warning</span>

		<div>
			<p class="pse-pickup-point-warning-title">Smilda levert niet bij een afhaalpunt</p>
			<p class="pse-pickup-point-warning-detail">
				Deze reservering gaat naar een afhaalpunt ({{ transport }}). {{ which }}
				Zet de vervoerder terug op PostNL.
			</p>
		</div>
	</div>
</template>

<style scoped>
.pse-pickup-point-warning {
	display: flex;
	align-items: flex-start;
	gap: 12px;
	margin: 0 0 14px;
	padding: 12px 16px;
	border: 1px solid var(--pse-alert);
	border-radius: 14px;
	background-color: var(--pse-alert-soft);
	/* The portal centres the page; this block has text of its own. */
	text-align: left;
	color: var(--pse-alert-ink);
}

.pse-pickup-point-warning-icon {
	flex: none;
	margin-top: 1px;
	font-size: 22px;
}

.pse-pickup-point-warning-title {
	margin: 0;
	font-size: 15px;
	font-weight: 700;
	line-height: 1.35;
}

.pse-pickup-point-warning-detail {
	margin: 3px 0 0;
	font-size: 13px;
	font-weight: 500;
	line-height: 1.45;
	overflow-wrap: anywhere;
}
</style>
