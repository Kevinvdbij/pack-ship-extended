<script setup lang="ts">
import ModalShell from "./ModalShell.vue";

// The stop between a finished collection order and the search screen.
//
// Every other reservation on this bench leaves on a round: it is packed, it is
// announced, and the box goes on the pallet with the rest. A collection order
// looks exactly the same up to this point and then has to go somewhere else --
// the "afhalen in de winkel" shelf at the front, where the customer will ask
// for it. The screen that used to follow this one is the search screen, which
// says nothing about the box still standing on the bench.
//
// So the run stops here. The warning cue is the one that says "this landed but
// is not the ordinary case", which is exactly what this is, and the dialog is
// not dismissable: a stray click on the page behind it is how a box ends up on
// the pallet.
defineProps<{
	reservationNumber: string;
	customer: string;
	// The portal's own wording for the transport, shown rather than paraphrased
	// -- it is the line in the ERP this whole screen is about.
	transport: string;
}>();

const emit = defineEmits<{ confirm: [] }>();
</script>

<template>
	<Teleport to="body">
		<ModalShell title="Afhalen in de winkel" size="sm" :dismissable="false">
			<p class="pse-pickup-lead">
				Deze reservering wordt <strong>niet verzonden</strong>. Zet de pakketten in het vak
				<strong>Afhalen in de winkel</strong>.
			</p>

			<dl class="pse-pickup-facts">
				<template v-if="reservationNumber">
					<dt>Reservering</dt>
					<dd>{{ reservationNumber }}</dd>
				</template>
				<template v-if="customer">
					<dt>Klant</dt>
					<dd>{{ customer }}</dd>
				</template>
				<template v-if="transport">
					<dt>Transport</dt>
					<dd>{{ transport }}</dd>
				</template>
			</dl>

			<template #footer>
				<button type="button" class="pse-dialog-btn" @click="emit('confirm')">
					In het vak gezet
				</button>
			</template>
		</ModalShell>
	</Teleport>
</template>

<style scoped>
/* The page under this is `.container-fluid.text-center`, which inherits into
   anything of ours that holds text. */
.pse-pickup-lead {
	margin: 0 0 0.9rem;
	text-align: left;
	font-size: 1rem;
	line-height: 1.45;
}

.pse-pickup-facts {
	display: grid;
	grid-template-columns: auto minmax(0, 1fr);
	gap: 0.25rem 0.9rem;
	margin: 0;
	text-align: left;
	font-size: 0.9rem;
}

.pse-pickup-facts dt {
	color: var(--pse-ink-soft);
}

.pse-pickup-facts dd {
	margin: 0;
	font-weight: 600;
}
</style>
