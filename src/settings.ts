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
	// Whether a rack bay is picked for the whole order or one per product line.
	// See `src/slots.ts`. Per order is the ordinary way an order is parked --
	// everything of it goes in one bay -- and per line is for the orders whose
	// items arrive far enough apart to be shelved separately.
	slotScope: "order" | "line",
	// How many seconds the workplace may stand untouched before it is signed out
	// of the portal, or 0 for never. See `src/idleLogout.ts`.
	//
	// Seconds rather than minutes, which is not the unit it is picked in -- the
	// dialog offers minutes. Stored this way so a time shorter than a minute can
	// be set at all, which is what it took to watch this work end to end without
	// standing at a counter for a quarter of an hour.
	//
	// Per machine, like the environment: what counts as "nobody is here" is a
	// fact about where the station stands rather than about the portal.
	idleLogoutSeconds: number,
	// The audible cues, one switch each -- see `src/sounds.ts`. A scan that
	// landed, a scan that landed wrong, and a step that failed.
	soundSuccess: boolean,
	soundWarning: boolean,
	soundError: boolean,
	// Bins for the CVP on the parcels page -- see `src/bins.ts`. Off unless
	// this workplace is set up for it, and set up means all of the four below:
	// the two environments are what make the labels come out in the right
	// place, and the put wall is what hands a bin out and is told its label.
	binsEnabled: boolean,
	// The environment the reservation is announced under when it has a bin. Its
	// printer discards, so the announcement prints nothing and every label is
	// sent where it belongs afterwards.
	noPrintEnvironmentId: number,
	// The environment whose parcel printer is the CVP's: the bin wall. Read for
	// its printer, never applied to the session.
	binWallEnvironmentId: number,
	// The put wall service, and its PLUGIN_TOKEN (Coolify's
	// SERVICE_PASSWORD_64_PLUGIN), which its /api/plugin routes require.
	putWallUrl: string,
	putWallToken: string
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
		slotScope: "order",
		// A quarter of an hour: long enough to walk a reservation to the counter
		// and back without being signed out mid-pack, short enough that a station
		// left at the end of a shift is not still somebody's session an hour
		// later.
		idleLogoutSeconds: 15 * 60,
		soundSuccess: true,
		soundWarning: true,
		soundError: true,
		binsEnabled: false,
		noPrintEnvironmentId: -1,
		binWallEnvironmentId: -1,
		putWallUrl: "",
		putWallToken: ""
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
			slotScope: this.slotScope,
			idleLogoutSeconds: this.idleLogoutSeconds,
			soundSuccess: this.soundSuccess,
			soundWarning: this.soundWarning,
			soundError: this.soundError,
			binsEnabled: this.binsEnabled,
			noPrintEnvironmentId: this.noPrintEnvironmentId,
			binWallEnvironmentId: this.binWallEnvironmentId,
			putWallUrl: this.putWallUrl,
			putWallToken: this.putWallToken
		});
	},

	// What bins still need on this workplace before one can be added, worded for
	// the packer who presses + Bak. A bin with no NOPRINT environment would print
	// its label at the bench as well as at the CVP, so nothing here is optional.
	binsMissing(): string[] {
		const missing: string[] = [];

		if (!(this.environmentId > 0)) missing.push("de omgeving van deze werkplek");
		if (!(this.noPrintEnvironmentId > 0)) missing.push("de omgeving zonder printer");
		if (!(this.binWallEnvironmentId > 0)) missing.push("de omgeving van de sorteerwand");
		if (!this.putWallUrl.trim()) missing.push("het adres van de sorteerwand");
		if (!this.putWallToken.trim()) missing.push("de plugin-sleutel van de sorteerwand");

		return missing;
	},

	// Whether a bin can actually be added: switched on and fully set up.
	binsReady(): boolean {
		return this.binsEnabled && this.binsMissing().length == 0;
	}
};

export default Settings;
