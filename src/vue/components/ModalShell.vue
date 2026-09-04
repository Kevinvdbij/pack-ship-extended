<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue";

// The frame every dialog of ours is built in: the dimmed page, the panel, the
// title bar with its close control, and the row of actions along the bottom.
//
// One component rather than a convention, because a convention is what the
// dialogs had before -- each carried its own backdrop, its own radius, its own
// entrance and its own idea of where the buttons go, and they had drifted far
// enough apart that opening two in a row looked like two different programs.
// What a dialog is is now stated once here, and each of them only says what it
// is about.
//
// The portal's own two dialogs -- the parcel editor and its delete
// confirmation -- cannot use this, because they are Bootstrap markup the portal
// builds and refreshes itself. They are matched to it from
// `src/styles/portal.css` instead, against the same tokens in the palette, so
// the pair look alike without one being able to change without the other.
const props = withDefaults(defineProps<{
	title: string;
	// The panel's width. The dialogs differ in what they hold -- a form, a
	// question, a product photo -- and little else, so this is the only knob
	// they get.
	size?: "sm" | "md" | "lg";
	// A dialog raised over another one. The credentials prompt is the only case:
	// it can open on a page that already has the settings dialog on it.
	elevated?: boolean;
	// Off for a dialog whose work would be lost by a stray click on the page
	// behind it.
	dismissable?: boolean;
}>(), {
	size: "md",
	elevated: false,
	dismissable: true,
});

const emit = defineEmits<{ close: [] }>();

// Escape closes whatever is on top. Bound to the document rather than to the
// panel: a dialog is modal, so the key means this dialog wherever the cursor
// happens to be -- and nothing of ours puts focus in the panel on open.
onMounted(() => document.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => document.removeEventListener("keydown", onKeydown));

function onKeydown(event: KeyboardEvent) {
	if (event.key == "Escape" && props.dismissable) {
		emit("close");
	}
}

// Only a click that both started and ended on the backdrop itself. A drag that
// begins inside the panel -- selecting the text of a client secret, say -- ends
// wherever the pointer was released, and closing on that would throw the dialog
// away mid-gesture.
function onBackdropClick(event: MouseEvent) {
	if (props.dismissable && event.target == event.currentTarget) {
		emit("close");
	}
}
</script>

<template>
	<div class="pse-modal" :class="{ 'is-elevated': elevated }" role="dialog" aria-modal="true"
		:aria-label="title" @mousedown="onBackdropClick">
		<div class="pse-modal-panel" :class="`is-${size}`">
			<header class="pse-modal-head">
				<h2 class="pse-modal-title">{{ title }}</h2>

				<button type="button" class="pse-modal-close" aria-label="Sluiten" @click="emit('close')">
					<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
						stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
						<path d="M6 6l12 12M18 6L6 18" />
					</svg>
				</button>
			</header>

			<div class="pse-modal-body">
				<slot />
			</div>

			<!-- Rendered only when a dialog has actions. A photo does not, and an
			     empty bar under it would be a rule across the bottom of nothing. -->
			<footer v-if="$slots.footer" class="pse-modal-foot">
				<slot name="footer" />
			</footer>
		</div>
	</div>
</template>

<style scoped>
.pse-modal {
	position: fixed;
	inset: 0;
	z-index: 100;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 28px 20px;
	/* Dimmed and blurred, so what is behind the dialog is plainly still there
	   but plainly not what is being asked about. The same pair the portal's busy
	   overlay wears, from the same token. */
	background-color: var(--pse-scrim);
	backdrop-filter: blur(3px);
	-webkit-backdrop-filter: blur(3px);
	/* The portal wraps the page in `.container-fluid.text-center`, which reaches
	   in here even through a teleport to `body` on some pages. */
	text-align: left;
	color: var(--pse-ink);
}

.pse-modal :deep(*) {
	box-sizing: border-box;
}

.is-elevated {
	z-index: 200;
}

.pse-modal-panel {
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	width: 100%;
	/* Never taller than the window. The body inside scrolls instead, so the
	   title stays readable and the actions stay reachable however much is in
	   between. */
	max-height: 100%;
	border-radius: var(--pse-dialog-radius);
	background-color: #ffffff;
	box-shadow: var(--pse-dialog-shadow);
}

.is-sm {
	max-width: 420px;
}

.is-md {
	max-width: 560px;
}

.is-lg {
	max-width: 780px;
}

.pse-modal-head {
	display: flex;
	align-items: center;
	gap: 16px;
	flex: none;
	padding: 17px 20px;
	border-bottom: 1px solid var(--pse-line);
}

.pse-modal-title {
	margin: 0;
	/* Takes the space so the close control is pushed to the far edge. */
	flex: 1;
	min-width: 0;
	font-size: 16px;
	font-weight: 650;
	line-height: 1.3;
	color: var(--pse-ink);
}

/* Quiet until it is pointed at: closing is always available and never the thing
   a dialog is opened to do, so it is not given the weight of a button. */
.pse-modal-close {
	display: flex;
	align-items: center;
	justify-content: center;
	flex: none;
	width: 32px;
	height: 32px;
	padding: 0;
	border: 0;
	border-radius: 9px;
	background-color: transparent;
	color: var(--pse-ink-faint);
	cursor: pointer;
	transition: background-color 0.15s ease, color 0.15s ease;
}

.pse-modal-close:hover {
	background-color: var(--pse-well);
	color: var(--pse-ink);
}

.pse-modal-close:focus {
	outline: none;
}

.pse-modal-close:focus-visible {
	outline: none;
	box-shadow: 0 0 0 3px var(--pse-brand-ring);
}

.pse-modal-body {
	flex: 1;
	min-height: 0;
	padding: 20px;
	overflow-y: auto;
	font-size: 14px;
	line-height: 1.5;
}

.pse-modal-foot {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 9px;
	flex: none;
	padding: 15px 20px;
	border-top: 1px solid var(--pse-line);
}

/* The entrance and the exit are not here. They belong to the `modal` transition
   in `src/style.css`, which is what wraps every dialog: stated there, one fade
   covers both directions and every dialog leaves the way it arrived. Keyframes
   on this element could only ever play forwards. */

@media (max-width: 640px) {
	.pse-modal {
		padding: 16px 12px;
	}

	.pse-modal-head,
	.pse-modal-body,
	.pse-modal-foot {
		padding-left: 16px;
		padding-right: 16px;
	}
}
</style>
