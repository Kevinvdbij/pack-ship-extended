import {
	ERP_EDIT_BUTTON_ID, ERP_LOGIN_MARKER, ERP_NOTE_SELECTOR, ERP_PAGE_PATH,
	ERP_RESERVATION_PAGE_ID, ERP_SAVE_BUTTON_ID, ERP_SET_ITEM_FUNCTION, ERP_URL
} from "./constants.ts";
import { debug } from "./logger.ts";

// Reading and writing the reservation's own note field.
//
// The note lives on the ERP's reservation maintenance screen and nowhere the
// packing portal serves -- checked, not assumed: the portal's summary block, its
// search response and its parcels form carry no note in any form, visible or
// hidden. So this reaches the screen that does have it.
//
// Through a frame rather than by posting forms ourselves. The screen is
// WebForms: every navigation on it is a postback carrying a signed view state
// and an event validation list, and replaying that by hand means reimplementing
// the page's own protocol and re-deriving it after every RetailVista update.
// Loaded in a frame, the page does all of that itself and we only call the
// functions it already has. It costs one page load; it buys not owning any of
// that.
//
// Everything here depends on the ERP and the portal sharing an origin. They do:
// `/outdoor/packship` is a sub application of `/outdoor`. Same origin means the
// frame's document is ours to read and its window's functions ours to call.

// The ERP has no session. Thrown rather than returned so it cannot be mistaken
// for "this reservation has no note", which is an ordinary and very common
// answer.
export class ErpSignedOutError extends Error {
	constructor() {
		super("The ERP session has expired.");
		this.name = "ErpSignedOutError";
	}
}

// How long any one step is given. Generous: this is a full ERP page on a shop
// connection, and the alternative to waiting is telling a packer their bay did
// not save when it was merely slow.
const STEP_TIMEOUT = 20000;

// One frame for the life of the page, built on first use.
//
// Kept rather than made and dropped per call, because the expensive part is the
// first load -- the screen without a record is forty-odd kilobytes of WebForms
// -- and a packing run reads and writes the same reservation repeatedly. It is
// off screen and inert between calls.
let framePromise: Promise<HTMLIFrameElement> | undefined;

// One call at a time. The frame is a single page and two overlapping operations
// would navigate it out from under each other, so callers queue rather than
// race. `slotStore` already serialises its own saves, but the note box and the
// bay controls are separate mounts and can both act within a moment.
let queue: Promise<unknown> = Promise.resolve();

// The reservation currently loaded in the frame, so a second read of the same
// one does not pay for the postback again.
let loadedReservationId = "";

export function readReservationNote(reservationId: string): Promise<string> {
	return enqueue(async () => {
		const document_ = await showReservation(reservationId);

		return noteField(document_).value;
	});
}

// Writes the note, and hands back what the field held afterwards.
//
// The record is put into edit mode first -- the note is `readOnly` until it is,
// and a value set on a read-only control is posted back unchanged -- and the
// page returns itself to view mode once it has saved.
export function writeReservationNote(reservationId: string, text: string): Promise<string> {
	return enqueue(async () => {
		const frame = await ensureFrame();

		await showReservation(reservationId);

		// Into edit mode. The button is the same one the operator would press,
		// and pressing it is a postback like any other on this screen.
		await press(frame, ERP_EDIT_BUTTON_ID, "edit");

		const field = noteField(frame.contentDocument!);

		if (field.readOnly) {
			throw new Error("The reservation note is still read-only after entering edit mode.");
		}

		field.value = text;
		// WebForms posts the control's value, so the assignment above is what
		// actually travels. The events are for the page's own handlers, which is
		// what marks the record dirty and enables its save control.
		field.dispatchEvent(new Event("input", { bubbles: true }));
		field.dispatchEvent(new Event("change", { bubbles: true }));

		await press(frame, ERP_SAVE_BUTTON_ID, "save");

		// The screen re-renders from the record it just stored, so what the field
		// holds now is what was actually kept -- which is worth handing back
		// rather than echoing the caller's own string at them.
		const saved = noteField(frame.contentDocument!).value;

		debug("Wrote the reservation note.", { reservationId, length: saved.length });

		return saved;
	});
}

// Anything that has to happen while the frame is on one record, run with the
// frame to itself.
function enqueue<T>(work: () => Promise<T>): Promise<T> {
	const result = queue.then(work, work);

	// The chain must not stop at the first failure, or one unreachable ERP would
	// wedge every later call on the page.
	queue = result.catch(() => undefined);

	return result;
}

