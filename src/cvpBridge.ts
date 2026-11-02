import { GM_xmlhttpRequest } from "$";
import Settings from "./settings.ts";
import { debug } from "./logger.ts";

// The CVP station bridge (`CVP-500-machine/packship-printer-bridge`), as far as
// the CVP station needs it: how the machine is doing, a bin to release, and a
// word ahead of a label about whose it is.
//
// The bridge runs on the station PC itself and answers on loopback. It sends no
// CORS headers -- nothing but its own status page was ever meant to call it --
// so a `fetch` from the portal's origin could send a request but never read the
// answer. `GM_xmlhttpRequest` is not bound by that, which is why `127.0.0.1` and
// `localhost` are among the script's `@connect` hosts.

export class CvpBridgeError extends Error {}

// What `/api/health` reports. Only the fields the station panel reads; the
// bridge sends more.
export interface CvpBridgeHealth {
	version: string;
	listenerUp: boolean;
	listenerError?: string | null;
	transport: string;
	// "ready", "busy" or "not connected" on the socket; "ok" or "unreachable" on
	// the share. See `HealthSnapshot.MachineState`.
	machineState: string;
	queueDepth: number;
	zebraReachable: boolean;
	// Null while the bin wall is switched off on the bridge.
	holdListenerUp?: boolean | null;
	// "ok", "unreachable", "token rejected" or "no token"; null with the bin
	// wall off.
	putWallState?: string | null;
	heldCount: number;
}

// The answer to a bin scan, which is exactly what the bridge's own window shows.
// `message` is Dutch and written for the operator.
export interface CvpBinScan {
	bin: string;
	// One of `BinScanResults` on the bridge: "released", "waiting_for_bins",
	// "label_not_ready", "label_failed", "unreachable", ...
	result: string;
	message: string;
	waitingFor: string[];
	trackings?: string[];
	customer?: string | null;
	orderReference?: string | null;
	itemCount?: number | null;
	canPrintOnZebra?: boolean;
	// A free bin: the put wall no longer knows its labels (already freed, or
	// "Complete bakken meteen vrijgeven" on), so the operator picks from the
	// labels the bridge holds.
	showHeldList?: boolean;
	isProblem?: boolean;
}

// One label the bridge is holding for a bin nobody has scanned yet, from
// `/api/bins/held`. Customer, order and bin are filled in once a scan asked the
// put wall about it. A held job whose tracking could not be read is on the list
// too, with status "Error" and no tracking: it can only go to the Zebra.
export interface CvpHeldLabel {
	id: number;
	receivedAt: string;
	tracking: string | null;
	customer: string | null;
	reference: string | null;
	bin: string | null;
	itemCount: number | null;
	status: string;
	note: string | null;
}

// What the bridge says to an action on a held label. A refusal comes back as a
// 409 with the same body, `ok` false and the reason in `message`.
export interface CvpHeldAction {
	ok: boolean;
	message: string;
}

// One label as the bridge has it, from `/api/labels`.
export interface CvpBridgeLabel {
	id: number;
	tracking: string | null;
	reference: string | null;
	// "Received", "Staged", "Scanned", "Produced", "Error", ...
	status: string;
	error: string | null;
}

// Short: the bridge is on this machine and answers from its own store. A bridge
// that takes longer than this is not running, and the panel says so.
const TIMEOUT_MS = 5000;

// A bin release waits on the put wall service over the internet, which the
// bridge gives five seconds a call: one to ask about the bin, then one to free
// each bin of the order after its labels went. A two-bin order can take fifteen
// seconds on a slow line, and a page that gave up first would say the bridge is
// gone while the labels are already at the machine.
const BIN_TIMEOUT_MS = 30_000;

export function readBridgeHealth(): Promise<CvpBridgeHealth> {
	return request<CvpBridgeHealth>("GET", "/api/health");
}

// A `BK` scan, handed to the bridge as its own scan field would take it. Every
// outcome is an answer with a result code; only something that is not a bin
// code at all comes back as a 400, with the same body.
export function scanBin(bin: string): Promise<CvpBinScan> {
	return request<CvpBinScan>("POST", `/api/bins/${encodeURIComponent(bin)}/scan`, undefined, BIN_TIMEOUT_MS, [400]);
}

// The same release, to the Zebra: the machine is down, or the order is too big
// for one box. Offered when the scan answer says it can be.
export function printBinOnZebra(bin: string): Promise<CvpBinScan> {
	return request<CvpBinScan>("POST", `/api/bins/${encodeURIComponent(bin)}/print-zebra`, undefined, BIN_TIMEOUT_MS, [400]);
}

// The labels the bridge holds for bins, oldest first. Answered by whichever
// runs the bridge, its window or its Windows service: both serve the status
// page and its API.
export function readHeldLabels(): Promise<CvpHeldLabel[]> {
	return request<CvpHeldLabel[]>("GET", "/api/bins/held");
}

// A held label to the machine by hand. No bin is freed at the wall: nothing said
// which bin it was. A later scan of that bin frees it.
export function sendHeldToCvp(id: number): Promise<CvpHeldAction> {
	return request<CvpHeldAction>("POST", `/api/held/${id}/send-cvp`, undefined, TIMEOUT_MS, [409]);
}

export function printHeldOnZebra(id: number): Promise<CvpHeldAction> {
	return request<CvpHeldAction>("POST", `/api/held/${id}/print-zebra`, undefined, TIMEOUT_MS, [409]);
}

export function readRecentLabels(limit = 20): Promise<CvpBridgeLabel[]> {
	return request<CvpBridgeLabel[]>("GET", `/api/labels?limit=${limit}`);
}

// Who the next label is for, said just before it is printed. The bridge pairs
// it with the first label that arrives within its hint window, which is what
// puts the customer and the order on the CVP's screen. A hint that does not
// arrive costs nothing but that, so a failure here is logged and never stops
// the order.
export async function sendHint(hint: {
	reservation: string;
	order: string;
	customerName: string;
}): Promise<void> {
	try {
		await request("POST", "/api/hint", { ...hint, parcelIndex: 1, expectedCount: 1 });
	} catch (error) {
		debug("The CVP bridge did not take the hint.", error);
	}
}

function request<T>(method: "GET" | "POST", path: string, body?: object, timeout = TIMEOUT_MS,
	answeredStatuses: number[] = []): Promise<T> {
	const base = Settings.cvpBridgeUrl.trim().replace(/\/+$/, "");

	if (!base) {
		return Promise.reject(new CvpBridgeError("Het adres van de CVP-brug is niet ingesteld."));
	}

	return new Promise((resolve, reject) => {
		GM_xmlhttpRequest({
			method,
			url: base + path,
			timeout,
			headers: body ? { "Content-Type": "application/json" } : undefined,
			data: body ? JSON.stringify(body) : undefined,
			onload: (response) => {
				const ok = (response.status >= 200 && response.status < 300) || answeredStatuses.includes(response.status);

				if (!ok) {
					reject(new CvpBridgeError(`De CVP-brug antwoordde ${response.status}.`));

					return;
				}

				if (response.status == 202 || response.status == 204 || !response.responseText) {
					resolve(undefined as T);

					return;
				}

				try {
					resolve(JSON.parse(response.responseText) as T);
				} catch {
					reject(new CvpBridgeError("De CVP-brug gaf een antwoord dat niet te lezen is."));
				}
			},
			onerror: () => reject(new CvpBridgeError("De CVP-brug is niet bereikbaar.")),
			ontimeout: () => reject(new CvpBridgeError("De CVP-brug reageert niet.")),
		});
	});
}
