import Settings from "./settings.ts";
import { debug } from "./logger.ts";
import { binLabel, withBinLabels } from "./constants.ts";

// The put wall service, as far as Pack&Ship needs it: handing out a bin, being
// told the bin's label exists, and taking the bin back when the packer changes
// their mind.
//
// The service owns the bins. A bin is a physical tote that the wall's binners
// also scan, so whether one is free is never decided here -- a scan of a bin
// that is in use for another order is refused by the service, and that refusal
// is what the packer is shown.
//
// Plain `fetch`: the service answers the portal's origin with CORS on its
// plugin routes, and the token is the plugin's own, given out for Pack&Ship.

export class PutWallError extends Error {}

// What a claim is made for. The service may never have seen this reservation --
// it does not have to have been on the wall -- so it is told enough to show it.
export interface BinClaim {
	reservationId: number;
	reservationNumber: number;
	orderReference: string;
	customer: string;
}

// Long enough for a service on the site's own network, short enough that a
// packer holding a bin is not left looking at a page that is not answering.
const TIMEOUT_MS = 8000;

export function claimBin(bin: string, claim: BinClaim): Promise<void> {
	return post(bin, "claim", claim);
}

// Only once the bin's label has been sent to the CVP's printer: the service
// counts the bin as ready to go into the machine from this call on.
export function reportBinTracking(bin: string, reservationId: number, tracking: string, itemCount: number): Promise<void> {
	return post(bin, "tracking", { reservationId, tracking, itemCount });
}

export function unclaimBin(bin: string, reservationId: number): Promise<void> {
	return post(bin, "unclaim", { reservationId });
}

async function post(bin: string, action: string, body: object): Promise<void> {
	const base = Settings.putWallUrl.trim().replace(/\/+$/, "");

	if (!base || !Settings.putWallToken.trim()) {
		throw new PutWallError("De sorteerwand is niet ingesteld op deze werkplek.");
	}

	let response: Response;

	try {
		response = await fetch(`${base}/api/plugin/bins/${encodeURIComponent(bin)}/${action}`, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${Settings.putWallToken.trim()}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
			signal: AbortSignal.timeout(TIMEOUT_MS),
		});
	} catch (error) {
		console.error("Pack&Ship Extended could not reach the put wall.", error);

		throw new PutWallError("De sorteerwand is niet bereikbaar.");
	}

	if (response.ok) {
		debug(`Put wall: ${action} ${bin}`, body);

		return;
	}

	// The service words its refusals for the packer ("BK0017 is in gebruik voor
	// reservering ..."), so its own sentence is the one shown -- with the bin
	// named the way the packer reads it off the tote.
	const answer = await response.json().catch(() => null) as { error?: string } | null;

	throw new PutWallError(answer?.error
		? withBinLabels(answer.error)
		: `De sorteerwand weigerde ${binLabel(bin)} (${response.status}).`);
}
