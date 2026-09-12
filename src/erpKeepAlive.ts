import { GM_getValue, GM_setValue } from "$";
import { STORAGE_KEYS } from "./constants.ts";
import { probeErpSession } from "./erpSession.ts";
import { debug } from "./logger.ts";

// Keeps the ERP session alive for as long as the portal's is in use.
//
// The two sessions are created together at sign-in and, since `erpLogout()`,
// ended together -- but between those two moments they keep separate clocks.
// The portal never expires a session that is being used, because every page a
// packer opens is a request against it. The ERP sees nothing of that: its only
// requests come from the hidden frame, and only when a bay is read or a label
// reprinted. A quiet hour of ordinary packing -- single-line orders, no rack --
// is an hour in which the ERP hears nothing, and an ASP.NET session that hears
// nothing for its timeout is gone. The packer then finds out when they next
// press a bay, and is asked for a password they typed once that morning.
//
// So the ERP is touched on a schedule instead, with the same request the session
// check makes. Its session is sliding -- every request restarts the clock -- so
// touching it more often than it times out is enough to keep it for the length
// of the shift. Nothing is stored to do it with: this only works on a session
// that exists, which is the point. It cannot bring one back, and does not try.
//
// Only while the portal is in use. This runs on the pages that have a session --
// never the login and logout pages -- and the idle sign-out takes those pages
// away when nobody is here, which is what stops a station left overnight holding
// an ERP seat until morning. A workplace with the idle sign-out switched off
// holds its ERP session exactly as long as it holds its portal one, which is
// what "in step" means.

// Comfortably inside any timeout the ERP is likely to have. ASP.NET's default
// session timeout is twenty minutes, and a forms ticket that slides renews once
// half its life has passed; five minutes is well under both, and forty-odd
// kilobytes every five minutes is not a load anybody will notice.
const INTERVAL_MS = 5 * 60_000;

// How often a tab looks at the clock. The stamp is shared -- see below -- so this
// is not the interval, only how late a touch can be.
const TICK_MS = 30_000;

let ticker: ReturnType<typeof setInterval> | undefined;

// Off while the ERP has told us it has no session. Touching a login form every
// five minutes keeps nothing alive and would only log the same refusal on a
// schedule; the next successful sign-in switches this back on.
let paused = false;

let inFlight = false;

export function startErpKeepAlive() {
	if (ticker) {
		return;
	}

	ticker = setInterval(tick, TICK_MS);
	tick();
}

// Told by whoever found the ERP signed out. Nothing to keep alive until a
// sign-in says otherwise.
export function pauseErpKeepAlive() {
	paused = true;
}

// Told by a successful sign-in. The stamp is set here too, since the sign-in
// itself was a touch.
export function resumeErpKeepAlive() {
	paused = false;
	GM_setValue(STORAGE_KEYS.erpKeepAlive, Date.now());
}

// Any tab may make the touch, and only one of them needs to. The stamp is in the
// value store so that every tab on the machine -- a mass complete run opens
// several -- shares one clock: whichever tab ticks first after the interval has
// passed makes the request and writes the stamp, and the rest see it and wait.
async function tick() {
	if (paused || inFlight) {
		return;
	}

	const sinceLastTouch = Date.now() - GM_getValue<number>(STORAGE_KEYS.erpKeepAlive, 0);

	if (sinceLastTouch < INTERVAL_MS) {
		return;
	}

	// A hidden tab defers to the visible ones, unless there have been none for a
	// while: a station whose only portal tab is behind another window is still a
	// station in use.
	if (document.hidden && sinceLastTouch < INTERVAL_MS * 2) {
		return;
	}

	// Claimed before the request rather than after, so two tabs that tick in the
	// same second do not both go.
	GM_setValue(STORAGE_KEYS.erpKeepAlive, Date.now());
	inFlight = true;

	try {
		const state = await probeErpSession();

		debug(`ERP keep-alive: ${state}.`);

		// Told here, not shown. A dialog appearing on its own in the middle of a
		// scan is the interruption this module exists to prevent; the prompt is
		// raised by the first thing that actually needs the ERP, as it always
		// was, and by then the packer is looking at the screen.
		if (state == "signed-out") {
			paused = true;
		}
	} finally {
		inFlight = false;
	}
}
