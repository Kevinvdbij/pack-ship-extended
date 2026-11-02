<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { readBridgeHealth, type CvpBridgeHealth } from "../../cvpBridge.ts";

// How the machine is doing, beside the scan field: whether the bridge on this
// computer answers, whether the CVP will take an order, and how much is waiting.
//
// Asked on a short timer rather than once. The machine's state is the thing the
// operator glances at between scans -- busy, ready, not connected -- and an
// answer from a minute ago is an answer about a different box.
const POLL_MS = 4000;

// After every check: whether the machine can take an order at all. The station
// closes its scan field on false -- a scan with no bridge or no machine behind
// it would finish an order whose label goes nowhere.
const emit = defineEmits<{ reachable: [value: boolean] }>();

// Busy is still reachable: the order waits in the machine's queue.
const UNREACHABLE_MACHINE = new Set(["not connected", "unreachable"]);

const health = ref<CvpBridgeHealth>();
const unreachable = ref("");
const checkedAt = ref<number>();

let timer: ReturnType<typeof setTimeout> | undefined;
let stopped = false;

onMounted(poll);

onBeforeUnmount(() => {
	stopped = true;
	clearTimeout(timer);
});

async function poll() {
	try {
		health.value = await readBridgeHealth();
		unreachable.value = "";
	} catch (error) {
		health.value = undefined;
		unreachable.value = error instanceof Error ? error.message : String(error);
	}

	checkedAt.value = Date.now();

	emit("reachable", Boolean(health.value) && !UNREACHABLE_MACHINE.has(health.value!.machineState));

	if (!stopped) {
		timer = setTimeout(poll, POLL_MS);
	}
}

type Tone = "ok" | "wait" | "bad" | "off";

interface Row {
	label: string;
	value: string;
	tone: Tone;
}

// The machine, in the bridge's own words mapped onto the operator's. On the
// socket it is "ready", "busy" or "not connected"; on the share there is nothing
// to wait for, so it is only ever "ok" or "unreachable".
const machine = computed<Row>(() => {
	if (!health.value) {
		return { label: "Machine", value: "Onbekend", tone: "off" };
	}

	switch (health.value.machineState) {
		case "ready": return { label: "Machine", value: "Klaar", tone: "ok" };
		case "ok": return { label: "Machine", value: "Klaar", tone: "ok" };
		case "busy": return { label: "Machine", value: "Bezig", tone: "wait" };
		case "not connected": return { label: "Machine", value: "Niet verbonden", tone: "bad" };
		case "unreachable": return { label: "Machine", value: "Niet bereikbaar", tone: "bad" };
		default: return { label: "Machine", value: health.value.machineState, tone: "wait" };
	}
});

const rows = computed<Row[]>(() => {
	const current = health.value;

	if (!current) {
		return [];
	}

	const list: Row[] = [
		{
			label: "Labelpoort",
			value: current.listenerUp ? "Luistert" : (current.listenerError || "Uit"),
			tone: current.listenerUp ? "ok" : "bad",
		},
		{
			label: "Wachtrij",
			value: current.queueDepth == 1 ? "1 label" : `${current.queueDepth} labels`,
			tone: current.queueDepth > 0 ? "wait" : "ok",
		},
		{
			label: "Zebra",
			value: current.zebraReachable ? "Bereikbaar" : "Niet bereikbaar",
			tone: current.zebraReachable ? "ok" : "bad",
		},
	];

	// Only on a bridge with the bin wall switched on: it reports null otherwise.
	if (current.putWallState != null) {
		list.push({
			label: "Sorteerwand",
			value: putWallLabel(current.putWallState),
			tone: current.putWallState == "ok" ? "ok" : "bad",
		});

		list.push({
			label: "Bakken met label",
			value: current.heldCount == 1 ? "1 wacht op scan" : `${current.heldCount} wachten op scan`,
			tone: current.heldCount > 0 ? "wait" : "ok",
		});
	}

	return list;
});

