<script setup lang="ts">
defineEmits(["close"]);
defineProps<{ imageUrl?: string }>();
</script>

<template>
    <div class="modal show" id="productReservationsModal" tabindex="-1" role="dialog" data-backdrop="static"
        aria-modal="true" style="display: block;">
        <div class="modal-dialog modal-xl" role="document">
            <div class="modal-content">
                <div class="modal-body">
                    <div class="image-container">
                        <img class="product-image" :src="imageUrl" />
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-dismiss="modal"
                        @click="$emit('close')">Sluiten</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal {
	position: absolute;
	width: 100% !important;
	height: 100% !important;
	left: 0;
	top: 0;
	background: rgba(51, 51, 51, 0.7);
	z-index: 100;
	background-color: rgba(0, 0, 0, 0.5);
    overflow-y: auto;
    justify-items: center;
}

.modal-content {
    align-self: center;
    width: 600px;
}

.image-container {
    text-align: center;
}

.product-image {
    width: 500px;
    height: 500px;
    object-fit: contain;
}

.close-button {
	position: absolute;
	top: 20px;
	right: 15px;
	border: 0;
	width: 50;
	height: 50;
	background-color: transparent;
}
</style>