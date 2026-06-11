<script setup lang="ts">
import { onMounted } from 'vue';
import * as RVUtils from '../../retailVistaUtils.ts';
import Settings from '../../settings.ts';
import { MassCompleteStatus } from '../../interfaces.ts';

onMounted(() => {
	updateAutoComplete();

	RVUtils.setLastCompletedReservation({
		id: RVUtils.getCurrentReservationId(),
		number: RVUtils.getCurrentReservationNumber()
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

function updateAutoComplete() {
	const orderNumber = RVUtils.getCurrentReservationNumber();

	if (RVUtils.isMassCompleteReservation(orderNumber)) {
		RVUtils.updateMassCompleteStatus( { reservationNumber: orderNumber, status: MassCompleteStatus.finished });
	}
}
</script>

<template />

<style scoped />