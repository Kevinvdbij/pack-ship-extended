<script setup lang="ts">
import logoUrl from "../../assets/kampeerhal-roden.svg";

// The band at the top of every page. On the pages the portal gives a header to
// it replaces one, and on the login page -- which is served with a bare layout
// and no band at all -- `LoginPage.vue` renders it as the page's own. Same
// component either way, so the mark is in the same place on the screen before
// and after signing in.
//
// Replaces the portal's header band, which spent 250px of the screen on a stock
// photo of somebody folding boxes, the vendor's logo and the RetailVista
// wordmark -- none of which the operator needs while packing.
//
// What is left is the one mark that says whose counter this is, on a band a
// third of the height. The vendor is still credited in the footer, which is
// where a build number and a copyright line belong anyway.
//
// The logo is bundled rather than taken from the portal: the file the portal
// serves is the vendor's own, with this mark stacked underneath it, so using it
// would mean cropping someone else's image at fixed pixel offsets. This is the
// same mark from Kampeerhal Roden's own site, as vector, in the brand green
// their storefront theme declares.
</script>

<template>
	<header class="pse-header">
		<div class="pse-header-inner">
			<img class="pse-header-logo" :src="logoUrl" alt="Kampeerhal Roden" />
		</div>
	</header>
</template>

<style scoped>
.pse-header {
	box-sizing: border-box;
	width: 100%;
	background-color: #ffffff;
	/* The portal's wrapper carries `text-center`, which reaches in here. */
	text-align: left;
	/* The only thing separating the band from the page below it. A border rather
	   than a shadow: nothing here floats, so a shadow would be depth for its own
	   sake. */
	border-bottom: 1px solid var(--pse-line);
}

/* Held to the same width as the search card below, so the logo starts on the
   card's left edge instead of at the window's. */
.pse-header-inner {
	box-sizing: border-box;
	display: flex;
	align-items: center;
	max-width: 980px;
	margin: 0 auto;
	padding: 16px 24px;
}

.pse-header-logo {
	display: block;
	height: 34px;
	width: auto;
}

@media (max-width: 860px) {
	.pse-header-inner {
		padding: 14px 16px;
	}

	.pse-header-logo {
		height: 28px;
	}
}
</style>
