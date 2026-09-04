<script setup lang="ts">
import { onMounted } from "vue";
import { cacheReservationDetails, getReservationDetailsFromOverview, skipVerification } from "../../retailVistaUtils.ts";
import { afterReveal } from "../../reveal.ts";
import { VENDOR_BAND_LOGO_SELECTOR } from "../../constants.ts";
import LoadingPanel from "../components/LoadingPanel.vue";

// The step between the search and the parcels page. The portal renders a
// verification screen here -- one checkbox per reservation row -- which the
// operator has already done with a scanner in their hand, so we tick the rows
// and post the form on their behalf and they never see it.
//
// It is still a page load, and until now it was a page load with nothing on it:
// the cloak hides the portal's screen, we render nothing in its place, and the
// operator watches a white screen for the whole round trip out and the whole
// page load back. That is the middle of the gap between pressing "Zoek" and
// getting a reservation.
//
// So the step keeps its job and gets a face. The portal's screen is hidden as
// before, ours says what is happening, and the form is not posted until that
// has actually been painted -- otherwise the browser leaves the old page up,
// commits the new document, and the card we built is never on screen at all.

// Read before anything is hidden or submitted: the rows on this screen are the
// same ones the parcels page needs, so caching them here is what lets that page
// render its product table from the first paint instead of fetching them again.
try {
	const reservationDetails = getReservationDetailsFromOverview();

	if (reservationDetails) {
		cacheReservationDetails(reservationDetails);
	}
} catch (error) {
	console.error("Pack&Ship Extended failed to cache the reservation.", error);
}

onMounted(() => {
	// The form stays in the document -- a hidden form still serialises and still
	// submits, and it is what carries the tick marks below.
	document.querySelector("#ReservationOverview")?.classList.add("pse-portal-replaced");

	// This page is served without a header band and carries the vendor's small
	// wordmark and a back control in its place. Our own band is mounted above
	// them by `main.ts`, so what is left is a second header under the first --
	// and a way out of a screen that is about to navigate on its own.
	document.querySelector(VENDOR_BAND_LOGO_SELECTOR)?.closest(".row")
		?.classList.add("pse-portal-replaced");

	// Queued behind the reveal, then behind two frames of it. `afterReveal` gets
	// the cloak off; the frames are what make the difference between a card that
	// exists and a card that has been painted. A navigation started before the
	// paint is a navigation the operator sees as more white screen.
	afterReveal(() => requestAnimationFrame(() => requestAnimationFrame(submit)));
});

function submit() {
	try {
		skipVerification(document.body);
	} catch (error) {
		console.error("Pack&Ship Extended failed to skip the verification step.", error);
	}
}
</script>

<template>
	<LoadingPanel title="Reservering wordt geopend" subtitle="Producten worden gecontroleerd." />
</template>
