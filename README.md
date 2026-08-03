# Pack&Ship Extended

A Tampermonkey userscript that extends the RetailVista Pack&Ship packing portal with quality-of-life
improvements: cached reservation details, automatic verification and finalisation, a product overview
with add/image buttons, mass completion of single-line reservations, and inline Shopware order notes.

Runs on `https://retailvista.net/bztrs/packingportal*`.

## Stack

Vue 3 (`<script setup>` SFCs) + TypeScript, bundled into a single userscript by
[vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey). Vue itself is loaded from a CDN
at runtime rather than bundled. jQuery is not a dependency — it is a global provided by the host
page, typed via `@types/jquery`.

## Development

```bash
npm install
npm run dev
```

Tampermonkey picks up the dev userscript served at `http://localhost:5173/`; install it once and
reload the portal to see changes. `dev` mounts the GM API into the page, so `GM_getValue` and
friends behave as they do in the real script.

Type-check and produce the distributable userscript in `dist/`:

```bash
npm run build
```

## Layout

| Path | Contents |
|---|---|
| `src/main.ts` | Route matching — picks the page component for the current URL and mounts it |
| `src/vue/pages/` | One component per portal page |
| `src/vue/components/` | Shared UI (selection modal, Shopware note, footer, modals) |
| `src/retailVistaUtils.ts` | DOM scraping and requests against the portal |
| `src/shopware.ts` | Shopware Admin/Store API client |
| `src/settings.ts` | Settings persisted through `GM_setValue` |

## Editor setup

[VS Code](https://code.visualstudio.com/) with
[Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur).
TypeScript cannot type `.vue` imports on its own, which is why `npm run build` uses `vue-tsc`
instead of `tsc`.
