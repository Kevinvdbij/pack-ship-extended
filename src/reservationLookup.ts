import {
	ERP_PAGE_PATH, ERP_RESERVATION_PAGE_ID, ERP_SEARCH_NUMBER_SELECTOR, ERP_SEARCH_PAGE_ID_VARIABLE,
	ERP_SEARCH_SUBMIT_SELECTOR, ERP_SET_ITEM_FUNCTION
} from "./constants.ts";
import { ErpPage, erpTask, whenErpHandsBackItem } from "./erpFrame.ts";
import { debug } from "./logger.ts";

// The internal id of a reservation, from the number an operator reads.
//
// Everything that reaches the ERP for a reservation needs the internal id, and
// most callers already have one: the packing portal keeps it in `#ReservationId`
// on any reservation page it will serve. The exception is the reservation that
// is not fully picked. The portal will not serve those at all -- it answers a
// search for one by number with "is nog niet volledig geraapt" and nothing else,
// and the cards it draws for them carry no link, no hidden input and no id in
// any attribute -- so the only thing known about such a reservation is the
// number printed on the card.
//
// The ERP's own answer is the reservation search form. It is normally a dialog,
// but it is an ordinary screen underneath, and that is how it is used here:
// opened bare in the same frame as everything else, filled in, and its results
// read off the grid it renders. Nothing here touches the application launcher --
// loading that signs the workplace out, which is the whole reason this is not
// driven the way an operator drives it. See CLAUDE.md.
//
// Read-only. The id goes to `src/reservationNote.ts`, which is the one writer.

// Numbers already looked up, for the life of the page. A dialog listing a dozen
// reservations asks for each of them, a packer coming back asks again, and the
// answer cannot change: a reservation keeps its id.
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

	const id = await erpTask((page) => look(page, number));

	if (id) {
		known.set(number, id);
	}

	return id;
}

async function look(page: ErpPage, number: string): Promise<string> {
	// The reservation screen first, for two reasons: it is what names its own
	// search form, and it is where the answer is checked afterwards.
	await page.open(`${ERP_PAGE_PATH}?pageId=${ERP_RESERVATION_PAGE_ID}`);

	const searchPageId = Number(page.window[ERP_SEARCH_PAGE_ID_VARIABLE]);

	if (!searchPageId) {
		throw new Error("The ERP reservation screen does not name a search form.");
	}

	await page.open(`${ERP_PAGE_PATH}?pageId=${searchPageId}`);

	const field = page.find<HTMLInputElement>(ERP_SEARCH_NUMBER_SELECTOR);
	const submit = page.find<HTMLElement>(ERP_SEARCH_SUBMIT_SELECTOR);

	if (!field || !submit) {
		throw new Error("The reservation search form is missing its number field or its search button.");
	}

	// WebForms posts the control's value, so the assignment is what travels; the
	// events are for the form's own handlers.
	field.value = number;
	field.dispatchEvent(new Event("input", { bubbles: true }));
	field.dispatchEvent(new Event("change", { bubbles: true }));

	// Listening before the search is pressed, because the answer arrives during
	// the render that follows it: the results grid hands the record to the window
	// above it as it loads. See `ERP_MAIN_ITEM_FUNCTION`.
	let handedBack = "";
	const stopListening = whenErpHandsBackItem((itemId) => (handedBack = itemId));

	let found: string;

	try {
		await page.press(submit.id, "the reservation search");

		// Waited for rather than read off the render that just arrived. The load
		// event fires when the document is swapped in, and the results are not
		// there yet: the grid builds itself from the page's own start-up scripts,
		// and it is that build which hands the record back. Read at the moment the
		// postback resolves, the answer is always "no grid".
		found = await settle(page, number, () => handedBack);
	} finally {
		stopListening();
	}

	if (!found) {
		debug("The ERP knows no reservation with this number, in this store", number);

		return "";
	}

	await confirm(page, found, number);

	debug("Looked up a reservation by number", { number, id: found });

	return found;
}

