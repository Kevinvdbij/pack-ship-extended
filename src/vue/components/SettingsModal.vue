<script setup lang="ts">
import { ref } from "vue";
import Settings from "../../settings.ts";
import { getCredentials, setCredentials } from "../../shopware.ts";
import { applyConfiguredEnvironment, getEnvironmentOptions } from "../../environment.ts";
import ModalShell from "./ModalShell.vue";

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
	<ModalShell title="Pack&amp;Ship Extended instellingen" size="md" @close="emit('close')">
		<!-- The switch is a setting you turn on, not a field you fill in, so it
		     is a row you can hit anywhere rather than a checkbox with a caption
		     beside it. -->
		<label class="pse-settings-switch">
			<input type="checkbox" class="pse-settings-checkbox" v-model="masterSwitch" />
			<span class="pse-settings-switch-text">
				<span class="pse-settings-switch-title">Automatische afhandeling</span>
				<span class="pse-dialog-hint">
					Verifieert, kondigt aan en rondt reserveringen af zonder tussenkomst.
				</span>
			</span>
		</label>

		<div class="pse-settings-field">
			<label class="pse-dialog-label" for="environmentId">Omgeving</label>
			<select id="environmentId" class="pse-dialog-input" v-model.number="environmentId"
				:disabled="environmentOptions.length == 0">
				<option :value="-1">Niet vastgezet (kiezen in de portal)</option>
				<option v-for="option in environmentOptions" :key="option.id" :value="option.id">
					{{ option.name }}
				</option>
			</select>
			<small class="pse-dialog-hint">
				Hoort bij deze computer en de printer erachter. Vastzetten verbergt de keuzelijst in de portal en
				zet de omgeving bij elke pagina terug.
			</small>
		</div>

		<div class="pse-settings-group">
			<h3 class="pse-settings-group-title">Shopware koppeling</h3>

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
			<div class="pse-settings-field">
				<label class="pse-dialog-label" for="pseSwClient">Client ID</label>
				<input type="text" id="pseSwClient" name="pseSwClient" class="pse-dialog-input" v-model="clientId"
					autocomplete="off" spellcheck="false" data-1p-ignore data-lpignore="true"
					data-form-type="other" />
			</div>

			<div class="pse-settings-field">
				<label class="pse-dialog-label" for="pseSwSecret">Client secret</label>
				<input type="text" id="pseSwSecret" name="pseSwSecret"
					class="pse-dialog-input pse-settings-masked" v-model="clientSecret" autocomplete="off"
					spellcheck="false" data-1p-ignore data-lpignore="true" data-form-type="other" />
			</div>
		</div>

		<template #footer>
			<button type="button" class="pse-dialog-btn pse-dialog-btn-quiet" @click="emit('close')">
				Annuleren
			</button>
			<button type="button" class="pse-dialog-btn" @click="save()">
				Opslaan
			</button>
		</template>
	</ModalShell>
</template>

<style scoped>
/* A filled box against a bare label reads as one crowding the other: the box
   has an edge and a tint, and the small uppercase label under it has neither,
   so the gap the fields use between themselves is not enough to separate them.
   Given clear water instead -- enough that the label reads as the start of the
   next setting rather than as a caption hanging off the box above it. */
.pse-settings-switch {
	display: flex;
	align-items: flex-start;
	gap: 11px;
	/* `!important` for the same reason as `.pse-dialog-label` -- this row is a
	   `<label>` too, and the portal flattens every one of them. */
	margin: 0 0 34px !important;
	padding: 13px 14px;
	border: 1px solid var(--pse-line);
	border-radius: 13px;
	background-color: var(--pse-well);
	cursor: pointer;
}

.pse-settings-checkbox {
	flex: none;
	width: 17px;
	height: 17px;
	margin: 1px 0 0;
	accent-color: var(--pse-brand-ink);
	cursor: pointer;
}

.pse-settings-switch-text {
	min-width: 0;
}

.pse-settings-switch-title {
	display: block;
	font-size: 14px;
	font-weight: 650;
	line-height: 1.3;
	color: var(--pse-ink);
}

.pse-settings-field {
	margin-bottom: 16px;
}

.pse-settings-field:last-child {
	margin-bottom: 0;
}

/* The credentials are configured once and then never touched, so they are set
   apart from the two settings above them rather than continuing the same list. */
.pse-settings-group {
	margin-top: 20px;
	padding-top: 18px;
	border-top: 1px solid var(--pse-line);
}

.pse-settings-group-title {
	margin: 0 0 14px;
	font-size: 13px;
	font-weight: 650;
	color: var(--pse-ink);
}

/* Masks the value the way a password field would, without being one. */
.pse-settings-masked {
	-webkit-text-security: disc;
	text-security: disc;
}
</style>
