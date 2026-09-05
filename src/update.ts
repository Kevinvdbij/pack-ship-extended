import { GM_getValue, GM_setValue, GM_xmlhttpRequest } from "$";
import { GREASYFORK_META_URL, RELEASES_PAGE_URL, STORAGE_KEYS, UPDATE_CHECK_INTERVAL } from "./constants.ts";
import { debug } from "./logger.ts";
import pkg from "../package.json";

// Whether this workplace is running the release that is out.
//
// Tampermonkey updates on a schedule of its own -- at browser start, then at
// whatever interval its settings name -- and a packing computer keeps Chrome
// open for days, so a release can sit unnoticed for a week while the machine
// beside it has it. Nothing here can install anything: a userscript cannot make
// Tampermonkey update itself, and an install always ends on Tampermonkey's own
// confirmation. What it can do is say that there is one, and put it one click
// away.
//
// What it reads is Greasy Fork's metadata block for the published script --
// the copy Tampermonkey installs from, so the version that is actually
// available to a workplace. Through `GM_xmlhttpRequest` rather than `fetch`,
// because Greasy Fork sends no CORS headers and a plain request from the portal
// is blocked before it is sent; the script is granted the call and the host in
// `vite.config.ts`.
export interface AvailableUpdate {
	// The version that is published, as its metadata block declares it.
	version: string;
	// Where to get it. The release page rather than the script itself: the
	// Stylus style is the other half of this extension and is installed by hand
	// from the same release, and a machine that takes only the script ends up
	// with a mismatched pair.
	url: string;
}

interface CachedCheck {
	checkedAt: number;
	// The newest version seen, which is not always newer than ours.
	version: string;
}

// What the last check found, from the store rather than the network.
//
// Read on render so the footer draws its own state in one pass; the check that
// might change it comes back later and is not waited for.
export function getKnownUpdate(): AvailableUpdate | undefined {
	const cached = GM_getValue(STORAGE_KEYS.updateCheck) as CachedCheck | undefined;

	return cached?.version && isNewer(cached.version, pkg.version)
		? { version: cached.version, url: RELEASES_PAGE_URL }
		: undefined;
}

// Asks Greasy Fork which version is published, at most once an hour.
//
// Every page mounts the footer and so every page calls this, which is the point
// -- the login screen is not the only place a shift passes through. The answer
// is cached across tabs in the GM store, so the interval is per workplace
// rather than per page, and a morning of packing is a handful of requests for a
// few hundred bytes each.
//
// Never rejects. A check that cannot reach Greasy Fork is not something to
// report on a packing screen -- it leaves the last answer standing and tries
// again on the next page after the interval.
export async function checkForUpdate(): Promise<AvailableUpdate | undefined> {
	const cached = GM_getValue(STORAGE_KEYS.updateCheck) as CachedCheck | undefined;

	if (cached && Date.now() - cached.checkedAt < UPDATE_CHECK_INTERVAL) {
		return getKnownUpdate();
	}

	try {
		const meta = await fetchMetadata();
		const version = meta.match(/@version\s+(\S+)/)?.[1];

		if (!version) {
			throw new Error("The published metadata block declares no version.");
		}

		GM_setValue(STORAGE_KEYS.updateCheck, { checkedAt: Date.now(), version } satisfies CachedCheck);
		debug(`Greasy Fork has ${version}, this workplace runs ${pkg.version}.`);
	} catch (error) {
		// The timestamp is deliberately not written on a failure: an outage
		// should not buy itself an hour of silence.
		debug("Could not check for an update:", error);
	}

	return getKnownUpdate();
}

// The published metadata block, as text.
//
// `GM_xmlhttpRequest` is callback-shaped and older than promises, so it is
// wrapped once here rather than at the point of use. A non-200 is a failure
// like any other: Greasy Fork answers 404 for a script that has been taken
// down, and that is not a version.
function fetchMetadata(): Promise<string> {
	return new Promise((resolve, reject) => {
		GM_xmlhttpRequest({
			method: "GET",
			url: GREASYFORK_META_URL,
			timeout: 10_000,
			onload: (response) => response.status == 200
				? resolve(response.responseText)
				: reject(new Error(`Greasy Fork answered ${response.status}`)),
			onerror: () => reject(new Error("The request failed.")),
			ontimeout: () => reject(new Error("The request timed out.")),
		});
	});
}

// Compares two "1.0.32" version strings.
//
// Numeric, part by part, because the strings sort wrongly as text once a part
// reaches double figures: "1.0.9" is above "1.0.32" alphabetically, and the
// version this is asked about is exactly the one that just went up.
function isNewer(candidate: string, current: string): boolean {
	const parts = (version: string) => version.split(".").map((part) => parseInt(part) || 0);

	const left = parts(candidate);
	const right = parts(current);

	for (let index = 0; index < Math.max(left.length, right.length); index++) {
		const difference = (left[index] ?? 0) - (right[index] ?? 0);

		if (difference != 0) {
			return difference > 0;
		}
	}

	return false;
}
