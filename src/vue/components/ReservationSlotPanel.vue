<script setup lang="ts">
import { computed, ref, Transition, watch } from "vue";
import { ModalProductDetails } from "../../interfaces.ts";
import { SlotHandle } from "../slotHandle.ts";
import { canAssignLines, slotScope } from "../slotScope.ts";
import SlotPicker from "./SlotPicker.vue";

// Where a reservation is parked, on the card that is being chosen between.
//
// The bay used to be reachable only after opening a reservation, which is one
// screen too late for the two cases this dialog is full of: an order of several
// lines and an order of several of one product are exactly the orders that wait
// in the rack, and the packer standing at the counter with the items in their
// hands is deciding between them here. Asking "where is this one standing" is
// part of that decision -- an order that is already in B4 is the one to carry
// on with -- and so is parking what is in hand before opening anything.
//
// It is the same rack, the same note and the same writer as the sidebar's card:
// what differs is that this dialog holds a reservation per card rather than one
// page-wide, so each card is given its own handle. See `src/vue/slotHandle.ts`.
const props = defineProps<{
	handle: SlotHandle;
	// The reservation's lines, for the per-line bays. The barcode is the key the
	// bays are written under -- the same one the parcels page uses, and the one a
	// packer can scan back.
	products: ModalProductDetails[];
}>();

// Which line the picker is open for, or the whole order. One dialog, opened from
// whichever control was pressed.
const picking = ref<{ barcode?: string; subject: string }>();

const orderSlot = computed(() => props.handle.slots.order);

const showOrderSlot = computed(() => slotScope.value == "order" || props.handle.hasOrderSlot.value);
const showLineSlots = computed(() => slotScope.value == "line" || props.handle.hasLineSlots.value);

// Every bay this reservation is using, each once, in rack order. What is on the
// folded bar: the whole point of the panel is being able to read that without
// opening anything.
const usedSlots = computed(() => {
	const used = new Set<string>();

	if (orderSlot.value) {
		used.add(orderSlot.value);
	}

	for (const slot of Object.values(props.handle.slots.lines)) {
		if (slot) {
			used.add(slot);
		}
	}

	return [...used].sort();
});

// The read is over and there is still nothing: the ERP was signed out or did not
// answer. Said rather than shown as an empty rack, which would be a claim this
// card has no business making.
const unavailable = computed(() => !props.handle.loading.value && !props.handle.ready.value);

function lineChipDisabled(barcode: string): boolean {
	return !props.handle.ready.value
		|| props.handle.saving.value
		|| (!props.handle.lineSlot(barcode) && !canAssignLines.value);
}

function onPick(slot: string) {
	const subject = picking.value;

	picking.value = undefined;

	if (!subject) {
		return;
	}

	if (subject.barcode) {
		props.handle.setLineSlot(subject.barcode, slot);
	} else {
		props.handle.setOrderSlot(slot);
	}
}

// ---- Folded, but only when there is something to fold ----
//
// One bay for the whole reservation is one control, and a fold around a single
// chip is a second press to reach something that already fits on the bar -- with
// the bay then printed twice, once as the summary and once as the control. So
// that version is just the bar, with the chip on it.
//
// A reservation with bays per line does have a list, and that folds: this dialog
// is a column of cards being compared, and a block of rows on each of them
// spends the screen on something only one card is being read for.
const foldable = computed(() => showLineSlots.value);

const open = ref(false);

// The reservation decides which way it opens, not the packer: bays that exist
// are what the card is for. It is still a control, so an empty one can be opened
// to park something in.
//
// Settled when the note lands rather than at setup, because at setup it has not
// been read yet -- the dialog is still asking the ERP for it. This is the moment
// the answer arrives, and it is the one unfolding anybody sees.
watch(() => props.handle.loading.value, (loading) => {
	if (!loading) {
		open.value = usedSlots.value.length > 0;
	}
}, { immediate: true });
</script>

