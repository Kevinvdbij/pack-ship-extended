<script setup lang="ts">
// Whatever the portal has to say about the last search, said in our own words
// and on our own surface.
//
// The portal answers a search with a Bootstrap alert -- yellow, full width,
// English -- dropped above its form. On a screen that is otherwise ours that
// reads as a piece of another site, so the alert is kept in the document (the
// portal's own response handler writes into it) and rendered again here as a
// card of the same family as the search card below it.
defineProps<{
	title: string;
	detail?: string;
	tone: "notice" | "alert";
}>();

defineEmits<{ dismiss: [] }>();
</script>

<template>
	<div class="pse-notice" :class="`is-${tone}`" role="status">
		<span class="pse-notice-icon" aria-hidden="true">
			<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
				stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="8.5" />
				<path d="M12 8v5" />
				<path d="M12 16.2v.1" />
			</svg>
		</span>

		<span class="pse-notice-text">
			<span class="pse-notice-title">{{ title }}</span>
			<span class="pse-notice-detail" v-if="detail">{{ detail }}</span>
		</span>

		<button type="button" class="pse-notice-close" aria-label="Melding sluiten" @click="$emit('dismiss')">
			<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"
				stroke-linecap="round">
				<path d="M6 6l12 12M18 6L6 18" />
			</svg>
		</button>
	</div>
</template>

<style scoped>
/* The same surface as the search card underneath: white, the same border, the
   same radius one step down. The tone is carried by the icon chip and a hairline
   at the start rather than by washing the whole block, so the message stays as
   readable as the rest of the screen. */
.pse-notice {
	display: flex;
	align-items: flex-start;
	gap: 12px;
	padding: 14px 16px;
	border: 1px solid var(--pse-line);
	border-radius: 14px;
	background-color: #ffffff;
	box-shadow: 0 1px 2px rgba(20, 48, 33, 0.04), 0 14px 30px -26px rgba(20, 48, 33, 0.45);
	text-align: left;
}

.pse-notice-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	flex: none;
	width: 32px;
	height: 32px;
	border-radius: 10px;
}

.pse-notice.is-notice .pse-notice-icon {
	background-color: var(--pse-attention-soft);
	color: var(--pse-attention-ink);
}

.pse-notice.is-alert .pse-notice-icon {
	background-color: var(--pse-alert-soft);
	color: var(--pse-alert-ink);
}

.pse-notice-text {
	display: block;
	min-width: 0;
	/* The icon is 32px and the first line of text is not, so the two are settled
	   against each other rather than both against the top of the box. */
	padding-top: 4px;
}

.pse-notice-title {
	display: block;
	font-size: 14px;
	font-weight: 650;
	line-height: 1.35;
	color: var(--pse-ink);
}

/* The line that says what to do about it. */
.pse-notice-detail {
	display: block;
	margin-top: 2px;
	font-size: 12.5px;
	line-height: 1.45;
	color: var(--pse-ink-soft);
}

.pse-notice-close {
	flex: none;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	margin-left: auto;
	padding: 0;
	border: 0;
	border-radius: 8px;
	background: none;
	color: var(--pse-ink-faint);
	cursor: pointer;
	transition: background-color 0.15s ease, color 0.15s ease;
}

.pse-notice-close:hover {
	background-color: var(--pse-well);
	color: var(--pse-ink);
}

.pse-notice-close:focus {
	outline: none;
}

.pse-notice-close:focus-visible {
	outline: none;
	box-shadow: 0 0 0 3px var(--pse-brand-ring);
}
</style>
