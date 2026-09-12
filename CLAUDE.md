# Working on this repo

Read `README.md` first — it covers the stack, the load behaviour and the companion Stylus style.
This file is the part that only matters while making changes.

## Releasing

Don't. Finish the change, build it so it is known to compile, and stop there — Kevin cuts the
release when he is ready for one. `npm version` tags and the tag publishes to Greasy Fork, so a
release is a decision about what reaches the packing floor rather than the last step of a fix.

Commit the work if the task called for it, and say the build is ready. Bump and push only when
asked for a release in so many words.

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
| `#ReservationSummary\ mb-2` | The reservation fields, read by `ReservationSidebar.vue` and then hidden. Keep it in the document — `getCurrentOrderNumber()` reads it and `#ReservationId` is inside it |
| `#ParcelsContainer` | The parcel area on the parcels page. **Never move anything out of it:** the portal's `refresh()` replaces its entire contents after every parcel change |
| `#tabs-parcels`, `#parcelsGroup` | Served empty and filled in after DOMContentLoaded by the portal's `init()` over AJAX. This is the region the skeleton stands in for |
| `img.nfLogoSmall` | The vendor's wordmark on the pages served without a header band |

The portal wraps its pages in `.container-fluid.text-center`, and that **inherits into anything we
mount**. Any block of ours that contains text needs its own `text-align`.

**Not every page has `.row.nfmlcomp`.** The parcels page and the verification step are served without a
header band at all, and `whenPresent` only reports absence when its own timeout expires — which is
longer than the reveal failsafe, so waiting for a band that never comes cost three seconds of blank
screen on every trip into a reservation. `mountHeader()` races that lookup against `domReady()` and
mounts our band at the top of `PAGE_COLUMN_SELECTOR` when the portal serves none.

## Driving the ERP

`src/erpFrame.ts` offers two ways in, and which one a job needs depends on how it addresses a
record.

- **A bare screen** (`erpTask`) — `Default.aspx?pageId=<n>` in a frame. Enough for anything keyed by
  the internal id, which is what `SetDisplayItemId` takes.
- **The application** (`erpApplicationTask`) — `RetailVista.aspx?pageId=<n>`, which frames the screen
  as `DefaultFrame` and brings the dialog machinery with it. Needed for anything that goes through a
  dialog, such as finding a reservation by the number an operator reads.

Two things about the launcher that are easy to undo by tidying:

- **The frame's `name` must start with `pop`.** `pagemanager.js` opens with
  `if (window.name.substring(0, 3) == 'pop') { } else { top.location.href = "Index.aspx" }` — the
  application expects to live in a window `Index.aspx` popped. A frame named anything else navigates
  **our own tab** to `Index.aspx`, packing screen and all. See `ERP_LAUNCHER_FRAME_NAME`.
- **A search form's fields have the same names as the screen's.** The form is a form over the same
  record, so asking the launcher's frames for "a reservation number box" is answered by the screen
  first, holding whatever record it is on — a wrong answer that looks entirely right. `findFrameShowing`
  skips `DefaultFrame` by name, and the lookup recognises the dialog by its Search button.

A record found by search is only accepted when the screen's own reservation number matches the one
asked for. Don't relax that: the id feeds the note writer, and a wrong id writes a bay onto somebody
else's reservation.

## Three traps that have already cost time

- **The cloak blocks focus.** The Stylus style hides the page with `visibility: hidden` until
  `pse-ready`, and a hidden element cannot be focused — `focus()` is dropped silently and does *not*
  take effect when the cloak lifts. Anything that places the cursor must go through
  `afterReveal()` in `src/reveal.ts`.
- **The ERP frame steals the focus.** Opening an ERP screen in the frame is harmless, but the
  postback that loads a record into it — `SetDisplayItemId`, which every read and write goes
  through — moves `document.activeElement` to the frame element, roughly 250ms *before* the frame's
  load event and without firing a single focus event out here. `src/erpFrame.ts` watches
  `document.activeElement` on a timer for the length of every `erpTask` and hands the cursor back.
  Anything that adds a new way of driving the ERP should go through `erpTask` so it is covered.
- **Load timing cannot be judged in `npm run dev`** (see README). Build and install before believing
  anything about paint order.

## Brand

Colours come from one palette in `src/style.css` (`--pse-*` on `:root`). The green is Kampeerhal
Roden's own `--bs-primary` (`#689F69`), taken from their storefront theme at kampeerhalroden.nl —
not sampled from the portal. `--pse-brand-ink` is the same green darkened until white text on it
clears 4.5:1, for filled buttons.

`src/assets/kampeerhal-roden.svg` is their logo from their own site, recoloured from the white
variant to that green. It is deliberately *not* cropped out of the vendor's combined logo file.
