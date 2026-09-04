# Working on this repo

Read `README.md` first — it covers the stack, the load behaviour and the companion Stylus style.
This file is the part that only matters while making changes.

## Inspecting the live portal

The portal is behind a login and its markup is not in this repo, so anything about its DOM has to be
checked against the running page rather than guessed. **Use the Claude in Chrome tools** (`mcp__claude-in-chrome__*`)
— Kevin's Chrome has the session, so `https://retailvista.net/outdoor/packship` opens straight into
the packing portal with the userscript and the Stylus style both active.

Useful things to run there with `javascript_tool`:

- Structure of a region — walk `document.body.firstElementChild` and print tag/id/class per level.
- Whether our replacements took — `getComputedStyle(el).textAlign`, `el.closest('.pse-field-shell')`,
  `[...document.querySelector('#frmReservations').elements].map(e => e.name)`.
- Where the portal put something before we moved it — check `contains()` **before** the page mounts,
  since our code relocates elements at mount.

Two things that will mislead you:

- **Anonymous fetches of portal assets are not what the session serves.** `curl` on
  `/outdoor/packship/img/NedFox_Logo_Nieuw.png` returns the vendor's stock logo; the session serves a
  customer-branded file at the same URL and the same dimensions. Read assets through the page, not
  from outside it.
- **Synthetic focus events do not behave like real ones in a background tab.** `el.focus()` followed
  by `el.blur()` fires no `focusout` at all, so focus behaviour tests as broken when it is fine.
  Drive it with real `computer` clicks instead.

Undo anything injected for a test (or just reload) before finishing.

## Portal markup we depend on

Selectors live in `src/constants.ts`. The ones that are load-bearing and easy to break:

| Selector | What it is |
|---|---|
| `.row.nfmlcomp` | The header band. Hidden entirely; `Header.vue` mounts before it |
| `.container > div.row.justify-content-md-center` | The search block. Hidden; its inputs and `#messages` are lifted out first |
| `#frmReservations`, `#ReservationNumber`, `#Productbarcode` | The portal's search form and its two inputs |

The portal wraps its pages in `.container-fluid.text-center`, and that **inherits into anything we
mount**. Any block of ours that contains text needs its own `text-align`.

## Two traps that have already cost time

- **The cloak blocks focus.** The Stylus style hides the page with `visibility: hidden` until
  `pse-ready`, and a hidden element cannot be focused — `focus()` is dropped silently and does *not*
  take effect when the cloak lifts. Anything that places the cursor must go through
  `afterReveal()` in `src/reveal.ts`.
- **Load timing cannot be judged in `npm run dev`** (see README). Build and install before believing
  anything about paint order.

## Brand

Colours come from one palette in `src/style.css` (`--pse-*` on `:root`). The green is Kampeerhal
Roden's own `--bs-primary` (`#689F69`), taken from their storefront theme at kampeerhalroden.nl —
not sampled from the portal. `--pse-brand-ink` is the same green darkened until white text on it
clears 4.5:1, for filled buttons.

`src/assets/kampeerhal-roden.svg` is their logo from their own site, recoloured from the white
variant to that green. It is deliberately *not* cropped out of the vendor's combined logo file.
