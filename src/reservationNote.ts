import {
	ERP_EDIT_BUTTON_ID, ERP_NOTE_SELECTOR, ERP_PAGE_PATH, ERP_RESERVATION_PAGE_ID,
	ERP_SAVE_BUTTON_ID, ERP_SET_ITEM_FUNCTION
} from "./constants.ts";
import { ErpPage, erpTask } from "./erpFrame.ts";
import { debug } from "./logger.ts";

// Reading and writing the reservation's own note field.
//
// The note lives on the ERP's reservation maintenance screen and nowhere the
// packing portal serves -- checked, not assumed: the portal's summary block, its
// search response and its parcels form carry no note in any form, visible or
// hidden. So this reaches the screen that does have it, through the shared frame
// in `src/erpFrame.ts`.

export { ErpSignedOutError, resetErpFrame as resetReservationNoteFrame } from "./erpFrame.ts";

export function readReservationNote(reservationId: string): Promise<string> {
	return erpTask(async (page) => {
		await showReservation(page, reservationId);

		return noteField(page).value;
	});
}

// Writes the note, and hands back what the field held afterwards.
//
// The record is put into edit mode first -- the note is `readOnly` until it is,
// and a value set on a read-only control is posted back unchanged -- and the
// screen returns itself to view mode once it has saved.
export function writeReservationNote(reservationId: string, text: string): Promise<string> {
	return erpTask(async (page) => {
		await showReservation(page, reservationId);

		// Into edit mode. The button is the same one the operator would press, and
		// pressing it is a postback like any other on this screen.
		await page.press(ERP_EDIT_BUTTON_ID, "edit");

		const field = noteField(page);

		if (field.readOnly) {
			throw new Error("The reservation note is still read-only after entering edit mode.");
		}

		field.value = text;
		// WebForms posts the control's value, so the assignment above is what
		// actually travels. The events are for the page's own handlers, which is
		// what marks the record dirty and enables its save control.
		field.dispatchEvent(new Event("input", { bubbles: true }));
		field.dispatchEvent(new Event("change", { bubbles: true }));

		await page.press(ERP_SAVE_BUTTON_ID, "save");

		// The screen re-renders from the record it just stored, so what the field
		// holds now is what was actually kept -- worth handing back rather than
		// echoing the caller's own string at them.
		const saved = noteField(page).value;

		debug("Wrote the reservation note.", { reservationId, length: saved.length });

		return saved;
	});
}

// Puts the frame on one reservation's maintenance screen.
//
// The id is the reservation's internal one -- `#ReservationId`, which the portal
// keeps in its summary block -- and not the number the operator reads off the
// screen. This screen ignores `itemId` on the query string and loads its own
// record through a function of its own, which is why the two steps.
async function showReservation(page: ErpPage, reservationId: string) {
	await page.open(`${ERP_PAGE_PATH}?pageId=${ERP_RESERVATION_PAGE_ID}`);

	if (page.find(ERP_NOTE_SELECTOR)) {
		// Already on a record -- but not necessarily this one, and there is no
		// cheap way to tell from the markup. Loading it again is one postback.
		debug("The ERP reservation screen is already showing a record.");
	}

	await page.call(ERP_SET_ITEM_FUNCTION, Number(reservationId), "view");
}

function noteField(page: ErpPage): HTMLTextAreaElement {
	const field = page.find<HTMLTextAreaElement>(ERP_NOTE_SELECTOR);

	if (!field) {
		throw new Error("The ERP reservation screen has no note field.");
	}

	return field;
}
