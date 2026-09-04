import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey from 'vite-plugin-monkey';
import { userstyle } from './build/userstyle.ts';
import { version } from './package.json' with { type: 'json' };

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
