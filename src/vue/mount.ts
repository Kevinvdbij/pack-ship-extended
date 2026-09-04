import { Component, createApp } from "vue";
import { debug } from "../logger.ts";

// The portal renders its own markup, so every component of ours needs a host
// element created and placed into that markup before it can be mounted.
export function mountApp(component: Component, attach: (host: HTMLDivElement) => void) {
	const host = document.createElement("div");

	attach(host);

	createApp(component).mount(host);
}

// Resolves once the portal's markup is complete.
//
// It is tempting to mount earlier -- the moment an anchor element appears --
// but an anchor exists as soon as its opening tag is parsed, which for `body`
// and `.container` is within a millisecond of document-start. Mounting there
// means mounting into a container the portal has not filled yet, so our block
// ends up above content that streams in afterwards instead of past the end of
// it, and every insertion then shifts the page as it loads.
//
// Waiting costs us a paint -- the portal's own page is on screen first -- and
// that is the right trade: appending to a finished document moves nothing,
// while hiding the page to cover the wait only turns a local change into a
// whole-page one.
export function domReady(): Promise<void> {
	if (document.readyState != "loading") {
		return Promise.resolve();
	}

	return new Promise((resolve) => {
		document.addEventListener("DOMContentLoaded", () => resolve(), { once: true });
	});
}

// How long to keep looking before giving up. A route whose anchor never shows
// up is a route that no longer matches the portal's markup; waiting forever
// would keep the boot -- and with it the cloak's release -- pending.
const ANCHOR_TIMEOUT_MS = 5000;

// For anchors the portal builds with its own scripts, which can land after
// DOMContentLoaded. Anything present in the served markup is already there by
// the time domReady() resolves and returns on the first look.
export function whenPresent<T extends Element>(find: () => T | null): Promise<T | null> {
	const existing = find();

	if (existing) {
		return Promise.resolve(existing);
	}

	return new Promise((resolve) => {
		const settle = (found: T | null) => {
			observer.disconnect();
			clearTimeout(timeout);
			resolve(found);
		};

		const observer = new MutationObserver(() => {
			const found = find();

			if (found) {
				settle(found);
			}
		});

		const timeout = window.setTimeout(() => {
			debug("Timed out waiting for an anchor element.");
			settle(null);
		}, ANCHOR_TIMEOUT_MS);

		observer.observe(document.documentElement, { childList: true, subtree: true });
	});
}
