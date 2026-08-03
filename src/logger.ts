import { GM_getValue } from "$";

// Tracing is noisy (it dumps the whole reservation cache on every page load), so
// it is off unless PSE_Debug is set to true in the GM value store.
const enabled = GM_getValue<boolean>("PSE_Debug", false);

export function debug(...args: unknown[]) {
	if (enabled) {
		console.log("[PSE]", ...args);
	}
}
