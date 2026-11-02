<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, useTemplateRef } from "vue";
import * as RVUtils from "../../retailVistaUtils.ts";
import { completeSingleLine, CvpRefusal, type CvpOrder, type CvpStep } from "../../cvpCompletion.ts";
import {
	printBinOnZebra, printHeldOnZebra, readHeldLabels, readRecentLabels, scanBin, sendHeldToCvp,
	type CvpBinScan, type CvpHeldLabel
} from "../../cvpBridge.ts";
import { BIN_CODE_PATTERN, binLabel, withBinLabels } from "../../constants.ts";
import { afterReveal } from "../../reveal.ts";
import { playSound, warmUpAudio } from "../../sounds.ts";
import Settings from "../../settings.ts";
import CvpStatusPanel from "../components/CvpStatusPanel.vue";
import ModalShell from "../components/ModalShell.vue";

// The CVP station: the workplace at the CVP-500, in place of the search screen.
// See `src/environment.ts` for what makes a workplace one.
//
// One field, and every scan goes into it. A product finishes its order: the
// order of that product is found, verified, given its parcel and announced, and
// the label that comes out goes straight to the machine -- all of it from this
// page, without a step to look at (see `src/cvpCompletion.ts`). An order of more
// than one unit stops first for the operator to count them onto the belt. A
// bin (`BK0017`) is handed to the bridge, which releases the label held for it
// to the machine.
//
// Products are worked one at a time, in the order they were scanned, and the
// field stays open while one is under way: the next scan is queued rather than
// refused, so the operator can put an item on the belt and scan the next one
// without waiting for the carrier. Bins do not queue behind them -- a release is
// the bridge's business and does not touch the portal.

type JobState = "waiting" | "working" | "done" | "wait" | "refused" | "failed";

interface Job {
	id: number;
	kind: "order" | "bin";
	code: string;
	state: JobState;
	scannedAt: number;
	step?: CvpStep;
	message?: string;
	order?: CvpOrder;
	trackings?: string[];
	// Where the bridge has the label, once it has been seen there.
	labelStatus?: string;
	labelError?: string | null;
	// The parcels page, for an order that stopped part way.
	parcelsUrl?: string;
	bin?: CvpBinScan;
	busy?: boolean;
	// For a free bin: what the bridge holds, to pick from by hand.
	held?: CvpHeldLabel[];
	heldError?: string;
	heldMessage?: string;
	heldTone?: "ok" | "bad";
}

// What stays on screen: the one being looked at and the ones before it. A
// station runs for a whole shift and the list is a glance back, not a log.
const HISTORY_LIMIT = 12;

const STEPS: { step: CvpStep; label: string }[] = [
	{ step: "search", label: "Zoeken" },
	{ step: "open", label: "Openen" },
	{ step: "verify", label: "Verifiëren" },
	{ step: "parcel", label: "Pakket" },
	{ step: "announce", label: "Aanmelden" },
];

const STEP_TITLES: Record<CvpStep, string> = {
	search: "Order zoeken",
	open: "Reservering openen",
	verify: "Producten verifiëren",
	parcel: "Pakket maken",
	announce: "Aanmelden bij de vervoerder",
};

const scanValue = ref("");
const scanInput = useTemplateRef<HTMLInputElement>("scanInput");

// Whether the CVP can take an order, as the status panel last found it. Unknown
// until its first answer, and the field stays closed until then: a product scan
// finishes an order and prints its label, and with nothing to take that label
// the parcel is announced for a box that is never made.
const cvpReachable = ref<boolean>();

// Back open: the cursor goes back into the field once it can take it again,
// which is the render after the flag changed.
function onReachable(value: boolean) {
	const reopened = value && !cvpReachable.value;

	cvpReachable.value = value;

	if (reopened) {
		nextTick(focusScanIfIdle);
	}
}

const jobs = ref<Job[]>([]);
let nextId = 1;

// Reservations this station has failed on since the page opened. One that
// stopped half way is still listed for its product, and the next scan of the
// same product would otherwise walk straight back into it.
const failedReservations = new Set<string>();

const current = computed(() => jobs.value[0]);
const earlier = computed(() => jobs.value.slice(1));
const waiting = computed(() => jobs.value.filter((job) => job.state == "waiting").length);

let working = false;
let unmounted = false;

onMounted(() => {
	// The portal's search block stays in the document -- its form is what the
	// search is asked with -- and is taken off the screen.
	RVUtils.getSearchBlock()?.classList.add("pse-portal-replaced");

	warmUpAudio();
	focusScan();

	window.addEventListener("focus", focusScanIfIdle);
});

onBeforeUnmount(() => {
	unmounted = true;
	window.removeEventListener("focus", focusScanIfIdle);

	// Nothing has been written while the question is open, so leaving the page
	// is a no.
	counting.value?.answer(false);
});

// Behind the cloak a field cannot take the cursor -- see `afterReveal`.
function focusScan() {
	afterReveal(() => scanInput.value?.focus());
}

