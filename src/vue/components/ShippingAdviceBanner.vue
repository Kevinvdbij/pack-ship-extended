<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import * as RVUtils from "../../retailVistaUtils.ts";
import { PARCEL_CONTAINER_SELECTOR, SETTINGS_SAVED_EVENT } from "../../constants.ts";
import { getParcelCarriers, type ParcelCarrier } from "../../parcelArea.ts";
import { debug } from "../../logger.ts";
import { domReady } from "../mount.ts";
import {
	isConfigured,
	readDestination,
	requestShippingAdvice,
	shippingLines,
	unknownEans,
	type ShippingAdvice,
} from "../../shippingAdvice.ts";

// Whether PostNL or Smilda is the cheaper way to send this reservation, as the
// webshop dashboard reckons it -- see `src/shippingAdvice.ts` -- set above the
// "Pakketten" heading, on the way into the boxes it is about. Placed and kept there by
// `mountShippingAdvice()` in `CreateParcelsPage.vue`.
//
// Held against the parcels, not the reservation: a packer cannot change the
// reservation's transport, only each parcel's carrier (Bewerk on its card), and
// the parcels' carrier is what the order actually goes out with -- which is what
// the dashboard lays the advice beside. Read again after every parcel change, so
// the banner stands down once the parcels follow the advice. Until there is a
// parcel to read, the reservation's transport stands in: it is what the first
// parcel is made with.
//
// Only raised when it would change what the packer does: a parcel goes with
// another carrier than the advice, or a product has a local carrier. A notice and
// nothing more, which is what Niek asked for to begin with: nothing is changed
// for the packer.
//
// Quiet lines besides, for the trial: the advice agrees with the parcels -- most
// orders, and worth seeing so the packer knows it was asked --
// the advice could not be had (a wrong login, a dashboard that is down), or a
// product has no known size. All worth knowing while the advice is being judged,
// none of them an instruction.
//
// Asked once per page, and answered from the tab's session after that -- see
// `requestShippingAdvice()`, since every question is recorded as an advice
// given.

type State = "hidden" | "loading" | "failed" | "ready";

const state = ref<State>("hidden");
const advice = ref<ShippingAdvice>();
const failure = ref("");

// Off the portal's summary block, which stays in the document after the sidebar
// has read it and hidden it. Read in `load()`, once the page is complete.
const transport = ref("");

// How each parcel on the page goes out, kept current by `watchParcels()`.
const parcelCarriers = ref<ParcelCarrier[]>([]);

const unknown = computed(() => (advice.value ? unknownEans(advice.value) : []));

// What the advice is held against: the parcels once there are any, and the
// reservation's transport until then. `text` is what the carrier's name is
// looked for in -- both parts of a card, since a Smilda parcel names Smilda in
// its title and only its service ("Colli - L200 - 60kg") on the carrier line --
// and `label` is how the banner names it.
const onParcels = computed(() => parcelCarriers.value.length > 0);
const compared = computed(() => onParcels.value
	? parcelCarriers.value.map((parcel) => ({ text: `${parcel.provider} ${parcel.service}`, label: parcelLabel(parcel) }))
	: transport.value ? [{ text: transport.value, label: transport.value }] : []);

// "PostNL Standard" as it is: it says the carrier. "Smilda (Colli - L200 -
// 60kg)" when the service alone does not, and the title is what does.
function parcelLabel(parcel: ParcelCarrier): string {
	if (/postnl|smilda/i.test(parcel.service) || !parcel.provider) {
		return parcel.service || parcel.provider;
	}

	return parcel.service ? `${parcel.provider} (${parcel.service})` : parcel.provider;
}

// The ones going with another carrier than advised. Matched as a word, because
// PostNL comes as several services -- "PostNL Standard", to a service point --
// and every one of them is PostNL.
const mismatched = computed(() => {
	const carrier = advice.value?.advies?.toLowerCase();

	return carrier ? compared.value.filter((entry) => !entry.text.toLowerCase().includes(carrier)) : [];
});

const differs = computed(() => mismatched.value.length > 0);

