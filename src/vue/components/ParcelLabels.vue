<script setup lang="ts">
import { computed, ref } from "vue";
import { toast } from "vue3-toastify";
import { ReservationParcel } from "../../interfaces.ts";
import { printParcelLabel } from "../../parcelLabel.ts";
import { ErpSignedOutError } from "../../erpFrame.ts";
import { erpStore } from "../erpStore.ts";
import { playSound } from "../../sounds.ts";
import Settings from "../../settings.ts";

// Printing a parcel's carrier label again.
//
// The label that came out when the parcel was announced is the one thing in this
// flow nobody can reproduce: it is the carrier's, it was sent straight to a
// printer, and it never passed through the browser. So a label that jams, tears
// or goes missing used to mean walking to the office and doing it from the ERP.
// This is that same task, on the screen where the parcel already is.
//
// It is deliberately the ERP's own task rather than anything of ours: same
// carrier account, same rules, same trail. What is added here is only knowing
// which parcel is meant and which printer this bench prints on.

const props = defineProps<{
	// The reservation's internal id -- `#ReservationId`, not the number on the
	// heading. The label dialog loads its record by it.
	reservationId: string;
	parcels: ReservationParcel[];
}>();

// The parcel being printed, so one button can say so without disabling the rest.
const printing = ref("");

// Only parcels that actually have a carrier label.
//
// The barcode is what decides it, not the transport type. A collection order or
// a parcel handed to a local driver has no carrier label to reprint -- but the
// transport type saying so is a translated phrase, and this portal has been seen
// serving its chrome in Dutch and its own task names in English within one
// session. The barcode is the carrier's, and it is either there or it is not.
const printable = computed(() => props.parcels.filter((parcel) => parcel.barcode));

// Nothing to offer: no parcels, or none of them carrier parcels. The card is not
// rendered at all rather than rendered empty -- an empty card on a collection
// order is a question the operator has to answer before they can ignore it.
const shown = computed(() => printable.value.length > 0);

// The workplace decides the printer, the same way it decides where the portal
// prints everything else. Unconfigured is the one case worth saying out loud:
// the reprint would otherwise fail with RetailVista's own wording, which does
// not mention the setting that actually needs filling in.
const environmentId = computed(() => Settings.environmentId);
const configured = computed(() => environmentId.value > 0);

async function reprint(parcel: ReservationParcel) {
	if (printing.value || !configured.value) {
		return;
	}

	printing.value = parcel.id;

	const work = printParcelLabel(props.reservationId, parcel.id, environmentId.value);

	toast.promise(work, {
		pending: `Etiket ${parcel.barcode} wordt opnieuw geprint...`,
		// The printer is named on the way out. The one real risk here is a label
		// appearing at a bench nobody is standing at, and the answer to that is
		// to say which bench before anyone goes looking.
		success: {
			render: ({ data }) => `Etiket ${parcel.barcode} geprint op ${(data as { printer: string }).printer}.`,
		},
		error: `Etiket ${parcel.barcode} kon niet opnieuw geprint worden.`,
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
		printing.value = "";
	}
}
</script>

<template>
	<section v-if="shown" class="pse-labels">
		<header class="pse-labels-head">
			<span class="material-icons pse-labels-icon" aria-hidden="true">local_printshop</span>
			<h3 class="pse-labels-title">{{ printable.length > 1 ? "Etiketten" : "Etiket" }}</h3>
		</header>

		<div class="pse-labels-body">
			<div v-for="parcel in printable" :key="parcel.id" class="pse-labels-row">
				<div class="pse-labels-what">
					<span class="pse-labels-barcode">{{ parcel.barcode }}</span>
					<span class="pse-labels-carrier">
						{{ [parcel.number, parcel.carrier || parcel.service].filter(Boolean).join(" - ") }}
					</span>
				</div>

				<button type="button" class="pse-labels-btn" :disabled="Boolean(printing) || !configured"
					:title="configured
						? `Print het etiket van pakket ${parcel.barcode} opnieuw`
						: 'Stel eerst de omgeving van deze werkplek in bij Instellingen'"
					@click="reprint(parcel)">
					<span v-if="printing == parcel.id" class="pse-labels-spinner" aria-hidden="true"></span>
					<span v-else class="material-icons pse-labels-btn-icon" aria-hidden="true">print</span>
					{{ printing == parcel.id ? "Printen..." : "Opnieuw" }}
				</button>
			</div>

			<p v-if="!configured" class="pse-labels-hint">
				Deze werkplek heeft nog geen omgeving ingesteld, dus er is geen printer om het
				etiket naartoe te sturen. Stel die in bij <b>Instellingen</b>.
			</p>
		</div>
	</section>
</template>

<style scoped>
/* The same surface as the cards it stands among, so the column reads as one
   stack rather than as a widget that arrived separately. */
.pse-labels {
	overflow: hidden;
	margin-bottom: 14px;
	border: 1px solid var(--pse-line);
	border-radius: 14px;
	background-color: #ffffff;
	box-shadow: 0 1px 2px rgba(20, 48, 33, 0.04);
	text-align: left;
}

.pse-labels-head {
	display: flex;
	align-items: center;
	gap: 9px;
	padding: 10px 14px;
	border-bottom: 1px solid var(--pse-line);
	background-color: var(--pse-well);
}

.pse-labels-icon {
	font-size: 18px;
	color: var(--pse-brand-ink);
}

.pse-labels-title {
	margin: 0;
	font-size: 13px;
	font-weight: 650;
	color: var(--pse-ink);
}

.pse-labels-body {
	padding: 10px 14px 12px;
}

.pse-labels-row {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 6px 0;
}

.pse-labels-row + .pse-labels-row {
	border-top: 1px solid var(--pse-line);
}

.pse-labels-what {
	display: flex;
	min-width: 0;
	flex: 1 1 auto;
	flex-direction: column;
	gap: 1px;
}

/* Tabular, and the largest thing on the row: this is what gets compared against
   the barcode on a label lying on the bench. */
.pse-labels-barcode {
	overflow: hidden;
	font-size: 13.5px;
	font-variant-numeric: tabular-nums;
	font-weight: 650;
	color: var(--pse-ink);
	text-overflow: ellipsis;
	white-space: nowrap;
}

.pse-labels-carrier {
	font-size: 12px;
	color: var(--pse-ink-faint);
}

.pse-labels-btn {
	display: flex;
	flex: none;
	align-items: center;
	gap: 6px;
	height: 32px;
	padding: 0 12px;
	border: 1px solid var(--pse-line);
	border-radius: 9px;
	background-color: #ffffff;
	font: inherit;
	font-size: 12.5px;
	font-weight: 600;
	color: var(--pse-ink);
	cursor: pointer;
	transition: background-color 0.15s ease, border-color 0.15s ease;
}

.pse-labels-btn:hover:not(:disabled) {
	border-color: var(--pse-brand);
	background-color: var(--pse-well);
}

.pse-labels-btn:disabled {
	opacity: 0.55;
	cursor: default;
}

.pse-labels-btn-icon {
	font-size: 16px;
	color: var(--pse-brand-ink);
}

.pse-labels-spinner {
	width: 13px;
	height: 13px;
	flex: none;
	border: 2px solid var(--pse-line);
	border-top-color: var(--pse-brand);
	border-radius: 50%;
	animation: pse-labels-spin 0.7s linear infinite;
}

@keyframes pse-labels-spin {
	to {
		transform: rotate(360deg);
	}
}

.pse-labels-hint {
	margin: 8px 0 0;
	font-size: 12px;
	line-height: 1.45;
	color: var(--pse-ink-faint);
}
</style>
