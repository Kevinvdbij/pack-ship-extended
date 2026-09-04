<script setup lang="ts">
// A page that is on its way somewhere else. The portal's flow puts a step
// between the search and the parcels page that exists only to post a form --
// see `VerifyProductsPage.vue` -- and behind the cloak that step is a blank
// screen for as long as the round trip takes.
//
// So it gets a face. Not a spinner in the middle of nothing: the header band
// and a card in the place the parcels page's own card will be, so what follows
// reads as this screen filling in rather than as a third page arriving.
defineProps<{
	title: string;
	subtitle?: string;
}>();
</script>

<template>
	<div class="pse-loading">
		<div class="pse-loading-card">
			<span class="pse-loading-spinner" aria-hidden="true"></span>
			<div class="pse-loading-text">
				<h2 class="pse-loading-title">{{ title }}</h2>
				<p v-if="subtitle" class="pse-loading-subtitle">{{ subtitle }}</p>
			</div>
		</div>
	</div>
</template>

<style scoped>
.pse-loading {
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: calc(100vh - 200px);
	padding: 48px 24px;
	color: var(--pse-ink);
	/* The portal wraps the page in `.container-fluid.text-center`. */
	text-align: left;
}

.pse-loading-card {
	display: flex;
	align-items: center;
	gap: 16px;
	width: 100%;
	max-width: 420px;
	padding: 24px 26px;
	border: 1px solid var(--pse-line);
	border-radius: 20px;
	background-color: #ffffff;
	box-shadow: 0 1px 2px rgba(20, 48, 33, 0.04), 0 18px 40px -28px rgba(20, 48, 33, 0.45);
}

/* The same ring the search button spins and the busy overlay draws, so every
   wait in the extension looks like the same wait. */
.pse-loading-spinner {
	flex: none;
	width: 28px;
	height: 28px;
	border: 3px solid var(--pse-brand-ring);
	border-top-color: var(--pse-brand);
	border-radius: 50%;
	animation: pse-loading-spin 0.7s linear infinite;
}

@keyframes pse-loading-spin {
	to {
		transform: rotate(360deg);
	}
}

.pse-loading-text {
	min-width: 0;
}

.pse-loading-title {
	margin: 0;
	font-size: 16px;
	font-weight: 650;
	line-height: 1.3;
	color: var(--pse-ink);
}

.pse-loading-subtitle {
	margin: 3px 0 0;
	font-size: 12.5px;
	line-height: 1.4;
	color: var(--pse-ink-soft);
}

@media (prefers-reduced-motion: reduce) {
	.pse-loading-spinner {
		animation-duration: 1.6s;
	}
}

@media (max-width: 860px) {
	.pse-loading {
		padding: 32px 16px;
	}
}
</style>
