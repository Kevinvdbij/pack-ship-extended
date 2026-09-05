import { ref } from "vue";
import iconSvg from "./assets/pwa-icon.svg?raw";
import maskableSvg from "./assets/pwa-icon-maskable.svg?raw";
import { PACKING_PORTAL_URL } from "./constants.ts";

// Makes the portal installable as an app, so the packing station runs it in a
// window of its own -- no address bar, no tab strip, and its own icon on the
// desktop and the taskbar.
//
// The portal serves no manifest, and we cannot put one on their server: a
// userscript has nothing but the page it is injected into. So the manifest is
// built here and declared as a `data:` URL, icons and all.
//
// **It has to be `data:`, not `blob:`.** A blob URL looks like the better fit
// -- it is same-origin with the page that made it and it fetches from the page
// perfectly well -- but Chrome will not install from one: with a blob manifest
// declared it never offers, and with the identical manifest as a data URL it
// offers immediately. The icons go the same way, as `data:` PNGs inside it.
// Both were checked against the live portal rather than reasoned about.
//
// There is no service worker and there cannot be one. A worker script has to be
// a same-origin *file*, and none of the URLs a userscript can mint is one -- so
// the installed app is a window onto the live portal rather than something that
// works offline. That is the right shape for it anyway: every screen it has is
// a request against RetailVista, so there would be nothing to serve when the
// network is gone.
//
// This runs at document-start along with everything else. Chrome re-reads the
// manifest whenever the link changes, so the timing is not critical -- but the
// earlier it is up, the sooner the install is on offer. The icons make it
// asynchronous: the link goes up as soon as they are drawn, which is a few
// milliseconds in and long before the document is complete.

const MANIFEST_LINK_ID = "pse-manifest";

// The scope decides which URLs stay inside the app window. The whole portal
// lives under this path and nothing else on the host is ours, so it is exactly
// the prefix the userscript itself matches on: a link out of Pack&Ship opens in
// the browser, everything within it stays in the app.
//
// **No trailing slash.** Chrome matches the scope as a prefix of the URL, and
// the portal's own home page is served at `/outdoor/packship` exactly -- so
// with a slash on the end, the one screen the app opens on counts as outside
// itself and Chrome puts its black "you have left the app" bar over the top of
// it. Without one, both that page and everything under it are inside.
const SCOPE = PACKING_PORTAL_URL;

// What the app window should be, best first: the browser takes the first of
// these it supports.
//
// `window-controls-overlay` gives the page the whole window and floats only the
// close and minimise buttons over the top corner -- not fullscreen, but the
// nearest thing to it that is a property of the *window* and therefore cannot
// be lost by clicking through to the next page. `standalone` is the fallback,
// and is a window of its own without the address bar and tab strip.
//
// Deliberately not `fullscreen`. Chrome on desktop does not support that mode
// -- it belongs to Android and ChromeOS, and on Windows it falls straight back
// to `standalone` -- so asking for it only misleads whoever reads this next.
// The README records what else was tried and what it cost.
//
// Chrome records the mode when the app is installed, so a change here reaches
// an existing install only after uninstalling and installing it again.
const DISPLAY_MODES = ["window-controls-overlay", "standalone", "minimal-ui"] as const;

// Whether Chrome has offered to install. It fires `beforeinstallprompt` when
// the manifest is accepted and the app is not installed yet, which is the only
// honest signal there is -- so the button in the footer follows this rather than
// being shown unconditionally and failing when pressed.
export const canInstall = ref(false);

// Chrome only lets the prompt be raised from a user gesture, and only once per
// event. It hands the event over ahead of time and expects it back.
let deferredPrompt: BeforeInstallPromptEvent | null = null;

// True when the page is being viewed in the installed app rather than in a
// browser tab. `display-mode` reports the mode actually granted, so a window
// that asked for one thing and was given another still answers here.
export function isInstalledApp() {
	return DISPLAY_MODES.some((mode) => matchMedia(`(display-mode: ${mode})`).matches);
}

export function installApp(): Promise<boolean> {
	const prompt = deferredPrompt;

	if (!prompt) {
		return Promise.resolve(false);
	}

	// Spent: Chrome refuses a second `prompt()` on the same event, and hands
	// over a fresh one if the install is dismissed and becomes possible again.
	deferredPrompt = null;
	canInstall.value = false;

	return prompt.prompt()
		.then(() => prompt.userChoice)
		.then((choice) => choice.outcome == "accepted")
		.catch((error) => {
			console.error("Pack&Ship Extended failed to open the install prompt.", error);

			return false;
		});
}

