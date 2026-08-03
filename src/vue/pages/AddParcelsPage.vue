<script setup lang="ts">
import ReservationSummary from '../components/ReservationSummary.vue';
import { mountApp } from '../mount.ts';

mountApp(ReservationSummary, (host) => {
	document.querySelector("#ReservationSummary\\ mb-2")!.insertAdjacentElement("beforeend", host);
});
</script>

<template />