// The frame, made once and reused. Resolves when the reservation screen has been
// served into it.
function ensureFrame(): Promise<HTMLIFrameElement> {
	framePromise ??= createFrame();

	return framePromise;
}

async function createFrame(): Promise<HTMLIFrameElement> {
	const frame = document.createElement("iframe");

	frame.className = "pse-erp-frame";
	frame.setAttribute("aria-hidden", "true");
	frame.setAttribute("tabindex", "-1");
	frame.title = "RetailVista";
	frame.src = `${ERP_URL}${ERP_PAGE_PATH}?pageId=${ERP_RESERVATION_PAGE_ID}`;

	const loaded = whenLoaded(frame, "the reservation screen");

	document.body.append(frame);

	await loaded;

	return frame;
}

// Puts the frame on one reservation and hands back its document.
//
// The id is the reservation's internal one -- `#ReservationId`, which the portal
// keeps in its summary block -- and not the number the operator reads off the
// screen. Passing the number loads nothing and the screen stays empty, which is
// why this is the one argument worth being sure of.
async function showReservation(reservationId: string): Promise<Document> {
	const frame = await ensureFrame();

	requireSession(frame);

	if (loadedReservationId == reservationId && noteFieldOrNull(frame.contentDocument!)) {
		return frame.contentDocument!;
	}

	const setItem = (frame.contentWindow as unknown as Record<string, unknown>)[ERP_SET_ITEM_FUNCTION];

	if (typeof setItem != "function") {
		throw new Error(`The ERP reservation screen has no ${ERP_SET_ITEM_FUNCTION}().`);
	}

	const loaded = whenLoaded(frame, `reservation ${reservationId}`);

	(setItem as (id: number, modus: string) => void).call(frame.contentWindow, Number(reservationId), "view");

	await loaded;

	requireSession(frame);

	loadedReservationId = reservationId;

	return frame.contentDocument!;
}

// Presses one of the screen's own controls and waits for the postback it starts.
async function press(frame: HTMLIFrameElement, id: string, what: string) {
	const button = frame.contentDocument?.getElementById(id) as HTMLElement | null;

	if (!button) {
		throw new Error(`The ERP reservation screen has no ${what} control (#${id}).`);
	}

	const loaded = whenLoaded(frame, what);

	button.click();

	await loaded;

	requireSession(frame);

	// The record has moved: whatever mode it is in now, the next caller should
	// not assume the frame is still showing what it was.
	loadedReservationId = "";
}

function whenLoaded(frame: HTMLIFrameElement, what: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const timer = window.setTimeout(() => {
			frame.removeEventListener("load", onLoad);
			reject(new Error(`Timed out waiting for ${what}.`));
		}, STEP_TIMEOUT);

		function onLoad() {
			window.clearTimeout(timer);
			// The load event fires as the document is swapped in; the page's own
			// start-up scripts have not necessarily run yet, and it is those that
			// define the functions called here. A turn of the event loop is
			// enough, and is what the frame gets.
			window.setTimeout(resolve, 0);
		}

		frame.addEventListener("load", onLoad, { once: true });
	});
}

// The ERP answers a request without a session by serving its login form, so a
// frame showing that form is a frame that has been signed out -- possibly
// halfway through a packing run, since the ERP expires on its own clock.
function requireSession(frame: HTMLIFrameElement) {
	const document_ = frame.contentDocument;

	if (!document_ || document_.body?.innerHTML.includes(ERP_LOGIN_MARKER)) {
		// The frame is on the wrong page now; whatever loads next starts over.
		loadedReservationId = "";

		throw new ErpSignedOutError();
	}
}

function noteField(document_: Document): HTMLTextAreaElement {
	const field = noteFieldOrNull(document_);

	if (!field) {
		throw new Error("The ERP reservation screen has no note field.");
	}

	return field;
}

function noteFieldOrNull(document_: Document): HTMLTextAreaElement | null {
	return document_.querySelector<HTMLTextAreaElement>(ERP_NOTE_SELECTOR);
}

// Takes the frame off the page. Used when the session has gone, so that the next
// call starts from a fresh load rather than from a frame parked on a login form.
export function resetReservationNoteFrame() {
	framePromise?.then((frame) => frame.remove()).catch(() => undefined);
	framePromise = undefined;
	loadedReservationId = "";
}
