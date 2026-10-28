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

## Bins for the CVP

`src/bins.ts` (parcels page) and `BinLabelsPanel.vue` (completed screen), off unless a workplace has
*Bakken voor de CVP* switched on and filled in. A bin is an ordinary portal parcel; what makes it a bin is
the record in GM storage (`PSE_Bins_<reservationId>`), because nothing of ours survives `refresh()`. The
put wall side of the contract is in `put-wall-service/handover-packship-bins.md`.

What it leans on in the portal. The first three were watched working on reservation 417053; the last two
are read from the portal's scripts (`put-wall-service/captured/portal`) and not yet seen live:

- A scan lands in the parcel whose tab is open: the tab's `show.bs.tab` handler sets `Items[n].Active`,
  and `VerifyProduct` posts the whole form. So opening the bin's tab is what routes the next scan.
- A parcel is added without the dialog: `Parcels/Create` (the arguments off `#add-parcel`'s
  `newParcel(...)`), its `#parcelForm` posted as served to `Parcels/Edit`, then the page's `refresh()`.
- **After a parcel is deleted, the hidden `Items[n].*` inputs are wrong.** `refresh()` posts the old
  form and ASP.NET refills hidden fields from the posted values by position, so every parcel after the
  deleted one carries its predecessor's hidden values, the deleted id among them. The tabs and cards are
  right. Measured: tabs `…461, …467`, hidden ids `…461, …466` with `…466` deleted. So read parcels off the
  panes (`getRenderedParcels()` in `src/parcelArea.ts`), never off the hidden ids, and
  `keepParcelFormInStep()` reloads the area from a plain GET when they disagree, or the next scan is
  posted against the wrong parcel. A deleted parcel's `Parcels/Edit?itemid=` answers 500, a live one
  200; a bin is only handed back on that definite answer.
- The announcement of an order with a bin runs under the NOPRINT environment: `#selectEnviroment` is
  posted to `Home/SetEnviroment` before the announce button's own handler is let through. The next page
  puts the workplace's environment back through `applyConfiguredEnvironment`, with nothing to remember.
- The completed screen matches its parcel cards to parcel ids by the number in front of " / ".

An order that came from the wall in its own bin (`complete` for the reservation, or still `filling`:
a product in its own shipping box never goes in the bin, so such an order never completes on the wall)
gets that bin added
unasked when the parcels page arms — `adoptOrderBin()`, through the put wall's
`GET /api/plugin/reservations/:reservationId/bins`, so the service has to be deployed with that route
first (against an older one the lookup fails quietly and nothing changes). A bin whose parcel the packer
deletes goes into the record's `declined` and is not added again. The announcement refuses a bin parcel
with nothing scanned into it; `parcelHasItems()` reads that off the `Items[p].Items[i].Amount` inputs of
the pane's own index, which is the naming `getParcelItems()` already relies on but has not been watched
on a bin parcel.

## Never load the ERP's launcher or its login page

`src/erpFrame.ts` drives the ERP by loading `Default.aspx?pageId=<n>` bare in a frame. Keep it that
way. **Loading `/outdoor/RetailVista.aspx` destroys the ERP session** — it frames `Login.aspx`, and
that page abandons whatever session the browser had. Measured: a session that answered
`Default.aspx` with the application answered with the login form seconds after the launcher was
loaded, and the packer is then prompted to sign in again on their next bay.

That is what the launcher is for, so the temptation is real. `RetailVista.aspx` is the application's
true top window — it owns the modal dialog machinery every screen reaches for through
`window.top.getMainWindow()`, which is why a bare screen has no search dialog and no way to find a
record by the number an operator reads. Two further facts about it, learned the expensive way:

- Its frame's `name` must start with `pop` (`pagemanager.js`: anything else sends `top.location` to
  `Index.aspx`, taking our own tab with it).
- Its inner frame goes to `Login.aspx` **whether or not a session exists**, and never redirects on to
  the application. Pointing that frame at `Default.aspx` afterwards does not help: by then the
  session is gone.

### Finding a reservation by number without the launcher

A reservation that is not fully picked has no id anywhere in the portal's markup, so `src/reservationLookup.ts`
asks the ERP — through the search form as an **ordinary screen** (`Default.aspx?pageId=<the id the
reservation screen publishes in `navigationIconsSearchPageId`>`), never as a dialog. Two things make
that work, and both look optional until you remove them:

- **Our page has to answer as the launcher.** Every screen reaches for `window.top.getMainWindow()`;
  most only when a dialog opens, which is why the note screen needs nothing. The search form calls it
  *as it loads*, and unanswered it throws and renders an empty criteria form — which reads exactly
  like "the search does not work here". `standInForLauncher()` in `erpFrame.ts` provides the little
  it actually touches.
- **The answer arrives after the postback's load event.** The grid builds itself from the page's own
  start-up scripts, and it is that build which calls `window.top.SetMainItemId(source, itemId, …)`
  (`Scripts/search.js`) with the record it settled on. Read at the moment `press()` resolves, there is
  no grid and no handoff yet — so the lookup waits for one of them.

The id is then confirmed by loading the record and checking its reservation number. Keep that: it
feeds the note writer, and a wrong id parks a bay on somebody else's reservation.

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

## The portal's login page signs you out

A GET of `/outdoor/packship/Identity/Account/Login` **ends the portal session** — a `fetch` of it
counts, not only a visit — and the form it serves carries an antiforgery token for whoever the
browser was on the way in. Posted by the now signed-out browser, that token is refused with a bare
**400**; so is a sign-out posted by a browser that is already signed out. Both were measured, and
both happen in the unmodified portal: a station with the login URL bookmarked gets the first one by
opening it while signed in.

So never request the login page from a page that has a session, and never navigate a tab to the
answer of a post whose token may be stale. `LoginPage.vue` fetches a fresh token immediately before
it posts, and `idleLogout.ts` posts the sign-out in the background and then asks for the portal.

## Brand

Colours come from one palette in `src/style.css` (`--pse-*` on `:root`). The green is Kampeerhal
Roden's own `--bs-primary` (`#689F69`), taken from their storefront theme at kampeerhalroden.nl —
not sampled from the portal. `--pse-brand-ink` is the same green darkened until white text on it
clears 4.5:1, for filled buttons.

`src/assets/kampeerhal-roden.svg` is their logo from their own site, recoloured from the white
variant to that green. It is deliberately *not* cropped out of the vendor's combined logo file.
