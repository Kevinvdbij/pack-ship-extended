# Pack&Ship Extended

A Tampermonkey userscript that extends the RetailVista Pack&Ship packing portal with quality-of-life
improvements: cached reservation details, automatic verification and finalisation, a product overview
with add/image buttons, mass completion of single-line reservations, and inline Shopware order notes.

The environment ("Omgeving") picker is configured per computer rather than per session. The portal
keeps that choice on the user session, so someone logging in carries the previous workplace along and
prints at the wrong location. Pinning it in the settings modal hides the portal's dropdown and pushes
the configured value back into the session on every page load.

Runs on `https://retailvista.net/outdoor/packship*`.

## Load behaviour, and the one rule that cannot be in the script

The portal renders its own markup server-side, so anything we change is on screen in the portal's
version first unless we get there before the first paint. Fading our version in does not hide that,
it only spreads it out — which is why the extension used to be limited to small additions.

Instead the page is hidden until the extension has finished building it, then shown once, complete.
The script runs at `document-start` and mounts each part as soon as the markup it needs is parsed,
rather than waiting for `DOMContentLoaded`, so nothing intermediate is ever visible and a region can
be changed as drastically as we like without a transition to soften it.

**The hiding is not done by the script, and cannot be.** Tampermonkey injects from an extension
service worker that Chrome is free to leave asleep, so a userscript has no way to guarantee it runs
before the first paint — and a rule that goes up after the paint it was meant to prevent is worse
than none. It is delivered by a companion [Stylus](https://add0n.com/stylus.html) style instead,
which is a stylesheet and applies whether or not any script has run. `src/reveal.ts` adds `pse-ready`
once the boot is done, which is what shows the page.

That style is **one rule**, and everything else is in the userscript:

```css
html:not(.pse-ready) body > * { visibility: hidden !important; }
```

The cloak is what lets the rest stay in the script. Restyling something the portal paints normally
has to beat the first paint or it flashes — but while the page is cloaked there is nothing on screen
to flash, so a stylesheet injected at `document-start` is in force long before anything is visible.
Win the race once, here, and nothing else has to run it.

| Artefact | Installed in | Built from |
|---|---|---|
| `dist/pack-ship-extended.user.js` | Tampermonkey | `src/main.ts` and everything it imports |
| `dist/pack-ship-extended.user.css` | Stylus | `src/styles/cloak.css` |

`npm run build` emits both, versioned together from `package.json`. Paste the `.css` into Stylus when
it changes — which should be close to never, since the rule is unlikely to move again.

### Where a rule goes

Three files, split by whose markup it styles:

- `src/styles/portal.css` — **the vendor's elements.** Bootstrap chrome recoloured to the house
  green, and the images we substitute. Every selector starts with `:root`: these tie the portal's own
  rules on specificity, and a script-injected `<style>` can land either side of the portal's `<head>`,
  so the extra pseudo-class settles it on specificity rather than on document order.
- `src/style.css` — **our elements,** where more than one component needs the rule.
- `<style scoped>` — **our elements,** where one component does.

All three draw on `src/styles/palette.css`, so the brand green is declared once and changing it moves
the portal's buttons and ours together.

Controls we take away — the environment and language pickers — are hidden from `src/environment.ts`
and `src/language.ts` rather than from CSS, because whether they should be hidden depends on what is
configured, which a stylesheet cannot know.

> **Both halves have to be installed together.** With the style active and the userscript disabled or
> broken, the page stays hidden until the failsafe in `src/reveal.ts` fires — three seconds of blank
> screen with nothing to explain it. That failsafe is load-bearing, not a formality: it is the only
> thing that gives the operator a page back when the script does not run. If you disable the
> userscript, disable the style too.
>
> The reverse is now survivable: with the script running and the style missing, the page is not
> cloaked, so the portal's own chrome shows for an instant before our CSS lands. It flashes, but it
> works.

Work that waits on the network cannot be part of the reveal, because holding the whole page on a
request is worse than a region arriving late. The reservation table is the one case: it renders a
skeleton sized from the portal's own row inputs and fills it in afterwards, so the swap moves
nothing.

## Stack

Vue 3 (`<script setup>` SFCs) + TypeScript, bundled into a single userscript by
[vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey). Vue is bundled rather than
pulled from a CDN: an `@require` has to be fetched before the script body runs, which delays the
script past the portal's first paint and breaks the load behaviour described below. jQuery is not a
dependency — it is a global provided by the host
page, typed via `@types/jquery`.

## Development

```bash
npm install
npm run dev
```

Tampermonkey picks up the dev userscript served at `http://localhost:5173/`; install it once and
reload the portal to see changes. `dev` mounts the GM API into the page, so `GM_getValue` and
friends behave as they do in the real script.

**Load timing cannot be tested in dev mode.** The dev userscript is a stub that injects a
`<script src="http://127.0.0.1:5173/...">` tag; the real code arrives asynchronously over HTTP, long
after the document is parsed, so everything looks like it flickers no matter what the code does.
Judge anything about paint timing against an installed `npm run build` artefact only.

Type-check and produce both distributable artefacts in `dist/` — the userscript and the
companion style:

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
| `src/settings.ts` | Settings persisted through `GM_setValue`, edited in the footer's settings modal |
| `src/style.css` | Global rules for our own markup, bundled into the userscript |
| `src/styles/portal.css` | The vendor's own elements, restyled |
| `src/styles/palette.css` | The brand colours, shared by every stylesheet above |
| `src/styles/cloak.css` | The one rule the userscript cannot deliver, emitted as the Stylus style |
| `build/userstyle.ts` | The Vite plugin that wraps the cloak into an installable style |
| `src/reveal.ts` | Shows the page once the boot is done, and the failsafe that shows it regardless |
| `src/environment.ts` | Pins the portal's environment ("Omgeving") to the machine |
| `src/currentUser.ts` | Name of the logged-in employee, captured on the Login page and shown in the footer |

## Editor setup

[VS Code](https://code.visualstudio.com/) with
[Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur).
TypeScript cannot type `.vue` imports on its own, which is why `npm run build` uses `vue-tsc`
instead of `tsc`.
