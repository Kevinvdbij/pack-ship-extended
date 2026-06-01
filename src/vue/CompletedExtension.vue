<script setup lang="ts">
import { onMounted } from 'vue';
import { getCurrentReservationNumber, setLastCompletedReservation } from '../utilities';

onMounted(() => {
	alert(getCurrentReservationNumber());
	setLastCompletedReservation(getCurrentReservationNumber());
});
</script>

<template/>

<style scoped/>