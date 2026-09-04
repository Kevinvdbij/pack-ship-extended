<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import shopwareIconUrl from "../../assets/shopware.svg";
import { requestToken, setCredentials, ShopwareCredentials } from "../../shopware.ts";
import { afterReveal } from "../../reveal.ts";
import ModalShell from "./ModalShell.vue";

const emit = defineEmits<{ saved: []; dismiss: [] }>();

const clientId = ref("");
const clientSecret = ref("");
const checking = ref(false);
const error = ref("");
const idField = ref<HTMLInputElement | null>(null);

// Only the shape is checked here; whether the pair actually works is left to
// Shopware, which is asked for a token before anything is stored.
function filledIn() {
	return clientId.value.trim().length > 0 && clientSecret.value.trim().length > 0;
}

// `afterReveal` as well as `nextTick`: the prompt mounts with the footer, which
// is while the page is still behind the cloak, and a hidden field
// cannot be focused at all -- see `src/reveal.ts`.
onMounted(() => nextTick(() => afterReveal(() => idField.value?.focus())));

async function save() {
	if (!filledIn() || checking.value) {
		return;
	}

	const credentials: ShopwareCredentials = { clientId: clientId.value, clientSecret: clientSecret.value };

	checking.value = true;
	error.value = "";

	try {
		// Storing a pair the shop rejects would leave every later call failing
		// with no hint of why, so the pair is tried before it is kept.
		await requestToken(credentials);
	} catch {
		error.value = "Shopware accepteert deze gegevens niet. Controleer de client ID en het secret.";
		checking.value = false;

		return;
	}

	setCredentials(credentials);

	checking.value = false;

	emit("saved");
}
</script>

<template>
	<!-- Not dismissable by a click on the page behind it: this is asked once, and
	     the work it unlocks cannot be done without an answer. "Later" is the way
	     past it, and it says what it costs. Elevated because the settings dialog
	     can already be open when the store turns out to be empty. -->
	<ModalShell title="Shopware koppeling instellen" size="md" elevated :dismissable="false"
		@close="emit('dismiss')">
		<div class="pse-credentials-intro">
			<img :src="shopwareIconUrl" class="pse-credentials-logo" width="34" height="34" alt="" />
			<p class="pse-credentials-subtitle">
				Pack&amp;Ship Extended heeft de client gegevens van de Shopware integratie nodig om
				ordergegevens op te halen. Ze worden alleen op deze computer bewaard.
			</p>
		</div>

		<!--
			Neither field is a login: they hold an integration's client
			credentials, and a password manager offering to fill or save
			this form gets it wrong. Chrome decides that from the shape of
			the markup, so the secret is a text input masked by
			-webkit-text-security instead of type="password". The ids avoid
			"user"/"password" wording for the same reason, and the data
			attributes opt the field out for 1Password, LastPass and
			Dashlane, which do not go by that heuristic.
		-->
		<div class="pse-credentials-field">
			<label class="pse-dialog-label" for="pseSetupClient">Client ID</label>
			<input ref="idField" type="text" id="pseSetupClient" name="pseSetupClient" class="pse-dialog-input"
				v-model="clientId" :disabled="checking" autocomplete="off" spellcheck="false" data-1p-ignore
				data-lpignore="true" data-form-type="other" @keyup.enter="save()" />
		</div>

		<div class="pse-credentials-field">
			<label class="pse-dialog-label" for="pseSetupSecret">Client secret</label>
			<input type="text" id="pseSetupSecret" name="pseSetupSecret"
				class="pse-dialog-input pse-credentials-masked" v-model="clientSecret" :disabled="checking"
				autocomplete="off" spellcheck="false" data-1p-ignore data-lpignore="true" data-form-type="other"
				@keyup.enter="save()" />
		</div>

		<Transition name="pse-credentials-error">
			<p v-if="error" class="pse-credentials-error">{{ error }}</p>
		</Transition>

		<p class="pse-credentials-footnote">
			Later te wijzigen via <b>Instellingen</b> onderin de portal.
		</p>

		<template #footer>
			<button type="button" class="pse-dialog-btn pse-dialog-btn-quiet" :disabled="checking"
				@click="emit('dismiss')">
				Later
			</button>
			<button type="button" class="pse-dialog-btn" :disabled="!filledIn() || checking" @click="save()">
				<span v-if="checking" class="pse-credentials-spinner" aria-hidden="true"></span>
				{{ checking ? "Controleren..." : "Opslaan" }}
			</button>
		</template>
	</ModalShell>
</template>

<style scoped>
.pse-credentials-intro {
	display: flex;
	align-items: flex-start;
	gap: 13px;
	margin-bottom: 20px;
}

.pse-credentials-logo {
	flex: none;
	margin-top: 1px;
}

.pse-credentials-subtitle {
	margin: 0;
	font-size: 13.5px;
	line-height: 1.45;
	color: var(--pse-ink-soft);
}

.pse-credentials-field {
	margin-bottom: 16px;
}

.pse-credentials-error {
	margin: 0 0 14px;
	padding: 11px 13px;
	border: 1px solid rgba(176, 58, 46, 0.28);
	border-radius: 12px;
	background-color: rgba(176, 58, 46, 0.06);
	font-size: 13px;
	line-height: 1.45;
	color: #a3372c;
}

.pse-credentials-error-enter-active,
.pse-credentials-error-leave-active {
	transition: opacity 0.15s ease;
}

.pse-credentials-error-enter-from,
.pse-credentials-error-leave-to {
	opacity: 0;
}

.pse-credentials-footnote {
	margin: 0;
	font-size: 12.5px;
	line-height: 1.4;
	color: var(--pse-ink-faint);
}

/* Masks the value the way a password field would, without being one. */
.pse-credentials-masked {
	-webkit-text-security: disc;
	text-security: disc;
}

.pse-credentials-spinner {
	width: 14px;
	height: 14px;
	flex: none;
	border: 2px solid rgba(255, 255, 255, 0.4);
	border-top-color: #ffffff;
	border-radius: 50%;
	animation: pse-credentials-spin 0.7s linear infinite;
}

@keyframes pse-credentials-spin {
	to {
		transform: rotate(360deg);
	}
}
</style>
