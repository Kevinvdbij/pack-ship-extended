import { computed, ComputedRef, reactive, Ref, ref } from "vue";
import { toast } from "vue3-toastify";
import { composeComment, emptyAssignment, parseComment, SlotAssignment } from "../slots.ts";
import { ErpSignedOutError, readReservationNote, writeReservationNote } from "../reservationNote.ts";
import { erpStore } from "./erpStore.ts";
import { playSound } from "../sounds.ts";
import { debug } from "../logger.ts";

// The rack bays of one reservation: what they are, whether they have been read
// yet, and the one place they are written back from.
//
// A handle rather than a module holding its own single copy of this, because
// there are two shapes of screen that show bays. A reservation page shows the
// one reservation it is about, and `src/vue/slotStore.ts` is the single handle
// that page's separate mounts share. The reservation selection dialog shows a
// card per reservation, each with bays of its own, so it holds a handle per
// card.
//
// Everything either of them does to a bay goes through here, which is what keeps
// one writer: a bay that is on screen is a bay that reached RetailVista, or a
// toast saying it did not.

export interface SlotHandle {
	// The bays, live. Reactive, so anything rendering them follows a save.
	slots: SlotAssignment;
	// Whether the note has been read. Everything that shows a bay renders its
	// resting state until it has.
	ready: ComputedRef<boolean>;
	// Still on its way. False both before the note arrives and after the attempt
	// has failed, so a card can spin while there is something to wait for and
	// stop when there is not.
	loading: ComputedRef<boolean>;
	saving: Ref<boolean>;
	hasOrderSlot: ComputedRef<boolean>;
	hasLineSlots: ComputedRef<boolean>;
	// What the operator reads, and what a toast names.
	reservationNumber: Ref<string>;

	// Points the handle at a reservation and reads its note.
	attach(reservationId: string, reservationNumber: string): Promise<void>;
	// Points it at a reservation whose note has already been read elsewhere --
	// see `readReservationNotes()`, which the selection dialog reads every card's
	// note with in one job. `undefined` means the batch could not read this one,
	// which is the state a failed read of our own leaves behind too.
	adopt(reservationId: string, reservationNumber: string, note: string | undefined): void;

	setOrderSlot(slot: string): Promise<unknown>;
	setLineSlot(barcode: string, slot: string): Promise<unknown>;
	lineSlot(barcode: string): string;
	// The bays the other lines of this reservation are in, so the picker can say
	// which are taken and by what. Only this reservation's: what another one is
	// using is not on this note, and guessing at it would be worse than saying
	// nothing.
	takenBy(exceptBarcode?: string): Map<string, string[]>;
}

export function createSlotHandle(): SlotHandle {
	const slots = reactive<SlotAssignment>(emptyAssignment());

	// The internal id is what the ERP screen loads a record by; the number is
	// what the operator reads. They are not interchangeable and both are needed.
	const reservationId = ref("");
	const reservationNumber = ref("");

	const loaded = ref(false);
	const saving = ref(false);

	// Whether the attempt to read it has finished, however it finished.
	//
	// Not the same question as `loaded`, and the difference is a spinner that
	// never stops. A read that fails -- an ERP that is signed out or unreachable
	// -- leaves `loaded` false for good, so anything that treats "not loaded" as
	// "still loading" turns forever on a card that is never going to fill in.
	const settled = ref(false);

	function reset(id: string, number: string) {
		reservationId.value = id;
		reservationNumber.value = number;
		loaded.value = false;
		settled.value = false;
		slots.order = "";
		slots.lines = {};
	}

	function take(note: string) {
		const parsed = parseComment(note);

		slots.order = parsed.slots.order;
		slots.lines = parsed.slots.lines;
		loaded.value = true;

		debug("Rack bays read off the reservation note", reservationNumber.value, JSON.stringify(slots));
	}

	// Two kinds of failure, told apart on purpose.
	//
	// An ERP that is merely unreachable or slow leaves the controls at rest and
	// says nothing: a rack bay is an aside on a screen whose job is packing, and
	// one bad request is not worth a dialog. A sign-out is different -- it will
	// not come back on its own, and every bay on the screen is dead until
	// somebody answers for it -- so it raises the prompt on the way in, rather
	// than waiting for a packer to press a bay and be refused.
	async function attach(id: string, number: string): Promise<void> {
		reset(id, number);

		// Nothing to read against, and nothing on its way: settled before it
		// began.
		if (!id) {
			settled.value = true;

			return;
		}

		try {
			take(await readReservationNote(id));
		} catch (error) {
			reportReadFailure(error);
		} finally {
			settled.value = true;
		}
	}

	function adopt(id: string, number: string, note: string | undefined) {
		reset(id, number);

		if (note !== undefined) {
			take(note);
		}

		settled.value = true;
	}

	function reportReadFailure(error: unknown) {
		if (error instanceof ErpSignedOutError) {
			erpStore.reportSignedOut();
		}

		console.error("Pack&Ship Extended could not read the reservation note.", error);
	}

	// The note is read again rather than composed from what was loaded with the
	// page. The field is shared: it is the reservation's own note, which somebody
	// in the office may have typed into since this page was opened, and
	// recomposing from a copy taken minutes ago would quietly drop what they
	// wrote. Reading it immediately before writing it back is what keeps the two
	// from overwriting each other, and the frame is already on the record so it
	// costs almost nothing.
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
			// The toast says so on screen; this says so to whoever has already
			// turned back to the rack.
			playSound("error");
		});

		// Settled either way: the toast reports the failure, and a control left
		// disabled after one would mean the bay could not be corrected.
		promise.catch(() => undefined).then(() => (saving.value = false));

		return promise;
	}

	return {
		slots,
		saving,
		reservationNumber,

		ready: computed(() => loaded.value),
		loading: computed(() => !settled.value),

		// ---- What this reservation was actually written with ----
		//
		// The setting says how a bay is picked here; these say how it was picked
		// wherever this reservation was last handled. They are not the same
		// question, and answering the first one for both is how a reservation
		// parked per line by another workstation would arrive on a screen set to
		// per order with its bays nowhere on it -- the items standing in the rack
		// and nothing saying where.
		hasOrderSlot: computed(() => Boolean(slots.order)),
		hasLineSlots: computed(() => Object.values(slots.lines).some(Boolean)),

		attach,
		adopt,

		// Picking the bay a control already shows means clearing it -- the same
		// press that set it, which is how a mis-set bay gets taken off without a
		// second control for it.
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
}
