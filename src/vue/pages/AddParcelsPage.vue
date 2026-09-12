<script setup lang="ts">
import ReservationSidebar from '../components/ReservationSidebar.vue';
import ReservationProducts from '../components/ReservationProducts.vue';
import BackLink from '../components/BackLink.vue';
import ParcelLabelButton from '../components/ParcelLabelButton.vue';
import { App } from 'vue';
import { mountApp } from '../mount.ts';
import {
	getCachedProducts,
	getCurrentReservationId,
	getParcelContainer,
	getParcelContainerParent,
	getReservationParcels,
	getReservationSidebarColumn,
	isSingleUnitOrder,
} from '../../retailVistaUtils.ts';
import { slotStore } from '../slotStore.ts';
import { debug } from '../../logger.ts';
import {
	PARCEL_BARCODE_HEADING_CLASS, PARCEL_BARCODE_HEADING_SELECTOR, PARCEL_BUTTON_CLASS,
	PARCEL_PANE_PREFIX, PARCEL_PANE_SELECTOR
} from '../../constants.ts';

// Adding a parcel to a reservation that has already been packed. The portal
// owns the work on this page; what we add is the column beside it and, when we
// can, the list of what the order was for.
// Before the sidebar, which is what shows the rack bay: a single-line order of
// one never waits in the rack, and a card that appears and then takes itself
// away is worse than one that was never there.
slotStore.setSingleUnit(isSingleUnitOrder(cachedProducts()));

mountSidebar();
mountProducts();
mountParcelLabels();
mountBackLink();

// The reprint control, one per parcel that has a carrier label.
//
// Into the portal's own parcel card, beside the barcode it reprints. Everything
// a card of ours could say about a parcel is already on that card, so what is
// added is the button alone.
//
// That means mounting inside `#ParcelsContainer`, which the portal refreshes
// wholesale after every parcel change -- adding a parcel, removing one, changing
// a weight. Nothing of ours is *moved* in there, which is the rule that matters;
// what is put in is put back when the portal replaces it. The observer is what
// does that, and it is also what handles the first fill: the panes are not in
// the served markup at all, but fetched by the portal's own init after
// DOMContentLoaded.
function mountParcelLabels() {
	const reservationId = readReservationId();
	const found = getParcelContainer();

	if (!reservationId || !found) {
		debug("No parcel container on this page to offer a reprint from.");

		return;
	}

	// Bound after the guard. `place` below is hoisted past it, and a check that
	// has not run yet narrows nothing.
	const container: Element = found;

	// One app per parcel. Kept so the ones the portal throws away can be shut
	// down: an app whose host has been removed is an app still watching a
	// document nobody can see.
	let mounted: Array<{ app: App; host: HTMLElement }> = [];

	// Re-entrancy guard and, with the disconnect below, the reason this does not
	// feed itself.
	//
	// The first version of this unmounted everything and mounted it again on
	// every mutation, and the hosts it mounted are *inside* the region it was
	// watching -- so placing a button was itself a mutation, which placed the
	// buttons again, for as long as the page could stand it. Clicking one made it
	// worse: the spinner is a render, a render is a mutation, and the component
	// handling the click was torn down in the middle of its own handler.
	//
	// So placing is now idempotent -- a pane that already has a button is left
	// alone -- and the observer is disconnected while this runs, which also
	// discards the mutations it makes. What remains for the observer is the only
	// thing it was ever for: the portal rebuilding the region from scratch.
	let placing = false;

	const observer = new MutationObserver(() => place());

	function place() {
		if (placing) {
			return;
		}

		placing = true;
		observer.disconnect();

		try {
			// Anything the portal has thrown away since last time.
			mounted = mounted.filter((entry) => {
				if (entry.host.isConnected) {
					return true;
				}

				entry.app.unmount();

				return false;
			});

			// Read once per pass and matched by id below. The pane's own hidden
			// inputs hold the same fields, but this is the reader the rest of the
			// extension uses and there is no reason for a second one here.
			const parcels = getReservationParcels(container);

			for (const pane of Array.from(container.querySelectorAll<HTMLElement>(PARCEL_PANE_SELECTOR))) {
				// Already carries one. This is what keeps a render from becoming a
				// remount, and a remount from becoming another render.
				if (pane.querySelector(`.${PARCEL_BUTTON_CLASS}`)) {
					continue;
				}

				// `parcels-content-876733` -- the portal puts the parcel's own id in
				// the pane's id, which is the same id the ERP's label dialog lists
				// its parcels by.
				const parcelId = pane.id.slice(PARCEL_PANE_PREFIX.length);
				const parcel = parcels.find((candidate) => candidate.id == parcelId);

				// No carrier barcode, no carrier label to reprint. This is the whole
				// gate: a collection order or a parcel taken by a local driver has
				// none, and so does a parcel whose announcement never succeeded --
				// which wants announcing, not reprinting. Deliberately not the
				// transport type, which is a translated phrase on a portal that has
				// been seen serving Dutch chrome and English task names at once.
				if (!parcel?.barcode) {
					continue;
				}

				// Beside the barcode, in the heading itself, so the two read as one
				// line: this label, and the way to print it again.
				const heading = pane.querySelector(PARCEL_BARCODE_HEADING_SELECTOR);

				if (!heading) {
					continue;
				}

				heading.classList.add(PARCEL_BARCODE_HEADING_CLASS);

				mounted.push(mountApp(ParcelLabelButton, (host) => heading.append(host),
					{ reservationId, parcel }));
			}
		} finally {
			observer.observe(container, { childList: true, subtree: true });
			placing = false;
		}
	}

	place();
}

