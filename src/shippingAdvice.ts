import { GM_xmlhttpRequest } from "$";
import Settings from "./settings.ts";
import { SHIPPING_ADVICE_URL } from "./constants.ts";

// Which carrier is cheaper for this shipment, PostNL or Smilda, as the webshop
// dashboard works it out. Asked, never computed here: the sum is small, but it
// stands on the PostNL and Smilda invoices -- rates per country and the size
// and weight PostNL measured for some 30,000 EANs -- which the dashboard reads
// again every morning. Asking keeps this screen giving the dashboard's answer.
//
// Advice only. Nothing here changes the reservation's transport: Niek wants to
// see how reliable the advice is before anything acts on it.
//
// `GM_xmlhttpRequest`, not `fetch`: the dashboard is another site and sends no
// CORS headers for this one, and doesn't have to -- the request goes out from
// Tampermonkey, which is what the `@connect` entry for the dashboard is for.
//
// The login is the dashboard's `packship` script account, which may call this
// endpoint and nothing else. Its password is stored per workplace in the
// settings, never in the script: the script is published on Greasy Fork.

export class ShippingAdviceError extends Error {}

// The countries the endpoint has rates for, by the names the portal prints
// under the delivery address. Dutch is what a corrected session serves, but a
// page can be read while it is still in English, the same as the sidebar's
// labels. Anything else is not asked about: there is no rate to compare.
const COUNTRIES: Record<string, ShippingCountry> = {
	nederland: "NL",
	netherlands: "NL",
	"the netherlands": "NL",
	belgie: "BE",
	belgië: "BE",
	belgium: "BE",
	duitsland: "DE",
	deutschland: "DE",
	germany: "DE",
	luxemburg: "LU",
	luxembourg: "LU",
};

export type ShippingCountry = "NL" | "BE" | "DE" | "LU";

export interface ShippingDestination {
	country: ShippingCountry;
	postcode: string;
}

export interface ShippingLine {
	ean: string;
	quantity: number;
}

export interface ShippingAdvice {
	// Null when a product has no known size, see `onbekend`.
	advies: "PostNL" | "Smilda" | null;
	// One line meant to be shown as it is.
	melding: string;
	reden?: string;
	onbekend?: unknown[];
	lokale_vervoerder?: boolean;
	tarieven_van?: string;
}

// The most lines the endpoint takes in one shipment.
const MAX_LINES = 50;

// The dashboard is on the internet, not on the site's own network, but this is
// an aside to the packing: a packer is not kept waiting on it.
const TIMEOUT_MS = 8000;

export function isConfigured(): boolean {
	return Boolean(Settings.shippingAdviceUser.trim() && Settings.shippingAdvicePassword);
}

// The country and postcode off the delivery address as the portal prints it:
// street, then "9301LR RODEN", then "Nederland". The country is the last line;
// the postcode starts the line before it. Null for an address the endpoint has
// no rates for, or one that is not laid out this way.
export function readDestination(addressLines: string[]): ShippingDestination | null {
	const lines = addressLines.map((line) => line.trim()).filter(Boolean);

	if (lines.length < 2) {
		return null;
	}

	const country = COUNTRIES[lines[lines.length - 1].toLowerCase()];

	if (!country) {
		return null;
	}

	// Four or five digits, and the two letters a Dutch postcode carries, with or
	// without the space. Only Germany's first digit changes the Smilda rate, but
	// the postcode is passed whole and the dashboard decides what it needs.
	const postcode = lines[lines.length - 2].match(/^(\d{4,5})\s?([A-Z]{2}\b)?/i);

	return {
		country,
		postcode: postcode ? (postcode[1] + (postcode[2] ?? "")).toUpperCase() : "",
	};
}

// The reservation's products folded into the endpoint's lines: one per EAN, with
// the quantities picked for it added up -- a product picked from two locations
// arrives as two rows. Shipping costs are a line on the order, not something in
// the box, and a product with no barcode cannot be looked up.
export function shippingLines(products: Array<{ mainBarcode: string; description: string; requiredQuantity: number }>): ShippingLine[] {
	const lines = new Map<string, number>();

	for (const product of products) {
		const ean = product.mainBarcode.trim();

		if (!ean || product.requiredQuantity <= 0 || /verzendkosten/i.test(product.description)) {
			continue;
		}

		lines.set(ean, (lines.get(ean) ?? 0) + product.requiredQuantity);
	}

	return Array.from(lines, ([ean, quantity]) => ({ ean, quantity }));
}

