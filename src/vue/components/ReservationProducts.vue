<script setup lang="ts">
import { ref, Transition } from "vue";
import imageIconUrl from "../../assets/image.svg";
import { ProductDetails } from "../../interfaces.ts";
import * as Shopware from "../../shopware.ts";
import ImageModal from "./ImageModal.vue";

// What the reservation is for, as a plain list.
//
// The parcels page has its own version of this table because there it is the
// work: it carries what has been scanned, what is still missing, and the button
// that adds one. Here nothing is being verified -- the reservation was packed
// already -- so the same facts are shown without any of that, as reference for
// deciding what goes in the parcel being added.
//
// The card, the table and the row action are the shared rules in
// `src/style.css`; only the shape of this particular table is below.
defineProps<{ products: ProductDetails[] }>();

const showImageModal = ref(false);
const imageModalUrl = ref("");

// Worth keeping even here. Checking a photo against what is in your hand is the
// one thing on this page that does not depend on the portal, and it is the
// reason to look at this list at all.
async function onClickShowImage(productEAN: string) {
	imageModalUrl.value = await Shopware.getImageUri(productEAN);
	showImageModal.value = true;
}
</script>

<template>
	<Teleport to="body">
		<Transition name="modal">
			<ImageModal v-if="showImageModal && imageModalUrl" :image-url="imageModalUrl"
				@close="showImageModal = false" />
		</Transition>
	</Teleport>

	<section class="pse-products">
		<header class="pse-products-head">
			<h2 class="pse-products-title">Producten</h2>
			<span class="pse-products-note">Uit de eerdere verwerking</span>
		</header>

		<div class="pse-products-card">
			<table class="pse-table">
				<thead>
					<tr>
						<th>Omschrijving</th>
						<th>Hoofd barcode</th>
						<th>Aantal</th>
						<th class="pse-table-right">Actie</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="product in products" :key="product.itemId">
						<td class="pse-cell-description">{{ product.description }}</td>
						<td class="pse-cell-barcode">{{ product.mainBarcode }}</td>
						<td class="pse-cell-quantity">{{ product.requiredQuantity }}</td>
						<td class="pse-table-right">
							<div class="pse-actions">
								<button type="button" class="pse-action pse-action-quiet"
									title="Afbeelding tonen" @click="onClickShowImage(product.mainBarcode)">
									<img :src="imageIconUrl" width="18" height="18" alt="Afbeelding" />
								</button>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>
</template>

<style scoped>
.pse-products {
	box-sizing: border-box;
	margin-bottom: 26px;
	color: var(--pse-ink);
	/* The portal wraps the page in `.container-fluid.text-center`. */
	text-align: left;
}

.pse-products :deep(*) {
	box-sizing: border-box;
}

/* Says where the list came from. It is read out of what this workstation cached
   while packing the reservation rather than out of the page, so it can be a
   little behind what the order says now -- which is worth admitting on a screen
   somebody is using to decide what to put in a box. */
.pse-products-note {
	flex: none;
	font-size: 12px;
	color: var(--pse-ink-faint);
}

.pse-cell-quantity {
	font-variant-numeric: tabular-nums;
	font-weight: 600;
	white-space: nowrap;
}
</style>