<template>
	<Teleport to="body">
		<Transition name="modal">
			<SlotPicker v-if="picking" :subject="picking.subject"
				:current="picking.barcode ? handle.lineSlot(picking.barcode) : orderSlot"
				:taken="handle.takenBy(picking.barcode)" @pick="onPick"
				@close="picking = undefined" />
		</Transition>
	</Teleport>

	<section class="pse-slotpanel">
		<div class="pse-slotpanel-card">
			<!-- The bar. A button only when there is a fold behind it: a bar that
			     carries the bay control itself must not also be a control, and a
			     button inside a button is not one either. -->
			<component :is="foldable ? 'button' : 'div'" class="pse-slotpanel-head"
				:class="{ 'is-plain': !foldable }" :type="foldable ? 'button' : undefined"
				:aria-expanded="foldable ? open : undefined"
				:title="foldable ? (open ? 'Vakken inklappen' : 'Vakken uitklappen') : undefined"
				@click="foldable && (open = !open)">
				<span class="material-icons pse-slotpanel-icon" aria-hidden="true">inventory_2</span>
				<h4 class="pse-slotpanel-title">{{ foldable ? "Vakken" : "Vak" }}</h4>

				<span v-if="handle.loading.value" class="pse-slotpanel-spinner" role="status"
					aria-label="Vak wordt opgehaald"></span>

				<!-- One bay for the whole reservation: the control lives on the bar,
				     because there is nothing else for the card to hold. -->
				<button v-else-if="!foldable" type="button" class="pse-slot-chip"
					:class="{ 'is-empty': !orderSlot }"
					:disabled="!handle.ready.value || handle.saving.value"
					:title="orderSlot
						? `Deze order staat in vak ${orderSlot}`
						: 'Kies een vak voor deze order'"
					@click="picking = { subject: `Reservering ${handle.reservationNumber.value}` }">
					<span v-if="orderSlot" class="pse-slot-chip-label">{{ orderSlot }}</span>
					<span v-else-if="unavailable" class="pse-slot-chip-empty">Niet beschikbaar</span>
					<span v-else class="pse-slot-chip-empty">
						<span class="material-icons pse-slot-chip-empty-icon" aria-hidden="true">add</span>
						Vak kiezen
					</span>
				</button>

				<!-- Folded shut, the bar says what is behind it. Open, it does not:
				     the bays are on show underneath, and saying them twice is one
				     answer too many. -->
				<span v-else-if="!open && usedSlots.length" class="pse-slotpanel-summary">
					<span v-for="used in usedSlots" :key="used" class="pse-slot-chip is-static">
						<span class="pse-slot-chip-label">{{ used }}</span>
					</span>
				</span>
				<span v-else-if="!open && unavailable" class="pse-slotpanel-empty">Niet beschikbaar</span>
				<span v-else-if="!open" class="pse-slotpanel-empty">Geen vak</span>

				<span v-if="foldable" class="material-icons pse-slotpanel-chevron"
					:class="{ 'is-open': open }" aria-hidden="true">expand_more</span>
			</component>

			<!-- The fold, as the note card does it: a grid row from 0fr to 1fr, so
			     the card opens to exactly what is in it without anything having to
			     measure it first. -->
			<div v-if="foldable" class="pse-slotpanel-collapse" :class="{ 'is-open': open }">
			<div class="pse-slotpanel-collapse-inner">
			<div class="pse-slotpanel-body">
				<!-- The whole reservation's own bay, when it has one as well. -->
				<div v-if="showOrderSlot" class="pse-slotpanel-block">
					<span class="pse-slotpanel-caption">Hele order</span>

					<button type="button" class="pse-slot-chip" :class="{ 'is-empty': !orderSlot }"
						:disabled="!handle.ready.value || handle.saving.value"
						:title="orderSlot
							? `Deze order staat in vak ${orderSlot}`
							: 'Kies een vak voor deze order'"
						@click="picking = { subject: `Reservering ${handle.reservationNumber.value}` }">
						<span v-if="orderSlot" class="pse-slot-chip-label">{{ orderSlot }}</span>
						<span v-else class="pse-slot-chip-empty">
							<span class="material-icons pse-slot-chip-empty-icon" aria-hidden="true">add</span>
							Vak kiezen
						</span>
					</button>
				</div>

				<!-- A bay per line, for the order whose items come in far enough apart
				     to be shelved separately. The same control the parcels page puts in
				     its product table, so a line parked from here reads back there
				     unchanged. -->
				<div class="pse-slotpanel-block">
					<span v-if="showOrderSlot" class="pse-slotpanel-caption">Losse regels</span>

					<ul class="pse-slotpanel-lines">
						<li v-for="product in products" :key="product.barcode" class="pse-slotpanel-line">
							<span class="pse-slotpanel-line-name" :title="product.description">
								{{ product.description }}
							</span>

							<button type="button" class="pse-slot-chip"
								:class="{ 'is-empty': !handle.lineSlot(product.barcode) }"
								:disabled="lineChipDisabled(product.barcode)"
								:title="handle.lineSlot(product.barcode)
									? `Staat in vak ${handle.lineSlot(product.barcode)}`
									: canAssignLines
										? 'Kies een vak voor dit product'
										: `Deze werkplek zet één vak per order. Zet de instelling op 'een vak per productregel' om losse regels weg te zetten.`"
								@click="picking = { barcode: product.barcode, subject: product.description }">
								<span v-if="handle.lineSlot(product.barcode)" class="pse-slot-chip-label">
									{{ handle.lineSlot(product.barcode) }}
								</span>
								<span v-else class="pse-slot-chip-empty">
									<span class="material-icons pse-slot-chip-empty-icon" aria-hidden="true">add</span>
									Vak
								</span>
							</button>
						</li>
					</ul>
				</div>

				<p v-if="unavailable" class="pse-slotpanel-hint">
					Geen verbinding met RetailVista, dus het vak van deze order is niet bekend.
				</p>
			</div>
			</div>
			</div>
		</div>
	</section>
</template>

<style scoped>
.pse-slotpanel {
	text-align: left;
}

/* The same surface as the note card beside it, so the two read as one pair of
   fields on the reservation rather than as a card and a strip. */
