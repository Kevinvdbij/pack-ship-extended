import {
	ERP_ITEM_ID_VARIABLE, ERP_RESERVATION_PAGE_ID, ERP_SEARCH_NUMBER_SELECTOR,
	ERP_SEARCH_PAGE_ID_VARIABLE, ERP_SEARCH_SUBMIT_SELECTOR
} from "./constants.ts";
import { ErpApplication, erpApplicationTask } from "./erpFrame.ts";
import { debug } from "./logger.ts";

// The internal id of a reservation, from the number an operator reads.
//
// Everything that reaches the ERP for a reservation needs the internal id, and
// most callers already have one: the packing portal keeps it in `#ReservationId`
// on any reservation page it will serve. The exception is the reservation that
// is not fully picked. The portal will not serve those at all -- it answers a
// search for one with "is nog niet volledig geraapt" and nothing else, and the
// cards it draws for them in the selection dialog carry no link and no id -- so
// the only thing known about such a reservation is its number.
//
// The ERP's own answer to that is the search form behind the magnifier on the
// reservation screen, which is what this drives: type the number, press Search,
// and the screen behind the dialog lands on the record. Its id is then read off
// the screen, where the record is.
//
// Read-only. Nothing here edits or saves anything; the id it returns goes to
// `src/reservationNote.ts`, which is the one writer.

// Numbers already looked up, for the life of the page. A dialog listing a dozen
// reservations asks for each of them, a packer coming back asks again, and the
// mapping cannot change: a reservation keeps its id.
const known = new Map<string, string>();

export async function findReservationId(reservationNumber: string): Promise<string> {
	const number = reservationNumber.trim();

	if (!number) {
		return "";
	}

	const remembered = known.get(number);

	if (remembered) {
		return remembered;
	}

	const id = await erpApplicationTask(ERP_RESERVATION_PAGE_ID, (application) =>
		search(application, number));

	if (id) {
		known.set(number, id);
	}

	return id;
}

async function search(application: ErpApplication, number: string): Promise<string> {
	// The screen publishes the page id of its own search form, so the form is
	// not named here: whichever screen the launcher is holding, this asks that
	// screen which form belongs to it.
	const searchPageId = Number(application.screenWindow()[ERP_SEARCH_PAGE_ID_VARIABLE]);

	if (!searchPageId) {
		throw new Error("The ERP reservation screen does not offer a search form.");
	}

	// Recognised by its Search button rather than by its number field: the screen
	// behind it has a number field of its own. See `findFrameShowing()`.
	const dialog = await application.openDialog(
		searchPageId, ERP_SEARCH_SUBMIT_SELECTOR, "the reservation search form");

	const field = dialog.querySelector<HTMLInputElement>(ERP_SEARCH_NUMBER_SELECTOR);
	const submit = dialog.querySelector<HTMLElement>(ERP_SEARCH_SUBMIT_SELECTOR);

	if (!field || !submit) {
		throw new Error("The reservation search form is missing its number field or its search button.");
	}

	// WebForms posts the control's value, so the assignment is what travels. The
	// events are for the form's own handlers.
	field.value = number;
	field.dispatchEvent(new Event("input", { bubbles: true }));
	field.dispatchEvent(new Event("change", { bubbles: true }));

	submit.click();

	// The screen behind the dialog is what answers, and it answers by loading a
	// record. Waited for by the number rather than by the load: a search that
	// matched nothing leaves the screen where it was, and a screen that is
	// already showing some other reservation would otherwise read as an answer.
	//
	// This is also the check that makes a wrong answer impossible. The id is only
	// accepted off a record whose own reservation number is the one asked for --
	// so the worst a mis-driven search can do is time out, rather than hand back
	// the id of whatever record happened to be on screen. A bay written onto the
	// wrong reservation is the one failure here that would cost real work on the
	// floor.
	const id = await application.until(() => {
		const screen = application.screen();
		const shown = screen.querySelector<HTMLInputElement>(ERP_SEARCH_NUMBER_SELECTOR)?.value?.trim();

		if (shown != number) {
			return undefined;
		}

		return readItemId(application);
	}, `reservation ${number} on the ERP reservation screen`);

	debug("Looked up a reservation by number", { number, id });

	return id;
}

// The id of the record the screen is showing, out of the element the screen
// itself keeps it in -- `SetDisplayItemId` writes into the same one. Read
// through the screen's variable rather than a selector of ours, because the
// variable is the screen's own statement of where it keeps it.
function readItemId(application: ErpApplication): string | undefined {
	const fieldId = application.screenWindow()[ERP_ITEM_ID_VARIABLE];

	if (typeof fieldId != "string") {
		return undefined;
	}

	const value = application.screen().getElementById(fieldId) as HTMLInputElement | null;
	const id = value?.value?.trim();

	// `-1` is what the screen carries when it is showing nothing.
	return id && id != "-1" ? id : undefined;
}
