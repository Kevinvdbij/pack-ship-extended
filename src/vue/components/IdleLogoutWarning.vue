<script setup lang="ts">
import { computed, Transition } from "vue";
import { idleState, logOut, noteActivity } from "../../idleLogout.ts";
import ModalShell from "./ModalShell.vue";

// The minute before the workplace signs itself out.
//
// A timer that signs someone out without warning is a timer that loses work: a
// packer who stepped away mid-reservation comes back to a login screen and no
// way to tell what the screen behind it was doing. So the last minute is spent
// saying so, with the count running, and any press anywhere on the page -- not
// only on this dialog -- calls the whole thing off. The button is for the person
// who is looking at the dialog rather than at the page.
//
// Not dismissable on the backdrop or on Escape. Both of those are how a dialog
// in the way is got rid of, and getting rid of this one is exactly what staying
// signed in means -- but it has to be a press that says so, not a stray click
// past the edge of it.
const label = computed(() => {
	const seconds = Math.max(0, idleState.secondsLeft);

	return seconds == 1 ? "1 seconde" : `${seconds} seconden`;
});

// Said to the module rather than staged as an event on the document. A
// synthetic press would be answered by the same listener and would work, but it
// would also be a lie told to every other thing on the page that listens for
// one -- and the thing this actually means, "somebody is here", is what the
// module already has a word for.
function stay() {
	noteActivity(true);
}
</script>

<template>
	<Teleport to="body">
		<Transition name="modal">
			<ModalShell v-if="idleState.warning" title="Nog aanwezig?" size="sm" :dismissable="false">
				<p class="pse-idle-lead">
					Deze werkplek wordt over <strong class="pse-idle-count">{{ label }}</strong> uitgelogd omdat
					er niets is gedaan.
				</p>
				<p class="pse-idle-hint">
					Druk op een toets, scan iets, of klik hieronder om ingelogd te blijven.
				</p>

				<template #footer>
					<button type="button" class="pse-dialog-btn pse-dialog-btn-quiet" @click="logOut()">
						Nu uitloggen
					</button>
					<button type="button" class="pse-dialog-btn" @click="stay()">
						Ingelogd blijven
					</button>
				</template>
			</ModalShell>
		</Transition>
	</Teleport>
</template>

<style scoped>
.pse-idle-lead {
	margin: 0 0 8px;
	font-size: 14px;
	line-height: 1.5;
	color: var(--pse-ink);
}

/* The number, which is the whole message. Tabular so the dialog does not twitch
   as the count goes from 10 to 9, and in the attention amber rather than the
   alert red -- nothing has gone wrong, and the way out is one press. */
.pse-idle-count {
	font-variant-numeric: tabular-nums;
	color: var(--pse-attention-ink);
}

.pse-idle-hint {
	margin: 0;
	font-size: 13px;
	line-height: 1.45;
	color: var(--pse-ink-soft);
}
</style>
