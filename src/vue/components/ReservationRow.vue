<script setup lang="ts">
import { computed } from "vue";
import { MassCompleteStatus, ModalReservationDetails } from "../../interfaces.ts";

// One singleline reservation, as a row rather than as a card.
//
// These are the reservations that hold exactly one of the scanned product, and
// there is nothing to inspect on them: no product table to read, nothing to
// check against the box. What they are for is being counted and picked from --
// and, when there are enough of them, being handed to a mass complete run. So
// they are a list of rows, dense enough that ten of them can be taken in at
// once, while `ReservationCard.vue` keeps the fuller shape for the groups that
// do have something to look at.
//
// The same row is also the run's progress readout: during a mass complete each
// one carries its own state, which is why the status is a prop rather than
// something this works out for itself. `undefined` is not a fourth state, it is
// no run.
const props = defineProps<{
	reservation: ModalReservationDetails;
	status?: MassCompleteStatus;
	// Off for every row while a run is going: the tabs are doing the opening,
	// and a second way in from here would land the operator in a reservation
	// that is already being finished behind their back.
	showOpen?: boolean;
}>();

defineEmits<{ open: [url: string] }>();

// What each state is called, in the order they happen. Written out rather than
// worked out at the point of use so that the word, the colour and the mark for
// a state are decided in one place.
const STATES = {
	[MassCompleteStatus.idle]: { label: "In wachtrij", modifier: "is-queued" },
	[MassCompleteStatus.started]: { label: "Bezig", modifier: "is-busy" },
	[MassCompleteStatus.finished]: { label: "Afgerond", modifier: "is-done" },
	[MassCompleteStatus.failed]: { label: "Mislukt", modifier: "is-failed" },
};

// Anything that is not one of the four is treated as a failure, which is what
// the old progress bar did: a run whose tab never reported back is not idle,
// and showing it as still queued would leave a row that never resolves.
const state = computed(() => props.status == undefined
	? undefined
	: STATES[props.status] ?? STATES[MassCompleteStatus.failed]);
</script>

<template>
	<div class="pse-row" :class="state?.modifier">
		<!-- The number first and in the tabular face: it is what is read off,
		     compared against a screen elsewhere, and typed back in. -->
		<span class="pse-row-number">{{ reservation.reservationNumber }}</span>

		<span class="pse-row-customer">{{ reservation.customer }}</span>

		<span class="pse-row-reference">{{ reservation.saleOrderReference }}</span>

		<!-- The status takes the place the Open button had rather than appearing
		     beside it, so a row is the same width whether it is being picked from
		     or being watched. Swapped rather than faded: at the start of a run
		     twenty of these change at once, and twenty simultaneous fades read as
		     the list flickering. -->
		<span v-if="state" class="pse-row-state" :class="state.modifier">
			<span class="pse-row-mark" aria-hidden="true"></span>
			{{ state.label }}
		</span>

		<button v-else-if="showOpen" type="button" class="pse-row-open"
			@click="$emit('open', reservation.url)">
			Open
			<span class="material-icons pse-row-open-icon" aria-hidden="true">chevron_right</span>
		</button>

		<span v-else></span>
	</div>
</template>

<style scoped>
/* A row, not a card: one line, one hairline under it, and the whole thing
   clickable-looking only where it can be clicked. The list around it draws the
   border and the radius -- see `.pse-rows` in the selection modal -- so that
   ten of these read as one block instead of ten stacked boxes. */
.pse-row {
	display: grid;
	/* Number and status are sized for their content and never move; the two
	   pieces of text in between share what is left, so a long customer name is
	   what gives way rather than the column the eye is scanning down. */
	grid-template-columns: auto minmax(0, 1.4fr) minmax(0, 1fr) auto;
	align-items: center;
	gap: 16px;
	padding: 11px 16px;
	border-top: 1px solid var(--pse-line);
	font-size: 14px;
	transition: background-color 0.15s ease;
}

