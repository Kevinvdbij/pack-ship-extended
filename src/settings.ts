import { GM_getValue, GM_setValue } from "$";

export interface SettingsData {
	enabled: boolean;
	proceed: boolean;
	addButtons: boolean;
}

export class Settings {
	#isEnabled: boolean = false;
	#isProceeding: boolean = false;
	#enableAddButtons: boolean = false;

	constructor() {
		this.load();
	}

	get enabled(): boolean {
		return this.#isEnabled;
	}

	set enabled(val: boolean) {
		this.#isEnabled = val;
		this.save();
		location.reload();
	}

	get proceed(): boolean {
		return this.#isProceeding;
	}

	set proceed(val: boolean) {
		this.#isProceeding = val;
		this.save();
	}

	get enableAddButtons(): boolean {
		return this.#enableAddButtons;
	}

	set enableAddButtons(val: boolean) {
		this.#enableAddButtons = val;
		this.save();
	}

	save(): void {
		const saveData: SettingsData = {
			enabled: this.#isEnabled,
			proceed: this.#isProceeding,
			addButtons: this.#enableAddButtons,
		};

		GM_setValue("NKHR_Settings", JSON.stringify(saveData));

		console.log(saveData);
	}

	load(): void {
		const defaultSettings: SettingsData = {
			enabled: true,
			proceed: true,
			addButtons: false,
		};

		const loadData: SettingsData = JSON.parse(
			GM_getValue("NKHR_Settings", JSON.stringify(defaultSettings)),
		);

		this.#isEnabled = loadData.enabled ?? defaultSettings.enabled;
		this.#isProceeding = loadData.proceed ?? defaultSettings.proceed;
		this.#enableAddButtons = loadData.addButtons ?? defaultSettings.addButtons;

		console.log(loadData);
	}

	public static saveData(data: SettingsData): void {
		GM_setValue("NKHR_Settings", JSON.stringify(data));
	}

	public static loadData(): SettingsData {
		const defaultSettings: SettingsData = {
			enabled: true,
			proceed: true,
			addButtons: false,
		};

		const loadData = JSON.parse(
			GM_getValue("NKHR_Settings", JSON.stringify(defaultSettings))) as SettingsData;

		return loadData;
	}
}