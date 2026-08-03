import { Component, createApp } from "vue";

// The portal renders its own markup, so every component of ours needs a host
// element created and placed into that markup before it can be mounted.
export function mountApp(component: Component, attach: (host: HTMLDivElement) => void) {
	const host = document.createElement("div");

	attach(host);

	createApp(component).mount(host);
}
