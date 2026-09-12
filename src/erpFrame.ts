import {
	ERP_LAUNCHER_FRAME_NAME, ERP_LAUNCHER_INNER_FRAME, ERP_LAUNCHER_PATH, ERP_LOGIN_MARKER,
	ERP_PAGE_PATH, ERP_SEARCH_OPEN_FUNCTION, ERP_URL
} from "./constants.ts";

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
	const run = async () => {
		// The focus is the frame's for the length of the job to take, so it is
		// ours to watch for exactly that long. See `watchFocus()`.
		watchFocus();

		try {
			return await work(await ensurePage());
		} finally {
			releaseFocus();
		}
	};
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

// ---- Keeping the cursor out of the frame ----
//
// Loading an ERP record takes the focus. Measured on the live portal rather than
// reasoned about: opening `Default.aspx?pageId=374` in a frame leaves the focus
// alone, but the postback that loads a record into it -- `SetDisplayItemId`,
// which every read and write here goes through -- moves `document.activeElement`
// to the frame element, about 250ms before the frame's own load event and
// without the outer document hearing a single focus event for it.
//
// On the parcels page that costs a scan. The first thing the sidebar does on the
// way in is read the reservation's note, so the cursor this page had just put in
// the scan field was pulled into a hidden document a second later, and the scan
// that followed went nowhere.
//
// The frame is `aria-hidden` and `tabindex="-1"`: nothing out here ever wants the
// cursor in there. So for as long as a job is running, the focus is watched and
// handed straight back to the element that had it.
//
// Watched on a timer rather than hung off an event, because there is no event:
// what changes is only `document.activeElement`. A timer for the length of a job
// is what covers a theft that lands anywhere in a postback -- before the load,
// after it, or on the second of the two loads a read is made of.

// Every frame of ours that is in the document, so the focus watch can tell "in
// one of our frames" from anywhere else without being handed one. There are two
// kinds -- the bare screen and the launcher -- and either can take the cursor.
const ourFrames = new Set<HTMLIFrameElement>();

// The element that had the focus before the frame took it.
//
// Sampled on the watch's own tick rather than tracked from focus events, and
// that is not belt-and-braces: a `focus()` call in a background tab moves
// `document.activeElement` without firing `focusin` at all -- measured in the
// live tab -- and the one page that most needs this places the cursor from a
// script. Events are listened to as well because they are free and finer
// grained, but nothing depends on them.
let lastFocusOutsideFrame: Element | null = null;

// How often the focus is looked at while a job runs, and how long the watch
// stays on after the last one finishes -- enough to cover a theft that lands a
// moment after the step that caused it was awaited.
const FOCUS_WATCH_INTERVAL = 100;
const FOCUS_WATCH_TAIL = 1000;

let focusWatchJobs = 0;
let focusWatchTimer: number | undefined;
let focusWatchStopTimer: number | undefined;

document.addEventListener("focusin", (event) => {
	lastFocusOutsideFrame = outsideFocusCandidate(event.target as Element | null)
		?? lastFocusOutsideFrame;
}, true);

function handFocusBack() {
	const active = document.activeElement;

	// `activeElement` is the frame element itself whenever the focus is anywhere
	// inside it, whichever of its own controls has it. Anything else is where the
	// packer is, and worth remembering for when a frame takes it.
	if (!(active instanceof HTMLIFrameElement) || !ourFrames.has(active)) {
		lastFocusOutsideFrame = outsideFocusCandidate(active) ?? lastFocusOutsideFrame;

		return;
	}

	const frame = active;

	const previous = lastFocusOutsideFrame;

	// Out of the frame either way. A frame that keeps the focus keeps every
	// keystroke after it, and handing the cursor back to nothing is still better
	// than leaving it in a document nobody can see.
	frame.blur();

	if (previous instanceof HTMLElement && previous.isConnected) {
		previous.focus({ preventScroll: true });
	}
}

// Somewhere the cursor could sensibly be put back. Not the body, which is where
// the focus sits when nothing holds it, and not the frame -- putting it back
// there is the whole thing being prevented.
function outsideFocusCandidate(element: Element | null): Element | null {
	if (!element || element == document.body) {
		return null;
	}

	return element instanceof HTMLIFrameElement && ourFrames.has(element) ? null : element;
}

// Counted rather than switched, so a job that starts while another is finishing
// does not turn the watch off behind it.
function watchFocus() {
	focusWatchJobs++;

	// Where the packer is right now, which is where they will want to be when
	// this job is over. Sampled again on every tick from here on.
	lastFocusOutsideFrame = outsideFocusCandidate(document.activeElement) ?? lastFocusOutsideFrame;

	window.clearTimeout(focusWatchStopTimer);
	focusWatchStopTimer = undefined;

	focusWatchTimer ??= window.setInterval(handFocusBack, FOCUS_WATCH_INTERVAL);
}

