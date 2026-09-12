<script setup lang="ts">
import { ref } from "vue";
import { toast } from "vue3-toastify";
import { printRaaplijst } from "../../raaplijst.ts";
import { ErpSignedOutError } from "../../erpFrame.ts";
import { erpStore } from "../erpStore.ts";
import { playSound } from "../../sounds.ts";

// The one control on the sidebar that fetches a piece of paper.
//
// It stands with the reservation's details rather than with the parcels,
// because that is what it is about: the raaplijst is the list of what has to
// come off the rack for this reservation, wanted before the first box is
// touched. Everything on this card is the reservation; this is the reservation
// on paper.
//
// No printer of its own to choose. The ERP renders the report and hands it
// back, and the browser's print dialog is where it goes -- the same dialog the
// ERP's own print button ends at, with the destination the operator picked last
// time already selected. See `src/raaplijst.ts`.
const props = defineProps<{
	// The reservation's internal id, which the ERP's report dialog loads by.
	reservationId: string;
}>();

const printing = ref(false);

async function print() {
	if (printing.value) {
		return;
	}

	printing.value = true;

	try {
		await printRaaplijst(props.reservationId);
	} catch (error) {
		if (error instanceof ErpSignedOutError) {
			erpStore.reportSignedOut();
		}

		console.error("Pack&Ship Extended could not print the raaplijst.", error);
		toast.error("De raaplijst kon niet opgehaald worden.");
		playSound("error");
	} finally {
		printing.value = false;
	}
}
</script>

<template>
	<button type="button" class="pse-raaplijst" :disabled="printing"
		title="Print raaplijst 110.1 van deze reservering" @click="print()">
		<span v-if="printing" class="pse-raaplijst-spinner" aria-hidden="true"></span>
		<span v-else class="material-icons pse-raaplijst-icon" aria-hidden="true">print</span>
		{{ printing ? "Raaplijst wordt opgehaald..." : "Raaplijst printen" }}
	</button>
</template>

<style scoped>
/* Full width of the card it closes, so it reads as an action belonging to the
   whole reservation rather than to the last row above it. */
.pse-raaplijst {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 7px;
	width: 100%;
	margin-top: 13px;
	padding: 9px 12px;
	border: 1px solid var(--pse-line);
	border-radius: 10px;
	background-color: #ffffff;
	font: inherit;
	font-size: 13px;
	font-weight: 600;
	line-height: 1.2;
	color: var(--pse-ink);
	cursor: pointer;
	transition: background-color 0.15s ease, border-color 0.15s ease;
}

.pse-raaplijst:hover:not(:disabled) {
	border-color: var(--pse-brand);
	background-color: var(--pse-well);
}

.pse-raaplijst:disabled {
	opacity: 0.55;
	cursor: default;
}

.pse-raaplijst:focus {
	outline: none;
}

.pse-raaplijst:focus-visible {
	outline: none;
	box-shadow: 0 0 0 3px var(--pse-brand-ring);
}

.pse-raaplijst-icon {
	font-size: 17px;
	color: var(--pse-brand-ink);
}

.pse-raaplijst-spinner {
	width: 13px;
	height: 13px;
	flex: none;
	border: 2px solid var(--pse-line);
	border-top-color: var(--pse-brand);
	border-radius: 50%;
	animation: pse-raaplijst-spin 0.7s linear infinite;
}

@keyframes pse-raaplijst-spin {
	to {
		transform: rotate(360deg);
	}
}
</style>
