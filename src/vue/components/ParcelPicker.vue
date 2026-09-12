<script setup lang="ts">
import { ref } from "vue";
import { ReservationParcel } from "../../interfaces.ts";
import { reprintParcel } from "../reprint.ts";
import ModalShell from "./ModalShell.vue";

// Which of a reservation's labels to print again.
//
// Only reached when there is an actual choice. A reservation with one label
// prints it where it was pressed -- asking "which one?" about a list of one is
// a click spent on nothing.
//
// This replaced sending the operator to the add-parcels screen to choose there.
// That worked, and the screen it went to is the better place to *look* at
// parcels, but it cost the search page to answer a question that fits in a
// dialog -- including whatever was half-typed into the search box, which on this
// screen is the thing most likely to be in progress.
const props = defineProps<{
	// What the dialog is about, in the operator's terms: the number on the log.
	reservationNumber: string;
	// What the ERP loads the label dialog by.
	reservationId: string;
	parcels: ReservationParcel[];
}>();

const emit = defineEmits<{ close: [] }>();

// The parcel being printed. One at a time: the others are disabled while it
// runs, because two labels from one dialog is never what was meant.
const printing = ref("");

async function pick(parcel: ReservationParcel) {
	if (printing.value) {
		return;
	}

	printing.value = parcel.id;

	const printed = await reprintParcel(props.reservationId, parcel);

	printing.value = "";

	// Closed on success, kept on failure. The toast says what went wrong, and
	// the dialog staying up is what makes trying again -- or trying the other
	// label -- one click rather than four.
	if (printed) {
		emit("close");
	}
}
</script>

<template>
	<ModalShell :title="`Etiket van reservering ${reservationNumber}`" size="sm" elevated
		@close="emit('close')">
		<p class="pse-picker-intro">
			Deze reservering heeft {{ parcels.length }} etiketten. Kies welk etiket opnieuw
			geprint moet worden.
		</p>

		<ul class="pse-picker-list">
			<li v-for="parcel in parcels" :key="parcel.id">
				<button type="button" class="pse-picker-row" :disabled="Boolean(printing)"
					:title="`Print het etiket van pakket ${parcel.barcode} opnieuw`" @click="pick(parcel)">
					<span class="pse-picker-what">
						<!-- The barcode is what gets compared against the label on the
						     bench, so it is the line that is set largest. -->
						<span class="pse-picker-barcode">{{ parcel.barcode }}</span>
						<span class="pse-picker-carrier">
							{{ [parcel.number, parcel.carrier || parcel.service].filter(Boolean).join(" - ") }}
						</span>
					</span>

					<span v-if="printing == parcel.id" class="pse-picker-spinner" aria-hidden="true"></span>
					<span v-else class="material-icons pse-picker-icon" aria-hidden="true">print</span>
				</button>
			</li>
		</ul>
	</ModalShell>
</template>

<style scoped>
.pse-picker-intro {
	margin: 0 0 16px;
	font-size: 13.5px;
	line-height: 1.45;
	color: var(--pse-ink-soft);
}

.pse-picker-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
	margin: 0;
	padding: 0;
	list-style: none;
}

.pse-picker-row {
	display: flex;
	align-items: center;
	gap: 12px;
	width: 100%;
	padding: 11px 13px;
	border: 1px solid var(--pse-line);
	border-radius: 12px;
	background-color: #ffffff;
	font: inherit;
	text-align: left;
	color: var(--pse-ink);
	cursor: pointer;
	transition: border-color 0.15s ease, background-color 0.15s ease;
}

.pse-picker-row:hover:not(:disabled) {
	border-color: var(--pse-brand);
	background-color: var(--pse-well);
}

.pse-picker-row:disabled {
	opacity: 0.55;
	cursor: default;
}

.pse-picker-row:focus {
	outline: none;
}

.pse-picker-row:focus-visible {
	outline: none;
	box-shadow: 0 0 0 3px var(--pse-brand-ring);
}

.pse-picker-what {
	display: flex;
	min-width: 0;
	flex: 1 1 auto;
	flex-direction: column;
	gap: 2px;
}

.pse-picker-barcode {
	overflow: hidden;
	font-size: 14px;
	font-variant-numeric: tabular-nums;
	font-weight: 650;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.pse-picker-carrier {
	font-size: 12px;
	color: var(--pse-ink-faint);
}

.pse-picker-icon {
	flex: none;
	font-size: 18px;
	color: var(--pse-brand-ink);
}

.pse-picker-spinner {
	width: 14px;
	height: 14px;
	flex: none;
	border: 2px solid var(--pse-line);
	border-top-color: var(--pse-brand);
	border-radius: 50%;
	animation: pse-picker-spin 0.7s linear infinite;
}

@keyframes pse-picker-spin {
	to {
		transform: rotate(360deg);
	}
}
</style>
