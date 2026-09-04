<script setup lang="ts">
import { computed } from "vue";

// Mass complete: opening a run of singleline reservations in background tabs and
// letting each one finish itself.
//
// It is the one thing in the picker that does work rather than showing it, so it
// is the one thing given a panel of its own, above the list it acts on. The list
// underneath is where the run is actually watched -- every row carries its own
// state -- and this holds what the whole run is doing: how many, how far, and
// how it ended.
//
// Three states, and the same panel in all three. What changes is the right-hand
// side: a number to set and a button to press before it starts, a count while it
// runs, and a verdict when it is over. Nothing appears or disappears above that,
// so starting a run does not move the list under the cursor.
const props = defineProps<{
	// How many singleline reservations there are in total. The ceiling on what
	// can be asked for, alongside `max`.
	total: number;
	max: number;
	amount: number;
	started: boolean;
	// Of the reservations in the run. Everything not counted here is still
	// waiting for a tab.
	finished: number;
	failed: number;
}>();

const emit = defineEmits<{ "update:amount": [value: number]; start: [] }>();

const settled = computed(() => props.finished + props.failed);

const done = computed(() => props.started && settled.value >= props.amount);

// Nought until the run starts, so the bar is not drawn part-full before anything
// has happened.
const progress = computed(() => props.started && props.amount > 0
	? Math.round((settled.value / props.amount) * 100)
	: 0);

// The count is clamped by whoever owns it -- the same clamp is applied when the
// field is left, so a typed number is corrected on the way out rather than being
// fought character by character while it is being typed.
function step(by: number) {
	emit("update:amount", props.amount + by);
}
</script>

<template>
	<section class="pse-mc" :class="{ 'is-running': started && !done, 'is-done': done }">
		<div class="pse-mc-head">
			<span class="pse-mc-icon" aria-hidden="true">
				<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2"
					stroke-linecap="round" stroke-linejoin="round">
					<path d="M4 7h16M4 12h16M4 17h9" />
					<path d="M15.5 18.5l2 2 4-4.5" />
				</svg>
			</span>

			<div class="pse-mc-titles">
				<h3 class="pse-mc-title">Massa voltooien</h3>

				<!-- One line that says what will happen, what is happening, or
				     what happened. It is the same sentence slot throughout, so
				     the panel does not change height between states. -->
				<p class="pse-mc-subtitle" v-if="!started">
					Opent {{ amount }} van de {{ total }} reserveringen in de achtergrond en rondt ze af.
				</p>
				<p class="pse-mc-subtitle" v-else-if="!done">
					{{ settled }} van {{ amount }} afgerond — laat dit scherm openstaan.
				</p>
				<p class="pse-mc-subtitle" v-else-if="failed > 0">
					{{ finished }} afgerond, {{ failed }} mislukt. Mislukte reserveringen staan hieronder.
				</p>
				<p class="pse-mc-subtitle" v-else>
					Alle {{ finished }} reserveringen zijn afgerond.
				</p>
			</div>

			<!-- Before the run: how many, and the one button that starts it. -->
			<div class="pse-mc-controls" v-if="!started">
				<div class="pse-mc-stepper">
					<button type="button" class="pse-mc-step" aria-label="Eén minder"
						:disabled="amount <= 2" @click="step(-1)">−</button>

					<input type="number" class="pse-mc-amount" :value="amount" inputmode="numeric"
						aria-label="Aantal reserveringen"
						@input="emit('update:amount', Number(($event.target as HTMLInputElement).value))"
						@focusout="emit('update:amount', amount)" />

					<button type="button" class="pse-mc-step" aria-label="Eén meer"
						:disabled="amount >= Math.min(max, total)" @click="step(1)">+</button>
				</div>

				<button type="button" class="pse-dialog-btn pse-mc-start" @click="emit('start')">
					Start voltooien
				</button>
			</div>

			<!-- During and after: the same corner, holding the count instead of
			     the controls that produced it. -->
			<div class="pse-mc-tally" v-else>
				<span class="pse-mc-tally-count">{{ settled }}<span class="pse-mc-tally-of">/{{ amount }}</span></span>
				<span class="pse-mc-tally-label">{{ done ? "klaar" : "afgerond" }}</span>
			</div>
		</div>

		<!-- The bar is the run, so it is only drawn once there is one. It is a
		     track and a fill rather than a stripe per reservation: the rows below
		     are the per-reservation view, and this is the answer to "how much
		     longer". -->
		<div class="pse-mc-progress" v-if="started">
			<div class="pse-mc-progress-fill" :style="{ width: `${progress}%` }"></div>
		</div>
	</section>
</template>

<style scoped>
/* The panel sits directly on top of the list it acts on and shares its width, so
   it is tinted rather than outlined -- an outlined box above an outlined list
   reads as two lists. */
.pse-mc {
	margin-bottom: 12px;
	padding: 15px 17px;
	border: 1px solid var(--pse-line);
	border-radius: 14px;
	background-color: var(--pse-well);
	transition: border-color 0.2s ease, background-color 0.2s ease;
}

