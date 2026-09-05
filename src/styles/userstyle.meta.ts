// The metadata block of the emitted userstyle, and the URL prefix it applies
// to.
//
// Here rather than at the top of `src/styles/cloak.css` so the version can be
// read from `package.json` and stay in step with the userscript's. The two
// halves have to be installed together -- the cloak hides the page and only the
// script shows it again -- so a build that versioned one and not the other
// would leave nothing to tell which pair a machine is running.

export const USERSTYLE_NAME = "Pack & Ship Extended Style";
export const USERSTYLE_ID = "555698";

// The `@-moz-document url-prefix(...)` target. Stylus matches this itself; the
// userscript's own `@match` is declared separately in `vite.config.ts`, so the
// two are kept deliberately equivalent rather than shared -- they are different
// grammars with different wildcard rules.
export const PORTAL_URL_PREFIX = "https://retailvista.net/outdoor/packship";

export function userstyleMetadata(version: string) {
	const encoded = encodeURIComponent(USERSTYLE_NAME);

	return [
		"/* ==UserStyle==",
		`@name           ${USERSTYLE_NAME}`,
		"@namespace      NedFoxKHR",
		`@version        ${version}`,
		"@description    Companion to the Pack&Ship Extended userscript. Hides the portal until the script has built the page; the script carries every other rule. Generated from src/styles/cloak.css -- do not edit in Stylus.",
		"@author         Kevin van der Bij",
		"@license        MIT",
		`@downloadURL    https://update.greasyfork.org/scripts/${USERSTYLE_ID}/${encoded}.user.css`,
		`@updateURL      https://update.greasyfork.org/scripts/${USERSTYLE_ID}/${encoded}.meta.css`,
		"==/UserStyle== */",
	].join("\n");
}
