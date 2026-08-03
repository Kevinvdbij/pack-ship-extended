<script setup lang="ts">
import ShopwareLogoIconUrl from "../../assets/shopware.svg";
import { ShopwareOrderEntry } from "../../shopware.ts";

// The order data is loaded after the modal opens, so it stays undefined for the
// first moment and the box shows a loader instead.
defineProps<{
	orderData?: ShopwareOrderEntry;
	enabled: boolean;
}>();

defineEmits<{ save: [] }>();
</script>

<template>
	<div class="card-body">
		<div class="reservation-rows">
			<div class="row nfTableHeader sw-header">
				<img :src="ShopwareLogoIconUrl" class="sw-logo" />
				<h4 class="sw-title">Shopware Notitie</h4>
			</div>
			<div class="reservation-rows">
				<div class="row nfTableRow sw-body">
					<div class="col">
						<div v-show="!enabled || !orderData" class="loader modal-loader"></div>
						<Transition>
							<textarea class="sw-textarea" v-if="orderData" v-model="orderData.customerComment"
								:disabled="!enabled"
								:placeholder="enabled ? 'Nog geen notitie...' : ''"></textarea>
						</Transition>
						<textarea class="sw-textarea" v-if="!orderData" disabled></textarea>
					</div>
					<div class="col-1.5">
						<button class="sw-btn" @click="$emit('save')" :disabled="!enabled">Opslaan</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.sw-btn {
	width: 100%;
}

.sw-body {
	padding-right: 20px;
}

.sw-textarea {
	min-height: 34px;
	font-size: 18px;
}

.sw-title {
	line-height: 22px;
}

.modal-loader {
	height: 20px;
	margin-top: -20px;
	top: 30px;
	justify-self: center;
	position: relative;
}
</style>
