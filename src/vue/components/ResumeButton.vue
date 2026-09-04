<script setup lang="ts">
// A shortcut back into the reservation this workplace was last working on.
// Neither is a search, so they sit outside the card as a row of their own --
// close to hand, but clearly not a third form.
defineProps<{
	label: string;
	// The reservation the shortcut would open. Absent when there is nothing to
	// go back to, which is also when the shortcut is disabled: the number is
	// what turns "somewhere I have been" into a specific place, so a shortcut
	// that cannot name one has nothing to offer.
	reservationNumber?: string;
	disabled: boolean;
}>();

defineEmits<{ click: [] }>();
</script>

<template>
	<button type="button" class="pse-resume" :disabled="disabled" @click="$emit('click')">
		<span class="pse-resume-icon" aria-hidden="true">
			<slot name="icon" />
		</span>

		<span class="pse-resume-text">
			<span class="pse-resume-label">{{ label }}</span>
			<span class="pse-resume-number">{{ reservationNumber || "Nog geen" }}</span>
		</span>

		<svg class="pse-resume-chevron" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
			stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M9 6l6 6-6 6" />
		</svg>
	</button>
</template>

<style scoped>
.pse-resume {
	display: flex;
	align-items: center;
	gap: 13px;
	width: 100%;
	margin: 0;
	padding: 13px 16px;
	border: 1px solid var(--pse-line);
	border-radius: 14px;
	background-color: #ffffff;
	font: inherit;
	text-align: left;
	color: var(--pse-ink);
	cursor: pointer;
	transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.pse-resume:hover:not(:disabled) {
	border-color: var(--pse-brand);
	box-shadow: 0 6px 18px -12px rgba(20, 48, 33, 0.5);
	transform: translateY(-1px);
}

.pse-resume:focus {
	outline: none;
}

.pse-resume:focus-visible {
	outline: none;
	border-color: var(--pse-brand);
	box-shadow: 0 0 0 3px var(--pse-brand-ring);
}

/* Kept on the page rather than hidden when there is nothing to resume: the row
   is then the same shape every time it is looked at, and the reason the
   shortcut cannot be taken is on screen instead of the shortcut simply being
   absent. */
.pse-resume:disabled {
	background-color: var(--pse-well);
	color: var(--pse-ink-faint);
	cursor: not-allowed;
}

.pse-resume-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	flex: none;
	width: 34px;
	height: 34px;
	border-radius: 10px;
	background-color: var(--pse-brand-soft);
	color: var(--pse-brand-ink);
}

.pse-resume:disabled .pse-resume-icon {
	background-color: rgba(20, 48, 33, 0.05);
	color: var(--pse-ink-faint);
}

.pse-resume-text {
	display: flex;
	flex-direction: column;
	gap: 2px;
	min-width: 0;
	/* Pushes the chevron to the far edge. */
	margin-right: auto;
}

.pse-resume-label {
	font-size: 13px;
	font-weight: 600;
	line-height: 1.3;
}

/* The number is the part that is checked before clicking, so it is set in
   tabular figures -- the digits then line up between the two shortcuts instead
   of drifting against each other. */
.pse-resume-number {
	font-size: 12px;
	line-height: 1.3;
	color: var(--pse-ink-soft);
	font-variant-numeric: tabular-nums;
}

.pse-resume:disabled .pse-resume-number {
	color: var(--pse-ink-faint);
}

.pse-resume-chevron {
	flex: none;
	color: var(--pse-ink-faint);
	transition: transform 0.15s ease, color 0.15s ease;
}

.pse-resume:hover:not(:disabled) .pse-resume-chevron {
	color: var(--pse-brand-ink);
	transform: translateX(2px);
}
</style>