// Guarded like the order number is: the pages this runs on each lay the portal's
// summary block out their own way, and a reservation we cannot identify is a
// reprint we cannot offer rather than a reason to take the page down.
function readReservationId(): string {
	try {
		return getCurrentReservationId();
	} catch (error) {
		debug("No reservation id on the add-parcels page.", error);

		return "";
	}
}

function mountSidebar() {
	const column = getReservationSidebarColumn();

	if (!column) {
		return;
	}

	mountApp(ReservationSidebar, (host) => column.insertAdjacentElement("afterbegin", host));
}

// The products, if this workstation still has them.
//
// There is nowhere to read them from on this page. The portal lists a
// reservation's rows as "not yet in a carrier", and by the time a reservation
// can be added to they are all in one, so the markup carries none of them --
// and `Reservations/Index` for a processed reservation answers without an
// overview at all, so there is nothing to fetch either. Checked, not assumed:
// both come back empty.
//
// What is left is the cache the parcels page fills while packing, keyed by
// reservation number. That makes this list present exactly when the same
// workstation packed the reservation, which is the common case for the parcel
// that comes back an hour later -- and absent, rather than wrong, when it was
// somebody else's.
function mountProducts() {
	const products = cachedProducts();

	if (!products?.length) {
		debug("No cached products for this reservation; the list is left out.");

		return;
	}

	// Above the portal's own block, which mirrors the parcels page: what the
	// order is for first, then the parcels. Into the column rather than into
	// `#ParcelsContainer`, which the portal re-renders wholesale on every
	// change.
	const column = getParcelContainerParent();

	if (!column) {
		return;
	}

	mountApp(ReservationProducts, (host) => column.insertAdjacentElement("afterbegin", host), { products });
}

// The portal puts its back control at the far top left, above the whole layout.
// The parcels page hides that row and renders the link beside its own heading,
// at the top right of the content column; this does the same, so the way back
// is in one place across both.
//
// Mounted last, so it comes out above the products list: `afterbegin` puts each
// new block ahead of the one before it.
function mountBackLink() {
	document.querySelector("#ReservationOverview > div:nth-child(1)")
		?.classList.add("pse-portal-replaced");

	const column = getParcelContainerParent();

	if (!column) {
		return;
	}

	mountApp(BackLink, (host) => column.insertAdjacentElement("afterbegin", host));
}

// The portal serves this route as a plain search form when the reservation turns
// out not to be processed yet, which the shared reader answers with nothing.
function cachedProducts() {
	return getCachedProducts();
}
</script>

<template />