// Only when nothing else has it: a press on the Zebra button or a link is the
// operator going there, and the cursor is theirs.
function focusScanIfIdle() {
	if (!document.activeElement || document.activeElement == document.body) {
		focusScan();
	}
}

function onScan() {
	const code = scanValue.value.trim();

	scanValue.value = "";

	if (!code || !cvpReachable.value) {
		return;
	}

	const job = reactive<Job>({
		id: nextId++,
		kind: BIN_CODE_PATTERN.test(code.toUpperCase()) ? "bin" : "order",
		code: BIN_CODE_PATTERN.test(code.toUpperCase()) ? code.toUpperCase() : code,
		state: "waiting",
		scannedAt: Date.now(),
	});

	jobs.value.unshift(job);
	jobs.value.splice(HISTORY_LIMIT);

	if (job.kind == "bin") {
		runBin(job);
	} else {
		runOrders();
	}
}

// ---- Products ----

async function runOrders() {
	if (working) {
		return;
	}

	working = true;

	try {
		for (let job = nextWaiting(); job && !unmounted; job = nextWaiting()) {
			await runOrder(job);
		}
	} finally {
		working = false;
	}
}

// The oldest scan still waiting: they are worked in the order they were made.
function nextWaiting(): Job | undefined {
	return [...jobs.value].reverse().find((job) => job.kind == "order" && job.state == "waiting");
}

async function runOrder(job: Job) {
	job.state = "working";

	try {
		const completed = await completeSingleLine(job.code, {
			skip: failedReservations,
			maxUnits: Settings.cvpMaxUnits,
			onStep: (step, order) => {
				job.step = step;
				job.order = order ?? job.order;
			},
			confirmUnits: (order) => askUnits(job, order),
		});

		job.order = completed;
		job.trackings = completed.trackings;
		job.state = "done";

		playSound("success");
		followLabel(job);
	} catch (error) {
		const refusal = error instanceof CvpRefusal
			? error
			: new CvpRefusal(error instanceof Error ? error.message : String(error), "error");

		if (!(error instanceof CvpRefusal)) {
			console.error("Pack&Ship Extended could not complete a scan for the CVP.", error);
		}

		job.order = refusal.order ?? job.order;
		job.message = refusal.message;
		job.parcelsUrl = refusal.parcelsUrl;
		job.state = refusal.tone == "error" ? "failed" : "refused";

		if (refusal.parcelsUrl && refusal.order) {
			failedReservations.add(refusal.order.reservationNumber);
		}

		playSound(refusal.tone == "error" ? "error" : "warning");
	}

	focusScanIfIdle();
}

// ---- Counting units onto the belt ----

// An order of more than one unit, put to the operator before anything is
// written. The scan that found it stands for one item; the rest are only on the
// belt if somebody counted them there, and the machine boxes whatever it is
// given.
//
// Counted rather than clicked. The scanner ends every barcode with Enter, so a
// question that Enter answers is answered by the next scan; and a button can be
// pressed without looking at the belt. The operator either types the number --
// it has to be the order's -- or scans each unit, the first of them being the
// scan that started this. Any other barcode is refused here instead of being
// queued: it is most likely one of these items under a second barcode, and as an
// order of its own it could finish somebody else's order with it.
interface Counting {
	job: Job;
	order: CvpOrder;
	scanned: number;
	typed: string;
	problem?: string;
	answer: (yes: boolean) => void;
}

const counting = ref<Counting | null>(null);
const countInput = useTemplateRef<HTMLInputElement>("countInput");

// Short enough that no barcode is one: EAN-8 is the shortest on the floor.
const TYPED_COUNT = /^\d{1,4}$/;

function askUnits(job: Job, order: CvpOrder): Promise<boolean> {
	return new Promise((resolve) => {
		counting.value = {
			job,
			order,
			scanned: 1,
			typed: "",
			answer: (yes) => {
				counting.value = null;

				// Said no: the order goes to a packing table, and the next scan of
				// this product should find another one rather than ask again.
				if (!yes) {
					failedReservations.add(order.reservationNumber);
				}

				resolve(yes);
			},
		};

		nextTick(() => countInput.value?.focus());
	});
}

function onCount() {
	const ask = counting.value;

	if (!ask) {
		return;
	}

	const value = ask.typed.trim();

	ask.typed = "";

	if (!value) {
		return;
	}

	if (value == ask.job.code) {
		ask.scanned++;
		ask.problem = undefined;

		if (ask.scanned >= ask.order.units) {
			ask.answer(true);
		} else {
			playSound("success");
		}

		return;
	}

	if (TYPED_COUNT.test(value)) {
		if (Number(value) == ask.order.units) {
			ask.answer(true);
		} else {
			ask.problem = `Geteld: ${Number(value)}. De order is voor ${ask.order.units} stuks. Tel opnieuw, of pak de order met de hand.`;
			playSound("warning");
		}

		return;
	}

	ask.problem = "Dat is een ander artikel. Bevestig eerst deze order, of pak hem met de hand, en scan het dan opnieuw.";
	playSound("warning");
}