// "reservering staat op Smilda Pallet", "pakket staat op PostNL Standard",
// "1 van de 3 pakketten staat op ...", or "2 van de 3 pakketten staan op ...".
const against = computed(() => {
	const names = [...new Set(mismatched.value.map((entry) => entry.label))].join(", ");

	if (!onParcels.value) {
		return `reservering staat op ${names}`;
	}

	if (compared.value.length == 1) {
		return `pakket staat op ${names}`;
	}

	return mismatched.value.length == compared.value.length
		? `pakketten staan op ${names}`
		: `${mismatched.value.length} van de ${compared.value.length} pakketten `
			+ `${mismatched.value.length == 1 ? "staat" : "staan"} op ${names}`;
});

const localCarrier = computed(() => Boolean(advice.value?.lokale_vervoerder));

const standsOut = computed(() => state.value == "ready" && (differs.value || localCarrier.value));

// What each carrier would cost, when the answer carries both as numbers. The
// handover names the fields (`postnl.totaal`, `smilda.kosten`) but not their
// type, so anything that does not read as a number is left out and the banner
// falls back on the advice alone.
const costs = computed(() => {
	const postnl = amount((advice.value as { postnl?: { totaal?: unknown } } | undefined)?.postnl?.totaal);
	const smilda = amount((advice.value as { smilda?: { kosten?: unknown } } | undefined)?.smilda?.kosten);

	return postnl != null && smilda != null ? { PostNL: postnl, Smilda: smilda } : null;
});

// "Smilda is € 24,76 goedkoper" when the advised carrier is the cheaper one.
// Not always so: PostNL is advised when Smilda saves less than € 5, and Smilda
// when something cannot go with PostNL at all. Then it says what is advised and
// leaves the reason to the line under it.
const headline = computed(() => {
	const carrier = advice.value?.advies;

	if (!carrier) {
		return "";
	}

	if (!differs.value) {
		return `${carrier} blijft het advies`;
	}

	const other = carrier == "PostNL" ? "Smilda" : "PostNL";
	const saving = costs.value ? costs.value[other] - costs.value[carrier] : 0;

	return saving > 0 ? `${carrier} is ${euro(saving)} goedkoper` : `Advies: verstuur met ${carrier}`;
});

const euroFormat = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" });

function euro(value: number): string {
	return euroFormat.format(value);
}

function amount(value: unknown): number | null {
	const number = typeof value == "string" ? Number(value.replace(",", ".")) : value;

	return typeof number == "number" && isFinite(number) ? number : null;
}

async function load() {
	// The page mounts as soon as the column it goes into exists, which can be
	// before the parser has reached the hidden product rows further down.
	await domReady();

	// Nothing to compare for a box the customer collects at the counter.
	transport.value = RVUtils.getCurrentTransport();

	if (!isConfigured() || RVUtils.isStorePickup(transport.value)) {
		state.value = "hidden";

		return;
	}

	const destination = readDestination(RVUtils.getDeliveryAddressLines());
	const lines = shippingLines(RVUtils.getVerificationRows());

	// A country the dashboard has no rates for, or an address not laid out the
	// way the portal usually prints it. Nothing to say rather than a guess at NL.
	if (!destination || lines.length == 0) {
		debug("No shipping advice asked: destination or products not readable.", { destination, lines });
		state.value = "hidden";

		return;
	}

	state.value = "loading";

	try {
		advice.value = await requestShippingAdvice(lines, destination,
			RVUtils.getSaleOrderReference() || safeOrderNumber());
		state.value = "ready";
	} catch (error) {
		failure.value = error instanceof Error ? error.message : String(error);
		state.value = "failed";
	}
}

function safeOrderNumber(): string {
	try {
		return RVUtils.getCurrentOrderNumber() ?? "";
	} catch {
		return "";
	}
}

// A password typed into the settings on this page is used straight away,
// rather than on the next reservation.
function onSettingsSaved() {
	load();
}

let parcelObserver: MutationObserver | undefined;

// The parcels are filled in by the portal after the page loads, and redrawn
// whole after every change, so they are read again whenever the parcel area
// changes. Only written when the carriers actually differ: this component sits
// inside that area, and a re-render it caused itself must find nothing new, or
// the observer would answer its own change for ever.
function watchParcels() {
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
	document.addEventListener(SETTINGS_SAVED_EVENT, onSettingsSaved);
	domReady().then(watchParcels);
	load();
});