function putWallLabel(state: string): string {
	switch (state) {
		case "ok": return "Verbonden";
		case "unreachable": return "Niet bereikbaar";
		case "token rejected": return "Sleutel geweigerd";
		case "no token": return "Geen sleutel";
		default: return state;
	}
}

const checkedLabel = computed(() => checkedAt.value
	? new Date(checkedAt.value).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
	: "");
</script>

<template>
	<aside class="pse-cvp-status" :class="`is-${unreachable ? 'bad' : machine.tone}`">
		<header class="pse-cvp-status-head">
			<span class="pse-cvp-status-dot" aria-hidden="true"></span>
			<span class="pse-cvp-status-titles">
				<span class="pse-cvp-status-kicker">CVP-500</span>
				<span class="pse-cvp-status-machine">{{ unreachable ? "Brug niet bereikbaar" : machine.value }}</span>
			</span>
		</header>

		<p class="pse-cvp-status-note" v-if="unreachable">
			{{ unreachable }} Controleer of de CVP Bridge op deze computer draait.
		</p>

		<dl class="pse-cvp-status-rows" v-if="rows.length > 0">
			<template v-for="row in rows" :key="row.label">
				<dt>{{ row.label }}</dt>
				<dd :class="`is-${row.tone}`">{{ row.value }}</dd>
			</template>
		</dl>

		<footer class="pse-cvp-status-foot" v-if="checkedLabel">
			<span v-if="health">Brug {{ health.version }}</span>
			<span>Bijgewerkt {{ checkedLabel }}</span>
		</footer>
	</aside>
</template>

<style scoped>
.pse-cvp-status {
	--tone: var(--pse-ink-faint);
	--tone-wash: var(--pse-well);

	padding: 18px 20px;
	border: 1px solid var(--pse-line);
	border-radius: 18px;
	background-color: #ffffff;
	text-align: left;
}

.pse-cvp-status.is-ok {
	--tone: var(--pse-brand);
	--tone-wash: var(--pse-brand-soft);
}

.pse-cvp-status.is-wait {
	--tone: #d99a2b;
	--tone-wash: var(--pse-attention-soft);
}

.pse-cvp-status.is-bad {
	--tone: var(--pse-alert);
	--tone-wash: var(--pse-alert-soft);
}

.pse-cvp-status-head {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 14px;
	border-radius: 13px;
	background-color: var(--tone-wash);
}

.pse-cvp-status-dot {
	flex: none;
	width: 14px;
	height: 14px;
	border-radius: 50%;
	background-color: var(--tone);
	box-shadow: 0 0 0 4px #ffffff;
}

.pse-cvp-status-titles {
	display: flex;
	flex-direction: column;
	min-width: 0;
}

.pse-cvp-status-kicker {
	font-size: 11px;
	font-weight: 650;
	letter-spacing: 0.07em;
	text-transform: uppercase;
	color: var(--pse-ink-soft);
}

.pse-cvp-status-machine {
	font-size: 19px;
	font-weight: 700;
	line-height: 1.25;
	color: var(--pse-ink);
}

.pse-cvp-status-note {
	margin: 12px 0 0;
	font-size: 13px;
	line-height: 1.45;
	color: var(--pse-alert-ink);
}

.pse-cvp-status-rows {
	display: grid;
	grid-template-columns: auto 1fr;
	gap: 9px 14px;
	margin: 16px 0 0;
	font-size: 13.5px;
}

.pse-cvp-status-rows dt {
	font-weight: 500;
	color: var(--pse-ink-soft);
}

.pse-cvp-status-rows dd {
	margin: 0;
	font-weight: 600;
	text-align: right;
	color: var(--pse-ink);
}

.pse-cvp-status-rows dd.is-wait {
	color: var(--pse-attention-ink);
}

.pse-cvp-status-rows dd.is-bad {
	color: var(--pse-alert-ink);
}

.pse-cvp-status-foot {
	display: flex;
	justify-content: space-between;
	gap: 10px;
	margin-top: 16px;
	padding-top: 12px;
	border-top: 1px solid var(--pse-line);
	font-size: 11.5px;
	color: var(--pse-ink-faint);
}
</style>
