import { debug } from "./logger.ts";
import { domReady } from "./vue/mount.ts";

// Pins the portal's footer band to the bottom of the viewport.
//
// The vendor's own stylesheet positions `.footer` absolutely at the bottom of
// the page, and every screen that carries the row of controls overrides that
// back to `position: relative` with Bootstrap's utility class. On a short page
// the difference does not show -- the layout is a viewport-height flex column,
// so the band lands at the bottom either way -- but the parcels page is taller
// than the screen, and there the whole band scrolls away with the content.
//
// What is in that band is not a colophon: the automatic-handling toggle, the
// settings button, the environment the workstation is printing to and the way
// out of the session. Those are read and reached for mid-run, so the band stays
// where it can be reached.
//
// The height is measured and published as a custom property rather than written
// into the stylesheet, because it is not one number. The row wraps to two lines
// below 991px, and the login page's band is laid out differently again -- so
// the space reserved for the band is measured from the band itself, and
// remeasured whenever it changes shape.
const HEIGHT_PROPERTY = "--pse-footer-height";
const PINNED_CLASS = "pse-fixed-footer";

export async function pinFooter() {
	// The footer is the last thing in the document, so there is nothing to be
	// gained by watching for it: waiting for a finished document is the same
	// wait, and it is one the boot is making anyway. It is also the wait that
	// cannot hang -- an element watcher only reports absence when its timeout
	// expires, which is the trap `mountHeader()` had to be taken out of.
	await domReady();

	const footer = document.querySelector<HTMLElement>("footer");

	if (!footer) {
		debug("No footer to pin.");

		return;
	}

	// Measured before the class goes on, which costs nothing and keeps the two
	// in the right order: the property is what the class's rules reserve space
	// with, so a frame with the class on and no property set would be a frame
	// with the wrong padding. The band is the full width of the page in flow and
	// pinned alike, so taking the measurement in either state gives the same
	// answer.
	const publish = () => document.documentElement.style
		.setProperty(HEIGHT_PROPERTY, `${footer.offsetHeight}px`);

	publish();

	document.documentElement.classList.add(PINNED_CLASS);

	// The band changes height when the window gets narrow enough for its cells
	// to wrap. Watching the element rather than the window, so a change of shape
	// for any other reason is caught too.
	new ResizeObserver(publish).observe(footer);
}
