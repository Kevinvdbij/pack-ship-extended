<script setup lang="ts">
import { ref } from "vue";
import Settings from "../../settings.ts";
import { getCredentials, setCredentials } from "../../shopware.ts";
import { applyConfiguredEnvironment, getEnvironmentOptions } from "../../environment.ts";
import ModalShell from "./ModalShell.vue";
import { previewSound, type SoundKind } from "../../sounds.ts";
import { SETTINGS_SAVED_EVENT, UPDATE_INSTALL_URL } from "../../constants.ts";
import { checkForUpdate } from "../../update.ts";
import { restartIdleLogout } from "../../idleLogout.ts";
import pkg from "../../../package.json";

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
const slotScope = ref(Settings.slotScope);
const idleLogoutSeconds = ref(Settings.idleLogoutSeconds);

// The times worth offering rather than a box to type a number into. Every one of
// these is a decision about how long a counter stands empty between reservations,
// and picking from a list is what stops a workplace being signed out every thirty
// seconds by a typo.
const IDLE_TIMES = [
	{ seconds: 0, label: "Uit -- nooit automatisch uitloggen" },
	{ seconds: 5 * 60, label: "Na 5 minuten" },
	{ seconds: 10 * 60, label: "Na 10 minuten" },
	{ seconds: 15 * 60, label: "Na 15 minuten" },
	{ seconds: 30 * 60, label: "Na 30 minuten" },
	{ seconds: 60 * 60, label: "Na een uur" },
];

const credentials = getCredentials();
const clientId = ref(credentials.clientId);
const clientSecret = ref(credentials.clientSecret);

// What the last press of the check button found. Empty until it is pressed --
// the footer already carries the standing answer, and this line is here to
// report on an asking that just happened.
const updateStatus = ref("");
const checking = ref(false);

// Asked properly rather than from the cache: the hour the ordinary check waits
// out is there to keep page loads quiet, and this is a person wanting to know
// now -- most often the person who just published the version they are looking
// for.
//
// The link is followed either way. Tampermonkey answers the script URL with its
// own install screen even when the version has not moved, which is the way to
// push a workplace that has fallen behind and will not pick it up on its own.
// So the anchor navigates as anchors do, and this only fills in the line under
// it.
async function onCheckForUpdate() {
	checking.value = true;
	updateStatus.value = "";

	const available = await checkForUpdate(true);

	checking.value = false;
	updateStatus.value = available
		? `Versie ${available.version} is beschikbaar.`
		: `Deze werkplek draait de nieuwste versie (${pkg.version}).`;
}

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
	Settings.slotScope = slotScope.value;
	Settings.idleLogoutSeconds = Number(idleLogoutSeconds.value);
	Settings.save();

	// The pages are mounted separately from this footer, so anything of theirs
	// that a setting decides is told rather than watched.
	document.dispatchEvent(new CustomEvent(SETTINGS_SAVED_EVENT));

	setCredentials({ clientId: clientId.value, clientSecret: clientSecret.value });

	// The timer is running in this page already, so a time that was just changed
	// has to replace the one that was armed on load rather than wait for the next
	// navigation -- which on a workplace that just turned the timer on could be
	// the sign-out it was configured to prevent being late for.
	restartIdleLogout();

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

		<div class="pse-settings-field">
			<label class="pse-dialog-label" for="pseSlotScope">Vakken in het rek</label>
			<select id="pseSlotScope" class="pse-dialog-input" v-model="slotScope">
				<option value="order">Eén vak per order</option>
				<option value="line">Een vak per productregel</option>
			</select>
			<small class="pse-dialog-hint">
				Waar een order blijft staan tot de rest binnen is. Per order staat het vak naast de reservering;
				per regel kies je het in de productlijst, voor orders waarvan de artikelen los binnenkomen. Het
				vak wordt bij de order in Shopware bewaard, apart van de notitie van de klant.
			</small>
		</div>

		<div class="pse-settings-field">
			<label class="pse-dialog-label" for="pseIdleLogout">Automatisch uitloggen</label>
			<select id="pseIdleLogout" class="pse-dialog-input" v-model.number="idleLogoutSeconds">
				<option v-for="time in IDLE_TIMES" :key="time.seconds" :value="time.seconds">
					{{ time.label }}
				</option>
			</select>
			<small class="pse-dialog-hint">
				Logt deze werkplek uit als er zo lang niets is aangeraakt, zodat de volgende packer niet onder
				de naam van de vorige werkt. Een minuut van tevoren verschijnt er een waarschuwing; een toets,
				een scan of een klik zet de teller terug. Tijdens het massaal afronden gebeurt er niets.
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

		<div class="pse-settings-group">
			<h3 class="pse-settings-group-title">Versie</h3>

			<div class="pse-settings-field">
				<!-- An anchor rather than a button, and the same URL the pill in
				     the footer opens: this is the one way in to an update, so
				     there is one address for it. Opened in its own tab so the
				     dialog and whatever was on screen behind it survive an
				     install that is thought better of. -->
				<a class="pse-dialog-btn pse-settings-update" :href="UPDATE_INSTALL_URL" target="_blank"
					rel="noopener" @click="onCheckForUpdate()">
					<span class="material-icons pse-settings-update-icon" aria-hidden="true">system_update_alt</span>
					{{ checking ? "Bezig met controleren" : "Controleer op updates" }}
				</a>

				<small class="pse-dialog-hint">
					Deze werkplek draait {{ pkg.version }}. Opent het installatiescherm van Tampermonkey, ook als
					er geen nieuwere versie is -- zo haal je een werkplek bij die achterloopt.
				</small>

				<small class="pse-dialog-hint pse-settings-update-status" v-if="updateStatus">
					{{ updateStatus }}
				</small>
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
/* An anchor wearing the dialog's button: it has to be told to lay itself out
   like one, since a button is a flex box here and an inline link is not.
 
   And it has to be told its colour in every link state. `.pse-dialog-btn` sets
   white text, but the portal styles links as links -- `a:hover` outranks a bare
   class, so hovering the button turned the label Bootstrap blue and underlined
   it. Stated once per state here, where the scope attribute puts us above that. */
.pse-settings-update,
.pse-settings-update:hover,
.pse-settings-update:focus,
.pse-settings-update:active,
.pse-settings-update:visited {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 9px;
	color: #ffffff;
	text-decoration: none;
}

.pse-settings-update-icon {
	font-size: 18px;
}

/* The answer to a press, so it is set apart from the standing explanation above
   it rather than reading as a third line of the same paragraph. */
.pse-settings-update-status {
	display: block;
	margin-top: 7px;
	font-weight: 600;
	color: var(--pse-ink);
}

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
