import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { Plugin } from "vite";
import { PORTAL_URL_PREFIX, userstyleMetadata } from "../src/styles/userstyle.meta.ts";

// Builds the second artefact: the Stylus style that carries the cloak.
//
// It is one rule, and it is here rather than typed into the Stylus editor for
// the same reason the rest of the CSS is -- so there is one place to look at
// what the extension does to the page, and the two halves carry the same
// version. `src/styles/cloak.css` explains why that rule cannot live in the
// userscript, and why nothing else has to live beside it.

// The source is a single file with no imports today. The inlining is kept
// anyway: it costs nothing, and it means splitting the cloak or giving it a
// shared value does not turn into a build change as well.
const IMPORT_PATTERN = /^@import\s+(?:url\()?["']([^"']+)["']\)?\s*;\s*$/gm;

async function inlineImports(path: string, seen = new Set<string>()): Promise<string> {
	// A file already pulled in contributes nothing the second time.
	if (seen.has(path)) {
		return "";
	}

	seen.add(path);

	const source = await readFile(path, "utf8");
	const imports: Promise<string>[] = [];

	// Collected first, then awaited: `replace` cannot take an async replacer, so
	// the resolved bodies are substituted back in a second pass in the same
	// order they were matched.
	source.replace(IMPORT_PATTERN, (_match: string, specifier: string) => {
		imports.push(inlineImports(resolve(dirname(path), specifier), seen));

		return "";
	});

	const bodies = await Promise.all(imports);
	let index = 0;

	return source.replace(IMPORT_PATTERN, () => bodies[index++]).trim();
}

// Stylus does not care about the indentation, but a person opening the
// installed style does: without it the block braces are invisible.
function indent(css: string) {
	return css
		.split("\n")
		.map((line) => (line.length > 0 ? `\t${line}` : line))
		.join("\n");
}

export function userstyle(version: string): Plugin {
	const source = "src/styles/cloak.css";

	let outDir = "dist";

	return {
		name: "pse:userstyle",
		// The userscript is the build's actual output; this rides along with it,
		// so it is only produced for a real build and not for `vite dev`.
		apply: "build",

		configResolved(config) {
			outDir = config.build.outDir;
		},

		// Registered here rather than in `configResolved`, which has no plugin
		// context to hang a watch off. The cloak is not reachable from the
		// userscript's module graph, so without this `vite build --watch` would
		// never notice a change to it and the two halves would drift.
		buildStart() {
			this.addWatchFile(resolve(source));
		},

		async writeBundle() {
			const css = await inlineImports(resolve(source));
			const target = resolve(outDir, "pack-ship-extended.user.css");

			await mkdir(dirname(target), { recursive: true });
			await writeFile(
				target,
				`${userstyleMetadata(version)}\n\n`
					+ `@-moz-document url-prefix("${PORTAL_URL_PREFIX}") {\n${indent(css)}\n}\n`,
				"utf8",
			);

			this.info?.(`userstyle written to ${target}`);
		},
	};
}
