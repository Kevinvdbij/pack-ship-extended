import { GM_getValue, GM_listValues, GM_setValue } from "$";
import { reactive } from "vue";
import { PACKING_PORTAL_URL, STORAGE_KEYS } from "./constants.ts";
import { MassCompleteStatus } from "./interfaces.ts";
import Settings from "./settings.ts";
import { erpLogout } from "./erpSession.ts";
import { debug } from "./logger.ts";

// Signs the workplace out after it has been left alone for a while.
//
// The portal session belongs to a person and the workstation belongs to the
// packing floor, which is the whole problem: someone logs in, packs, and walks
// away, and the next person to pick up the scanner is working -- and printing,
// and finishing reservations -- under a name that is not theirs. The portal
// itself never signs anyone out. So this does, after a configured stretch of
// nobody touching it.
//
// The time is a setting, with a quarter of an hour as the default -- see
// `src/settings.ts` for why that length -- and "never" as one of the choices. A
// packing station that signs itself out mid-shift because a reservation took a
// while to walk is worse than one that does not sign out at all, so the time
// is picked from a short list of ones long enough to rule that out.

// Sixty seconds of "you are about to be signed out", with the countdown running
// and one button to stay. Nobody should lose a half-packed reservation to a
// timer they never saw, and a minute is long enough to get back across the
// counter.
//
// Never more than half the time itself. Every time the dialog offers is minutes
// long, so this does not come up -- but a warning window longer than the timer
// it warns about would mean the dialog was on screen from the moment the page
// settled, which is not a warning at all, and that is worth one line to rule
// out rather than a rule about which times may be offered.
const WARNING_MS = 60_000;

function warningMs(): number {
	return Math.min(WARNING_MS, timeoutMs() / 2);
}

// How often the clock is looked at. The deadline can move under us -- another
// tab counts as this workplace being in use -- so this polls rather than
// arming one timeout for the whole stretch.
const TICK_MS = 1000;

// The activity stamp is written at most this often. Every pointer press and key
// would otherwise be a write to the value store, which is shared with every
// other tab on the machine and answered synchronously.
const WRITE_EVERY_MS = 5000;

// What the warning dialog reads. Reactive because it is the same clock the
// dialog counts down from, and it is driven from here rather than from the
// component: the countdown is the state of the workplace, not of a dialog.
export const idleState = reactive({
	warning: false,
	// Whole seconds left, for the dialog to say.
	secondsLeft: 0,
});

let ticker: ReturnType<typeof setInterval> | undefined;
let lastWrite = 0;
let listening = false;

// Whether this page armed the timer at all. The settings dialog restarts it when
// it saves, and that dialog can be opened from the login page's own footer --
// where there is no session, nothing to sign out of, and a timer that fired
// would send the browser off the page somebody is typing their password into.
let started = false;

// When this page first saw a mass complete run in progress. A run holds the
// timer off, and a run that was interrupted -- the tab closed, the browser
// killed -- leaves its entries saying "started" for ever, which would hold the
// timer off for ever with it. Signing out is a safeguard, and a safeguard that
// can be switched off by a crash weeks ago is not one. So the hold is bounded:
// a real run of fifty reservations is minutes, and past this it is treated as
// the leftover it is.
let massCompleteSeenAt = 0;
const MASS_COMPLETE_HOLD_MS = 15 * 60_000;

// The events that mean somebody is here. Pointer presses and keys, which
// between them cover the scanner -- it types -- and anyone working the screen.
//
// Not `mousemove`: a mouse nudged by a passing sleeve, or by a cable on a
// counter, would hold a station signed in all afternoon, which is the state
// this exists to end.
const ACTIVITY_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"] as const;

export function startIdleLogout() {
	started = true;

	// The moment the page loads counts: the packer navigated here, whether by
	// pressing something on the page before it or by scanning into it.
	noteActivity(true);

	if (!listening) {
		for (const event of ACTIVITY_EVENTS) {
			// Captured, so a control that stops the event from bubbling still
			// counts as somebody being here, and passive because none of this
			// touches the event.
			document.addEventListener(event, () => noteActivity(), { capture: true, passive: true });
		}

		// A tab that is brought back to the front is a workplace being returned
		// to, which the events above do not see until something is pressed.
		document.addEventListener("visibilitychange", () => {
			if (!document.hidden) {
				noteActivity();
			}
		});

		listening = true;
	}

	restart();
}

// Called when the settings dialog saves, so a time that was just configured is
// the time that is running rather than the one the page loaded with.
export function restartIdleLogout() {
	restart();
}

function restart() {
	clearInterval(ticker);
	ticker = undefined;

	// Never from a page that did not arm it in the first place.
	if (!started) {
		return;
	}

	idleState.warning = false;

	if (timeoutMs() <= 0) {
		return;
	}

	debug(`Idle logout armed at ${Settings.idleLogoutSeconds} seconds.`);
	ticker = setInterval(tick, TICK_MS);
	tick();
}

function timeoutMs(): number {
	const seconds = Number(Settings.idleLogoutSeconds);

	return seconds > 0 ? seconds * 1000 : 0;
}