.pse-row:first-child {
	border-top: 0;
}

.pse-row:hover {
	background-color: var(--pse-well);
}

.pse-row-number {
	font-variant-numeric: tabular-nums;
	font-weight: 650;
	color: var(--pse-ink);
}

.pse-row-customer,
.pse-row-reference {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.pse-row-customer {
	color: var(--pse-ink);
}

.pse-row-reference {
	font-variant-numeric: tabular-nums;
	font-size: 13px;
	color: var(--pse-ink-soft);
}

/* ---- Open ---- *
 * Quiet, because on this list every row carries one and a column of filled
 * buttons reads as a column of things that need doing. It is the only control
 * on the row, so it does not have to shout to be found.
 */
.pse-row-open {
	display: inline-flex;
	align-items: center;
	gap: 2px;
	height: 32px;
	padding: 0 8px 0 12px;
	border: 1px solid var(--pse-line);
	border-radius: 9px;
	background-color: #ffffff;
	font: inherit;
	font-size: 13px;
	font-weight: 650;
	color: var(--pse-ink-soft);
	cursor: pointer;
	transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease;
}

.pse-row:hover .pse-row-open {
	border-color: var(--pse-brand);
	background-color: var(--pse-brand-soft);
	color: var(--pse-brand-ink);
}

.pse-row-open:focus {
	outline: none;
}

.pse-row-open:focus-visible {
	outline: none;
	box-shadow: 0 0 0 3px var(--pse-brand-ring);
}

.pse-row-open-icon {
	font-size: 18px;
}

/* ---- The run states ---- *
 * A word and a mark, in the same badge shape the parcels page uses for its
 * counts, so "this one is still going" reads the same way here as "this one is
 * still short" does there. Four states and four colours, all of them mixed from
 * the palette's own greens except the two that have to mean something else --
 * amber for working, red for wrong, both taken from the pair already in use on
 * the parcels page.
 */
.pse-row-state {
	display: inline-flex;
	align-items: center;
	gap: 7px;
	padding: 4px 11px;
	border-radius: 999px;
	font-size: 12.5px;
	font-weight: 650;
	white-space: nowrap;
}

.pse-row-mark {
	width: 7px;
	height: 7px;
	flex: none;
	border-radius: 50%;
	background-color: currentColor;
}

.pse-row-state.is-queued {
	background-color: var(--pse-well);
	color: var(--pse-ink-faint);
}

.pse-row-state.is-busy {
	background-color: rgba(226, 160, 46, 0.16);
	color: #8a5a10;
}

/* The one row that is actually being worked on is the one worth finding in a
   list of twenty, so its mark pulses -- the badge itself stays put, because the
   list is being read down while this happens. */
.pse-row-state.is-busy .pse-row-mark {
	animation: pse-row-pulse 1.6s ease-in-out infinite;
}

@keyframes pse-row-pulse {
	50% {
		opacity: 0.3;
	}
}

.pse-row-state.is-done {
	background-color: var(--pse-brand-soft);
	color: var(--pse-brand-ink);
}

.pse-row-state.is-failed {
	background-color: rgba(176, 58, 46, 0.12);
	color: #a3372c;
}

/* A failure is the one thing on this list that has to be picked out without
   reading it, since the run carries on around it and the summary at the top
   only says how many there were. */
.pse-row.is-failed {
	background-color: rgba(176, 58, 46, 0.05);
}

@media (prefers-reduced-motion: reduce) {
	.pse-row-state.is-busy .pse-row-mark {
		animation: none;
	}
}

/* Below this the reference is the first thing worth dropping: it is the same
   order under another name, and the number beside it is what this list is
   scanned by. */
@media (max-width: 720px) {
	.pse-row {
		grid-template-columns: auto minmax(0, 1fr) auto;
		gap: 12px;
	}

	.pse-row-reference {
		display: none;
	}
}
</style>
