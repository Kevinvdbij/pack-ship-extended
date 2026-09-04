<script setup lang="ts">
import { PACKING_PORTAL_URL } from "../../constants.ts";

// The way out of a reservation, as a row of its own.
//
// The parcels page carries the same link beside its "Producten" heading, which
// puts it at the top right of the content column. This page has no heading of
// ours to hang it off -- everything in the column is the portal's, and the
// products list above it is only there when this workstation packed the
// reservation -- so the link gets its own row and lands in the same corner
// either way.
//
// The portal's own version of this sits at the far top left, above the whole
// layout, where it reads as page furniture rather than as the way back.
</script>

<template>
	<div class="pse-back-row">
		<a class="pse-back" :href="PACKING_PORTAL_URL">
			<span class="material-icons pse-back-icon" aria-hidden="true">chevron_left</span>
			Nieuwe zoekopdracht
		</a>
	</div>
</template>

<style scoped>
.pse-back-row {
	display: flex;
	justify-content: flex-end;
	/* The portal wraps the page in `.container-fluid.text-center`. */
	text-align: left;
	margin-bottom: 10px;
}
</style>