/* A run in progress is the only thing on the screen that is moving, and the
   panel is what says so. */
.pse-mc.is-running {
	border-color: rgba(226, 160, 46, 0.4);
	background-color: rgba(226, 160, 46, 0.07);
}

.pse-mc.is-done {
	border-color: var(--pse-brand);
	background-color: var(--pse-brand-soft);
}

.pse-mc-head {
	display: flex;
	align-items: center;
	gap: 13px;
}

.pse-mc-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	flex: none;
	width: 36px;
	height: 36px;
	border-radius: 11px;
	background-color: #ffffff;
	border: 1px solid var(--pse-line);
	color: var(--pse-brand-ink);
}

.pse-mc.is-running .pse-mc-icon {
	border-color: rgba(226, 160, 46, 0.4);
	color: #8a5a10;
}

.pse-mc-titles {
	/* Takes the room, so the controls are pushed to the far end and stay there
	   whatever the sentence says. */
	flex: 1;
	min-width: 0;
}

.pse-mc-title {
	margin: 0;
	font-size: 14.5px;
	font-weight: 650;
	line-height: 1.3;
	color: var(--pse-ink);
}

.pse-mc-subtitle {
	margin: 3px 0 0;
	font-size: 12.5px;
	line-height: 1.4;
	color: var(--pse-ink-soft);
}

.pse-mc-controls {
	display: flex;
	align-items: center;
	gap: 10px;
	flex: none;
}

/* ---- How many ---- *
 * One segmented control rather than a field with two buttons beside it: the
 * three parts do one job, and the run is nearly always started at the number it
 * was offered or one or two either side of it.
 */
.pse-mc-stepper {
	display: flex;
	align-items: center;
	height: 40px;
	overflow: hidden;
	border: 1px solid var(--pse-line);
	border-radius: 11px;
	background-color: #ffffff;
}

.pse-mc-step {
	width: 34px;
	height: 100%;
	padding: 0;
	border: 0;
	background-color: transparent;
	font: inherit;
	font-size: 17px;
	line-height: 1;
	color: var(--pse-ink-soft);
	cursor: pointer;
	transition: background-color 0.15s ease, color 0.15s ease;
}

.pse-mc-step:hover:not(:disabled) {
	background-color: var(--pse-brand-soft);
	color: var(--pse-brand-ink);
}

.pse-mc-step:disabled {
	color: var(--pse-line);
	cursor: not-allowed;
}

.pse-mc-step:focus {
	outline: none;
}

.pse-mc-step:focus-visible {
	outline: none;
	box-shadow: inset 0 0 0 2px var(--pse-brand-ring);
}

.pse-mc-amount {
	width: 46px;
	height: 100%;
	padding: 0;
	border: 0;
	border-left: 1px solid var(--pse-line);
	border-right: 1px solid var(--pse-line);
	background-color: transparent;
	font: inherit;
	font-size: 15px;
	font-weight: 650;
	font-variant-numeric: tabular-nums;
	text-align: center;
	color: var(--pse-ink);
}

.pse-mc-amount:focus {
	outline: none;
	background-color: var(--pse-brand-soft);
}

/* The browser's spinners are a second pair of steppers inside a control that
   already has one, at a size nobody hits on the first try. */
.pse-mc-amount::-webkit-inner-spin-button,
.pse-mc-amount::-webkit-outer-spin-button {
	appearance: none;
	-webkit-appearance: none;
	margin: 0;
}

.pse-mc-start {
	flex: none;
}

/* ---- The count, once it is running ---- */
.pse-mc-tally {
	display: flex;
	align-items: baseline;
	gap: 6px;
	flex: none;
}

.pse-mc-tally-count {
	font-size: 20px;
	font-weight: 700;
	font-variant-numeric: tabular-nums;
	line-height: 1;
	color: var(--pse-ink);
}

.pse-mc-tally-of {
	font-size: 14px;
	font-weight: 650;
	color: var(--pse-ink-faint);
}

.pse-mc-tally-label {
	font-size: 12px;
	color: var(--pse-ink-soft);
}

.pse-mc-progress {
	height: 6px;
	margin-top: 13px;
	overflow: hidden;
	border-radius: 999px;
	background-color: rgba(20, 43, 34, 0.08);
}

.pse-mc-progress-fill {
	height: 100%;
	border-radius: 999px;
	background-color: var(--pse-brand);
	/* Each reservation lands as one step, so the fill is eased between them
	   rather than jumping -- which is also what says the run is still alive when
	   two tabs happen to finish a while apart. */
	transition: width 0.4s cubic-bezier(0.2, 0.9, 0.3, 1);
}

/* The controls are the first thing to run out of room, and they are the widest
   thing on the row. Given a line of their own rather than being squeezed. */
@media (max-width: 720px) {
	.pse-mc-head {
		flex-wrap: wrap;
	}

	.pse-mc-titles {
		flex-basis: 100%;
		order: -1;
	}

	.pse-mc-controls,
	.pse-mc-tally {
		margin-left: auto;
	}
}
</style>
