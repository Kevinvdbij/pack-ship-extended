<script setup lang="ts">
import { onMounted, ref, Teleport } from 'vue';
import Modal from "./components/SettingsModal.vue";
import pkg from "../../package.json";

const show = ref(false);
const showModal = ref(false);

onMounted(() => {
	show.value = true;
});
</script>

<template>
	<Teleport to="footer > div > div > div.col-auto.mr-auto.text-left > div">
		<Transition>
			<div v-if="show" class="col ml-2">Pack&Ship Extended Version {{ pkg.version }}</div>
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
</style>