export function installManifest() {
	// Marked on the root element, so a rule can tell the installed window from
	// a browser tab. Nothing keys off it yet -- it is here because the two are
	// otherwise indistinguishable from CSS, and the window without an address
	// bar above it is the one that will want the difference first.
	if (isInstalledApp()) {
		document.documentElement.classList.add("pse-app");
	}

	window.addEventListener("beforeinstallprompt", (event) => {
		// Chrome shows its own install bar off this event. Ours is a pill in
		// the footer instead, which is where every other control of ours is.
		event.preventDefault();

		deferredPrompt = event as BeforeInstallPromptEvent;
		canInstall.value = true;
	});

	window.addEventListener("appinstalled", () => {
		deferredPrompt = null;
		canInstall.value = false;
	});

	return buildManifest()
		.then(link)
		.catch((error) => console.error("Pack&Ship Extended failed to publish its web app manifest.", error));
}

async function buildManifest() {
	const [icon, maskable] = await Promise.all([rasterise(iconSvg), rasterise(maskableSvg)]);

	return {
		// A stable id, so reinstalling or changing anything below updates the
		// app the station already has rather than adding a second one. Without
		// it the id defaults to the start URL, which could then not be changed
		// without orphaning the installed copy.
		id: "pack-ship-extended",
		name: "Pack&Ship",
		short_name: "Pack&Ship",
		description: "RetailVista Pack&Ship, met Pack&Ship Extended.",
		lang: "nl-NL",
		dir: "ltr",
		start_url: SCOPE,
		scope: SCOPE,
		// `display` names the mode every browser understands; `display_override`
		// is what asks for the overlay, which the fixed fallback chain behind
		// `display` has no way to express.
		display: "standalone",
		display_override: [...DISPLAY_MODES],
		// The window's own colours: the ground it paints while a page is on its
		// way, and the strip of chrome above the page.
		//
		// Both white, and the second one deliberately not the brand green. That
		// strip sits directly above a page whose top is white, so a green one
		// is a band of colour with nothing on it, cut off from everything else
		// green on the page. White, it reads as the top of the page rather than
		// as a bar over it, and the green stays where it means something.
		background_color: "#ffffff",
		theme_color: "#ffffff",
		icons: [
			{ src: icon, sizes: "512x512", type: "image/png", purpose: "any" },
			{ src: maskable, sizes: "512x512", type: "image/png", purpose: "maskable" },
		],
	};
}

function link(manifest: object) {
	const url = "data:application/manifest+json;utf8," + encodeURIComponent(JSON.stringify(manifest));

	// Replaced rather than added to: a second `rel="manifest"` is ignored, so on
	// a re-run the stale one would be the one that counts.
	document.getElementById(MANIFEST_LINK_ID)?.remove();

	const element = document.createElement("link");
	element.id = MANIFEST_LINK_ID;
	element.rel = "manifest";
	element.href = url;

	// `head` at document-start may not have been parsed yet. The parser adopts
	// a link put on the root element into the head it then builds, so there is
	// nothing to wait for.
	(document.head ?? document.documentElement).append(element);
}

// An SVG through a canvas and back out as a `data:` PNG. Chrome will not take
// an SVG as an installable icon, and the shape of the mark is worth keeping in
// a form a person can read -- so it is stored as the drawing and turned into
// what Chrome wants here. The result goes straight into the manifest, which is
// itself a data URL, so the whole thing is one string with nothing to fetch.
async function rasterise(svg: string) {
	const size = 512;
	const image = new Image();

	// Loaded as an image, which means the file is parsed as XML rather than as
	// HTML: anything XML rejects fails here with an `EncodingError` and no
	// indication of what in the file caused it. The one that has already cost
	// an afternoon is the house em dash, which is two hyphens and therefore not
	// allowed inside an XML comment. The icon files say so at the top.
	image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
	await image.decode();

	const canvas = document.createElement("canvas");
	canvas.width = canvas.height = size;
	canvas.getContext("2d")?.drawImage(image, 0, 0, size, size);

	return canvas.toDataURL("image/png");
}

// Not in the DOM lib: the event is Chromium's own, and this is the shape of it.
interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>;
	readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
