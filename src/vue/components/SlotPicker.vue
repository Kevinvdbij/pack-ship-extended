<script setup lang="ts">
import { RACK } from "../../slots.ts";
import ModalShell from "./ModalShell.vue";

// The rack, drawn the way it stands beside the counter: four columns left to
// right, A and C three tall bays side by side, B and D two rows of three above
// each other. Picking a bay is pointing at the rack, not reading a dropdown --
// which is the whole reason this is a map and not a select.
//
// Laid out as a grid rather than as a list of buttons, because the mistake it has
// to prevent is putting the items in the bay next to the one the screen said.
const props = defineProps<{
	// What is being parked: the order's number, or a product's description. Shown
	// in the title, so a picker opened from the wrong row is obvious before
	// anything is written.
	subject: string;
	// The bay this thing is in now, if any. Pressing it again clears it.
	current: string;
	// Bays the rest of this order is already using, and what is in them. Not
	// disabled -- two products of one order can share a bay, and the rack is
	// wider than it is tall in practice -- but marked, so a bay that is in use is
	// a decision rather than a surprise.
	taken?: Map<string, string[]>;
}>();

const emit = defineEmits<{ close: []; pick: [slot: string] }>();

function label(letter: string, bay: number) {
	return `${letter}${bay}`;
}

function occupants(slot: string): string[] {
	return props.taken?.get(slot) ?? [];
}
</script>

<template>
	<ModalShell :title="`Vak kiezen — ${subject}`" size="lg" @close="emit('close')">
		<p class="pse-rack-lead">
			Kies het vak waar dit blijft staan. Nog een keer op het huidige vak drukken maakt het weer leeg.
		</p>

		<div class="pse-rack">
			<div v-for="column in RACK" :key="column.letter" class="pse-rack-column">
				<span class="pse-rack-letter">{{ column.letter }}</span>

				<div class="pse-rack-bays" :class="`is-rows-${column.rows.length}`">
					<button v-for="bay in column.rows.flat()" :key="bay" type="button" class="pse-rack-bay"
						:class="{
							'is-current': current == label(column.letter, bay),
							'is-taken': occupants(label(column.letter, bay)).length > 0,
						}"
						:title="occupants(label(column.letter, bay)).length
							? `Vak ${label(column.letter, bay)} — al in gebruik voor deze order`
							: `Vak ${label(column.letter, bay)}`"
						@click="emit('pick', label(column.letter, bay))">
						<span class="pse-rack-bay-label">{{ label(column.letter, bay) }}</span>

						<!-- What else of this order is standing there. A count rather
						     than the barcodes: the bay is being chosen, and "2 stuks"
						     is what decides it. -->
						<span v-if="occupants(label(column.letter, bay)).length" class="pse-rack-bay-note">
							{{ occupants(label(column.letter, bay)).length }} regel{{
								occupants(label(column.letter, bay)).length > 1 ? "s" : "" }}
						</span>

						<span v-else-if="current == label(column.letter, bay)" class="pse-rack-bay-note">
							Huidig
						</span>
					</button>
				</div>
			</div>
		</div>

		<template #footer>
			<button v-if="current" type="button" class="pse-dialog-btn pse-dialog-btn-quiet"
				@click="emit('pick', current)">
				Vak leegmaken
			</button>
			<button type="button" class="pse-dialog-btn pse-dialog-btn-quiet" @click="emit('close')">
				Annuleren
			</button>
		</template>
	</ModalShell>
</template>

<style scoped>
.pse-rack-lead {
	margin: 0 0 16px;
	font-size: 13px;
	line-height: 1.45;
	color: var(--pse-ink-soft);
}

/* The four columns, in the order they stand. Equal widths: they are equally wide
   in the building, and a column drawn narrower than its neighbour because it
   holds fewer bays would be the wrong map. */
.pse-rack {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 12px;
}

.pse-rack-column {
	display: flex;
	flex-direction: column;
	gap: 7px;
	min-width: 0;
}

/* The letter above its column rather than on every bay's face. The bays carry
   their full name anyway; this is what makes the four blocks readable as four
   columns at a glance. */
.pse-rack-letter {
	font-size: 11px;
	font-weight: 700;
	letter-spacing: 0.10em;
	text-align: center;
	color: var(--pse-ink-faint);
}

/* Both kinds of column are the same overall box, so the rack is one rectangle:
   a three-across grid two rows tall. A column with one row of bays gets them
   spanning both rows, which is what makes A and C read as full height beside B
   and D. */
.pse-rack-bays {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	grid-template-rows: repeat(2, 1fr);
	gap: 6px;
	padding: 7px;
	border: 1px solid var(--pse-line);
	border-radius: 14px;
	background-color: var(--pse-well);
	/* The rack is a wall, not a list. Tall enough that the tall bays read as tall
	   and the half ones as half. */
	height: 232px;
}

.pse-rack-bays.is-rows-1 .pse-rack-bay {
	grid-row: span 2;
}

.pse-rack-bay {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 3px;
	min-width: 0;
	padding: 4px;
	border: 1px solid var(--pse-line);
	border-radius: 10px;
	background-color: #ffffff;
	font: inherit;
	color: var(--pse-ink-soft);
	cursor: pointer;
	transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease,
		box-shadow 0.15s ease;
}

.pse-rack-bay:hover {
	border-color: var(--pse-brand);
	background-color: var(--pse-brand-soft);
	color: var(--pse-brand-ink);
}

.pse-rack-bay:focus {
	outline: none;
}

.pse-rack-bay:focus-visible {
	outline: none;
	box-shadow: 0 0 0 3px var(--pse-brand-ring);
}

.pse-rack-bay-label {
	font-size: 15px;
	font-weight: 700;
	font-variant-numeric: tabular-nums;
	line-height: 1.1;
}

.pse-rack-bay-note {
	font-size: 10px;
	font-weight: 600;
	line-height: 1.2;
	text-align: center;
	opacity: 0.8;
}

/* Another line of this order is already there. Marked in the attention amber
   rather than disabled: sharing a bay is allowed and sometimes right, and the
   packer only has to know before they choose. */
.pse-rack-bay.is-taken {
	border-color: var(--pse-attention-line-soft);
	background-color: var(--pse-attention-soft);
	color: var(--pse-attention-ink);
}

/* Where this thing is now: filled, so it is found without reading the faces. */
.pse-rack-bay.is-current {
	border-color: var(--pse-brand-ink);
	background-color: var(--pse-brand-ink);
	color: #ffffff;
}

.pse-rack-bay.is-current:hover {
	background-color: var(--pse-brand-ink-strong);
	color: #ffffff;
}

/* Under the dialog's own breakpoint the four columns cannot hold three bays
   across each. Two columns of two, which keeps each block's own shape. */
@media (max-width: 720px) {
	.pse-rack {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}
</style>
