import { computed, reactive, ref } from "vue";
import { toast } from "vue3-toastify";
import { composeComment, emptyAssignment, parseComment, SlotAssignment } from "../slots.ts";
import { ErpSignedOutError, readReservationNote, writeReservationNote } from "../reservationNote.ts";
import { erpStore } from "./erpStore.ts";
import { playSound } from "../sounds.ts";
import Settings from "../settings.ts";
import { SETTINGS_SAVED_EVENT } from "../constants.ts";
import { debug } from "../logger.ts";

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

const slots = reactive<SlotAssignment>(emptyAssignment());

// The reservation the bays belong to. The internal id is what the ERP screen
// loads a record by; the number is what the operator reads and what a toast
// names. They are not interchangeable and both are needed.
const reservationId = ref("");
const reservationNumber = ref("");

// Whether the note has been read yet. Everything that shows a bay renders its
// resting state until it has, the way the note box does.
const loaded = ref(false);
const saving = ref(false);

// One product, one of it. Such an order is not parked in the rack -- it is
// scanned, boxed and gone, and there is never a second visit for the rest of it
// to wait through -- so asking where it is standing is asking about something
// that does not happen. Set by the page, which is what knows the reservation's
// rows; false until it says otherwise, so a page that cannot tell shows the
// control rather than quietly withholding it.
const singleUnit = ref(false);

// Whether a bay is picked for the whole order or one per product line. A setting
// because the two ways of working are both real: one bay for the order is what
// the floor does when an order is parked whole, and per line is for the orders
// whose items come in far enough apart to be shelved separately.
//
// Read through a computed rather than copied into a ref, and that is not a
// style choice: this module is evaluated with every other import, which is
// before `main.ts` calls `Settings.load()`. A value taken at import time is the
// default whatever the workplace has configured -- so it is read when something
// first asks for it, by which time the store has been loaded.
//
// The counter is what re-reads it. The settings dialog lives in the footer's
// mount, which is a third app again, so the change arrives as an event on the
// document; bumping the counter is what tells the computed its answer is stale.
const settingsVersion = ref(0);

const scope = computed<"order" | "line">(() => {
	settingsVersion.value;

	return Settings.slotScope;
});

document.addEventListener(SETTINGS_SAVED_EVENT, () => {
	Settings.load();
	settingsVersion.value++;
});

// Registered by the sidebar, which is the one mount that knows what the page is
// about. The bays are read off the reservation's note, which is where they live.
//
// Two kinds of failure, told apart on purpose.
//
// An ERP that is merely unreachable or slow leaves the controls at rest and says
// nothing: a rack bay is an aside on a page whose job is packing, and one bad
// request is not worth a dialog. A sign-out is different -- it will not come
// back on its own, and every bay on the page is dead until somebody answers for
// it -- so it raises the prompt here, on the way in, rather than waiting for a
// packer to press a bay and be refused.
async function attachReservation(id: string, number: string) {
	reservationId.value = id;
	reservationNumber.value = number;
	loaded.value = false;

	slots.order = "";
	slots.lines = {};

	if (!id) {
		return;
	}

	try {
		const parsed = parseComment(await readReservationNote(id));

		slots.order = parsed.slots.order;
		slots.lines = parsed.slots.lines;
		loaded.value = true;

		debug("Rack bays read off the reservation note", JSON.stringify(slots));
	} catch (error) {
		if (error instanceof ErpSignedOutError) {
			erpStore.reportSignedOut();
		}

		console.error("Pack&Ship Extended could not read the reservation note.", error);
	}
}