// The button does what Enter does with a typed number, for a hand on the screen
// rather than on the keys. Still the number: pressing it is not the count.
const typedMatches = computed(() => counting.value != null
	&& TYPED_COUNT.test(counting.value.typed.trim())
	&& Number(counting.value.typed.trim()) == counting.value.order.units);

// The label, as the bridge sees it: in, at the machine, made into a box. Asked
// for a few minutes after the announcement and then let go -- the bridge's own
// window is where a label is followed further.
const LABEL_POLL_MS = 2000;
const LABEL_FOLLOW_MS = 3 * 60_000;
const LABEL_FINAL = new Set(["Produced", "Retracted", "FallbackPrinted", "Duplicate", "Stale", "Error", "Released", "Removed"]);

async function followLabel(job: Job) {
	const trackings = new Set(job.trackings ?? []);

	if (trackings.size == 0) {
		return;
	}

	const until = Date.now() + LABEL_FOLLOW_MS;

	while (!unmounted && Date.now() < until && jobs.value.includes(job)) {
		try {
			const label = (await readRecentLabels(30)).find((candidate) => candidate.tracking && trackings.has(candidate.tracking));

			if (label) {
				job.labelStatus = label.status;
				job.labelError = label.error;

				if (LABEL_FINAL.has(label.status)) {
					return;
				}
			}
		} catch {
			// The status panel says when the bridge is gone; this only stops
			// following.
			return;
		}

		await new Promise((resolve) => setTimeout(resolve, LABEL_POLL_MS));
	}
}

function labelStatusText(job: Job): string {
	switch (job.labelStatus) {
		case undefined: return "Wacht op het label bij de CVP-brug";
		case "Received": return "Label ontvangen door de CVP-brug";
		case "Staged": return "Klaar in de machine";
		case "Scanned": return "In de machine";
		case "Produced": return "Doos gemaakt";
		case "Retracted": return "Teruggezet door de machine";
		case "FallbackPrinted": return "Op de Zebra geprint";
		case "Duplicate": return "Dubbel label, niet opnieuw naar de machine";
		case "Error": return `Fout bij de CVP-brug${job.labelError ? `: ${job.labelError}` : ""}`;
		default: return job.labelStatus;
	}
}

function labelTone(job: Job): "ok" | "wait" | "bad" {
	switch (job.labelStatus) {
		case "Staged":
		case "Scanned":
		case "Produced":
			return "ok";
		case "Error":
		case "Retracted":
		case "Duplicate":
			return "bad";
		default:
			return "wait";
	}
}

// ---- Bins ----

// Released or printed: the bin's work is done here -- also when its labels had
// gone before and this scan only freed the bin. Waiting outcomes are worth a
// second scan later; anything the bridge marks as a problem is the shiftleader's.
const BIN_DONE = new Set(["released", "printed_zebra", "already_released"]);
const BIN_WAIT = new Set(["waiting_for_bins", "label_not_ready", "label_not_arrived", "not_complete"]);

async function runBin(job: Job, zebra = false) {
	job.state = "working";
	job.busy = true;

	try {
		const answer = zebra ? await printBinOnZebra(job.code) : await scanBin(job.code);

		job.bin = answer;
		job.message = withBinLabels(answer.message);

		if (BIN_DONE.has(answer.result)) {
			job.state = "done";
			playSound("success");
		} else if (BIN_WAIT.has(answer.result) && !answer.isProblem) {
			job.state = "wait";
			playSound("warning");
		} else {
			job.state = answer.isProblem ? "failed" : "refused";
			playSound(answer.isProblem ? "error" : "warning");
		}
		if (answer.showHeldList) {
			await loadHeld(job);
		}
	} catch (error) {
		job.message = error instanceof Error ? error.message : String(error);
		job.state = "failed";
		playSound("error");
	} finally {
		job.busy = false;
	}

	focusScanIfIdle();
}

// ---- Held labels, for a free bin ----

// The label asked about a second time before it goes to the machine by hand:
// nothing ties it to the goods on the belt but the operator's word.
const confirmingHeld = ref<number | null>(null);

async function loadHeld(job: Job) {
	job.heldError = undefined;

	try {
		job.held = await readHeldLabels();
	} catch (error) {
		// A bridge that cannot be asked -- not running, or its page switched off.
		// Its window shows the same list on its Bin wall tab.
		job.held = undefined;
		job.heldError = `${error instanceof Error ? error.message : String(error)} `
			+ "Kies het label in het venster van de CVP-brug.";
	}
}

async function heldToMachine(job: Job, label: CvpHeldLabel) {
	if (confirmingHeld.value != label.id) {
		confirmingHeld.value = label.id;

		return;
	}

	confirmingHeld.value = null;
	await heldAction(job, () => sendHeldToCvp(label.id), `${label.tracking} is naar de machine gestuurd.`);
}

async function heldToZebra(job: Job, label: CvpHeldLabel) {
	confirmingHeld.value = null;
	await heldAction(job, () => printHeldOnZebra(label.id),
		`${label.tracking ?? "Het label"} is op de Zebra geprint.`);
}