function releaseFocus() {
	focusWatchJobs = Math.max(0, focusWatchJobs - 1);

	if (focusWatchJobs > 0 || focusWatchStopTimer !== undefined) {
		return;
	}

	focusWatchStopTimer = window.setTimeout(() => {
		focusWatchStopTimer = undefined;

		if (focusWatchJobs == 0) {
			window.clearInterval(focusWatchTimer);
			focusWatchTimer = undefined;
		}
	}, FOCUS_WATCH_TAIL);
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

	// Known to the focus watch before it is in the document, so the first job is
	// covered -- that is the one that lands while the packer is being given the
	// scan field.
	ourFrames.add(frame);

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

// ---- The application, rather than one of its screens ----
//
// Everything above drives a screen on its own, which is all that is needed for
// anything addressed by an internal id. Finding a record by the number an
// operator reads is not: the lookup is the application's search dialog, and the
// dialog machinery lives in the launcher window -- `window.top.getMainWindow()`,
// which a bare screen has no answer for.
//
// So there is a second frame that holds the application proper: the launcher,
// with the screen inside it as `DefaultFrame`. It is created only when something
// asks for it, because it costs two page loads rather than one, and it is kept
// once created.
//
// Named, and the name matters -- see `ERP_LAUNCHER_FRAME_NAME`. A frame whose
// name does not begin with `pop` sends our own tab to `Index.aspx`.

// The launcher, for the length of one job.
export interface ErpApplication {
	// The launcher's own window, which owns the dialog machinery.
	launcher: Window & Record<string, unknown>;
	// The screen inside it. Re-read after every postback, which replaces the
	// document.
	screen(): Document;
	// And its window, for the screen's own functions and variables.
	screenWindow(): Window & Record<string, unknown>;
	// Opens one of the application's dialogs the way the screen's own controls do,
	// and hands back its document once `marker` is in it. The dialog is found by
	// what it is showing rather than by a handle: the launcher hands none back.
	openDialog(pageId: number, marker: string, what: string): Promise<Document>;
	// Polls until `probe` answers with something, or gives up. The application
	// answers callbacks and async postbacks with no event out here to wait on, so
	// the waiting is done by looking.
	until<T>(probe: () => T | undefined | null | false, what: string): Promise<T>;
}

let launcherPromise: Promise<HTMLIFrameElement> | undefined;

// Which screen the launcher is holding, so a second job on the same one does not
// pay for the load again.
let launcherPage = 0;

// How often the application is looked at while waiting for it.
const POLL_INTERVAL = 150;

export function erpApplicationTask<T>(
	pageId: number,
	work: (application: ErpApplication) => Promise<T>
): Promise<T> {
	const run = async () => {
		watchFocus();

		try {
			return await work(await ensureApplication(pageId));
		} finally {
			releaseFocus();
		}
	};
	const result = queue.then(run, run);

	queue = result.catch(() => undefined);

	return result;
}

async function ensureApplication(pageId: number): Promise<ErpApplication> {
	const frame = await ensureLauncher(pageId);

	const launcher = () => {
		const window_ = frame.contentWindow as (Window & Record<string, unknown>) | null;

		if (!window_) {
			throw new Error("The ERP launcher has no window.");
		}

		return window_;
	};

	const screenWindow = () => {
		const inner = launcher()[ERP_LAUNCHER_INNER_FRAME] as (Window & Record<string, unknown>) | undefined;

		if (!inner?.document?.body) {
			throw new Error("The ERP launcher is not holding a screen.");
		}

		requireInnerSession(inner.document);

		return inner;
	};

	await openScreen(frame, pageId);

	return {
		get launcher() {
			return launcher();
		},

		screen: () => screenWindow().document,
		screenWindow,
		until: pollFor,

		async openDialog(dialogPageId: number, marker: string, what: string) {
			const open = launcher()[ERP_SEARCH_OPEN_FUNCTION];

			if (typeof open != "function") {
				throw new Error(`The ERP launcher cannot open ${what}.`);
			}

			(open as (...rest: unknown[]) => void).call(launcher(), dialogPageId, 950, 600);

			return pollFor(() => findFrameShowing(launcher(), marker), what);
		},
	};
}

// The dialog's own frame, told from the launcher's others by what is in it.
//
// The screen is skipped by name rather than left to the marker to exclude. A
// search form is a form over the same record the screen behind it displays, so
// its fields carry the same names -- ask for a reservation number box and the
// screen answers first, with the box holding whatever record it is on. That
// mistake is not visible in the answer: it is a document with the right control
// in it, and everything after would read the wrong one.
function findFrameShowing(launcher: Window, marker: string): Document | undefined {
	for (const candidate of Array.from(launcher.frames as unknown as Window[])) {
		try {
			if (candidate.name == ERP_LAUNCHER_INNER_FRAME) {
				continue;
			}

			const document_ = candidate.document;

			if (document_?.querySelector(marker)) {
				return document_;
			}
		} catch {
			// A frame we cannot read is not one of the application's.
		}
	}

	return undefined;
}

async function ensureLauncher(pageId: number): Promise<HTMLIFrameElement> {
	launcherPromise ??= createLauncher(pageId);

	return launcherPromise;
}

async function createLauncher(pageId: number): Promise<HTMLIFrameElement> {
	const frame = document.createElement("iframe");

	frame.className = "pse-erp-frame";
	frame.setAttribute("aria-hidden", "true");
	frame.setAttribute("tabindex", "-1");
	frame.title = "RetailVista";
	// Load-bearing. See `ERP_LAUNCHER_FRAME_NAME`.
	frame.name = ERP_LAUNCHER_FRAME_NAME;

	const loaded = whenLoaded(frame, "the ERP application");

	ourFrames.add(frame);
	launcherPage = pageId;

	frame.src = `${ERP_URL}${ERP_LAUNCHER_PATH}?pageId=${pageId}`;
	document.body.append(frame);

	await loaded;
	await whenScreenReady(frame);

	return frame;
}

// Puts the launcher's inner frame on the screen wanted. A launcher already
// showing it is left alone: the frame is kept between jobs, and reloading the
// screen we are on would cost a page load and lose the record displayed.
async function openScreen(frame: HTMLIFrameElement, pageId: number) {
	if (launcherPage == pageId) {
		return;
	}

	const inner = (frame.contentWindow as unknown as Record<string, Window | undefined>)
		?.[ERP_LAUNCHER_INNER_FRAME];

	if (!inner) {
		throw new Error("The ERP launcher is not holding a screen.");
	}

	inner.location.replace(`${ERP_URL}${ERP_PAGE_PATH}?pageId=${pageId}`);
	launcherPage = pageId;

	await whenScreenReady(frame);
}

// The launcher frames its screen itself, from a load of its own that does not
// finish with the launcher's -- and a postback inside it replaces the document
// again. Waited for by looking, since those loads belong to a frame we did not
// create and cannot listen to before it exists.
function whenScreenReady(frame: HTMLIFrameElement): Promise<Document> {
	return pollFor(() => {
		const inner = (frame.contentWindow as unknown as Record<string, Window | undefined>)
			?.[ERP_LAUNCHER_INNER_FRAME];
		const document_ = inner?.document;

		if (!document_?.body || document_.readyState == "loading") {
			return undefined;
		}

		requireInnerSession(document_);

		return document_;
	}, "the ERP application's screen");
}

// The screen inside the launcher, checked the way a bare one is: the ERP answers
// a request without a session by serving its login form.
function requireInnerSession(document_: Document) {
	if (document_.body?.innerHTML.includes(ERP_LOGIN_MARKER)) {
		throw new ErpSignedOutError();
	}
}

function pollFor<T>(probe: () => T | undefined | null | false, what: string): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const deadline = performance.now() + STEP_TIMEOUT;

		const look = () => {
			let answer: T | undefined | null | false;

			try {
				answer = probe();
			} catch (error) {
				// A signed-out session will not come good by waiting; anything else
				// is usually a document mid-navigation, which is what the waiting is
				// for.
				if (error instanceof ErpSignedOutError) {
					reject(error);

					return;
				}

				answer = undefined;
			}

			if (answer) {
				resolve(answer);

				return;
			}

			if (performance.now() > deadline) {
				reject(new Error(`Timed out waiting for ${what}.`));

				return;
			}

			window.setTimeout(look, POLL_INTERVAL);
		};

		look();
	});
}

// Takes the frame off the page, so the next job starts from a fresh load rather
// than from a frame parked on a login form.
export function resetErpFrame() {
	for (const promise of [framePromise, launcherPromise]) {
		promise?.then((frame) => {
			ourFrames.delete(frame);
			frame.remove();
		}).catch(() => undefined);
	}

	framePromise = undefined;
	launcherPromise = undefined;
	currentPage = "";
}
