<script setup lang="ts">
import { computed, ref } from "vue";
import { ReservationParcel } from "../../interfaces.ts";
import { reprintParcel } from "../reprint.ts";
import Settings from "../../settings.ts";

// Printing one parcel's carrier label again.
//
// This sits in the portal's own parcel card, beside the barcode it reprints,
// rather than in a card of ours above the page. It started as the latter and was
// wrong for a plain reason: everything such a card can say -- the barcode, the
// carrier, the parcel number -- the portal already says two inches further down,
// so it was a second copy of the same facts whose only new content was one
// button. The button is the part worth having, so the button is what is added.
//
// The cost of sitting there is that the portal owns the markup around it and
// replaces the lot after every parcel change. See `AddParcelsPage.vue`, which
// puts these back each time that happens.
//
// What actually happens on a press is in `src/vue/reprint.ts`, shared with the
// log beside the search and the picker it opens.
const props = defineProps<{
	// The reservation's internal id, which the ERP's label dialog loads by.
	reservationId: string;
	parcel: ReservationParcel;
}>();

const printing = ref(false);

// The workplace decides the printer. Checked here as well as in the shared
// reprint so the control can say why it is dead before anybody presses it --
// a disabled button with a reason beats a toast after the fact.
const configured = computed(() => Settings.environmentId > 0);

async function reprint() {
	if (printing.value || !configured.value) {
		return;
	}

	printing.value = true;

	await reprintParcel(props.reservationId, props.parcel);

	printing.value = false;
}
</script>

<template>
	<button type="button" class="pse-reprint" :disabled="printing || !configured"
		:title="configured
			? `Print het etiket van pakket ${parcel.barcode} opnieuw`
			: 'Stel eerst de omgeving van deze werkplek in bij Instellingen'"
		@click="reprint()">
		<span v-if="printing" class="pse-reprint-spinner" aria-hidden="true"></span>
		<span v-else class="material-icons pse-reprint-icon" aria-hidden="true">print</span>
		{{ printing ? "Printen..." : "Etiket opnieuw" }}
	</button>
</template>

<style scoped>
/* Sized and coloured to sit beside the portal's barcode heading without
   competing with it. The barcode is what that line is for and what gets read
   off it; this only has to be plainly a button. Its own spacing is the
   heading's business -- see `src/styles/portal.css` -- so there is no margin
   here to fight with it. */
.pse-reprint {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 5px 11px;
	border: 1px solid var(--pse-line);
	border-radius: 9px;
	background-color: #ffffff;
	font: inherit;
	font-size: 12.5px;
	font-weight: 600;
	line-height: 1.2;
	color: var(--pse-ink);
	cursor: pointer;
	transition: background-color 0.15s ease, border-color 0.15s ease;
}

.pse-reprint:hover:not(:disabled) {
	border-color: var(--pse-brand);
	background-color: var(--pse-well);
}

.pse-reprint:disabled {
	opacity: 0.55;
	cursor: default;
}

.pse-reprint:focus {
	outline: none;
}

.pse-reprint:focus-visible {
	outline: none;
	box-shadow: 0 0 0 3px var(--pse-brand-ring);
}

.pse-reprint-icon {
	font-size: 16px;
	color: var(--pse-brand-ink);
}

.pse-reprint-spinner {
	width: 12px;
	height: 12px;
	flex: none;
	border: 2px solid var(--pse-line);
	border-top-color: var(--pse-brand);
	border-radius: 50%;
	animation: pse-reprint-spin 0.7s linear infinite;
}

@keyframes pse-reprint-spin {
	to {
		transform: rotate(360deg);
	}
}
</style>