// One writer, so a bay that is shown is a bay that reached RetailVista -- or a
// toast saying it did not.
//
// The note is read again rather than composed from what was loaded with the
// page. The field is shared: it is the reservation's own note, which somebody in
// the office may have typed into since this page was opened, and recomposing
// from a copy taken minutes ago would quietly drop what they wrote. Reading it
// immediately before writing it back is what keeps the two from overwriting each
// other, and the frame is already on the record so it costs almost nothing.
function save(): Promise<unknown> {
	if (!reservationId.value) {
		return Promise.resolve();
	}

	saving.value = true;

	const promise = (async () => {
		const current = parseComment(await readReservationNote(reservationId.value));

		await writeReservationNote(reservationId.value, composeComment(current.text, slots));
	})();

	toast.promise(promise, {
		pending: `Reservering ${reservationNumber.value} vak wordt opgeslagen...`,
		success: `Reservering ${reservationNumber.value} vak succesvol opgeslagen.`,
		error: `Er is een fout opgetreden bij het opslaan van het vak van reservering ${reservationNumber.value}.`,
	}).catch(() => undefined);

	promise.catch((error) => {
		if (error instanceof ErpSignedOutError) {
			// The session went while the packer was working. This is the press
			// that needs it, so this is where it is worth interrupting for.
			erpStore.reportSignedOut();
		}

		console.error("Failed to save the reservation note.", error);
		// The toast says so on screen; this says so to whoever has already turned
		// back to the rack.
		playSound("error");
	});

	// Settled either way: the toast reports the failure, and a control left
	// disabled after one would mean the bay could not be corrected.
	promise.catch(() => undefined).then(() => (saving.value = false));

	return promise;
}

// Read the bays again once a lapsed ERP session has been signed back in.
//
// The attach that raised the prompt has already failed and returned by the time
// anybody types a password, so without this the bays stay missing on a screen
// whose dialog just said it had fixed them.
erpStore.onRestored(() => {
	if (reservationId.value) {
		attachReservation(reservationId.value, reservationNumber.value);
	}
});

// Picking the bay a control already shows means clearing it -- the same press
// that set it, which is how a mis-set bay gets taken off without a second
// control for it.
export const slotStore = {
	slots,
	scope,
	saving,
	// Kept under its old name: every caller asks this to put a reservation number
	// on screen, and which of the two ids it is has never been their business.
	orderNumber: reservationNumber,

	// Whether there is a reservation to write a bay onto at all. False until the
	// note has been read, which is what keeps a control from offering to save
	// into a field nobody has managed to open yet.
	ready: computed(() => loaded.value),

	// ---- What this reservation was actually written with ----
	//
	// The setting says how a bay is picked here; these say how it was picked
	// wherever this reservation was last handled. They are not the same question,
	// and answering the first one for both is how a reservation parked per line
	// by another workstation would arrive on a screen set to per order with its
	// bays nowhere on it -- the items standing in the rack and nothing saying
	// where.
	//
	// So each control is shown when its own setting asks for it *or* when the
	// reservation already carries that kind of bay. A bay that exists is always
	// shown and always changeable; the setting only decides what is offered on a
	// reservation that has none yet.
	hasOrderSlot: computed(() => Boolean(slots.order)),
	hasLineSlots: computed(() => Object.values(slots.lines).some(Boolean)),

	// Whether to offer a bay on this reservation at all.
	//
	// The exception is the same one the two modes make for each other: a bay that
	// exists is always shown. Somebody parked a single-line order for a reason we
	// do not know -- a repair, a customer collecting later -- and hiding where
	// they put it would leave the item in the rack with nothing pointing at it.
	showSlots: computed(() =>
		!singleUnit.value || Boolean(slots.order) || Object.values(slots.lines).some(Boolean)),

	attachReservation,

	// Told by the page, before the sidebar mounts where it can be: a control that
	// appears and then takes itself away is worse than one that was never there.
	setSingleUnit(value: boolean) {
		singleUnit.value = value;
	},

	setOrderSlot(slot: string) {
		slots.order = slots.order == slot ? "" : slot;

		return save();
	},

	setLineSlot(barcode: string, slot: string) {
		if (slots.lines[barcode] == slot) {
			delete slots.lines[barcode];
		} else {
			slots.lines[barcode] = slot;
		}

		return save();
	},

	lineSlot(barcode: string): string {
		return slots.lines[barcode] ?? "";
	},

	// The bays this reservation already has something in, so the picker can say
	// which of them are taken and by what. Only the other lines of this
	// reservation: what another reservation is using is not on this one's note,
	// and guessing at it would be worse than saying nothing.
	takenBy(exceptBarcode?: string): Map<string, string[]> {
		const taken = new Map<string, string[]>();

		for (const [barcode, slot] of Object.entries(slots.lines)) {
			if (!slot || barcode == exceptBarcode) {
				continue;
			}

			taken.set(slot, [...(taken.get(slot) ?? []), barcode]);
		}

		return taken;
	},
};
