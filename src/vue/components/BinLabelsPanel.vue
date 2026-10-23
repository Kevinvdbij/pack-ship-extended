<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { clearBinRecord, getBinRecord, saveBinRecord } from "../../bins.ts";
import { printParcelLabel } from "../../parcelLabel.ts";
import { reportBinTracking } from "../../putWall.ts";
import { ErpSignedOutError } from "../../erpFrame.ts";
import { erpStore } from "../erpStore.ts";
import { playSound } from "../../sounds.ts";
import Settings from "../../settings.ts";
import type { CompletedParcel } from "../../interfaces.ts";
import { binLabel } from "../../constants.ts";

// The labels of an order with a bin, sent where they belong.
//
// Such an order was announced under the NOPRINT environment -- see
// `src/bins.ts` -- so nothing came out of any printer on the way here. Each
// parcel's label is sent now through the ERP's own reprint: an ordinary parcel
// to this workplace's printer, a bin to the bin wall's, which is the CVP's. The
// put wall is told a bin's tracking number only once its label has gone, since
// from that moment it counts the bin as ready for the machine.
//
// Ordinary parcels first: the packer is standing at this printer with the box.
//
// Progress is kept in the bin record, so a reload of this screen picks up where
// it stopped rather than printing a label twice.

type LineState = "waiting" | "printing" | "reporting" | "done" | "failed";

interface Line {
	parcelId: string;
	number: string;
	bin?: string;
	state: LineState;
	printer?: string;
	error?: string;
}

const props = defineProps<{
	reservationId: string;
	parcels: CompletedParcel[];
}>();

const emit = defineEmits<{ done: []; failed: [] }>();

const lines = ref<Line[]>([]);
const running = ref(false);

const failed = computed(() => !running.value && lines.value.some((line) => line.state == "failed"));

onMounted(run);

async function run() {
	const record = getBinRecord(props.reservationId);

	if (!record) {
		emit("done");

		return;
	}

	running.value = true;

	lines.value = record.parcels
		.map((parcel): Line => ({
			parcelId: parcel.id,
			number: parcel.number,
			bin: record.bins.find((entry) => entry.parcelId == parcel.id)?.bin,
			state: "waiting",
		}))
		.sort((a, b) => Number(Boolean(a.bin)) - Number(Boolean(b.bin)));

	if (lines.value.length == 0) {
		// Announced by a press that went round the parcels page's own: there
		// is no list of which parcel is which to work from.
		lines.value = record.bins.map((entry) => ({
			parcelId: entry.parcelId,
			number: "",
			bin: entry.bin,
			state: "failed",
			error: "Niet bekend welk pakket dit is. Print het label via de ERP.",
		}));
	}

	for (const line of lines.value) {
		if (line.state == "failed") {
			continue;
		}

		const parcel = props.parcels.find((candidate) => candidate.number == line.number);

		if (!parcel?.barcode) {
			fail(line, "Dit pakket heeft geen barcode gekregen.");

			continue;
		}

		if (!record.printed.includes(line.parcelId)) {
			line.state = "printing";

			try {
				const environmentId = line.bin ? Settings.binWallEnvironmentId : Settings.environmentId;
				const { printer } = await printParcelLabel(props.reservationId, line.parcelId, environmentId);

				line.printer = printer;
				record.printed.push(line.parcelId);
				saveBinRecord(props.reservationId, record);
			} catch (error) {
				if (error instanceof ErpSignedOutError) {
					erpStore.reportSignedOut();
				}

				console.error("Pack&Ship Extended could not send a label.", error);
				fail(line, "Het label kon niet geprint worden.");

				continue;
			}
		}

		if (line.bin && !record.reported.includes(line.bin)) {
			line.state = "reporting";

			try {
				await reportBinTracking(line.bin, Number(props.reservationId), parcel.barcode, parcel.units);

				record.reported.push(line.bin);
				saveBinRecord(props.reservationId, record);
			} catch (error) {
				fail(line, (error as Error).message);

				continue;
			}
		}

		line.state = "done";
	}

	running.value = false;

	if (lines.value.every((line) => line.state == "done")) {
		clearBinRecord(props.reservationId);
		emit("done");
	} else {
		playSound("error");
		emit("failed");
	}
}

function fail(line: Line, error: string) {
	line.state = "failed";
	line.error = error;
}

function name(line: Line): string {
	return line.bin ? binLabel(line.bin) : `Pakket ${line.number}`;
}

function status(line: Line): string {
	switch (line.state) {
		case "waiting":
			return "Wacht";
		case "printing":
			return "Label wordt geprint...";
		case "reporting":
			return "Wordt gemeld bij de sorteerwand...";
		case "done":
			return line.bin
				? "Label bij de CVP, gemeld bij de sorteerwand"
				: line.printer ? `Geprint op ${line.printer}` : "Geprint";
		case "failed":
			return line.error ?? "Mislukt";
	}
}
</script>

<template>
	<section class="pse-bin-labels">
		<h2 class="pse-bin-labels-title">Labels</h2>

		<ul class="pse-bin-labels-list">
			<li v-for="line in lines" :key="line.parcelId" class="pse-bin-labels-line"
				:class="[`is-${line.state}`, { 'is-bin': line.bin }]">
				<span class="material-icons pse-bin-labels-icon" aria-hidden="true">
					{{ line.state == "done" ? "check_circle" : line.state == "failed" ? "error"
						: line.bin ? "shopping_basket" : "inventory_2" }}
				</span>
				<span class="pse-bin-labels-text">
					<span class="pse-bin-labels-name">{{ name(line) }}</span>
					<span class="pse-bin-labels-status">{{ status(line) }}</span>
				</span>
			</li>
		</ul>

		<button v-if="failed" type="button" class="pse-done-button" @click="run()">
			Opnieuw proberen
		</button>
	</section>
</template>

<style scoped>
.pse-bin-labels {
	width: 100%;
	margin: 18px 0 4px;
	text-align: left;
}

.pse-bin-labels-title {
	margin: 0 0 8px;
	font-size: 11px;
	font-weight: 650;
	letter-spacing: 0.06em;
	text-transform: uppercase;
	color: var(--pse-ink-faint);
}

.pse-bin-labels-list {
	margin: 0 0 14px;
	padding: 0;
	list-style: none;
}

.pse-bin-labels-line {
	display: flex;
	align-items: flex-start;
	gap: 10px;
	padding: 9px 0;
	border-top: 1px solid var(--pse-line);
}

.pse-bin-labels-icon {
	flex: none;
	font-size: 20px;
	color: var(--pse-ink-faint);
}

.pse-bin-labels-line.is-done .pse-bin-labels-icon {
	color: var(--pse-brand);
}

.pse-bin-labels-line.is-failed .pse-bin-labels-icon,
.pse-bin-labels-line.is-failed .pse-bin-labels-status {
	color: var(--pse-alert-ink);
}

.pse-bin-labels-text {
	display: flex;
	flex-direction: column;
	gap: 1px;
	min-width: 0;
}

.pse-bin-labels-name {
	font-size: 14px;
	font-weight: 650;
	color: var(--pse-ink);
}

.pse-bin-labels-status {
	font-size: 12.5px;
	line-height: 1.4;
	color: var(--pse-ink-soft);
}
</style>
