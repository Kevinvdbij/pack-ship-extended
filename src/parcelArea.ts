import { PACKING_PORTAL_URL, PARCEL_CONTAINER_SELECTOR, PARCEL_PANE_PREFIX, PARCEL_PANE_SELECTOR } from "./constants.ts";
import { debug } from "./logger.ts";

// The parcel area on the parcels page, as it really is.
//
// The portal keeps two accounts of its parcels in that area, and after a parcel
// is deleted they disagree. The tabs and the cards are rendered from the
// reservation as it now stands. The hidden `Items[n].*` inputs are not: the
// portal's `refresh()` posts the form it had, and ASP.NET fills hidden fields
// from the posted values by position -- so every parcel after the deleted one
// carries the hidden values of the one before it, the deleted parcel's id among
// them. Measured on reservation 417053: tabs 897413, 897459, 897461, 897467;
// hidden ids 897413, 897459, 897461, 897466, the last one deleted.
//
// Two things follow. Anything that wants to know which parcels exist reads the
// rendered panes, never the hidden ids. And the form has to be put right before
// the next scan, because a scan is posted with those hidden ids and lands in
// whichever parcel they name.

export interface RenderedParcel {
	// The parcel's own id, off its pane: `parcels-content-897467`.
	id: string;
	// Its number, off the card's title: "372969 / SendCloud".
	number: string;
}

export function getRenderedParcels(target: ParentNode = document): RenderedParcel[] {
	return Array.from(target.querySelectorAll<HTMLElement>(PARCEL_PANE_SELECTOR)).map((pane) => ({
		id: pane.id.slice(PARCEL_PANE_PREFIX.length),
		number: (pane.querySelector(".card-title")?.textContent ?? "").split("/")[0].trim(),
	}));
}

// Whether the hidden inputs have fallen out of step with the panes they sit in.
// Each pane carries its parcel's `Items[n].ItemId`; one that names another
// parcel is the posted-back value of a parcel that has since moved or gone.
export function isParcelFormStale(target: ParentNode = document): boolean {
	return Array.from(target.querySelectorAll<HTMLElement>(PARCEL_PANE_SELECTOR)).some((pane) => {
		const own = pane.querySelector<HTMLInputElement>("input[name^='Items['][name$='.ItemId']");

		return own != null && own.value != pane.id.slice(PARCEL_PANE_PREFIX.length);
	});
}

// Replaces the parcel area with a fresh render of it. Taken from the page
// itself, served by a plain GET -- which posts nothing, so there is nothing for
// the server to fill back in -- and handed to the portal's own `init()`
// afterwards, as its `refresh()` does with its own answer.
export async function reloadParcelArea(): Promise<void> {
	const container = document.querySelector(PARCEL_CONTAINER_SELECTOR);

	if (!container) {
		return;
	}

	const response = await fetch(window.location.pathname + window.location.search, { cache: "no-store" });

	if (!response.ok) {
		throw new Error(`The parcels page answered ${response.status}.`);
	}

	const holder = document.createElement("div");

	holder.innerHTML = await response.text();

	const fresh = holder.querySelector(PARCEL_CONTAINER_SELECTOR);

	if (!fresh) {
		throw new Error("The parcels page came back without its parcel area.");
	}

	container.innerHTML = fresh.innerHTML;

	location.href = "javascript:void(init());";
}

// Whether the portal still has a parcel, asked of the portal rather than read
// off the page. Its edit form answers for a parcel that exists and fails for one
// that has been deleted -- a 500 with "Value cannot be null" in it, measured.
// Anything that cannot be read as either is "don't know", which callers treat
// as "still there": a bin is only ever handed back on a definite answer.
export async function parcelExists(parcelId: string): Promise<boolean | undefined> {
	try {
		const response = await fetch(
			`${PACKING_PORTAL_URL}/Parcels/Edit?itemid=${encodeURIComponent(parcelId)}&cashOnDelivery=false`,
			{ cache: "no-store" });

		if (response.ok) {
			return (await response.text()).includes("parcelForm");
		}

		return response.status >= 500 ? false : undefined;
	} catch {
		return undefined;
	}
}

// Whether anything has been scanned into a parcel. Its products are the hidden
// `Items[p].Items[i]` groups under its own index p, which is read off the
// parcel's `Items[p].ItemId` in its pane -- the products' inputs are found by
// that name, wherever the portal put them. Undefined when the pane gives no
// index, which callers do not take as empty.
//
// Only right on an area that is in step: see `parcelAreaSettled()`.
export function parcelHasItems(parcelId: string): boolean | undefined {
	const index = Array.from(document.querySelectorAll<HTMLInputElement>(
		`#${PARCEL_PANE_PREFIX}${parcelId} input[name^='Items['][name$='.ItemId']`))
		.map((input) => input.name.match(/^Items\[(\d+)\]\.ItemId$/)?.[1])
		.find((found) => found !== undefined);

	if (index === undefined) {
		return undefined;
	}

	return Array.from(document.querySelectorAll<HTMLInputElement>(`input[name^='Items[${index}].Items['][name$='].Amount']`))
		.some((input) => (Number(input.value.split(",").shift()) || 0) > 0);
}

// ---- Keeping the form right ----

let repairing: Promise<void> | null = null;

// Set when a reload came back out of step itself, which another reload will not
// fix. Stops the loop until the area is seen in step again.
let gaveUp = false;

export function isRepairingParcelArea(): boolean {
	return repairing != null;
}

// Puts the form right whenever the parcel area is redrawn out of step. Checked
// after the portal has finished with the area -- its `refresh()` writes the
// markup and then runs `init()` in the same task -- so the check is queued
// rather than made inside the mutation.
export function keepParcelFormInStep() {
	const container = document.querySelector(PARCEL_CONTAINER_SELECTOR);

	if (!container) {
		return;
	}

	let queued = false;

	const check = () => {
		queued = false;

		if (repairing) {
			return;
		}

		if (!isParcelFormStale()) {
			gaveUp = false;

			return;
		}

		if (gaveUp) {
			return;
		}

		debug("The parcel form is out of step with its parcels, reloading the parcel area");

		repairing = reloadParcelArea()
			.catch((error) => console.error("Pack&Ship Extended could not reload the parcel area.", error))
			.finally(() => {
				repairing = null;

				if (isParcelFormStale()) {
					gaveUp = true;
					console.error("Pack&Ship Extended: the parcel area is still out of step after reloading it.");
				}
			});
	};

	new MutationObserver(() => {
		if (!queued) {
			queued = true;
			setTimeout(check, 0);
		}
	}).observe(container, { childList: true, subtree: true });

	check();
}

// Resolves once no repair is under way, for a step that must see the area as
// it really is.
export async function parcelAreaSettled(): Promise<void> {
	while (repairing) {
		await repairing;
	}
}
