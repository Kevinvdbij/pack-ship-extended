<script setup lang="ts">
import { computed, ref, Transition } from "vue";
import { slotStore } from "../slotStore.ts";
import SlotPicker from "./SlotPicker.vue";

// Where this order is parked, in the column beside the work.
//
// The sidebar is on every page that has a reservation open, which is why the bay
// lives here: a packer coming back to a half-finished order sees where the rest
// of it is standing before they look at anything else.
//
// Two kinds of bay can be on one order -- one for the whole of it, and one per
// product line -- and this card shows whichever of them the order actually has,
// not whichever the setting prefers. The setting only decides what is offered on
// an order that has neither yet: an order parked per line elsewhere shows its
// line bays here even on a workplace set to per order, and the other way round.
// The rack does not care what a setting says, and neither does the packer
// looking for the items.
const showPicker = ref(false);

const slot = computed(() => slotStore.slots.order);

// The bays the lines are using, each once, in rack order. What is in them is the
// product table's business; this is the list of places to walk to.
const lineSlots = computed(() => {
	const used = new Set(Object.values(slotStore.slots.lines).filter(Boolean));

	return [...used].sort();
});

// The order's own bay: offered while this workplace picks bays that way, and
// shown regardless once the order has one, so a bay someone else set can be read
// and corrected rather than only being in the way.
const showOrderSlot = computed(() => slotStore.scope.value == "order" || slotStore.hasOrderSlot.value);

// The line bays: listed while this workplace picks bays that way, and whenever
// the order carries any. Read-only either way -- they belong to the rows of the
// product table, and a second control for the same bay is a second place to set
// it wrong from.
const showLineSlots = computed(() => slotStore.scope.value == "line" || slotStore.hasLineSlots.value);

// Both at once is not a mistake to hide: an order can have been parked whole and
// then had one line moved, and saying so is the point of the card.
const showBoth = computed(() => showOrderSlot.value && showLineSlots.value);

// Whether the line bays can be changed from the product table at all. On a
// workplace set to one bay per order they are shown and the existing ones can be
// corrected, but no new one can be added -- so the hint must not send a packer
// to a control that will not answer them.
const canAssignLines = computed(() => slotStore.scope.value == "line");

function onPick(picked: string) {
	showPicker.value = false;
	slotStore.setOrderSlot(picked);
}
</script>

<template>
	<Teleport to="body">
		<Transition name="modal">
			<SlotPicker v-if="showPicker" :subject="`Reservering ${slotStore.orderNumber.value}`"
				:current="slot" @pick="onPick" @close="showPicker = false" />
		</Transition>
	</Teleport>

	<section class="pse-slotcard">
		<header class="pse-slotcard-head">
			<span class="material-icons pse-slotcard-icon" aria-hidden="true">inventory_2</span>
			<h3 class="pse-slotcard-title">{{ showLineSlots ? "Vakken" : "Vak" }}</h3>
		</header>

		<div class="pse-slotcard-body">
			<!-- One bay for the whole order: the card is the control. The bay is set
			     as large as the reservation number above it -- it is walked to from
			     across the room, and that is the one thing on this card that is read
			     from a distance. -->
			<template v-if="showOrderSlot">
				<span v-if="showBoth" class="pse-slotcard-caption">Hele order</span>

				<button type="button" class="pse-slot-chip is-large" :class="{ 'is-empty': !slot }"
					:disabled="!slotStore.ready.value || slotStore.saving.value"
					:title="slot ? `Deze order staat in vak ${slot}` : 'Kies een vak voor deze order'"
					@click="showPicker = true">
					<span v-if="slot" class="pse-slot-chip-label">{{ slot }}</span>
					<span v-else class="pse-slot-chip-empty">
						<span class="material-icons pse-slot-chip-empty-icon" aria-hidden="true">add</span>
						Vak kiezen
					</span>
				</button>

				<p v-if="!showBoth" class="pse-slotcard-hint">
					{{ slot
						? "Alles van deze order staat hier tot de rest binnen is."
						: "Kies een vak zodra je deze order wegzet." }}
				</p>
			</template>

			<!-- The bays the lines are in. Read-only here, because the bay belongs to
			     a row of the product table. Shown on any order that has them, so a
			     screen set to één vak per order still says where the items are. -->
			<template v-if="showLineSlots">
				<span v-if="showBoth" class="pse-slotcard-caption is-spaced">Losse regels</span>

				<div v-if="lineSlots.length" class="pse-slotcard-list">
					<span v-for="used in lineSlots" :key="used" class="pse-slot-chip is-static">
						<span class="pse-slot-chip-label">{{ used }}</span>
					</span>
				</div>

				<p class="pse-slotcard-hint">
					{{ canAssignLines
						? (lineSlots.length
							? "Vakken waar losse producten van deze order staan. Kies ze per regel in de productlijst."
							: "Kies per regel in de productlijst een vak zodra je iets wegzet.")
						: "Losse regels van deze order zijn elders per regel weggezet. Deze werkplek zet één vak per order." }}
				</p>
			</template>
		</div>
	</section>
</template>

<style scoped>
/* The same surface as the note above it and the details below it, so the column
   reads as one stack rather than as three widgets. */
.pse-slotcard {
	overflow: hidden;
	border: 1px solid var(--pse-line);
	border-radius: 14px;
	background-color: #ffffff;
	box-shadow: 0 1px 2px rgba(20, 48, 33, 0.04);
	text-align: left;
}

.pse-slotcard-head {
	display: flex;
	align-items: center;
	gap: 9px;
	padding: 10px 14px;
	border-bottom: 1px solid var(--pse-line);
	background-color: var(--pse-well);
}

.pse-slotcard-icon {
	flex: none;
	font-size: 18px;
	color: var(--pse-ink-faint);
}

/* Set like the note's caption, for the same reason: what is under it is what is
   being read. */
.pse-slotcard-title {
	margin: 0;
	font-size: 10.5px;
	font-weight: 650;
	letter-spacing: 0.06em;
	text-transform: uppercase;
	line-height: 1.6;
	color: var(--pse-ink-faint);
}

.pse-slotcard-body {
	padding: 12px 14px 14px;
}

/* Which of the two a block is, when the card is showing both. Set like the
   labels in the reservation card under it, so the card reads as one column of
   fields rather than as two controls stacked. */
.pse-slotcard-caption {
	display: block;
	margin-bottom: 6px;
	font-size: 10.5px;
	font-weight: 650;
	letter-spacing: 0.06em;
	text-transform: uppercase;
	line-height: 1.6;
	color: var(--pse-ink-faint);
}

.pse-slotcard-caption.is-spaced {
	margin-top: 14px;
	padding-top: 12px;
	border-top: 1px solid var(--pse-line);
}

.pse-slotcard-list {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.pse-slotcard-hint {
	margin: 9px 0 0;
	font-size: 12px;
	line-height: 1.4;
	color: var(--pse-ink-faint);
}
</style>
