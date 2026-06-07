<script setup lang="ts">
import { onMounted } from 'vue';
import { getCurrentReservationId, getCurrentReservationNumber, setLastCompletedReservation } from '../../retailVistaUtils.ts';
import Settings from '../../settings.ts';

onMounted(() => {
	setLastCompletedReservation({
		id: getCurrentReservationId(),
		number: getCurrentReservationNumber()
	});
	autoFinalize();
});

function autoFinalize() {
	if (!Settings.autoMasterSwitch) {
		return;
	}

	const proceedButton = document.querySelector("#ReservationContainer > div:nth-child(11) > div > button") as HTMLButtonElement;
	proceedButton.click();
}
</script>

<template />

<style scoped />