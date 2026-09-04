<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import shopwareIconUrl from "../../assets/shopware.svg";
import { requestToken, setCredentials, ShopwareCredentials } from "../../shopware.ts";

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

onMounted(() => nextTick(() => idField.value?.focus()));

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
	<div class="pse-credentials-backdrop">
		<div class="pse-credentials-card" role="dialog" aria-modal="true" aria-labelledby="pseCredentialsTitle">
			<div class="pse-credentials-header">
				<img :src="shopwareIconUrl" class="pse-credentials-logo" width="40" height="40" alt="" />
				<div>
					<h3 id="pseCredentialsTitle">Shopware koppeling instellen</h3>
					<p class="pse-credentials-subtitle">
						Pack&amp;Ship Extended heeft de client gegevens van de Shopware integratie nodig om
						ordergegevens op te halen. Ze worden alleen op deze computer bewaard.
					</p>
				</div>
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
			<label class="pse-credentials-label" for="pseSetupClient">Client ID</label>
			<input ref="idField" type="text" id="pseSetupClient" name="pseSetupClient" class="pse-credentials-input"
				v-model="clientId" :disabled="checking" autocomplete="off" spellcheck="false" data-1p-ignore
				data-lpignore="true" data-form-type="other" @keyup.enter="save()">

			<label class="pse-credentials-label" for="pseSetupSecret">Client secret</label>
			<input type="text" id="pseSetupSecret" name="pseSetupSecret"
				class="pse-credentials-input pse-credentials-masked" v-model="clientSecret" :disabled="checking"
				autocomplete="off" spellcheck="false" data-1p-ignore data-lpignore="true" data-form-type="other"
				@keyup.enter="save()">

			<Transition name="pse-credentials-error">
				<p v-if="error" class="pse-credentials-error">{{ error }}</p>
			</Transition>

			<div class="pse-credentials-actions">
				<button type="button" class="pse-credentials-later" :disabled="checking" @click="emit('dismiss')">
					Later
				</button>
				<button type="button" class="pse-credentials-save" :disabled="!filledIn() || checking" @click="save()">
					<span v-if="checking" class="pse-credentials-spinner"></span>
					{{ checking ? "Controleren..." : "Opslaan" }}
				</button>
			</div>

			<p class="pse-credentials-footnote">
				Later te wijzigen via <b>Instellingen</b> onderin de portal.
			</p>
		</div>
	</div>
</template>

<style scoped>
.pse-credentials-backdrop {
	position: fixed;
	inset: 0;
	z-index: 200;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(17, 24, 33, 0.55);
	backdrop-filter: blur(2px);
	font-size: 15px;
}

.pse-credentials-card {
	width: 480px;
	max-width: 92%;
	padding: 26px 28px 22px;
	background: #ffffff;
	border-radius: 16px;
	box-shadow: 0 18px 48px rgba(17, 24, 33, 0.28);
	animation: pse-credentials-in 0.22s ease-out;
}

.pse-credentials-header {
	display: flex;
	gap: 14px;
	align-items: flex-start;
	margin-bottom: 20px;
}

.pse-credentials-logo {
	flex: none;
	margin-top: 2px;
}

.pse-credentials-card h3 {
	margin: 0 0 6px;
	font-size: 19px;
	font-weight: 700;
	color: #1f2933;
}

.pse-credentials-subtitle {
	margin: 0;
	color: #6c757d;
	font-size: 13.5px;
	line-height: 1.45;
}

.pse-credentials-label {
	display: block;
	margin-bottom: 4px;
	font-weight: 600;
	color: #1f2933;
}

.pse-credentials-input {
	width: 100%;
	margin-bottom: 14px;
	padding: 9px 11px;
	border: 1px solid #ced4da;
	border-radius: 8px;
	font-size: 15px;
	transition: border-color 120ms, box-shadow 120ms;
}

.pse-credentials-input:focus {
	outline: none;
	border-color: #689f69;
	box-shadow: 0 0 0 3px rgba(104, 159, 105, 0.18);
}

.pse-credentials-input:disabled {
	background: #f4f5f7;
}

/* Masks the value the way a password field would, without being one. */
.pse-credentials-masked {
	-webkit-text-security: disc;
	text-security: disc;
}

p.pse-credentials-error {
	margin: -4px 0 12px;
	padding: 9px 11px;
	background: #fdecea;
	border-radius: 8px;
	color: #a3352b;
	font-size: 13.5px;
	line-height: 1.4;
}

.pse-credentials-error-enter-active {
	transition: opacity 150ms ease-out;
}

.pse-credentials-error-enter-from {
	opacity: 0;
}

.pse-credentials-actions {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	margin-top: 4px;
}

.pse-credentials-later,
.pse-credentials-save {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	height: 42px;
	padding: 0 20px;
	border: none;
	border-radius: 8px;
	font-size: 15px;
	font-weight: 700;
	transition: background-color 120ms, color 120ms;
}

.pse-credentials-later {
	background: transparent;
	color: #6c757d;
}

.pse-credentials-later:hover:not(:disabled) {
	background: #f1f3f5;
	color: #1f2933;
}

.pse-credentials-save {
	min-width: 130px;
	background: #689f69;
	color: #ffffff;
}

.pse-credentials-save:hover:not(:disabled),
.pse-credentials-save:focus:not(:disabled) {
	background: #537f5f;
}

.pse-credentials-save:disabled {
	background: #b9cdba;
}

.pse-credentials-spinner {
	width: 15px;
	height: 15px;
	border: 2px solid rgba(255, 255, 255, 0.45);
	border-top-color: #ffffff;
	border-radius: 50%;
	animation: pse-credentials-spin 0.7s linear infinite;
}

.pse-credentials-footnote {
	margin: 14px 0 0;
	color: #98a1ab;
	font-size: 12.5px;
	text-align: right;
}

@keyframes pse-credentials-in {
	from {
		opacity: 0;
		transform: translateY(12px) scale(0.98);
	}

	to {
		opacity: 1;
		transform: none;
	}
}

@keyframes pse-credentials-spin {
	to {
		transform: rotate(360deg);
	}
}
</style>
