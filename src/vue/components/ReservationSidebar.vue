<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import * as Shopware from "../../shopware.ts";
import { saveOrderComment } from "../../shopwareComments.ts";
import { getCurrentOrderNumber, matchShopwareOrderNumber } from "../../retailVistaUtils.ts";
import { debug } from "../../logger.ts";
import { RESERVATION_SUMMARY_SELECTOR, SHOPWARE_URL } from "../../constants.ts";
import ShopwareNote from "./ShopwareNote.vue";
import CopyButton from "./CopyButton.vue";

// The column beside the work: which reservation this is, who it is for, where
// it is going, and the customer's note. The same on every page that has a
// reservation open -- the parcels page, the completed page, the add-parcels
// page -- which is why it is a component rather than three pages each doing
// their own version.
//
// The portal renders the same facts as a stack of `Label: value` rows in
// `#ReservationSummary mb-2`. Those rows are the source: they are read here and
// re-rendered as our own markup, and the portal's block is then hidden rather
// than removed. It has to stay in the document -- `getCurrentOrderNumber()`
// reads the sale order reference straight out of it, and `#ReservationId`,
// which the whole page identifies itself by, is one of its children.

// The two fields worth reading at a glance rather than looking up. Matched by
// the portal's own labels; anything not named here is rendered as an ordinary
// row, so a label we have not seen is shown rather than dropped.
const CHIP_LABELS = ["Status", "Logistieke status"];

const heading = ref("");
const fields = ref<Array<{ label: string; value: string }>>([]);
const addressLabel = ref("");
const address = ref<string[]>([]);

const chips = computed(() => fields.value.filter((field) => CHIP_LABELS.includes(field.label)));
const rows = computed(() => fields.value.filter((field) => !CHIP_LABELS.includes(field.label)));

// The fields that get copied out of here rather than read: the reservation
// number and the webshop's order reference are what get pasted into a search
// somewhere else -- a carrier's site, Shopware, an email to a customer -- and
// they are long enough that reading them off the screen and typing them in is
// where the digits get transposed.
const COPYABLE_LABELS = ["Verkooporder referentiecode"];

const isCopyable = (label: string) => COPYABLE_LABELS.includes(label);

// The heading reads "Reservering 395258"; what belongs on the clipboard is the
// number on its own.
const reservationNumber = computed(() => heading.value.match(/\d{3,}/)?.[0] ?? "");

// The Shopware note. Only orders that came from the webshop have one, which is
// what the order number's shape says.
//
// Read through a guard because `getCurrentOrderNumber()` digs the reference out
// of a fixed position in the portal's summary block and asserts its way there.
// This component is mounted on pages that each lay that block out their own
// way, and a reference we cannot find is a note we cannot show -- not a reason
// to take the sidebar, and with it the rest of the page's mount, down.
const orderNumber = readOrderNumber();
const hasShopwareOrder = Boolean(orderNumber) && matchShopwareOrderNumber(orderNumber);

const orderEntry = ref<Shopware.ShopwareOrderEntry>();
const noteEnabled = ref(false);

let token: Shopware.ShopwareToken | undefined;
let saveTimeoutId: number;

// Read before the portal's block is hidden, and without `innerText`: under the
// cloak the page is `visibility: hidden`, and a display-none block has no
// rendered text at all once we have hidden it. `textContent` walked by hand is
// what works in both states -- and it is the only way to get the line breaks
// out of the address, which the portal writes with `<br>`.
readPortalSummary();

onMounted(() => {
	document.querySelector(RESERVATION_SUMMARY_SELECTOR)?.classList.add("pse-portal-replaced");

	if (hasShopwareOrder) {
		loadNote();
	}
});

