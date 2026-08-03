<script setup lang="ts">
import ReservationSummary from '../components/ReservationSummary.vue';
import { mountApp } from '../mount.ts';
import { RESERVATION_SUMMARY_SELECTOR } from '../../constants.ts';

mountApp(ReservationSummary, (host) => {
	document.querySelector(RESERVATION_SUMMARY_SELECTOR)!.insertAdjacentElement("beforeend", host);
});
</script>

<template />