import { existsSync } from 'node:fs';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey from 'vite-plugin-monkey';
import { userstyle } from './build/userstyle.ts';
import { version } from './package.json' with { type: 'json' };

// `npm run dev` opens the dev userscript's install page, and vite-plugin-monkey
// hands that to whatever `BROWSER` names, falling back to the machine's default
// browser. The default here is Firefox, which has neither Tampermonkey nor a
// session on the portal, so the page it opens is of no use to anybody.
//
// Chrome by full path rather than by name: `open` resolves a bare "chrome"
// through the registry's App Paths, which is one more thing to be wrong on a
// machine where it is not registered. Only when nothing has set it already, so
// `BROWSER=none npm run dev` and the like still work from the shell.
process.env.BROWSER ??= chromePath();

function chromePath() {
	const suffix = String.raw`\Google\Chrome\Application\chrome.exe`;

	const candidates = [
		process.env.PROGRAMFILES,
		process.env["PROGRAMFILES(X86)"],
		process.env.LOCALAPPDATA,
	];

	// The bare name as a last resort. Chrome is not on `PATH` on Windows, so
	// this leans on the registry's App Paths, which is what `open` falls back
	// to -- worth having, not worth relying on.
	return candidates
		.filter((base) => base != undefined)
		.map((base) => base + suffix)
		.find((candidate) => existsSync(candidate))
		?? "chrome";
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    monkey({
      entry: 'src/main.ts',
      server: { mountGmApi: true },
      userscript: {
        name: "Pack&Ship Extended",
        description: "Extension for the RetailVista Pack&Ship application with plenty of QOL improvements.",
        icon: 'https://www.kampeerhalroden.nl/media/e9/9d/08/1703346720/favicon.ico',
        namespace: 'npm/vite-plugin-monkey',
        match: ['https://retailvista.net/outdoor/packship*'],
        // The regions we rewrite are cloaked before the portal's first paint
        // (see src/styles/portal.css), which only works if we are running by
        // then.
        'run-at': 'document-start',
        // The one host we call that is not the portal or Shopware: Greasy
        // Fork's metadata block, read on every page to see whether this
        // workplace is behind. See `src/update.ts`.
        connect: ['update.greasyfork.org'],
        license: "MIT",
      },
      // Vue is bundled rather than pulled from a CDN with @require. A required
      // resource has to be fetched before the script body runs, so on a cold or
      // slow cache our document-start script starts after the page has already
      // been painted -- and a cloak that goes up after the paint it was meant
      // to prevent is worse than none.
    }),
    // The companion Stylus style, built from `src/styles/` alongside the
    // userscript and versioned with it. Both halves have to be installed
    // together, so both are produced by the same command.
    userstyle(version),
  ],
});