// `order` is the order the advice is for: the dashboard records every advice
// and lays it beside the carrier the order actually went out with, every hour,
// which is how Niek sees how often the advice is followed here and what not
// following it cost. It does not change the advice. The webshop's or Bol's
// order number is recognised as well as RetailVista's own, and the webshop's is
// the one the portal prints, as the sale order reference.
export async function requestShippingAdvice(lines: ShippingLine[], destination: ShippingDestination,
	order: string): Promise<ShippingAdvice> {
	if (lines.length == 0) {
		throw new ShippingAdviceError("Geen producten om naar te vragen.");
	}

	if (lines.length > MAX_LINES) {
		throw new ShippingAdviceError(`Meer dan ${MAX_LINES} regels; het verzendadvies neemt er niet meer.`);
	}

	const query = new URLSearchParams({
		regels: lines.map((line) => `${line.ean}:${line.quantity}`).join(","),
		land: destination.country,
	});

	if (destination.postcode) {
		query.set("postcode", destination.postcode);
	}

	if (order) {
		query.set("order", order);
	}

	// Asked once per shipment per tab. Every call is recorded as an advice given,
	// and a packer reloads the parcels page, or comes back to it, often enough
	// that asking on every load would count one shipment's advice several times
	// over. The same question in the same tab gets the answer it got before, for
	// as long as a packer plausibly stays with one order.
	const key = `${CACHE_PREFIX}${query}`;
	const cached = readCached(key);

	if (cached) {
		return cached;
	}

	const advice = await ask(query);

	writeCached(key, advice);

	return advice;
}

const CACHE_PREFIX = "PSE_ShippingAdvice_";

// A station's tab stays open the whole shift, so session storage alone kept an
// answer all day: a correction on the dashboard's side never reached a tab that
// had already asked. Kept for a quarter of an hour instead -- long enough for
// one order's reloads, short enough that a fix there shows here.
const CACHE_LIFETIME_MS = 15 * 60 * 1000;

// Either call can throw where site data is blocked, and a cache that is not
// there only means asking again. An entry from before the lifetime was kept is
// a bare answer without `at`, and is asked again like an expired one.
function readCached(key: string): ShippingAdvice | null {
	try {
		const stored = sessionStorage.getItem(key);
		const parsed = (stored ? JSON.parse(stored) : null) as { at?: unknown; advice?: unknown } | null;

		if (typeof parsed?.at != "number" || Date.now() - parsed.at > CACHE_LIFETIME_MS || !isAdvice(parsed.advice)) {
			sessionStorage.removeItem(key);

			return null;
		}

		return parsed.advice;
	} catch {
		return null;
	}
}

function writeCached(key: string, advice: ShippingAdvice) {
	try {
		sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), advice }));
	} catch {
		// Nothing kept; the next load asks again.
	}
}

function ask(query: URLSearchParams): Promise<ShippingAdvice> {
	return new Promise((resolve, reject) => {
		GM_xmlhttpRequest({
			method: "GET",
			url: `${SHIPPING_ADVICE_URL}?${query}`,
			timeout: TIMEOUT_MS,
			// Only this login. Whatever the browser holds for the dashboard --
			// somebody signed in to it on this machine -- is not sent along.
			anonymous: true,
			headers: {
				Accept: "application/json",
				Authorization: basicAuth(Settings.shippingAdviceUser.trim(), Settings.shippingAdvicePassword),
			},
			onload: (response) => {
				if (response.status == 401) {
					reject(new ShippingAdviceError("De inlog voor het verzendadvies klopt niet."));

					return;
				}

				let body: unknown;

				try {
					body = JSON.parse(response.responseText);
				} catch {
					reject(new ShippingAdviceError(`Het verzendadvies antwoordde ${response.status}.`));

					return;
				}

				if (response.status == 400) {
					const fout = (body as { fout?: unknown })?.fout;

					reject(new ShippingAdviceError(typeof fout == "string" && fout ? fout : "Het verzendadvies weigerde de vraag."));

					return;
				}

				if (response.status < 200 || response.status >= 300 || !isAdvice(body)) {
					reject(new ShippingAdviceError(`Het verzendadvies antwoordde ${response.status}.`));

					return;
				}

				resolve(body);
			},
			onerror: () => reject(new ShippingAdviceError("Het verzendadvies is niet bereikbaar.")),
			ontimeout: () => reject(new ShippingAdviceError("Het verzendadvies reageert niet.")),
		});
	});
}

// The EANs the dashboard has no size for, as text. The handover describes the
// field as "EAN's zonder maat" without saying whether it holds bare strings or
// objects, so both are read.
export function unknownEans(advice: ShippingAdvice): string[] {
	return (advice.onbekend ?? [])
		.map((entry) => typeof entry == "string" || typeof entry == "number"
			? String(entry)
			: String((entry as { ean?: unknown })?.ean ?? ""))
		.filter(Boolean);
}

function isAdvice(body: unknown): body is ShippingAdvice {
	if (!body || typeof body != "object") {
		return false;
	}

	const advies = (body as ShippingAdvice).advies;

	return advies === null || advies == "PostNL" || advies == "Smilda";
}

// `btoa` takes Latin-1 only, and a password is whatever was chosen for it.
function basicAuth(user: string, password: string): string {
	const bytes = new TextEncoder().encode(`${user}:${password}`);

	return "Basic " + btoa(String.fromCharCode(...bytes));
}
