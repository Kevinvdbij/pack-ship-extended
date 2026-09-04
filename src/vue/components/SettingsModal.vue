<script setup lang="ts">
import { ref } from "vue";
import closeIconUrl from "../../assets/close.svg";
import saveIconUrl from "../../assets/save.svg";
import Settings from "../../settings.ts";
import { getCredentials, setCredentials } from "../../shopware.ts";
import { applyConfiguredEnvironment, getEnvironmentOptions } from "../../environment.ts";

const emit = defineEmits<{ close: []; save: [] }>();

// The picker lives in the portal footer, so the choices are whatever the
// current page offers. An empty list means this page has no picker.
const environmentOptions = getEnvironmentOptions();

const masterSwitch = ref(Settings.autoMasterSwitch);
const environmentId = ref(Settings.environmentId);

const credentials = getCredentials();
const clientId = ref(credentials.clientId);
const clientSecret = ref(credentials.clientSecret);

function save() {
	Settings.autoMasterSwitch = masterSwitch.value;
	Settings.environmentId = Number(environmentId.value);
	// Stored with the id so the next page load can label the footer without
	// waiting for the portal to render its dropdown.
	Settings.environmentName = environmentOptions.find((option) => option.id == Number(environmentId.value))?.name ?? "";
	Settings.save();

	setCredentials({ clientId: clientId.value, clientSecret: clientSecret.value });

	// Relabels the footer and, when the environment changed, corrects the
	// portal session.
	applyConfiguredEnvironment();

	emit("save");
	emit("close");
}
</script>

<template>
	<div class="settings-modal">
		<div class="settings-modal-content">
			<button class="close-button" @click="emit('close')">
				<img :src="closeIconUrl" width="50" height="50" />
			</button>
			<h3>Pack&Ship Extended Instellingen</h3>

			<div class="settings-modal-content-options">
				<div class="setting">
					<input type="checkbox" id="masterSwitch" v-model="masterSwitch">
					<label class="setting-label" for="masterSwitch">Automatische afhandeling (hoofdschakelaar)</label>
				</div>

				<div class="setting">
					<label class="setting-label-block" for="environmentId">Omgeving</label>
					<select id="environmentId" class="setting-input" v-model.number="environmentId"
						:disabled="environmentOptions.length == 0">
						<option :value="-1">Niet vastgezet (kiezen in de portal)</option>
						<option v-for="option in environmentOptions" :key="option.id" :value="option.id">
							{{ option.name }}
						</option>
					</select>
					<small class="setting-hint">
						Hoort bij deze computer en de printer erachter. Vastzetten verbergt de keuzelijst in de
						portal en zet de omgeving bij elke pagina terug.
					</small>
				</div>

				<!--
					Neither field is a login: they hold an integration's client
					credentials, and a password manager offering to fill or save
					this form gets it wrong. Chrome decides that from the shape
					of the markup, so the secret is a text input masked by
					-webkit-text-security instead of type="password" -- without a
					password field there is no login form to recognise. The ids
					avoid "user"/"password" wording for the same reason, and the
					data attributes opt the field out for 1Password, LastPass and
					Dashlane, which do not go by that heuristic.
				-->
				<div class="setting">
					<label class="setting-label-block" for="pseSwClient">Shopware client ID</label>
					<input type="text" id="pseSwClient" name="pseSwClient" class="setting-input" v-model="clientId"
						autocomplete="off" spellcheck="false" data-1p-ignore data-lpignore="true"
						data-form-type="other">
				</div>

				<div class="setting">
					<label class="setting-label-block" for="pseSwSecret">Shopware client secret</label>
					<input type="text" id="pseSwSecret" name="pseSwSecret" class="setting-input masked-input"
						v-model="clientSecret" autocomplete="off" spellcheck="false" data-1p-ignore
						data-lpignore="true" data-form-type="other">
				</div>

				<button class="save-button" @click="save()">
					Opslaan
					<img :src="saveIconUrl" width="35" height="35" class="save-icon" />
				</button>
			</div>
		</div>
	</div>
</template>

<style scoped>
.settings-modal {
	position: absolute;
	width: 100% !important;
	height: 100% !important;
	left: 0;
	top: 0;
	background: rgba(51, 51, 51, 0.7);
	z-index: 100;
	background-color: rgba(0, 0, 0, 0.5);
}

.settings-modal-content {
	position: relative;
	animation: settings-modal-in 0.2s ease-out;
	background-color: rgb(255, 255, 255);
	min-width: 550px;
	width: 550px;
	max-width: 95%;
	max-height: 95%;
	top: 50%;
	justify-self: center;
	-webkit-transform: translateY(-50%);
	-ms-transform: translateY(-50%);
	transform: translateY(-50%);
	padding: 25px;
	padding-bottom: 85px;
	font-size: 16px;
	border-radius: 15px;
}

.settings-modal-content-options {
	margin-top: 20px;
	margin-left: 20px;
	margin-right: 20px;
}

.setting {
	margin-bottom: 15px;
}

.close-button {
	position: absolute;
	top: 20px;
	right: 15px;
	border: 0;
	width: 50;
	height: 50;
	background-color: transparent;
}

.save-button {
	position: absolute;
	right: 25px;
	bottom: 25px;
	width: 125px;
	height: 45px;
	background-color: #689f69;
	border-radius: 8px;
	border-style: none;
	box-sizing: border-box;
	color: #FFFFFF;
	transition: color 100ms;
	font-weight: 700;
	font-size: 16px;
}

.save-button:hover,
.save-button:focus {
	background-color: #537f5f;
}

.save-icon {
	filter: invert(1);
}

.setting-label {
	padding-left: 10px;
	justify-content: center;
}

.setting-label-block {
	display: block;
	margin-bottom: 3px;
	font-weight: 600;
}

.setting-input {
	width: 100%;
	padding: 5px 8px;
	border: 1px solid #ced4da;
	border-radius: 5px;
	font-size: 15px;
}

/* Centred with a transform, so the entrance has to carry that transform along
   rather than replace it. */
@keyframes settings-modal-in {
	from {
		opacity: 0;
		transform: translateY(calc(-50% + 12px)) scale(0.98);
	}

	to {
		opacity: 1;
		transform: translateY(-50%) scale(1);
	}
}

.setting-hint {
	display: block;
	margin-top: 4px;
	color: #6c757d;
	line-height: 1.3;
}

/* Masks the value the way a password field would, without being one. */
.masked-input {
	-webkit-text-security: disc;
	text-security: disc;
}

input[type="checkbox"] {
	vertical-align: -4px;
}
</style>
