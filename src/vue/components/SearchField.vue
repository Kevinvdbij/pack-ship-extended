<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue";
import { adoptElement } from "../../retailVistaUtils.ts";

const props = defineProps<{
	label: string;
	placeholder?: string;
	// Selector of a portal input to take over. Given one, the field wears our
	// shell but the control inside it is still the portal's own element, which
	// is what keeps the portal's form serialising and the barcode focus helper
	// finding what it looks for. Without one the field renders a control of
	// ours, bound through v-model.
	adopt?: string;
}>();

const model = defineModel<string>();

const shell = useTemplateRef<HTMLElement>("shell");

// The whole label is the click target, so a control of ours needs no `for` and
// an adopted one needs no id of ours -- which is just as well, since the portal
// owns both of those on the elements we take over.
onMounted(() => {
	if (!props.adopt) {
		return;
	}

	// Bootstrap's `form-control` goes with it: the portal's sizing and focus
	// ring are the two things this redesign is replacing, and leaving them on
	// would mean overriding every one of them from here.
	adoptElement(shell.value!, document.querySelector(props.adopt), "pse-input");
});
</script>

<template>
	<label class="pse-field">
		<span class="pse-field-label">{{ label }}</span>
		<span class="pse-field-shell" ref="shell">
			<input v-if="!adopt" class="pse-input" type="text" autocomplete="off" :placeholder="placeholder"
				v-model="model" />
		</span>
	</label>
</template>

<style scoped>
.pse-field {
	display: block;
	margin: 0;
	cursor: text;
}

/* Small, quiet and set in capitals: on a card with two forms the labels are
   scanned rather than read, and at this weight they mark out the fields without
   competing with the headings above them. */
.pse-field-label {
	display: block;
	margin-bottom: 7px;
	font-size: 11px;
	font-weight: 650;
	letter-spacing: 0.07em;
	text-transform: uppercase;
	color: var(--pse-ink-soft);
}

.pse-field-shell {
	display: block;
}

/* `:deep` because an adopted control is the portal's element and never carries
   this component's scope attribute. The rule is written once and applies to
   both kinds of control, which is the point of putting them in the same shell.

   Inputs are the one thing on this page that is aimed at with a barcode scanner
   in one hand, so they are sized well past what the text in them needs. */
.pse-field-shell :deep(.pse-input) {
	box-sizing: border-box;
	display: block;
	width: 100%;
	height: 48px;
	margin: 0;
	padding: 0 15px;
	border: 1px solid var(--pse-line);
	border-radius: 12px;
	background-color: var(--pse-well);
	font: inherit;
	font-size: 15px;
	color: var(--pse-ink);
	transition: border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
}

.pse-field-shell :deep(.pse-input::placeholder) {
	color: var(--pse-ink-faint);
}

/* The field lifts off the card's tint when it is the one being typed into, so
   which input the scanner is pointed at is readable from across the counter. */
.pse-field-shell :deep(.pse-input:focus) {
	outline: none;
	border-color: var(--pse-brand);
	background-color: #ffffff;
	box-shadow: 0 0 0 3px var(--pse-brand-ring);
}
</style>
