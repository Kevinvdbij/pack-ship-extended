<script setup lang="ts">
// One half of the search card: an icon, a heading and whatever fields the page
// puts in it. Both halves of the card are this component, so the two forms read
// as siblings rather than as two blocks that happen to sit side by side.
defineProps<{
	title: string;
	subtitle: string;
}>();
</script>

<template>
	<section class="pse-panel">
		<header class="pse-panel-head">
			<span class="pse-panel-icon" aria-hidden="true">
				<slot name="icon" />
			</span>
			<span class="pse-panel-text">
				<h2 class="pse-panel-title">{{ title }}</h2>
				<p class="pse-panel-subtitle">{{ subtitle }}</p>
			</span>
		</header>

		<slot />
	</section>
</template>

<style scoped>
.pse-panel {
	display: flex;
	flex-direction: column;
	/* The two panels hold a different number of fields, so their buttons would
	   otherwise sit at different heights. The gap is the same everywhere and the
	   page pushes the shorter panel's button down to match. */
	gap: 18px;
	min-width: 0;
}

.pse-panel-head {
	display: flex;
	align-items: center;
	gap: 12px;
}

/* A tinted chip rather than a bare glyph: at this size a loose icon reads as a
   smudge beside the heading, while a chip is deliberate and gives the heading
   something to sit against. */
.pse-panel-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	flex: none;
	width: 38px;
	height: 38px;
	border-radius: 11px;
	background-color: var(--pse-brand-soft);
	color: var(--pse-brand-ink);
}

.pse-panel-text {
	min-width: 0;
}

.pse-panel-title {
	margin: 0;
	font-size: 16px;
	font-weight: 650;
	line-height: 1.3;
	color: var(--pse-ink);
}

/* The heading names the form; this line says when to reach for it. The two
	 forms look alike and pick the wrong one and the operator is several screens
	 deep before it shows, so the distinction is spelled out rather than left to
	 the headings alone. */
.pse-panel-subtitle {
	margin: 2px 0 0;
	font-size: 12.5px;
	line-height: 1.4;
	color: var(--pse-ink-soft);
}
</style>
