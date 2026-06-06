<script setup lang="ts">
import { onMounted, ref, Teleport } from 'vue';
import Modal from "./components/SettingsModal.vue";
import pkg from "../../package.json";
import powerIconUrl from "../assets/power.svg";

const show = ref(false);
const showModal = ref(false);

const masterSwitch = ref(true);

onMounted(() => {
	show.value = true;
});
</script>

<template>
	<Teleport to="footer > div > div > div.col-auto.mr-auto.text-left > div">
		<Transition>
			<button v-if="show" type="button" class="toggle-button" @click="masterSwitch = !masterSwitch">
				<img :src="powerIconUrl" :class="masterSwitch ? 'power-button-icon-on' : 'power-button-icon-off'"/>
			</button>
		</Transition>
		<Transition>
			<div v-if="show" class="col ml-2">Pack&Ship Extended Versie {{ pkg.version }}</div>
		</Transition>

		<Transition>
			<button v-if="show" type="submit" class="nav-link btn btn-link remove-padding col ml-3" @click="showModal = true;">Instellingen</button>
		</Transition>
	</Teleport>

	<Teleport to="body">
		<Transition>
			<Modal v-if="showModal" @close="showModal = false"/>
		</Transition>
	</Teleport>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.25s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.toggle-button {
	background-color: transparent;
	border: none;
	margin-top: -5px;
	padding-left: 10px;
}

.toggle-button:hover,
.toggle-button:active,
.toggle-button:focus {
	outline: none;
	box-shadow: none;
}

.power-button-icon-on {
	filter: invert(79%) sepia(44%) saturate(550%) hue-rotate(67deg) brightness(92%) contrast(99%);
}

.power-button-icon-off {
	filter: invert(67%) sepia(17%) saturate(6115%) hue-rotate(316deg) brightness(91%) contrast(99%);
}
</style>