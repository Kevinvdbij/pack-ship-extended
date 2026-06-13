import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey, { cdn } from 'vite-plugin-monkey';

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
        match: ['https://retailvista.net/bztrs/packingportal*'],
        license: "MIT",
		    "run-at": "document-start",
      },
      build: {
        externalGlobals: {
          vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
        },
      },
    }),
  ],
});
