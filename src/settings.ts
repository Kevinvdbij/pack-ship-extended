import { GM_getValue, GM_setValue } from "$";
import { STORAGE_KEYS } from "./constants.ts";

type SettingsData = {
	enabled: boolean,
	autoMasterSwitch: boolean,
	autoProceed: boolean,
	autoSelect: boolean
}

function defaults(): SettingsData {
	return {
		enabled: true,
		autoMasterSwitch: true,
		autoProceed: true,
		autoSelect: true
	}
}

// Persisted through the GM value store, so it survives page navigations and is
// shared with the tabs opened by a mass complete run.
const Settings = {
	...defaults(),

	load() {
		Object.assign(this, GM_getValue(STORAGE_KEYS.settings));
	},

	save() {
		GM_setValue(STORAGE_KEYS.settings, {
			enabled: this.enabled,
			autoMasterSwitch: this.autoMasterSwitch,
			autoProceed: this.autoProceed,
			autoSelect: this.autoSelect
		});
	}
};

export default Settings;
