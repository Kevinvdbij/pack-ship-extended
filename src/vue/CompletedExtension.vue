<script setup lang="ts">
import { onMounted } from 'vue';
import { getCurrentReservationId, getCurrentReservationNumber, setLastCompletedReservation } from '../utilities';

onMounted(() => {
	setLastCompletedReservation({
		id: getCurrentReservationId(),
		number: getCurrentReservationNumber()
	});
	proceed();
});

function proceed() {
	const proceedButton = document.querySelector("#ReservationContainer > div:nth-child(11) > div > button") as HTMLButtonElement;
	proceedButton.click();
}
</script>

<template/>

<style scoped/>