<script setup lang="ts">
import { cacheReservationDetails, getReservationDetailsFromOverview, skipVerification } from '../../retailVistaUtils.ts';

try {
	skipVerification(document.body);
} catch (error) {
	console.error(error);
}

try {
	const reservationDetails = getReservationDetailsFromOverview();

	if (reservationDetails) {
		cacheReservationDetails(reservationDetails)
	}
} catch (error) {
	console.error(error);
}
</script>

<template />

<style scoped />