function readPortalSummary() {
	const block = document.querySelector(RESERVATION_SUMMARY_SELECTOR);

	if (!block) {
		return;
	}

	for (const row of Array.from(block.children)) {
		// The hidden inputs the portal keeps in here, `#ReservationId` among
		// them. They carry the page's identity, not any of its text.
		if (row.tagName == "INPUT") {
			continue;
		}

		const lines = readLines(row);

		if (lines.length == 0) {
			continue;
		}

		// The reservation number, which the portal sets apart with `.lead` and
		// which is the one line on the card read from across the counter.
		if (!heading.value && row.classList.contains("lead")) {
			heading.value = lines.join(" ");
			continue;
		}

		const text = lines.join(" ");
		const separator = text.indexOf(":");

		// No label at all: the address body, which the portal renders as a bare
		// indented block under its own heading.
		if (separator < 0) {
			address.value.push(...lines);
			continue;
		}

		const label = text.slice(0, separator).trim();
		const value = text.slice(separator + 1).trim();

		// A label with nothing after it is a heading for the block below it,
		// which is how the portal introduces the delivery address.
		if (!value) {
			addressLabel.value = label;
			continue;
		}

		fields.value.push({ label, value });
	}
}

// The element's text, split into lines on the `<br>` elements between them.
function readLines(element: Element): string[] {
	const lines: string[] = [];
	let current = "";

	for (const node of Array.from(element.childNodes)) {
		if (node.nodeName == "BR") {
			lines.push(current.trim());
			current = "";
			continue;
		}

		current += node.textContent ?? "";
	}

	lines.push(current.trim());

	return lines.filter(Boolean);
}

function readOrderNumber(): string {
	try {
		return getCurrentOrderNumber();
	} catch (error) {
		debug("No sale order reference in the reservation summary.", error);

		return "";
	}
}

function loadNote() {
	Shopware.shopwareInitialize()
		.then(async (shopwareToken) => {
			token = shopwareToken;

			const order = await Shopware.shopwareGetOrderData(shopwareToken, orderNumber);

			orderEntry.value = order.data[0];
			noteEnabled.value = true;
		})
		.catch((error) => {
			// The note is an aside on a page whose job is packing, so a Shopware
			// that is unreachable leaves the box disabled rather than taking the
			// sidebar down with it.
			console.error("Pack&Ship Extended failed to load the Shopware note.", error);
		});
}

function onSave() {
	if (!token || !orderEntry.value) {
		return;
	}

	saveOrderComment(token, orderEntry.value, orderNumber);

	// Held shut for a moment so a second click cannot fire a second update
	// against the same order.
	noteEnabled.value = false;

	clearTimeout(saveTimeoutId);
	saveTimeoutId = setTimeout(() => (noteEnabled.value = true), 250);
}

function onOpen() {
	if (!orderEntry.value) {
		return;
	}

	window.open(`${SHOPWARE_URL}/admin#/sw/order/detail/${orderEntry.value.id}/general`, "_blank")?.focus();
}
</script>

<template>
	<aside class="pse-sidebar">
		<!-- Above the reservation's own details rather than under them. The
		     details are reference -- looked up when something needs checking --
		     while a note is an instruction from the customer that has to be read
		     before the parcel is packed at all. Under the card it sat below the
		     fold on a short window, which is the one place a thing that must be
		     read cannot be. -->
		<ShopwareNote v-if="hasShopwareOrder" :order-data="orderEntry" :enabled="noteEnabled" show-open
			show-alert @save="onSave" @open="onOpen" />

		<div class="pse-sidebar-card">
			<header class="pse-sidebar-head">
				<div class="pse-sidebar-heading-row">
					<h2 class="pse-sidebar-heading">{{ heading }}</h2>

					<CopyButton v-if="reservationNumber" :value="reservationNumber"
						:label="`Reserveringsnummer ${reservationNumber}`" />
				</div>

				<div v-if="chips.length" class="pse-sidebar-chips">
					<span v-for="chip in chips" :key="chip.label" class="pse-sidebar-chip"
						:title="`${chip.label}: ${chip.value}`">
						{{ chip.value }}
					</span>
				</div>
			</header>

			<dl class="pse-sidebar-rows">
				<template v-for="row in rows" :key="row.label">
					<dt class="pse-sidebar-label">{{ row.label }}</dt>
					<dd class="pse-sidebar-value">
						<span class="pse-sidebar-value-text">{{ row.value }}</span>

						<CopyButton v-if="isCopyable(row.label)" :value="row.value" :label="row.label" />
					</dd>
				</template>
			</dl>

			<div v-if="address.length" class="pse-sidebar-address">
				<span class="pse-sidebar-label">{{ addressLabel }}</span>
				<p class="pse-sidebar-address-body">
					<span v-for="(line, index) in address" :key="index">{{ line }}</span>
				</p>
			</div>
		</div>

		<!-- Anything the page wants under the reservation's own details. -->
		<slot />
	</aside>
