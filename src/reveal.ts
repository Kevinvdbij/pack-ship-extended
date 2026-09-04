// The page is hidden until the extension has finished building it, and shown
// once, complete. Nothing of the portal's own version of a region is ever on
// screen, so a region can be changed as drastically as we like without a
// transition to soften the swap -- there is no earlier version to swap from.
//
// The hiding is not done here. It cannot be: a userscript is injected from an
// extension service worker that the browser is free to have asleep, so it has
// no way to guarantee it runs before the first paint, and a rule that goes up
// after the paint it was meant to prevent is worse than none. The rule lives in
// `src/styles/cloak.css` instead, delivered as a Stylus style, which applies
// whether or not any script has run:
//
//     html:not(.pse-ready) body > * { visibility: hidden !important; }
//
// All this module does is take it off again -- and because that one rule holds
// the page back, every other stylesheet of ours can be injected by the script
// on its own schedule.

const READY_CLASS = "pse-ready";

// Load-bearing, not a formality. The theme hides the page unconditionally, so
// if our script is slow, throws, or never runs at all, this is the only thing
// that gives the operator a page back. It is armed before anything else and
// fires regardless of how the boot is getting on.
const FAILSAFE_MS = 3000;

let revealed = false;

// Work that has to wait for the page to be on screen. The theme hides it with
// `visibility: hidden`, and a hidden element cannot take focus -- `focus()`
// called under the cloak is dropped, and it does not come back once the cloak
// lifts. Anything that puts the cursor somewhere therefore has to be queued
// here rather than run at mount.
const pendingWork: Array<() => void> = [];

export function armReveal() {
	setTimeout(reveal, FAILSAFE_MS);
}

// Runs `work` once the page is visible, or straight away if it already is.
// Callers do not have to know which of the two it is.
export function afterReveal(work: () => void) {
	if (revealed) {
		work();
		return;
	}

	pendingWork.push(work);
}

export function reveal() {
	if (revealed) {
		return;
	}

	revealed = true;
	document.documentElement.classList.add(READY_CLASS);

	// Drained after the class is on, so the queued work sees a visible page.
	// Individually guarded: the reveal is what gives the operator a page back,
	// so nothing queued behind it may take the rest of the queue down with it.
	while (pendingWork.length > 0) {
		try {
			pendingWork.shift()!();
		} catch (error) {
			console.error("Pack&Ship Extended failed to run work queued for the reveal.", error);
		}
	}
}

// How long to wait for those frames before going ahead without them. Long enough
// that an ordinary visible load is never cut short by it -- two frames is 33ms
// at 60Hz -- and short enough that a page which stops painting mid-step is not
// left standing.
const PAINT_TIMEOUT_MS = 400;

// Runs `work` once the page has had a chance to be drawn.
//
// Two frames, because one only gets us to the frame the work's own markup was
// rendered in and the second is the one after it has been put on screen. That is
// what the pages which navigate on the operator's behalf wait for: a form posted
// before the paint replaces a screen that was never actually shown, and the
// operator sees more of the white gap the screen exists to fill.
//
// But frames are the wrong thing to wait for on a page nobody is looking at. A
// hidden tab is not painted at all and `requestAnimationFrame` never fires in
// one, so a step queued behind frames simply stops -- which is what happened to
// mass complete: every reservation opens in a background tab, and every one of
// them sat on the verification step until the operator clicked it into view.
//
// So a hidden page does not wait. There is no paint to wait for and no operator
// to spare the gap. The timer covers the case in between -- a tab that is
// visible when the work is queued and is put behind another before its frames
// come round -- so a step can be delayed by a paint but never held by the lack
// of one.
export function afterPaint(work: () => void) {
	let ran = false;

	const once = () => {
		if (ran) {
			return;
		}

		ran = true;
		work();
	};

	if (document.hidden) {
		once();
		return;
	}

	requestAnimationFrame(() => requestAnimationFrame(once));
	setTimeout(once, PAINT_TIMEOUT_MS);
}
