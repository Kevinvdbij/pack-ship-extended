<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { CompletedReservation } from "../../interfaces.ts";

// The reservations this workplace has finished, listed beside the search.
//
// The two shortcuts under the card only ever point at the last one, which is
// the right answer for as long as the last one is what is being asked about. It
// stops being the right answer the moment the question is "which reservation
// was that customer's again" -- and the answer to that used to be a walk back
// through the portal's own overview.
//
// So this is a log rather than a control panel: it says what was finished and
// when, and one click takes any of them into the add-parcels flow, which is the
// only thing left to do with a reservation that is already out.
const props = defineProps<{
	entries: CompletedReservation[];
}>();

defineEmits<{
	open: [reservationNumber: string];
	clear: [];
}>();

// "Zojuist" has to stop being true on its own. The panel is looked at on a page
// that can sit open for a whole shift, so the times are re-read on a timer
// rather than at mount -- a minute is finer than any of the words below need.
const now = ref(Date.now());
let tick: number | undefined;

onMounted(() => {
	tick = window.setInterval(() => now.value = Date.now(), 60_000);
});

onBeforeUnmount(() => window.clearInterval(tick));

const failedCount = computed(() => props.entries.filter((entry) => entry.failed).length);

// How long ago, in the words the floor uses. Anything past the hour is given
// the clock time instead: "23 uur geleden" is a sum to do, and by then the
// question being asked is which time it was.
function ago(completedAt: number) {
	const minutes = Math.floor((now.value - completedAt) / 60_000);

	if (minutes < 1) {
		return "Zojuist";
	}

	if (minutes < 60) {
		return `${minutes} min geleden`;
	}

	const completed = new Date(completedAt);
	const time = completed.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });

	// A day older and the time alone is misleading, so the date is said as well.
	return isToday(completed)
		? time
		: `${completed.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })} ${time}`;
}

function isToday(date: Date) {
	const today = new Date();

	return date.getDate() == today.getDate()
		&& date.getMonth() == today.getMonth()
		&& date.getFullYear() == today.getFullYear();
}

// Written out, because the panel is read at a glance and "1 pakketten" is read
// twice.
function parcelLabel(count: number) {
	return count == 1 ? "1 pakket" : `${count} pakketten`;
}
</script>

<template>
	<aside class="pse-history">
		<header class="pse-history-head">
			<span class="pse-history-icon" aria-hidden="true">
				<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
					stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="8.5" />
					<path d="M12 7.5V12l3 2" />
				</svg>
			</span>

			<span class="pse-history-text">
				<h2 class="pse-history-title">Afgerond</h2>
				<p class="pse-history-subtitle">
					{{ entries.length }} {{ entries.length == 1 ? "reservering" : "reserveringen" }}<template
						v-if="failedCount">, {{ failedCount }} geweigerd</template>
				</p>
			</span>

			<button type="button" class="pse-history-clear" @click="$emit('clear')">Wissen</button>
		</header>

		<ol class="pse-history-list">
			<li v-for="entry in entries" :key="entry.number">
				<button type="button" class="pse-history-row" :class="{ 'pse-history-row-failed': entry.failed }"
					:title="`Pakket toevoegen aan reservering ${entry.number}`"
					@click="$emit('open', entry.number)">
					<span class="pse-history-marker" aria-hidden="true"></span>

					<span class="pse-history-body">
						<span class="pse-history-number">{{ entry.number }}</span>
						<span class="pse-history-meta">
							<span v-if="entry.failed" class="pse-history-badge">Geweigerd</span>
							<span v-else>{{ parcelLabel(entry.parcels) }}</span>
							<span class="pse-history-dot" aria-hidden="true">·</span>
							<span>{{ ago(entry.completedAt) }}</span>
						</span>
					</span>

					<svg class="pse-history-add" viewBox="0 0 24 24" width="16" height="16" fill="none"
						stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
						aria-hidden="true">
						<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
						<path d="M4 7.5l8 4.5 8-4.5" />
						<path d="M12 12v9" />
					</svg>
				</button>
			</li>
		</ol>
	</aside>
</template>

<style scoped>
/* Its own surface rather than a third cell of the search card: this is not a
   form, and giving it the card's white would have it read as one. A quieter
   well beside the card says "reference" without needing a word for it. */
.pse-history {
	display: flex;
	flex-direction: column;
	min-width: 0;
	/* A grid item stretches to its row by default, which on a short log left the
	   well running on past the last entry. It is as tall as what is in it. */
	align-self: start;
	/* Tall enough to be a list, short enough that the card beside it is still
	   what the eye lands on. Past that it scrolls. */
	max-height: 420px;
	padding: 18px 8px 8px 18px;
	border: 1px solid var(--pse-line);
	border-radius: 20px;
	background-color: var(--pse-well);
}

