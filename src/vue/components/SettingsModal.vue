<script setup lang="ts">
import { ref } from "vue";
import Settings from "../../settings.ts";
import { getCredentials, setCredentials } from "../../shopware.ts";
import { applyConfiguredEnvironment, getEnvironmentOptions } from "../../environment.ts";
import ModalShell from "./ModalShell.vue";
import { previewSound, type SoundKind } from "../../sounds.ts";
import { SETTINGS_SAVED_EVENT } from "../../constants.ts";

const emit = defineEmits<{ close: []; save: [] }>();

// The three cues, in the order they are met: most scans land, some land wrong,
// and now and then a step fails. Each has a switch and a button to hear it,
// since which is which is exactly what a switch labelled "warning" cannot
// tell you.
const SOUNDS: { kind: SoundKind; title: string; hint: string }[] = [
	{
		kind: "success",
		title: "Scan gelukt",
		hint: "Twee korte tonen omhoog. Het product is aan het pakket toegevoegd.",
	},
	{
		kind: "warning",
		title: "Scan klopt niet",
		hint: "Twee piepjes. De barcode hoort niet bij deze reservering, of het product is één keer te veel gescand.",
	},
	{
		kind: "error",
		title: "Fout in het proces",
		hint: "Eén lage, dalende zoemer. De aanmelding bij de vervoerder is geweigerd of een stap is mislukt.",
	},
];

const soundSwitches = ref<Record<SoundKind, boolean>>({
	success: Settings.soundSuccess,
	warning: Settings.soundWarning,
	error: Settings.soundError,
});

// The picker lives in the portal footer, so the choices are whatever the
// current page offers. An empty list means this page has no picker.
const environmentOptions = getEnvironmentOptions();

const masterSwitch = ref(Settings.autoMasterSwitch);
const showCompletedHistory = ref(Settings.showCompletedHistory);
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
	Settings.soundSuccess = soundSwitches.value.success;
	Settings.soundWarning = soundSwitches.value.warning;
	Settings.soundError = soundSwitches.value.error;
	Settings.showCompletedHistory = showCompletedHistory.value;
	Settings.save();

	// The pages are mounted separately from this footer, so anything of theirs
	// that a setting decides is told rather than watched.
	document.dispatchEvent(new CustomEvent(SETTINGS_SAVED_EVENT));

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

		<label class="pse-settings-switch">
			<input type="checkbox" class="pse-settings-checkbox" v-model="showCompletedHistory" />
			<span class="pse-settings-switch-text">
				<span class="pse-settings-switch-title">Afgeronde reserveringen tonen</span>
				<span class="pse-dialog-hint">
					Zet de lijst met afgeronde reserveringen naast het zoekscherm. Uit betekent alleen verbergen:
					de lijst wordt bijgehouden en staat er compleet weer zodra je hem aanzet.
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
			<h3 class="pse-settings-group-title">Geluiden</h3>

			<!-- The listen button sits beside the label rather than inside it, so
			     hearing a sound and switching it are two different clicks. -->
			<div v-for="sound in SOUNDS" :key="sound.kind" class="pse-settings-sound">
				<label class="pse-settings-switch pse-settings-switch-compact">
					<input type="checkbox" class="pse-settings-checkbox" v-model="soundSwitches[sound.kind]" />
					<span class="pse-settings-switch-text">
						<span class="pse-settings-switch-title">{{ sound.title }}</span>
						<span class="pse-dialog-hint">{{ sound.hint }}</span>
					</span>
				</label>
				<button type="button" class="pse-dialog-btn pse-dialog-btn-quiet pse-settings-listen"
					:title="`${sound.title} afspelen`" @click="previewSound(sound.kind)">
					<span class="material-icons pse-settings-listen-icon" aria-hidden="true">volume_up</span>
					Luister
				</button>
			</div>
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

/* One row per sound: the switch, then the button that plays it. The switch
   keeps the master switch's shape so the list reads as more of the same kind of
   thing, but stacked, so it loses the clear water the lone one needs above the
   field under it. */
.pse-settings-sound {
	display: flex;
	align-items: stretch;
	gap: 8px;
	margin-bottom: 8px;
}

.pse-settings-sound:last-child {
	margin-bottom: 0;
}

.pse-settings-switch-compact {
	flex: 1 1 auto;
	min-width: 0;
	margin: 0 !important;
}

.pse-settings-listen {
	flex: none;
	min-width: 0;
	display: inline-flex;
	align-items: center;
	gap: 6px;
	height: auto;
	padding: 0 14px;
	border-radius: 13px;
}

.pse-settings-listen-icon {
	font-size: 18px;
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