// The stamp is shared through the value store rather than kept here, so every
// tab on the machine counts as one workplace. A packer working in one tab with
// a reservation open in another must not be signed out by the tab they are not
// looking at.
export function noteActivity(force = false) {
	const now = Date.now();

	// The throttle is there to keep ordinary packing from writing to the value
	// store on every key. It must never swallow the press that calls off a
	// sign-out: during the warning minute that press is the whole point, and a
	// throttled one left the dialog counting down over somebody who had already
	// answered it. So a warning on screen forces the write through.
	if (!force && !idleState.warning && now - lastWrite < WRITE_EVERY_MS) {
		return;
	}

	lastWrite = now;
	GM_setValue(STORAGE_KEYS.idleActivity, now);
	idleState.warning = false;
}

function lastActivity(): number {
	return GM_getValue<number>(STORAGE_KEYS.idleActivity, 0) || Date.now();
}

function tick() {
	const timeout = timeoutMs();

	if (timeout <= 0) {
		return;
	}

	// A mass complete run drives tabs nobody is standing at, for minutes at a
	// time, and finishing it signs those reservations out of the floor's hands
	// rather than a person's. Signing out underneath it would strand the run
	// halfway with reservations announced and not finished, which is the one
	// state on this portal that takes somebody else's morning to unpick.
	if (massCompleteRunning()) {
		massCompleteSeenAt = massCompleteSeenAt || Date.now();

		if (Date.now() - massCompleteSeenAt < MASS_COMPLETE_HOLD_MS) {
			noteActivity(true);

			return;
		}

		debug("A mass complete run has been marked as running for too long to be one; ignoring it.");
	} else {
		massCompleteSeenAt = 0;
	}

	const remaining = timeout - (Date.now() - lastActivity());

	if (remaining <= 0) {
		logOut();

		return;
	}

	idleState.warning = remaining <= warningMs();
	idleState.secondsLeft = Math.ceil(remaining / 1000);
}

function massCompleteRunning(): boolean {
	return GM_listValues()
		.filter((key) => key.startsWith(STORAGE_KEYS.massCompleteEntryPrefix))
		.some((key) => GM_getValue<MassCompleteStatus>(key, MassCompleteStatus.idle) == MassCompleteStatus.started);
}

// Signing out is a POST, and it carries an antiforgery token.
//
// This is the part that cannot be guessed at: the portal's control is a form in
// the footer -- `<form action=".../Identity/Account/Logout?returnUrl=..." method="post">`
// with a `__RequestVerificationToken` in it -- and a plain navigation to that
// same URL does not sign anybody out. It answers with a page, the session
// stands, and the workplace is left logged in by a timer that reported it had
// done its job. So the portal's own form is submitted, token and all.
//
// If it is not on the page -- a page served without the footer, or the timer
// firing before the footer was parsed -- the intention is written down and the
// browser sent to a page that does have one. The next load picks it up.
//
// The ERP session goes first. It was created alongside the portal's and would
// otherwise outlive it in the browser profile, for the next person to inherit --
// see `erpLogout()`. Given a moment to land, but not more: nobody is standing
// here, and the portal's sign-out must not wait on an ERP that is not answering.
export function logOut() {
	clearInterval(ticker);
	ticker = undefined;
	idleState.warning = false;

	Promise.race([erpLogout(), new Promise<void>((resolve) => setTimeout(resolve, ERP_LOGOUT_BUDGET_MS))])
		.then(signOutOfPortal);
}

const ERP_LOGOUT_BUDGET_MS = 3000;

function signOutOfPortal() {
	const form = document.querySelector<HTMLFormElement>('form[action*="Logout"]');

	if (form) {
		debug("Idle timeout reached, signing out.");
		GM_setValue(STORAGE_KEYS.pendingLogout, false);
		form.submit();

		return;
	}

	debug("Idle timeout reached with no logout form on the page; signing out on the next one.");
	GM_setValue(STORAGE_KEYS.pendingLogout, true);
	window.location.assign(PACKING_PORTAL_URL);
}

// Called by the pages that mark the end of a session: the login page and the
// logout page. A sign-out owed from an earlier page has been overtaken by events
// once either of these is on screen -- the session it meant to end is over --
// and left standing it would be carried out on the first page of the *next*
// session, signing out whoever has just signed in.
export function clearPendingLogout() {
	if (GM_getValue<boolean>(STORAGE_KEYS.pendingLogout, false)) {
		debug("Dropping a held-over sign-out: the session it was for has ended.");
		GM_setValue(STORAGE_KEYS.pendingLogout, false);
	}
}

// Answers a logout that could not be carried out on the page that wanted it.
// Called once per page load, before anything else is mounted: the session is
// meant to be over, so this page is not one to stay on.
export function completePendingLogout(): boolean {
	if (!GM_getValue<boolean>(STORAGE_KEYS.pendingLogout, false)) {
		return false;
	}

	const form = document.querySelector<HTMLFormElement>('form[action*="Logout"]');

	if (!form) {
		return false;
	}

	GM_setValue(STORAGE_KEYS.pendingLogout, false);
	debug("Carrying out the sign-out that was held over from the previous page.");
	form.submit();

	return true;
}
