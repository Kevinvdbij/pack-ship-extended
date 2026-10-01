<script setup lang="ts">
import { TransitionGroup } from "vue";
import { dismissToast, pauseToast, resumeToast, toasts } from "../toastStore.ts";

// The notices themselves, as a column in the top right corner of the window.
//
// The top, because the bottom is taken: the footer band is where this
// extension keeps its controls, and a notice over the switch that turns
// automatic handling off is a notice in the way. The right, because every page
// here is read from the left.
//
// Each one is a card of the kind the rest of the extension is built from, with
// a mark that says how it went. The mark carries the colour and the card stays
// white: a failure is picked out without the corner of the screen turning red.
</script>

<template>
	<!-- Polite, so a screen reader finishes what it was saying. A failure is the
	     exception, and is marked as one on its own card. -->
	<TransitionGroup tag="div" name="pse-toast" class="pse-toasts" aria-live="polite">
		<div v-for="entry in toasts" :key="entry.id" class="pse-toast" :class="`is-${entry.kind}`"
			:role="entry.kind == 'error' ? 'alert' : 'status'" @mouseenter="pauseToast(entry.id)"
			@mouseleave="resumeToast(entry.id)">
			<span class="pse-toast-mark" aria-hidden="true">
				<span v-if="entry.kind == 'pending'" class="pse-toast-spinner"></span>

				<svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
					stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
					<path v-if="entry.kind == 'success'" d="M5 12.5l4.5 4.5L19 7.5" />
					<path v-else-if="entry.kind == 'error'" d="M12 6.5v7M12 17.4v.1" />
					<path v-else d="M12 11v6.5M12 6.6v.1" />
				</svg>
			</span>

			<p class="pse-toast-text">{{ entry.message }}</p>

			<button type="button" class="pse-toast-close" aria-label="Melding sluiten"
				@click="dismissToast(entry.id)">
				<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
					stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
					<path d="M6 6l12 12M18 6L6 18" />
				</svg>
			</button>

			<!-- How long it has left, for the ones that are on a clock. Drawn by
			     an animation of the same length as the timer rather than driven
			     by it: it is a hint, and nothing depends on the two agreeing to
			     the millisecond. -->
			<span v-if="entry.kind != 'pending'" :key="entry.kind" class="pse-toast-clock"
				aria-hidden="true"></span>
		</div>
	</TransitionGroup>
</template>

<style scoped>
/* Above everything, the portal's busy scrim (1990) included: a notice is most
   often about work that is still holding that scrim up. The column itself takes
   no clicks -- only the cards in it do -- so the corner of the page under it
   stays usable. */
.pse-toasts {
	position: fixed;
	/* Clear of the window's own buttons where the installed app draws them over
	   the page; nothing at all in a tab. */
	top: calc(env(titlebar-area-height, 0px) + 18px);
	right: 18px;
	z-index: 2100;
	display: flex;
	flex-direction: column;
	gap: 10px;
	width: 360px;
	max-width: calc(100vw - 36px);
	pointer-events: none;
}

.pse-toast {
	--pse-toast-accent: var(--pse-brand-ink);
	--pse-toast-soft: var(--pse-brand-soft);
	--pse-toast-life: 5s;

	position: relative;
	box-sizing: border-box;
	display: flex;
	align-items: flex-start;
	gap: 12px;
	width: 100%;
	padding: 13px 12px 14px 14px;
	overflow: hidden;
	border: 1px solid var(--pse-line);
	border-radius: 14px;
	background-color: #ffffff;
	box-shadow: 0 1px 2px rgba(20, 48, 33, 0.06), 0 18px 40px -22px rgba(11, 26, 18, 0.5);
	/* The portal wraps its pages in `.container-fluid.text-center`. */
	text-align: left;
	color: var(--pse-ink);
	pointer-events: auto;
}

.pse-toast.is-success {
	--pse-toast-life: 4s;
}

.pse-toast.is-error {
	--pse-toast-accent: var(--pse-alert);
	--pse-toast-soft: var(--pse-alert-soft);
	--pse-toast-life: 8s;
}

.pse-toast.is-info,
.pse-toast.is-pending {
	--pse-toast-accent: var(--pse-ink-soft);
	--pse-toast-soft: var(--pse-well);
}

.pse-toast-mark {
	display: flex;
	align-items: center;
	justify-content: center;
	flex: none;
	width: 28px;
	height: 28px;
	border-radius: 9px;
	background-color: var(--pse-toast-soft);
	color: var(--pse-toast-accent);
}

/* The same ring every other wait in the extension draws. */
.pse-toast-spinner {
	box-sizing: border-box;
	width: 16px;
	height: 16px;
	border: 2.5px solid var(--pse-brand-ring);
	border-top-color: var(--pse-brand);
	border-radius: 50%;
	animation: pse-toast-spin 0.7s linear infinite;
}

@keyframes pse-toast-spin {
	to {
		transform: rotate(360deg);
	}
}

/* Held down so a single line sits against the middle of the mark and a longer
   message starts level with it. Wraps anywhere it has to: a barcode or an order
   number is one long word. */
.pse-toast-text {
	flex: 1;
	min-width: 0;
	margin: 0;
	padding-top: 4px;
	font-size: 13.5px;
	font-weight: 550;
	line-height: 1.45;
	overflow-wrap: anywhere;
}

.pse-toast-close {
	display: flex;
	align-items: center;
	justify-content: center;
	flex: none;
	width: 26px;
	height: 26px;
	margin-top: 1px;
	padding: 0;
	border: 0;
	border-radius: 8px;
	background-color: transparent;
	color: var(--pse-ink-faint);
	cursor: pointer;
	transition: background-color 0.15s ease, color 0.15s ease;
}

.pse-toast-close:hover {
	background-color: var(--pse-well);
	color: var(--pse-ink);
}

.pse-toast-close:focus {
	outline: none;
}

.pse-toast-close:focus-visible {
	outline: none;
	box-shadow: 0 0 0 3px var(--pse-brand-ring);
}

/* A hairline along the bottom that runs out with the notice's time, and stops
   while the pointer is holding the notice open -- which also restarts it, the
   way the timer itself is restarted. */
.pse-toast-clock {
	position: absolute;
	left: 0;
	bottom: 0;
	width: 100%;
	height: 3px;
	background-color: var(--pse-toast-accent);
	opacity: 0.45;
	transform-origin: left;
	animation: pse-toast-clock var(--pse-toast-life) linear forwards;
}

.pse-toast:hover .pse-toast-clock {
	animation: none;
}

@keyframes pse-toast-clock {
	to {
		transform: scaleX(0);
	}
}

/* In from the edge it sits against, out the same way, and the cards under one
   that leaves close the gap rather than jumping it. */
.pse-toast-enter-active,
.pse-toast-leave-active,
.pse-toast-move {
	transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1);
}

.pse-toast-enter-from,
.pse-toast-leave-to {
	opacity: 0;
	transform: translateX(24px);
}

/* Out of the column while it leaves, so the ones below can move up under it. */
.pse-toast-leave-active {
	position: absolute;
}

@media (prefers-reduced-motion: reduce) {
	.pse-toast-enter-active,
	.pse-toast-leave-active,
	.pse-toast-move {
		transition: opacity 0.2s ease;
	}

	.pse-toast-enter-from,
	.pse-toast-leave-to {
		transform: none;
	}

	.pse-toast-spinner {
		animation-duration: 1.6s;
	}

	.pse-toast-clock {
		display: none;
	}
}

@media (max-width: 640px) {
	.pse-toasts {
		top: 12px;
		right: 12px;
		max-width: calc(100vw - 24px);
	}
}
</style>