// Waits for the search to answer, one way or the other.
//
// Two answers are possible and either will do: the record handed back by the
// form itself, or -- if it never hands one back -- the row in the grid it drew.
// Both arrive after the postback's load event, from the page's own start-up, so
// this is a matter of looking until one of them is there.
//
// A search that matched nothing draws an empty grid and hands nothing back,
// which is an answer too: it settles as soon as the grid exists, rather than
// waiting out the whole window.
const ANSWER_TIMEOUT = 8000;
const ANSWER_INTERVAL = 150;

function settle(page: ErpPage, number: string, handedBack: () => string): Promise<string> {
	return new Promise((resolve, reject) => {
		const deadline = performance.now() + ANSWER_TIMEOUT;

		const look = () => {
			try {
				const given = handedBack();

				if (given) {
					resolve(given);

					return;
				}

				if (findGrid(page)) {
					resolve(readResult(page, number));

					return;
				}
			} catch (error) {
				reject(error);

				return;
			}

			if (performance.now() > deadline) {
				reject(new Error("The reservation search never came back with a result."));

				return;
			}

			window.setTimeout(look, ANSWER_INTERVAL);
		};

		look();
	});
}

// The one row the search came back with, and the id on it.
//
// The fallback, for a search whose results never handed a record back. Read off
// the grid's own client-side data rather than out of the markup. The
// results are a ComponentArt grid: the rendered rows are a nest of tables whose
// cells carry no ids at all, while the object behind it holds the rows as plain
// arrays -- and, in `DataKeyField`, the grid's own statement of which column is
// the record's key. So the id is taken from the column the grid says is the key,
// not from a position counted off a sample.
//
// The row is matched on the number appearing in it, and exactly one row must.
// A search that somehow came back with several is not an answer this is willing
// to guess at.
function readResult(page: ErpPage, number: string): string {
	const grid = findGrid(page);

	if (!grid) {
		throw new Error("The reservation search came back without a result grid.");
	}

	const matches = grid.rows.filter((row) =>
		row.some((cell) => String(cell ?? "").trim() == number));

	if (matches.length != 1) {
		debug("The reservation search did not come back with one row", { number, rows: matches.length });

		return "";
	}

	return String(matches[0][grid.keyIndex] ?? "").trim();
}

function findGrid(page: ErpPage): { rows: unknown[][]; keyIndex: number } | undefined {
	const window_ = page.window;

	for (const name of Object.keys(window_)) {
		let value: unknown;

		try {
			value = window_[name];
		} catch {
			// Some of a window's own properties throw on access; none of those
			// are a grid.
			continue;
		}

		const candidate = value as { Data?: unknown; DataKeyField?: unknown } | null;

		if (!candidate || typeof candidate != "object" || !Array.isArray(candidate.Data)) {
			continue;
		}

		const keyIndex = Number(candidate.DataKeyField ?? 0);

		if (!Number.isInteger(keyIndex) || keyIndex < 0) {
			continue;
		}

		return { rows: candidate.Data as unknown[][], keyIndex };
	}

	return undefined;
}

// Loads the record and refuses it unless it is the reservation that was asked
// for.
//
// The cost is one postback, and it buys the only guarantee that matters here.
// This id goes on to the note writer, and a note written against the wrong
// record puts a rack bay on somebody else's reservation -- which is not a bug
// anybody on the floor would catch until they went looking for the items. So
// the answer is checked against the record itself rather than trusted from the
// grid it was read off.
async function confirm(page: ErpPage, id: string, number: string) {
	await page.open(`${ERP_PAGE_PATH}?pageId=${ERP_RESERVATION_PAGE_ID}`);
	await page.call(ERP_SET_ITEM_FUNCTION, Number(id), "view");

	const shown = page.find<HTMLInputElement>(ERP_SEARCH_NUMBER_SELECTOR)?.value?.trim();

	if (shown != number) {
		throw new Error(`The ERP record ${id} is reservation ${shown || "(none)"}, not ${number}.`);
	}
}