.pse-history-head {
	display: flex;
	/* The count line wraps once the log has a refused reservation in it, and the
	   clear button reads as adrift when it centres against two lines. Both are
	   held to the top instead, where they line up with the heading. */
	align-items: flex-start;
	gap: 11px;
	/* The list gives its right-hand padding to the scrollbar; the header keeps
	   it, so the two still end on the same line. */
	padding-right: 10px;
	margin-bottom: 14px;
}

.pse-history-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	flex: none;
	width: 32px;
	height: 32px;
	border-radius: 10px;
	background-color: var(--pse-brand-soft);
	color: var(--pse-brand-ink);
}

.pse-history-text {
	min-width: 0;
	margin-right: auto;
}

.pse-history-title {
	margin: 0;
	font-size: 15px;
	font-weight: 650;
	line-height: 1.3;
	color: var(--pse-ink);
}

.pse-history-subtitle {
	margin: 1px 0 0;
	font-size: 12px;
	line-height: 1.4;
	color: var(--pse-ink-soft);
}

/* Deliberately the plainest thing on the panel. It throws the list away, and
   nothing here is worth a button that invites a press. */
.pse-history-clear {
	flex: none;
	margin: 0;
	padding: 5px 9px;
	border: 0;
	border-radius: 8px;
	background: none;
	font: inherit;
	font-size: 12px;
	font-weight: 600;
	color: var(--pse-ink-faint);
	cursor: pointer;
	transition: background-color 0.15s ease, color 0.15s ease;
}

.pse-history-clear:hover {
	background-color: rgba(20, 48, 33, 0.05);
	color: var(--pse-ink-soft);
}

.pse-history-clear:focus {
	outline: none;
}

.pse-history-clear:focus-visible {
	outline: none;
	box-shadow: 0 0 0 3px var(--pse-brand-ring);
}

.pse-history-list {
	display: flex;
	flex-direction: column;
	gap: 6px;
	min-height: 0;
	margin: 0;
	padding: 0 8px 10px 0;
	list-style: none;
	overflow-y: auto;
	/* The list runs to the bottom edge of the panel and would otherwise end on a
	   hard cut. Fading the last few pixels says there is more below without
	   spending a row on saying so. */
	mask-image: linear-gradient(to bottom, #000 calc(100% - 18px), transparent);
	scrollbar-width: thin;
	scrollbar-color: var(--pse-line) transparent;
}

.pse-history-row {
	display: flex;
	align-items: center;
	gap: 11px;
	width: 100%;
	margin: 0;
	padding: 9px 11px;
	border: 1px solid transparent;
	border-radius: 12px;
	background-color: #ffffff;
	font: inherit;
	text-align: left;
	color: var(--pse-ink);
	cursor: pointer;
	transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.pse-history-row:hover {
	border-color: var(--pse-brand);
	box-shadow: 0 6px 16px -12px rgba(20, 48, 33, 0.5);
	transform: translateY(-1px);
}

.pse-history-row:focus {
	outline: none;
}

.pse-history-row:focus-visible {
	outline: none;
	border-color: var(--pse-brand);
	box-shadow: 0 0 0 3px var(--pse-brand-ring);
}

/* A stripe rather than an icon per row: forty of the same glyph is a texture,
   and the only thing worth telling apart down the column is which ones did not
   go out. */
.pse-history-marker {
	flex: none;
	width: 3px;
	align-self: stretch;
	border-radius: 2px;
	background-color: var(--pse-brand);
}

.pse-history-row-failed .pse-history-marker {
	background-color: var(--pse-alert);
}

.pse-history-body {
	display: flex;
	flex-direction: column;
	gap: 2px;
	min-width: 0;
	margin-right: auto;
}

/* Tabular, so the numbers line up down the column and a wrong digit shows as a
   wrong shape rather than having to be read. */
.pse-history-number {
	font-size: 13.5px;
	font-weight: 600;
	line-height: 1.3;
	font-variant-numeric: tabular-nums;
}

.pse-history-meta {
	display: flex;
	align-items: center;
	gap: 5px;
	font-size: 11.5px;
	line-height: 1.4;
	color: var(--pse-ink-soft);
}

.pse-history-dot {
	color: var(--pse-ink-faint);
}

.pse-history-badge {
	padding: 1px 6px;
	border-radius: 999px;
	background-color: var(--pse-alert-soft);
	font-size: 10.5px;
	font-weight: 650;
	letter-spacing: 0.01em;
	color: var(--pse-alert-ink);
}

/* The row's whole job is one click, and it is the same job as the panel beside
   it -- so it wears that panel's icon, kept faint until the row is pointed at. */
.pse-history-add {
	flex: none;
	color: var(--pse-ink-faint);
	opacity: 0.7;
	transition: color 0.15s ease, opacity 0.15s ease;
}

.pse-history-row:hover .pse-history-add {
	color: var(--pse-brand-ink);
	opacity: 1;
}

/* Stacked under the card, the list is no longer holding a column open, and a
   fixed height there leaves it either cramped or half empty. */
@media (max-width: 1120px) {
	.pse-history {
		max-height: 300px;
	}
}
</style>
