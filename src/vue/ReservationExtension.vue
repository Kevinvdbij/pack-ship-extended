<script setup lang="ts">
import { cacheReservationDetails, GetReservationDetailsFromOverview, skipVerification } from '../retailVistaUtils.ts';

try {
	skipVerification(document.body);
} catch (error) {
	console.error(error);
}

try {
	const reservationDetails = GetReservationDetailsFromOverview();

	if (reservationDetails) {
		cacheReservationDetails(reservationDetails)
	}
} catch (error) {
	console.error(error);
}
</script>

<template />

<style scoped />