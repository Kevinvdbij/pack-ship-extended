<script setup lang="ts">
import ReservationSidebar from '../components/ReservationSidebar.vue';
import ReservationProducts from '../components/ReservationProducts.vue';
import BackLink from '../components/BackLink.vue';
import ParcelLabels from '../components/ParcelLabels.vue';
import { mountApp } from '../mount.ts';
import {
	getCachedProducts,
	getCurrentReservationId,
	getParcelContainerParent,
	getReservationParcels,
	getReservationSidebarColumn,
	isSingleUnitOrder,
} from '../../retailVistaUtils.ts';
import { slotStore } from '../slotStore.ts';
import { debug } from '../../logger.ts';

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

// The reprint control, one row per parcel that has a carrier label.
//
// This page is where a reprint is actually wanted: it is what the operator opens
// when a parcel comes back to the bench, and the reservation's parcels are
// already on it. The ids come out of the portal's own form -- `Items[n].ItemId`
// is the same id the ERP's label dialog lists its parcels by -- so nothing has
// to be fetched to know which box is which.
//
// Into the column rather than into `#ParcelsContainer`: the portal re-renders
// that wholesale after every parcel change, and anything of ours inside it would
// be swept away with the first edit.
function mountParcelLabels() {
	const parcels = getReservationParcels();
	const reservationId = readReservationId();

	if (!reservationId || parcels.length == 0) {
		debug("No parcels on this page to offer a reprint for.");

		return;
	}

	const column = getParcelContainerParent();

	if (!column) {
		return;
	}

	mountApp(ParcelLabels, (host) => column.insertAdjacentElement("afterbegin", host),
		{ reservationId, parcels });
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
