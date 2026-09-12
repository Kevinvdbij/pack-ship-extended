<script setup lang="ts">
import { computed, ref } from "vue";
import { toast } from "vue3-toastify";
import { printParcelLabel } from "../../parcelLabel.ts";
import { ErpSignedOutError } from "../../erpFrame.ts";
import { erpStore } from "../erpStore.ts";
import { playSound } from "../../sounds.ts";
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

const props = defineProps<{
	// The reservation's internal id, which the ERP's label dialog loads by.
	reservationId: string;
	// The parcel's own id, which that dialog lists its parcels by.
	parcelId: string;
	// Shown in the toasts, so the operator is told which label went out rather
	// than only that one did.
	barcode: string;
}>();

const printing = ref(false);

// The workplace decides the printer, the same way it decides where the portal
// prints everything else. Unconfigured is worth saying out loud: the reprint
// would otherwise fail with RetailVista's wording, which does not mention the
// setting that actually needs filling in.
const configured = computed(() => Settings.environmentId > 0);

async function reprint() {
	if (printing.value || !configured.value) {
		return;
	}

	printing.value = true;

	const work = printParcelLabel(props.reservationId, props.parcelId, Settings.environmentId);

	toast.promise(work, {
		pending: `Etiket ${props.barcode} wordt opnieuw geprint...`,
		// The printer is named on the way out. The one real risk in this feature
		// is a label appearing at a bench nobody is standing at, and the answer to
		// that is to say which bench before anyone goes looking.
		success: {
			render: ({ data }) => `Etiket ${props.barcode} geprint op ${(data as { printer: string }).printer}.`,
		},
		error: `Etiket ${props.barcode} kon niet opnieuw geprint worden.`,
	}).catch(() => undefined);

	try {
		await work;
	} catch (error) {
		if (error instanceof ErpSignedOutError) {
			erpStore.reportSignedOut();
		}

		console.error("Pack&Ship Extended could not reprint the parcel label.", error);
		playSound("error");
	} finally {
		printing.value = false;
	}
}
</script>

<template>
	<button type="button" class="pse-reprint" :disabled="printing || !configured"
		:title="configured
			? `Print het etiket van pakket ${barcode} opnieuw`
			: 'Stel eerst de omgeving van deze werkplek in bij Instellingen'"
		@click="reprint()">
		<span v-if="printing" class="pse-reprint-spinner" aria-hidden="true"></span>
		<span v-else class="material-icons pse-reprint-icon" aria-hidden="true">print</span>
		{{ printing ? "Printen..." : "Etiket opnieuw" }}
	</button>
</template>

<style scoped>
/* Sized and coloured to sit under the portal's barcode heading as one more line
   of that card, rather than as something bolted on. It is the only control in
   there, so it does not have to compete for attention -- it only has to be
   plainly a button. */
.pse-reprint {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	margin-top: 6px;
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
