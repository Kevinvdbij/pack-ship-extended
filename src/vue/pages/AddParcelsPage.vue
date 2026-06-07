<script setup lang="ts">
import { createApp, onMounted } from 'vue';
import ReservationSummary from '../components/ReservationSummary.vue';

onMounted(() => {
});
createApp(ReservationSummary).mount(
	(() => {
		const app = document.createElement('div');
		document.querySelector("#ReservationSummary\\ mb-2")!.insertAdjacentElement("beforeend", app);
		return app;
	})(),
);
</script>

<template />

<style scoped>
.text-area-grow-enter-active,
.text-area-grow-leave-active {
	transition: opacity 0.25s ease, transform 0.1s ease;
}

.text-area-grow-enter-from,
.text-area-grow-leave-to {
	opacity: 0;
	transform: scaleY(0);
}
</style>