// The bridge words its answers for its own window, in English. A success is said
// here instead; a refusal keeps the bridge's reason, which is the useful part.
async function heldAction(job: Job, action: () => Promise<{ ok: boolean; message: string }>, done: string) {
	job.busy = true;

	try {
		const answer = await action();

		job.heldMessage = answer.ok ? done : `Niet gelukt: ${answer.message}`;
		job.heldTone = answer.ok ? "ok" : "bad";
		playSound(answer.ok ? "success" : "error");
	} catch (error) {
		job.heldMessage = error instanceof Error ? error.message : String(error);
		job.heldTone = "bad";
		playSound("error");
	} finally {
		job.busy = false;
	}

	await loadHeld(job);
	focusScanIfIdle();
}

function heldAge(label: CvpHeldLabel): string {
	const minutes = Math.max(0, Math.round((Date.now() - new Date(label.receivedAt).getTime()) / 60_000));

	return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} u ${String(minutes % 60).padStart(2, "0")}`;
}

// ---- Showing it ----

function title(job: Job): string {
	if (job.kind == "bin") {
		switch (job.state) {
			case "waiting":
			case "working": return `${binLabel(job.code)} vrijgeven`;
			case "done":
				switch (job.bin?.result) {
					case "printed_zebra": return "Op de Zebra geprint";
					case "already_released": return "Bak vrijgegeven";
					default: return "Naar de machine";
				}
			default: return job.message ?? "";
		}
	}

	switch (job.state) {
		case "waiting": return "In de wachtrij";
		case "working":
			if (counting.value?.job == job) {
				return "Aantal tellen";
			}

			return job.step ? STEP_TITLES[job.step] : "Bezig";
		case "done": return "Klaar voor de machine";
		default: return job.message ?? "";
	}
}

function tone(job: Job): "busy" | "ok" | "wait" | "bad" {
	switch (job.state) {
		case "waiting":
		case "working": return "busy";
		case "done": return "ok";
		case "wait":
		case "refused": return "wait";
		case "failed": return "bad";
	}
}

function stepState(job: Job, step: CvpStep): "done" | "active" | "todo" {
	const at = STEPS.findIndex((entry) => entry.step == job.step);
	const index = STEPS.findIndex((entry) => entry.step == step);

	if (job.state == "done" || index < at) {
		return "done";
	}

	return index == at && job.state == "working" ? "active" : "todo";
}

function time(at: number): string {
	return new Date(at).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
}

function codeLabel(job: Job): string {
	return job.kind == "bin" ? binLabel(job.code) : job.code;
}

// In this window rather than a new one: the station runs as an installed app,
// and the parcels page comes back here through the completed screen's own
// button once the order is finished by hand. The return hash keeps that page
// from clearing the parcel or announcing on its own.
function openParcels(url: string) {
	RVUtils.setBusy(true);

	window.location.href = url;
}
</script>

<template>
	<div class="pse-cvp">
		<div class="pse-cvp-layout">
			<main class="pse-cvp-main">
				<section class="pse-cvp-card">
					<header class="pse-cvp-head">
						<span class="pse-cvp-icon" aria-hidden="true">
							<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"
								stroke-linecap="round" stroke-linejoin="round">
								<path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2" />
								<path d="M8 8v8M11 8v8M14 8v8M17 8v8" />
							</svg>
						</span>
						<span class="pse-cvp-head-text">
							<h2 class="pse-cvp-title">CVP-station</h2>
							<p class="pse-cvp-subtitle">
								Scan een artikel om de order af te ronden, of een bak om zijn label naar de machine te sturen.
							</p>
						</span>
					</header>

					<label class="pse-cvp-field">
						<span class="pse-cvp-field-label">Scan</span>
						<input ref="scanInput" v-model="scanValue" class="pse-cvp-input" type="text" autocomplete="off"
							spellcheck="false" placeholder="Artikel of bak" :disabled="!cvpReachable"
							data-1p-ignore data-lpignore="true"
							data-form-type="other" @keydown.enter.prevent="onScan()" />
					</label>

					<p class="pse-cvp-queue" v-if="waiting > 0">
						{{ waiting == 1 ? "1 scan wacht" : `${waiting} scans wachten` }} op de order die nu wordt afgerond.
					</p>
				</section>

				<!-- The scan being looked at: the newest one, large. -->
				<section v-if="current" class="pse-cvp-result" :class="`is-${tone(current)}`" aria-live="polite">
					<div class="pse-cvp-result-head">
						<span class="pse-cvp-result-kind">
							{{ current.kind == "bin" ? "Bak" : "Artikel" }} · {{ codeLabel(current) }}
						</span>
						<span class="pse-cvp-result-time">{{ time(current.scannedAt) }}</span>
					</div>

					<h3 class="pse-cvp-result-title">
						<span class="pse-cvp-spinner" v-if="current.state == 'working'" aria-hidden="true"></span>
						{{ title(current) }}
					</h3>

					<!-- How far a product scan has got. -->
					<ol class="pse-cvp-steps" v-if="current.kind == 'order' && (current.state == 'working' || current.state == 'done')">
						<li v-for="entry in STEPS" :key="entry.step" :class="`is-${stepState(current, entry.step)}`">
							{{ entry.label }}
						</li>
					</ol>

					<dl class="pse-cvp-facts" v-if="current.order || current.bin?.customer || current.bin?.orderReference">
						<template v-if="current.order">
							<dt>Reservering</dt>
							<dd>{{ current.order.reservationNumber }}</dd>
							<template v-if="current.order.orderReference">
								<dt>Order</dt>
								<dd>{{ current.order.orderReference }}</dd>
							</template>
							<template v-if="current.order.customer">
								<dt>Klant</dt>
								<dd>{{ current.order.customer }}</dd>
							</template>
							<dt>Product</dt>
							<dd>{{ current.order.product }}</dd>
							<template v-if="current.order.units > 1">
								<dt>Aantal</dt>
								<dd>{{ current.order.units }} stuks</dd>
							</template>
						</template>
						<template v-else-if="current.bin">
							<template v-if="current.bin.orderReference">
								<dt>Order</dt>
								<dd>{{ current.bin.orderReference }}</dd>
							</template>
							<template v-if="current.bin.customer">
								<dt>Klant</dt>
								<dd>{{ current.bin.customer }}</dd>
							</template>
							<template v-if="current.bin.itemCount">
								<dt>Artikelen</dt>
								<dd>{{ current.bin.itemCount }} stuks</dd>
							</template>
						</template>
						<template v-if="current.trackings?.length || current.bin?.trackings?.length">
							<dt>Label</dt>
							<dd class="pse-cvp-mono">{{ (current.trackings ?? current.bin?.trackings ?? []).join(", ") }}</dd>
						</template>
					</dl>

					<!-- The label's way to the box, for an order that was announced. -->
					<p class="pse-cvp-label" v-if="current.kind == 'order' && current.state == 'done'"
						:class="`is-${labelTone(current)}`">
						<span class="pse-cvp-label-dot" aria-hidden="true"></span>
						{{ labelStatusText(current) }}
					</p>

					<!-- A bin the bridge is still waiting on the others of. -->
					<p class="pse-cvp-detail" v-if="current.bin?.waitingFor?.length">
						Scan ook {{ current.bin.waitingFor.map(binLabel).join(", ") }}.
					</p>

					<!-- What the bridge said, when the title is the outcome rather than the words. -->
					<p class="pse-cvp-detail" v-if="current.kind == 'bin' && current.state == 'done' && current.message">
						{{ current.message }}
					</p>

					<!-- A free bin: the put wall no longer knows its labels, so they are picked by hand. -->
					<div class="pse-cvp-held" v-if="current.bin?.showHeldList">
						<h4 class="pse-cvp-held-title">Vastgehouden labels bij de CVP-brug</h4>

						<p class="pse-cvp-held-note" v-if="current.heldError">{{ current.heldError }}</p>
						<p class="pse-cvp-held-note" v-else-if="current.held && current.held.length == 0">
							De CVP-brug houdt geen labels vast.
						</p>

						<ul class="pse-cvp-held-list" v-if="current.held?.length">
							<li v-for="label in current.held" :key="label.id">
								<span class="pse-cvp-held-text">
									<strong class="pse-cvp-mono">{{ label.tracking ?? "Onleesbaar label" }}</strong>
									<span>{{ [label.customer, label.reference, label.bin ? binLabel(label.bin) : null]
										.filter(Boolean).join(" · ") || "Nog geen bak gescand" }}</span>
									<span class="pse-cvp-held-age">{{ heldAge(label) }} vastgehouden</span>
								</span>
								<span class="pse-cvp-held-buttons">
									<button type="button" class="pse-cvp-button" v-if="label.tracking && label.status == 'Held'"
										:disabled="current.busy" @click="heldToMachine(current, label)">
										{{ confirmingHeld == label.id ? "Zeker? Naar de machine" : "Naar de machine" }}
									</button>
									<button type="button" class="pse-cvp-button is-quiet" :disabled="current.busy"
										@click="heldToZebra(current, label)">
										Op de Zebra
									</button>
								</span>
							</li>
						</ul>

						<p class="pse-cvp-held-result" v-if="current.heldMessage" :class="`is-${current.heldTone}`">
							{{ current.heldMessage }}
						</p>
					</div>

					<div class="pse-cvp-actions" v-if="current.parcelsUrl || (current.bin?.canPrintOnZebra && current.state != 'done')">
						<button type="button" class="pse-cvp-button" v-if="current.bin?.canPrintOnZebra && current.state != 'done'"
							:disabled="current.busy" @click="runBin(current, true)">
							Labels op de Zebra printen
						</button>
						<button type="button" class="pse-cvp-button is-quiet" v-if="current.parcelsUrl"
							@click="openParcels(current.parcelsUrl)">
							Openen in Pack &amp; Ship
						</button>
					</div>
				</section>

				<section v-else class="pse-cvp-empty">
					Nog niets gescand. Het resultaat van elke scan verschijnt hier.
				</section>

				<!-- What came before, one line each. -->
				<ul class="pse-cvp-history" v-if="earlier.length > 0">
					<li v-for="job in earlier" :key="job.id" :class="`is-${tone(job)}`">
						<span class="pse-cvp-history-dot" aria-hidden="true"></span>
						<span class="pse-cvp-history-code">{{ codeLabel(job) }}</span>
						<span class="pse-cvp-history-text">
							{{ title(job) }}<template v-if="job.order"> · {{ job.order.reservationNumber }}</template>
						</span>
						<span class="pse-cvp-history-time">{{ time(job.scannedAt) }}</span>
					</li>
				</ul>
			</main>

			<CvpStatusPanel class="pse-cvp-side" @reachable="onReachable" />
		</div>

		<Teleport to="body">
			<Transition name="modal">
				<ModalShell v-if="counting" title="Tel de stuks op de band" size="sm" :dismissable="false"
					@close="counting.answer(false)">
					<p class="pse-cvp-count-units">
						<strong>{{ counting.order.units }}</strong>
						<span>× {{ counting.order.product }}</span>
					</p>
					<p class="pse-cvp-count-order">
						Reservering {{ counting.order.reservationNumber }}<template v-if="counting.order.customer">
							· {{ counting.order.customer }}</template>
					</p>

					<p class="pse-cvp-count-lead">
						Leg alle {{ counting.order.units }} op de band. Scan elk stuk, of typ het aantal en druk op Enter.
					</p>

					<p class="pse-cvp-count-scanned">
						Gescand: <strong>{{ counting.scanned }}</strong> van {{ counting.order.units }}
					</p>

					<input ref="countInput" v-model="counting.typed" class="pse-dialog-input pse-cvp-count-input"
						type="text" inputmode="numeric" autocomplete="off" spellcheck="false" placeholder="Aantal of scan"
						aria-label="Aantal of scan" data-1p-ignore data-lpignore="true" data-form-type="other"
						@keydown.enter.prevent="onCount()" />

					<p class="pse-cvp-count-problem" v-if="counting.problem" role="alert">{{ counting.problem }}</p>

					<template #footer>
						<button type="button" class="pse-dialog-btn pse-dialog-btn-quiet" @click="counting.answer(false)">
							Pak met de hand
						</button>
						<button type="button" class="pse-dialog-btn" :disabled="!typedMatches" @click="onCount()">
							Bevestig {{ counting.order.units }} stuks
						</button>
					</template>
				</ModalShell>
			</Transition>
		</Teleport>
	</div>
</template>

<style scoped>
.pse-cvp {
	box-sizing: border-box;
	width: 100%;
	margin: 28px auto 56px;
	padding: 0 24px;
	color: var(--pse-ink);
	/* The portal's `.container-fluid.text-center` reaches in here. */
	text-align: left;
}

.pse-cvp :deep(*) {
	box-sizing: border-box;
}

.pse-cvp-layout {
	display: grid;
	grid-template-columns: minmax(0, 1fr) 300px;
	gap: 20px;
	align-items: start;
	max-width: 1180px;
	margin: 0 auto;
}

.pse-cvp-main {
	display: flex;
	flex-direction: column;
	gap: 16px;
	min-width: 0;
}

.pse-cvp-card {
	padding: 28px 30px;
	border: 1px solid var(--pse-line);
	border-radius: 20px;
	background-color: #ffffff;
	box-shadow: 0 1px 2px rgba(20, 48, 33, 0.04), 0 18px 40px -28px rgba(20, 48, 33, 0.45);
}

.pse-cvp-head {
	display: flex;
	align-items: center;
	gap: 14px;
	margin-bottom: 22px;
}

.pse-cvp-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	flex: none;
	width: 44px;
	height: 44px;
	border-radius: 13px;
	background-color: var(--pse-brand-soft);
	color: var(--pse-brand-ink);
}

.pse-cvp-title {
	margin: 0;
	font-size: 20px;
	font-weight: 700;
	line-height: 1.25;
	color: var(--pse-ink);
}

.pse-cvp-subtitle {
	margin: 3px 0 0;
	font-size: 13.5px;
	line-height: 1.45;
	color: var(--pse-ink-soft);
}

.pse-cvp-field {
	display: block;
	margin: 0;
	cursor: text;
}

.pse-cvp-field-label {
	display: block;
	margin-bottom: 8px;
	font-size: 11px;
	font-weight: 650;
	letter-spacing: 0.07em;
	text-transform: uppercase;
	color: var(--pse-ink-soft);
}

/* The one control on the screen, aimed at from across the belt: sized for that
   rather than for the text in it. */
.pse-cvp-input {
	display: block;
	width: 100%;
	height: 64px;
	margin: 0;
	padding: 0 20px;
	border: 1px solid var(--pse-line);
	border-radius: 14px;
	background-color: var(--pse-well);
	font: inherit;
	font-size: 22px;
	font-weight: 600;
	letter-spacing: 0.02em;
	color: var(--pse-ink);
	transition: border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
}

.pse-cvp-input::placeholder {
	font-weight: 500;
	color: var(--pse-ink-faint);
}

.pse-cvp-input:focus {
	outline: none;
	border-color: var(--pse-brand);
	background-color: #ffffff;
	box-shadow: 0 0 0 4px var(--pse-brand-ring);
}

.pse-cvp-input:disabled {
	opacity: 0.55;
	cursor: not-allowed;
}

.pse-cvp-queue {
	margin: 12px 0 0;
	font-size: 13px;
	color: var(--pse-attention-ink);
}

/* ---- The current scan ---- */
.pse-cvp-result {
	--tone: var(--pse-ink-faint);
	--tone-wash: var(--pse-well);
	--tone-ink: var(--pse-ink);

	padding: 22px 26px;
	border: 1px solid var(--pse-line);
	border-left: 6px solid var(--tone);
	border-radius: 18px;
	background-color: #ffffff;
}

.pse-cvp-result.is-busy {
	--tone: #d99a2b;
	--tone-ink: var(--pse-attention-ink);
}

.pse-cvp-result.is-ok {
	--tone: var(--pse-brand);
	--tone-wash: var(--pse-brand-soft);
	--tone-ink: var(--pse-brand-ink-strong);
	background-color: var(--pse-brand-soft);
}

.pse-cvp-result.is-wait {
	--tone: #d99a2b;
	--tone-ink: var(--pse-attention-ink);
	background-color: var(--pse-attention-soft);
}

.pse-cvp-result.is-bad {
	--tone: var(--pse-alert);
	--tone-ink: var(--pse-alert-ink);
	background-color: var(--pse-alert-wash);
}

.pse-cvp-result-head {
	display: flex;
	justify-content: space-between;
	gap: 12px;
	font-size: 12px;
	font-weight: 600;
	letter-spacing: 0.04em;
	text-transform: uppercase;
	color: var(--pse-ink-soft);
}

.pse-cvp-result-title {
	display: flex;
	align-items: center;
	gap: 12px;
	margin: 8px 0 0;
	font-size: 26px;
	font-weight: 700;
	line-height: 1.25;
	color: var(--tone-ink);
}

.pse-cvp-spinner {
	flex: none;
	width: 22px;
	height: 22px;
	border: 3px solid rgba(217, 154, 43, 0.3);
	border-top-color: #d99a2b;
	border-radius: 50%;
	animation: pse-cvp-spin 0.7s linear infinite;
}

@keyframes pse-cvp-spin {
	to {
		transform: rotate(360deg);
	}
}

.pse-cvp-steps {
	display: flex;
	gap: 6px;
	margin: 18px 0 0;
	padding: 0;
	list-style: none;
}

.pse-cvp-steps li {
	flex: 1;
	padding-top: 9px;
	border-top: 4px solid var(--pse-line);
	font-size: 12px;
	font-weight: 600;
	color: var(--pse-ink-faint);
}

.pse-cvp-steps li.is-done {
	border-top-color: var(--pse-brand);
	color: var(--pse-brand-ink);
}

.pse-cvp-steps li.is-active {
	border-top-color: #d99a2b;
	color: var(--pse-attention-ink);
}

.pse-cvp-facts {
	display: grid;
	grid-template-columns: auto 1fr;
	gap: 7px 18px;
	margin: 18px 0 0;
	font-size: 15px;
}

.pse-cvp-facts dt {
	font-weight: 500;
	color: var(--pse-ink-soft);
}

.pse-cvp-facts dd {
	margin: 0;
	font-weight: 600;
	color: var(--pse-ink);
	overflow-wrap: anywhere;
}

.pse-cvp-mono {
	font-variant-numeric: tabular-nums;
	letter-spacing: 0.03em;
}

.pse-cvp-label {
	display: flex;
	align-items: center;
	gap: 10px;
	margin: 18px 0 0;
	padding: 11px 14px;
	border-radius: 12px;
	background-color: #ffffff;
	font-size: 15px;
	font-weight: 650;
	color: var(--pse-attention-ink);
}

.pse-cvp-label.is-ok {
	color: var(--pse-brand-ink-strong);
}

.pse-cvp-label.is-bad {
	color: var(--pse-alert-ink);
}

.pse-cvp-label-dot {
	flex: none;
	width: 10px;
	height: 10px;
	border-radius: 50%;
	background-color: currentColor;
}

.pse-cvp-detail {
	margin: 14px 0 0;
	font-size: 15px;
	font-weight: 600;
	color: var(--tone-ink);
}

.pse-cvp-held {
	margin-top: 18px;
	padding: 16px 18px;
	border: 1px solid var(--pse-line);
	border-radius: 14px;
	background-color: #ffffff;
}

.pse-cvp-held-title {
	margin: 0 0 10px;
	font-size: 13px;
	font-weight: 650;
	letter-spacing: 0.04em;
	text-transform: uppercase;
	color: var(--pse-ink-soft);
}

.pse-cvp-held-note {
	margin: 0;
	font-size: 14px;
	color: var(--pse-ink-soft);
}

.pse-cvp-held-list {
	margin: 0;
	padding: 0;
	list-style: none;
}

.pse-cvp-held-list li {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 10px;
	padding: 10px 0;
}

.pse-cvp-held-list li + li {
	border-top: 1px solid var(--pse-line);
}

.pse-cvp-held-text {
	display: flex;
	flex-direction: column;
	gap: 2px;
	min-width: 0;
	font-size: 14px;
	color: var(--pse-ink);
}

.pse-cvp-held-age {
	font-size: 12.5px;
	color: var(--pse-ink-faint);
}

.pse-cvp-held-buttons {
	display: flex;
	gap: 8px;
}

.pse-cvp-held-result {
	margin: 12px 0 0;
	font-size: 14px;
	font-weight: 600;
}

.pse-cvp-held-result.is-ok {
	color: var(--pse-brand-ink-strong);
}

.pse-cvp-held-result.is-bad {
	color: var(--pse-alert-ink);
}

.pse-cvp-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	margin-top: 18px;
}

.pse-cvp-button {
	height: 44px;
	padding: 0 18px;
	border: 0;
	border-radius: 12px;
	background-color: var(--pse-brand-ink);
	font: inherit;
	font-size: 14px;
	font-weight: 650;
	color: #ffffff;
	cursor: pointer;
}

.pse-cvp-button:hover:not(:disabled) {
	background-color: var(--pse-brand-ink-strong);
}

.pse-cvp-button:disabled {
	background-color: #cfdbd4;
	cursor: not-allowed;
}

.pse-cvp-button.is-quiet {
	border: 1px solid var(--pse-line);
	background-color: #ffffff;
	color: var(--pse-ink);
}

.pse-cvp-button.is-quiet:hover {
	background-color: var(--pse-well);
}

.pse-cvp-button:focus-visible {
	outline: none;
	box-shadow: 0 0 0 3px var(--pse-brand-ring);
}

.pse-cvp-empty {
	padding: 22px 26px;
	border: 1px dashed var(--pse-line);
	border-radius: 18px;
	font-size: 14px;
	color: var(--pse-ink-faint);
}

/* ---- Earlier scans ---- */
.pse-cvp-history {
	margin: 0;
	padding: 6px 0;
	border: 1px solid var(--pse-line);
	border-radius: 16px;
	background-color: #ffffff;
	list-style: none;
}

.pse-cvp-history li {
	--tone: var(--pse-ink-faint);

	display: grid;
	grid-template-columns: auto auto minmax(0, 1fr) auto;
	align-items: center;
	gap: 12px;
	padding: 9px 18px;
	font-size: 13.5px;
}

.pse-cvp-history li + li {
	border-top: 1px solid var(--pse-line);
}

.pse-cvp-history li.is-ok {
	--tone: var(--pse-brand);
}

.pse-cvp-history li.is-wait,
.pse-cvp-history li.is-busy {
	--tone: #d99a2b;
}

.pse-cvp-history li.is-bad {
	--tone: var(--pse-alert);
}

.pse-cvp-history-dot {
	width: 9px;
	height: 9px;
	border-radius: 50%;
	background-color: var(--tone);
}

.pse-cvp-history-code {
	font-weight: 650;
	font-variant-numeric: tabular-nums;
	color: var(--pse-ink);
}

.pse-cvp-history-text {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	color: var(--pse-ink-soft);
}

.pse-cvp-history-time {
	font-variant-numeric: tabular-nums;
	color: var(--pse-ink-faint);
}

/* ---- Counting units onto the belt ---- */
.pse-cvp-count-units {
	display: flex;
	align-items: baseline;
	gap: 12px;
	margin: 0;
	font-size: 18px;
	font-weight: 600;
	line-height: 1.3;
	color: var(--pse-ink);
}

/* Read from the belt, not from the chair. */
.pse-cvp-count-units strong {
	flex: none;
	font-size: 44px;
	font-weight: 750;
	line-height: 1;
	font-variant-numeric: tabular-nums;
	color: var(--pse-brand-ink);
}

.pse-cvp-count-order {
	margin: 6px 0 0;
	font-size: 13.5px;
	color: var(--pse-ink-soft);
}

.pse-cvp-count-lead {
	margin: 16px 0 0;
	font-size: 14.5px;
	line-height: 1.45;
	color: var(--pse-ink);
}

.pse-cvp-count-scanned {
	margin: 10px 0 0;
	font-size: 14px;
	color: var(--pse-ink-soft);
}

.pse-cvp-count-scanned strong {
	font-variant-numeric: tabular-nums;
	color: var(--pse-ink);
}

.pse-cvp-count-input {
	margin-top: 12px;
	height: 52px;
	font-size: 20px;
	font-weight: 600;
}

.pse-cvp-count-problem {
	margin: 10px 0 0;
	padding: 10px 12px;
	border-radius: 10px;
	background-color: var(--pse-attention-soft);
	font-size: 13.5px;
	font-weight: 600;
	color: var(--pse-attention-ink);
}

@media (max-width: 960px) {
	.pse-cvp {
		padding: 0 16px;
	}

	.pse-cvp-layout {
		grid-template-columns: minmax(0, 1fr);
	}

	.pse-cvp-side {
		order: -1;
	}
}
</style>
