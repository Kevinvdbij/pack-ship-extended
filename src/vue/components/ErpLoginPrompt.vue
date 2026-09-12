<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import { erpStore } from "../erpStore.ts";
import { afterReveal } from "../../reveal.ts";
import ModalShell from "./ModalShell.vue";

// Asked when the ERP session has gone and the portal's has not.
//
// The two sessions are separate and expire on their own clocks -- see
// `src/erpSession.ts` -- so a packer can be perfectly signed in, press a rack
// bay, and have it refused by a system they never knowingly signed into. This is
// what that looks like from the counter: one dialog, the same three fields as
// the portal's own login, with the two that are not secret already filled in.
//
// Nothing was stored to retry with, which is the point. The password exists on
// this machine for the length of one sign-in and is then gone, so the way back
// from an expired session is to ask -- and the ask is cheap because the rest is
// already known.

const emit = defineEmits<{ done: [] }>();

const suggested = erpStore.suggested.value;

const companyNumber = ref(suggested.companyNumber);
const userName = ref(suggested.userName);
const password = ref("");

const passwordField = ref<HTMLInputElement | null>(null);
const userNameField = ref<HTMLInputElement | null>(null);

function filledIn() {
	return companyNumber.value.trim().length > 0
		&& userName.value.trim().length > 0
		&& password.value.length > 0;
}

// Straight to whichever field is actually empty. On the ordinary expiry the
// first two are already known and the only thing being asked for is the
// password, so landing anywhere else would mean tabbing past what we filled in.
//
// `afterReveal` as well as `nextTick`: the prompt mounts with the footer, which
// can be while the page is still behind the cloak, and a hidden field cannot be
// focused at all -- see `src/reveal.ts`.
onMounted(() => nextTick(() => afterReveal(() => {
	(userName.value ? passwordField.value : userNameField.value)?.focus();
})));

async function signIn() {
	if (!filledIn() || erpStore.busy.value) {
		return;
	}

	const ok = await erpStore.signIn(companyNumber.value.trim(), userName.value.trim(), password.value);

	// Cleared either way. A rejected password is not worth offering back for a
	// second press, and a successful one has no business staying in a field.
	password.value = "";

	if (ok) {
		emit("done");
	}
}
</script>

<template>
	<!-- Dismissable, unlike the Shopware one. That prompt is asked once, at
	     setup, on a workplace that cannot do its job without an answer; this one
	     can arrive in the middle of a packing run, and packing does not depend on
	     it. "Later" leaves the bays unavailable and nothing else. -->
	<ModalShell title="Opnieuw inloggen bij RetailVista" size="md" elevated
		@close="erpStore.dismiss(); emit('done')">
		<p class="pse-erp-subtitle">
			De verbinding met RetailVista is verlopen. Vakken kunnen pas weer worden opgeslagen
			als je opnieuw inlogt. Je blijft gewoon ingelogd in de inpakportal.
		</p>

		<div class="pse-erp-field">
			<label class="pse-dialog-label" for="pseErpCompany">Bedrijf nr</label>
			<input type="text" id="pseErpCompany" class="pse-dialog-input" v-model="companyNumber"
				:disabled="erpStore.busy.value" autocomplete="off" spellcheck="false"
				@keyup.enter="signIn()" />
		</div>

		<div class="pse-erp-field">
			<label class="pse-dialog-label" for="pseErpUser">Gebruikersnaam</label>
			<input ref="userNameField" type="text" id="pseErpUser" class="pse-dialog-input" v-model="userName"
				:disabled="erpStore.busy.value" autocomplete="username" spellcheck="false"
				@keyup.enter="signIn()" />
		</div>

		<div class="pse-erp-field">
			<label class="pse-dialog-label" for="pseErpPassword">Wachtwoord</label>
			<input ref="passwordField" type="password" id="pseErpPassword" class="pse-dialog-input"
				v-model="password" :disabled="erpStore.busy.value" autocomplete="current-password"
				@keyup.enter="signIn()" />
		</div>

		<Transition name="pse-erp-error">
			<p v-if="erpStore.refused.value" class="pse-erp-error">
				RetailVista accepteert deze gegevens niet. Controleer het bedrijfsnummer, de
				gebruikersnaam en het wachtwoord.
			</p>
		</Transition>

		<template #footer>
			<button type="button" class="pse-dialog-btn pse-dialog-btn-quiet" :disabled="erpStore.busy.value"
				@click="erpStore.dismiss(); emit('done')">
				Later
			</button>
			<button type="button" class="pse-dialog-btn" :disabled="!filledIn() || erpStore.busy.value"
				@click="signIn()">
				<span v-if="erpStore.busy.value" class="pse-erp-spinner" aria-hidden="true"></span>
				{{ erpStore.busy.value ? "Inloggen..." : "Inloggen" }}
			</button>
		</template>
	</ModalShell>
</template>

<style scoped>
.pse-erp-subtitle {
	margin: 0 0 20px;
	font-size: 13.5px;
	line-height: 1.45;
	color: var(--pse-ink-soft);
}

.pse-erp-field {
	margin-bottom: 16px;
}

.pse-erp-error {
	margin: 0 0 14px;
	padding: 11px 13px;
	border: 1px solid rgba(176, 58, 46, 0.28);
	border-radius: 12px;
	background-color: rgba(176, 58, 46, 0.06);
	font-size: 13px;
	line-height: 1.45;
	color: #a3372c;
}

.pse-erp-error-enter-active,
.pse-erp-error-leave-active {
	transition: opacity 0.15s ease;
}

.pse-erp-error-enter-from,
.pse-erp-error-leave-to {
	opacity: 0;
}

.pse-erp-spinner {
	width: 14px;
	height: 14px;
	flex: none;
	border: 2px solid rgba(255, 255, 255, 0.4);
	border-top-color: #ffffff;
	border-radius: 50%;
	animation: pse-erp-spin 0.7s linear infinite;
}

@keyframes pse-erp-spin {
	to {
		transform: rotate(360deg);
	}
}
</style>