onBeforeUnmount(() => {
	document.removeEventListener(SETTINGS_SAVED_EVENT, onSettingsSaved);
	parcelObserver?.disconnect();
});
</script>

<template>
	<div v-if="standsOut && advice" class="pse-advice-banner" role="status">
		<span class="material-icons pse-advice-banner-icon" aria-hidden="true">local_shipping</span>

		<div class="pse-advice-banner-text">
			<p class="pse-advice-banner-title">
				{{ headline }}
				<span v-if="differs" class="pse-advice-banner-against">{{ against }}</span>
			</p>

			<p v-if="advice.melding" class="pse-advice-banner-detail">{{ advice.melding }}</p>

			<p v-if="localCarrier" class="pse-advice-banner-detail pse-advice-banner-flag">
				<span class="material-icons pse-advice-banner-flag-icon" aria-hidden="true">priority_high</span>
				Een artikel in deze order heeft een lokale vervoerder.
			</p>
		</div>
	</div>

	<p v-else-if="state == 'failed'" class="pse-advice-quiet">
		<span class="material-icons pse-advice-quiet-icon" aria-hidden="true">local_shipping</span>
		Geen verzendadvies: {{ failure }}
	</p>

	<!-- The parcels (or, before there are any, the reservation) already go with
	     the advised carrier. Said quietly, so the packer can see the advice was
	     asked and agreed, without anything to act on. The reason is the
	     dashboard's own: "€ 52,40 goedkoper dan Smilda", or why PostNL wins on a
	     near tie. -->
	<p v-else-if="state == 'ready' && advice?.advies" class="pse-advice-quiet">
		<span class="material-icons pse-advice-quiet-icon" aria-hidden="true">local_shipping</span>
		<span>
			Verzendadvies: {{ advice.advies }}, zoals {{ onParcels ? "de pakketten" : "de reservering" }}<template v-if="advice.reden">
				&middot; {{ advice.reden }}</template>
		</span>
	</p>

	<p v-else-if="state == 'ready' && !advice?.advies && unknown.length" class="pse-advice-quiet">
		<span class="material-icons pse-advice-quiet-icon" aria-hidden="true">local_shipping</span>
		Geen verzendadvies: van {{ unknown.join(", ") }} is geen maat bekend.
	</p>
</template>

<style scoped>
/* Across the column, tinted, with the advice as its first line: read on the way
   to the first box rather than found by looking for it. */
.pse-advice-banner {
	display: flex;
	align-items: flex-start;
	gap: 12px;
	margin: 0 0 14px;
	padding: 12px 16px;
	border: 1px solid var(--pse-attention-line-soft);
	border-radius: 14px;
	background-color: var(--pse-attention-soft);
	/* The portal centres the page; this block has text of its own. */
	text-align: left;
	color: var(--pse-attention-ink);
}

.pse-advice-banner-icon {
	flex: none;
	margin-top: 1px;
	font-size: 22px;
}

.pse-advice-banner-text {
	min-width: 0;
}

.pse-advice-banner-title {
	display: flex;
	flex-wrap: wrap;
	align-items: baseline;
	gap: 2px 10px;
	margin: 0;
	font-size: 15px;
	font-weight: 700;
	line-height: 1.35;
}

.pse-advice-banner-against {
	font-size: 12.5px;
	font-weight: 600;
	opacity: 0.85;
}

.pse-advice-banner-detail {
	margin: 3px 0 0;
	font-size: 13px;
	font-weight: 500;
	line-height: 1.45;
	overflow-wrap: anywhere;
}

.pse-advice-banner-flag {
	display: flex;
	align-items: flex-start;
	gap: 5px;
	margin-top: 6px;
	font-weight: 650;
}

.pse-advice-banner-flag-icon {
	flex: none;
	font-size: 16px;
}

/* For the trial, not for the packer: said, but not raised. */
.pse-advice-quiet {
	display: flex;
	align-items: center;
	gap: 6px;
	margin: 0 0 12px;
	font-size: 12px;
	line-height: 1.4;
	text-align: left;
	color: var(--pse-ink-faint);
}

.pse-advice-quiet-icon {
	flex: none;
	font-size: 15px;
}
</style>
