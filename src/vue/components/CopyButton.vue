<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import { writeToClipboard } from "../../clipboard.ts";

// The one copy control in the extension: a barcode, a reservation number, an
// order reference -- anything long enough that reading it off the screen and
// typing it in somewhere else is where the digits get transposed.
//
// It carries its own result rather than being told one. The copy can genuinely
// fail -- the async clipboard refuses when the document is not focused, and the
// old command reports false rather than throwing -- and a tick that appears
// either way answers the only question this button is asked with a guess.
const props = defineProps<{
	value: string;
	// What is being copied, for the control's own title: "Barcode kopiëren".
	label: string;
}>();

const state = ref<boolean>();
let timeout: number;

const icon = computed(() => state.value == undefined
	? "content_copy"
	: state.value ? "check" : "error_outline");

onUnmounted(() => clearTimeout(timeout));

async function copy() {
	if (!props.value) {
		return;
	}

	state.value = await writeToClipboard(props.value);

	clearTimeout(timeout);
	timeout = setTimeout(() => (state.value = undefined), 1400);
}
</script>

<template>
	<button type="button" class="pse-copy" :class="{ 'is-copied': state == true, 'is-failed': state == false }"
		:title="`${label} kopiëren`" @click.stop="copy()">
		<span class="material-icons pse-copy-icon" aria-hidden="true">{{ icon }}</span>
	</button>
</template>