.pse-slotpanel-card {
	overflow: hidden;
	border: 1px solid var(--pse-line);
	border-radius: 14px;
	background-color: #ffffff;
	box-shadow: 0 1px 2px rgba(20, 48, 33, 0.04);
}

.pse-slotpanel-head {
	display: flex;
	align-items: center;
	gap: 9px;
	width: 100%;
	min-height: 42px;
	padding: 7px 14px;
	border: 0;
	border-bottom: 1px solid var(--pse-line);
	background-color: var(--pse-well);
	font: inherit;
	text-align: left;
	cursor: pointer;
	transition: background-color 0.15s ease, border-color 0.15s ease;
}

/* Shut, there is nothing under the rule for it to separate -- and the bar that
   carries its own bay control has nothing under it at all. */
.pse-slotpanel-head[aria-expanded="false"],
.pse-slotpanel-head.is-plain {
	border-bottom-color: transparent;
}

/* The bar-only version is not a control, so it does not answer the pointer like
   one. What is on it does. */
.pse-slotpanel-head.is-plain {
	cursor: default;
}

.pse-slotpanel-head:not(.is-plain):hover {
	background-color: var(--pse-brand-soft);
}

.pse-slotpanel-head:focus {
	outline: none;
}

.pse-slotpanel-head:focus-visible {
	outline: none;
	box-shadow: inset 0 0 0 2px var(--pse-brand-ring);
}

.pse-slotpanel-icon {
	flex: none;
	font-size: 18px;
	color: var(--pse-ink-faint);
}

/* Set like the note's caption and the product table's column headings: what is
   under it is what is being read, and this only says what it is. */
.pse-slotpanel-title {
	flex: 1;
	min-width: 0;
	margin: 0;
	font-size: 10.5px;
	font-weight: 650;
	letter-spacing: 0.06em;
	text-transform: uppercase;
	line-height: 1.6;
	color: var(--pse-ink-faint);
}

.pse-slotpanel-summary {
	display: flex;
	gap: 5px;
	flex: none;
	flex-wrap: wrap;
	justify-content: flex-end;
}

.pse-slotpanel-empty {
	flex: none;
	font-size: 11.5px;
	font-weight: 550;
	color: var(--pse-ink-faint);
}

/* The same ring the note card turns while Shopware is answering, because on a
   card where both are loading they had better look like the same thing
   happening twice. */
.pse-slotpanel-spinner {
	flex: none;
	width: 13px;
	height: 13px;
	border: 2px solid var(--pse-line);
	border-top-color: var(--pse-brand);
	border-radius: 50%;
	animation: pse-slotpanel-spin 0.7s linear infinite;
}

@keyframes pse-slotpanel-spin {
	to {
		transform: rotate(360deg);
	}
}

.pse-slotpanel-chevron {
	flex: none;
	font-size: 19px;
	color: var(--pse-ink-faint);
	transition: transform 0.28s ease;
}

.pse-slotpanel-chevron.is-open {
	transform: rotate(180deg);
}

.pse-slotpanel-collapse {
	display: grid;
	grid-template-rows: 0fr;
	transition: grid-template-rows 0.28s cubic-bezier(0.33, 1, 0.68, 1);
}

.pse-slotpanel-collapse.is-open {
	grid-template-rows: 1fr;
}

.pse-slotpanel-collapse-inner {
	min-height: 0;
	overflow: hidden;
	opacity: 0;
	transition: opacity 0.2s ease;
}

.pse-slotpanel-collapse.is-open .pse-slotpanel-collapse-inner {
	opacity: 1;
	transition-delay: 0.06s;
}

.pse-slotpanel-body {
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 12px 14px 14px;
}

.pse-slotpanel-block {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 6px;
}

.pse-slotpanel-caption {
	font-size: 10.5px;
	font-weight: 650;
	letter-spacing: 0.06em;
	text-transform: uppercase;
	color: var(--pse-ink-faint);
}

/* One row per line: what it is on the left, where it stands on the right. The
   name is allowed to run out rather than wrap, because the column that matters
   is the one holding the bay. */
.pse-slotpanel-lines {
	display: flex;
	flex-direction: column;
	gap: 6px;
	width: 100%;
	margin: 0;
	padding: 0;
	list-style: none;
}

.pse-slotpanel-line {
	display: flex;
	align-items: center;
	gap: 12px;
}

.pse-slotpanel-line-name {
	flex: 1;
	min-width: 0;
	overflow: hidden;
	font-size: 13px;
	white-space: nowrap;
	text-overflow: ellipsis;
	color: var(--pse-ink);
}

.pse-slotpanel-hint {
	margin: 0;
	font-size: 12px;
	line-height: 1.45;
	color: var(--pse-ink-soft);
}

@media (prefers-reduced-motion: reduce) {
	.pse-slotpanel-collapse,
	.pse-slotpanel-collapse-inner,
	.pse-slotpanel-chevron {
		transition: none;
	}

	.pse-slotpanel-spinner {
		animation: none;
	}
}
</style>
