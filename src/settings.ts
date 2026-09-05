import { GM_getValue, GM_setValue } from "$";
import { STORAGE_KEYS } from "./constants.ts";

type SettingsData = {
	enabled: boolean,
	autoMasterSwitch: boolean,
	autoProceed: boolean,
	autoSelect: boolean,
	// The environment ("Omgeving") this computer packs for. It ties the portal
	// session to a workplace and therefore to a printer, so it belongs to the
	// machine rather than to whoever is logged in. -1 means unconfigured, in
	// which case the portal's own dropdown is left alone.
	environmentId: number,
	// The name that goes with environmentId, kept alongside it so the footer
	// label can be written without the portal's own dropdown. Reading the name
	// off its <option> list meant waiting for that list to be parsed, and the
	// wait was long enough for the dropdown to be painted before we could
	// replace it.
	environmentName: string,
	// Whether the search screen shows the log of finished reservations. Display
	// only: the log is written on the completed screen either way, so turning it
	// off hides what is there rather than stopping it being kept -- and turning
	// it back on shows the reservations packed while it was off.
	showCompletedHistory: boolean,
	// The audible cues, one switch each -- see `src/sounds.ts`. A scan that
	// landed, a scan that landed wrong, and a step that failed.
	soundSuccess: boolean,
	soundWarning: boolean,
	soundError: boolean
}

function defaults(): SettingsData {
	return {
		enabled: true,
		autoMasterSwitch: true,
		autoProceed: true,
		autoSelect: true,
		environmentId: -1,
		environmentName: "",
		showCompletedHistory: true,
		soundSuccess: true,
		soundWarning: true,
		soundError: true
	}
}

// Persisted through the GM value store, so it survives page navigations and is
// shared with the tabs opened by a mass complete run.
const Settings = {
	...defaults(),

	load() {
		// Merge onto the defaults so a store written by an older version, which
		// has no entry for a setting added since, still yields a usable value.
		Object.assign(this, defaults(), GM_getValue(STORAGE_KEYS.settings));
	},

	save() {
		GM_setValue(STORAGE_KEYS.settings, {
			enabled: this.enabled,
			autoMasterSwitch: this.autoMasterSwitch,
			autoProceed: this.autoProceed,
			autoSelect: this.autoSelect,
			environmentId: this.environmentId,
			environmentName: this.environmentName,
			showCompletedHistory: this.showCompletedHistory,
			soundSuccess: this.soundSuccess,
			soundWarning: this.soundWarning,
			soundError: this.soundError
		});
	}
};

export default Settings;
