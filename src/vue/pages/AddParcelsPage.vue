<script setup lang="ts">
import { createApp } from 'vue';
import ReservationSummary from '../components/ReservationSummary.vue';

createApp(ReservationSummary).mount(
	(() => {
		const app = document.createElement('div');
		document.querySelector("#ReservationSummary\\ mb-2")!.insertAdjacentElement("beforeend", app);
		return app;
	})(),
);
</script>

<template />