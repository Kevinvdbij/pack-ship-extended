import { ERP_LOGIN_MARKER, ERP_URL } from "./constants.ts";

// The one ERP page this workstation keeps open, and the queue that keeps it to
// one thing at a time.
//
// The ERP shares an origin with the packing portal -- `/outdoor/packship` is a
// sub application of `/outdoor` -- so a page of ours can load an ERP screen in a
// frame, read its document and call its own functions. That is what makes any of
// this possible without an API.
//
// Through a frame rather than by posting forms ourselves, because the ERP is
// WebForms: every action is a postback carrying a signed view state and an event
// validation list belonging to that exact render. Loaded in a frame the page
// does all of that itself, and a RetailVista update that changes the protocol
// changes nothing here.
//
// One frame for the workstation, not one per feature. The rack bays and the
// parcel labels both drive the ERP, and two frames would mean two full page
// loads racing each other through one session. So both go through `erpTask`,
// which hands the frame over for the length of one job.

// The ERP has no session. Thrown rather than returned so it cannot be mistaken
// for an ordinary empty answer, which is what most of these reads produce.
export class ErpSignedOutError extends Error {
	constructor() {
		super("The ERP session has expired.");
		this.name = "ErpSignedOutError";
	}
}

// How long any one step is given. Generous: this is a full ERP page on a shop
// connection, and the alternative to waiting is telling a packer their work did
// not happen when it was merely slow.
const STEP_TIMEOUT = 20000;

let framePromise: Promise<HTMLIFrameElement> | undefined;

// What the frame is currently showing, so a second job on the same screen does
// not pay for the load again. Cleared by anything that navigates it -- a press
// is a postback and lands somewhere new, even when the URL looks the same.
let currentPage = "";

// One job at a time. The frame is a single page and two overlapping jobs would
// navigate it out from under each other.
let queue: Promise<unknown> = Promise.resolve();

// The frame, for the length of one job.
export interface ErpPage {
	// The frame's live document. Re-read after every step: a postback replaces it.
	document: Document;
	// Loads an ERP screen, by path and query relative to `/outdoor`.
	open(pathAndQuery: string): Promise<Document>;
	// Calls one of the page's own functions and waits for the postback it starts.
	call(functionName: string, ...args: unknown[]): Promise<Document>;
	// Presses one of the page's own controls and waits for the postback.
	press(elementId: string, what: string): Promise<Document>;
	// First match in the frame's current document.
	find<T extends Element>(selector: string): T | null;
}

// Runs one job with the frame to itself.
export function erpTask<T>(work: (page: ErpPage) => Promise<T>): Promise<T> {
	const run = async () => work(await ensurePage());
	const result = queue.then(run, run);

	// The chain must not stop at the first failure, or one unreachable ERP would
	// wedge every later job on the page.
	queue = result.catch(() => undefined);

	return result;
}

async function ensurePage(): Promise<ErpPage> {
	const frame = await ensureFrame();

	const page: ErpPage = {
		get document() {
			requireSession(frame);

			return frame.contentDocument!;
		},

		async open(pathAndQuery: string) {
			if (currentPage == pathAndQuery && frame.contentDocument?.body) {
				requireSession(frame);

				return frame.contentDocument!;
			}

			const loaded = whenLoaded(frame, pathAndQuery);

			frame.src = `${ERP_URL}/${pathAndQuery.replace(/^\//, "")}`;

			await loaded;
			requireSession(frame);

			currentPage = pathAndQuery;

			return frame.contentDocument!;
		},

		async call(functionName: string, ...args: unknown[]) {
			const target = (frame.contentWindow as unknown as Record<string, unknown>)[functionName];

			if (typeof target != "function") {
				throw new Error(`The ERP screen has no ${functionName}().`);
			}

			const loaded = whenLoaded(frame, functionName);

			(target as (...rest: unknown[]) => void).apply(frame.contentWindow, args);

			await loaded;
			requireSession(frame);

			// The screen has moved on from whatever it was serving.
			currentPage = "";

			return frame.contentDocument!;
		},

		async press(elementId: string, what: string) {
			const button = frame.contentDocument?.getElementById(elementId);

			if (!button) {
				throw new Error(`The ERP screen has no ${what} control (#${elementId}).`);
			}

			const loaded = whenLoaded(frame, what);

			button.click();

			await loaded;
			requireSession(frame);

			currentPage = "";

			return frame.contentDocument!;
		},

		find<T extends Element>(selector: string) {
			requireSession(frame);

			return frame.contentDocument!.querySelector<T>(selector);
		},
	};

	return page;
}

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
	// Blank to begin with. Every job opens the screen it needs, and starting on a
	// screen chosen here would be one page load spent on a guess.
	frame.src = "about:blank";

	const loaded = whenLoaded(frame, "the ERP frame");

	document.body.append(frame);

	await loaded;

	currentPage = "";

	return frame;
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
			// define the functions `call` reaches for. A turn of the event loop is
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
		currentPage = "";

		throw new ErpSignedOutError();
	}
}

// Takes the frame off the page, so the next job starts from a fresh load rather
// than from a frame parked on a login form.
export function resetErpFrame() {
	framePromise?.then((frame) => frame.remove()).catch(() => undefined);
	framePromise = undefined;
	currentPage = "";
}
