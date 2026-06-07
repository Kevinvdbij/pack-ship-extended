import { GM_getValue, GM_setValue } from "$";

export default class Settings {
	private static _data: SettingsData = Settings.defaults();
	
	static defaults(): SettingsData {
		return {
			enabled: true,
			autoMasterSwitch: true,
			autoProceed: true,
			autoSelect: true
		}
	}

	static load() {
		Object.assign(this._data, GM_getValue("PSE_Settings"));
	}

	static save() {
		GM_setValue("PSE_Settings", (Settings._data));
	}

	static get enabled() {
		return Settings._data.enabled;
	}
	
	static set enabled(value) {
		Settings._data.enabled = value;
	}

	static get autoMasterSwitch() {
		return Settings._data.autoMasterSwitch;
	}
	
	static set autoMasterSwitch(value) {
		Settings._data.autoMasterSwitch = value;
	}

	static get autoProceed() {
		return Settings._data.autoProceed;
	}
	
	static set autoProceed(value) {
		Settings._data.autoProceed = value;
	}

	static get autoSelect() {
		return Settings._data.autoSelect;
	}
	
	static set autoSelect(value) {
		Settings._data.autoSelect = value;
	}
}

type SettingsData = {
	enabled: boolean,
	autoMasterSwitch: boolean,
	autoProceed: boolean,
	autoSelect: boolean
}