</template>

<style scoped>
.pse-sidebar {
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	gap: 14px;
	/* The portal wraps the page in `.container-fluid.text-center`, which reaches
	   in here and centres every label on the card. */
	text-align: left;
	color: var(--pse-ink);
}

.pse-sidebar :deep(*) {
	box-sizing: border-box;
}

.pse-sidebar-card {
	padding: 18px 18px 20px;
	border: 1px solid var(--pse-line);
	border-radius: 16px;
	background-color: #ffffff;
	box-shadow: 0 1px 2px rgba(20, 48, 33, 0.04), 0 18px 40px -30px rgba(20, 48, 33, 0.45);
}

.pse-sidebar-head {
	padding-bottom: 14px;
	margin-bottom: 14px;
	border-bottom: 1px solid var(--pse-line);
}

/* The reservation number. The largest thing in the column by some way: it is
   what the operator checks against the paperwork in their hand. */
/* The number and its copy button on one line, the button directly after the
   digits rather than out at the card's edge. It belongs to the number, and a
   button parked in the far corner reads as belonging to the row instead. */
.pse-sidebar-heading-row {
	display: flex;
	align-items: center;
	gap: 4px;
}

.pse-sidebar-heading {
	margin: 0;
	min-width: 0;
	font-size: 19px;
	font-weight: 700;
	line-height: 1.25;
	color: var(--pse-ink);
}

.pse-sidebar-chips {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	margin-top: 10px;
}

/* The two states, promoted out of the rows below and set as chips. They are the
   fields that are checked rather than read, and a chip is findable without
   reading the label in front of it. */
.pse-sidebar-chip {
	padding: 3px 10px;
	border: 1px solid var(--pse-brand-ring);
	border-radius: 999px;
	background-color: var(--pse-brand-soft);
	font-size: 11.5px;
	font-weight: 650;
	line-height: 1.5;
	color: var(--pse-brand-ink);
}

/* Label above value rather than beside it. The column is a quarter of the page
   wide and the values are addresses, customer names and carrier names -- given
   a label column to share with, every one of them wrapped to three lines. Set
   this way each value gets the full width and most of them fit on one, which is
   the difference between a column that is scanned and one that is read. */
.pse-sidebar-rows {
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	margin: 0;
}

.pse-sidebar-label {
	margin: 0;
	font-size: 10.5px;
	font-weight: 650;
	letter-spacing: 0.06em;
	text-transform: uppercase;
	line-height: 1.6;
	color: var(--pse-ink-faint);
}

.pse-sidebar-value {
	display: flex;
	align-items: baseline;
	gap: 6px;
	margin: 2px 0 11px;
	font-size: 13.5px;
	font-weight: 550;
	line-height: 1.35;
	color: var(--pse-ink);
	overflow-wrap: anywhere;
}

.pse-sidebar-value:last-child {
	margin-bottom: 0;
}

.pse-sidebar-value-text {
	min-width: 0;
	overflow-wrap: anywhere;
}

.pse-sidebar-address {
	margin-top: 16px;
	padding-top: 14px;
	border-top: 1px solid var(--pse-line);
}

/* Each line on its own row. The address is copied off the screen onto a label,
   so it is set the way it will be written rather than run together as a
   sentence. */
.pse-sidebar-address-body {
	display: flex;
	flex-direction: column;
	margin: 7px 0 0;
	font-size: 13.5px;
	font-weight: 550;
	line-height: 1.45;
	color: var(--pse-ink);
}
</style>
