import { computed, ref } from "vue";
import { createSlotHandle } from "./slotHandle.ts";
import { slotScope } from "./slotScope.ts";
import { erpStore } from "./erpStore.ts";

// The rack bays of the reservation that is open, shared by everything on the
// page that shows or changes one.
//
// A module rather than a provide/inject, because the two places this is needed
// are not in one component tree: the sidebar and the product table are separate
// mounts -- separate Vue apps on the same document, mounted into two regions of
// the portal's own markup -- and what crosses between them is a module they both
// import. The sidebar is the one that knows which reservation the page is about,
// so it fills this in; the product table only reads it and asks it to change a
// bay.
//
// One reservation at a time, which is what a page is. Nothing here survives a
// navigation, and nothing needs to: the bays live on the reservation itself.
//
// The reading, writing and saving are `src/vue/slotHandle.ts`, which the cards
// in the reservation selection dialog hold one of each. This module is that
// handle for the page's own reservation, plus the two things only a page can say
// -- whether the reservation is one that is ever parked at all, and what the
// workplace setting asks for.
//
// ---- Why the reservation and not the webshop order ----
//
// These used to be kept on the Shopware order's customer comment, which worked
// and was easy to reach -- but only for the orders that have one. A reservation
// that did not come from the webshop had nowhere to put a bay at all, so the
// rack could not be used for it, and the answer to "where is this parked" for
// those was the slip of paper this feature exists to replace.
//
// The reservation's own note field has neither problem: every reservation has
// one, whatever it came from. The format is unchanged -- see `src/slots.ts`,
// which never knew which field it was writing into -- and what changed is only
// where it is read from and written to.

const handle = createSlotHandle();

// One product, one of it. Such an order is not parked in the rack -- it is
// scanned, boxed and gone, and there is never a second visit for the rest of it
// to wait through -- so asking where it is standing is asking about something
// that does not happen. Set by the page, which is what knows the reservation's
// rows; false until it says otherwise, so a page that cannot tell shows the
// control rather than quietly withholding it.
const singleUnit = ref(false);

// The id the page attached with, kept because a re-read after a sign-in needs
// it and the handle does not hand its own back.
let lastReservationId = "";

function attachReservation(id: string, number: string): Promise<void> {
	lastReservationId = id;

	return handle.attach(id, number);
}

// Read the bays again once a lapsed ERP session has been signed back in.
//
// The attach that raised the prompt has already failed and returned by the time
// anybody types a password, so without this the bays stay missing on a screen
// whose dialog just said it had fixed them.
erpStore.onRestored(() => {
	if (lastReservationId) {
		attachReservation(lastReservationId, handle.reservationNumber.value);
	}
});

export const slotStore = {
	slots: handle.slots,
	scope: slotScope,
	saving: handle.saving,
	// Kept under its old name: every caller asks this to put a reservation number
	// on screen, and which of the two ids it is has never been their business.
	orderNumber: handle.reservationNumber,

	// Whether there is a reservation to write a bay onto at all. False until the
	// note has been read, which is what keeps a control from offering to save
	// into a field nobody has managed to open yet.
	ready: handle.ready,
	loading: handle.loading,

	hasOrderSlot: handle.hasOrderSlot,
	hasLineSlots: handle.hasLineSlots,

	// Whether to offer a bay on this reservation at all.
	//
	// The exception is the same one the two modes make for each other: a bay that
	// exists is always shown. Somebody parked a single-line order for a reason we
	// do not know -- a repair, a customer collecting later -- and hiding where
	// they put it would leave the item in the rack with nothing pointing at it.
	showSlots: computed(() =>
		!singleUnit.value || handle.hasOrderSlot.value || handle.hasLineSlots.value),

	attachReservation,

	// Told by the page, before the sidebar mounts where it can be: a control that
	// appears and then takes itself away is worse than one that was never there.
	setSingleUnit(value: boolean) {
		singleUnit.value = value;
	},

	setOrderSlot: handle.setOrderSlot,
	setLineSlot: handle.setLineSlot,
	lineSlot: handle.lineSlot,
	takenBy: handle.takenBy,
};
