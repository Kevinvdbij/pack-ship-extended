<script setup lang="ts">
import ModalShell from "./ModalShell.vue";

// The product photo, opened from the action column of the product table so a
// packer can check that what is in their hand is what the line is asking for.
defineProps<{ imageUrl?: string }>();

defineEmits(["close"]);
</script>

<template>
	<ModalShell title="Productafbeelding" size="lg" @close="$emit('close')">
		<div class="pse-image">
			<img class="pse-image-photo" :src="imageUrl" alt="" />
		</div>

		<template #footer>
			<button type="button" class="pse-dialog-btn pse-dialog-btn-quiet" @click="$emit('close')">
				Sluiten
			</button>
		</template>
	</ModalShell>
</template>

<style scoped>
/* The photo comes from the webshop at whatever size and aspect it was uploaded
   at, so it is fitted into a fixed box rather than allowed to set the dialog's
   shape -- otherwise the panel jumps to a different size with every product.
 *
 * White, not the tint the other wells wear. Nearly every product photo is cut
 * out on white already, so a tinted surround did not read as a frame around the
 * picture -- it read as a green border stuck to a white square, with the join
 * landing wherever that particular image happened to end. On white the photo's
 * own background disappears into the card and the hairline is what says where
 * the picture stops. The padding is what keeps that hairline off the product. */
.pse-image {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 24px;
	border: 1px solid var(--pse-line);
	border-radius: 14px;
	background-color: #ffffff;
}

.pse-image-photo {
	display: block;
	width: 100%;
	max-width: 460px;
	height: 46vh;
	min-height: 260px;
	object-fit: contain;
}
</style>
