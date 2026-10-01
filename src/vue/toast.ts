import { mountApp } from "./mount.ts";
import ToastStack from "./components/ToastStack.vue";
import { addToast, settleToast } from "./toastStore.ts";

// The notices that report on work done away from where the packer is looking:
// a note saved, a label reprinted, a bay written to the reservation.
//
// Ours rather than a library's. There are three things this extension ever says
// this way -- something failed, something is worth knowing, something is being
// done and here is how it went -- and the library that used to say them brought
// its own stylesheet, its own idea of a card and a few hundred options nobody
// set. This is those three, drawn like everything else here.

// What a settled piece of work is reported as: a sentence, or one made from
// what the work came back with.
type Outcome<T> = string | ((value: T) => string);

interface PromiseMessages<T> {
	pending: string;
	success: Outcome<T>;
	error: Outcome<unknown>;
}

// The stack is mounted by the first notice rather than with the page. Most page
// loads never raise one, and every notice comes from something an operator
// pressed -- long after there is a body to mount into.
let mounted = false;

function ensureStack() {
	if (mounted) {
		return;
	}

	mounted = true;

	mountApp(ToastStack, (host) => document.body.append(host));
}

function show(kind: "success" | "error" | "info", message: string) {
	ensureStack();
	addToast(kind, message);
}

function describe<T>(outcome: Outcome<T>, value: T): string {
	return typeof outcome == "function" ? outcome(value) : outcome;
}

export const toast = {
	success: (message: string) => show("success", message),
	error: (message: string) => show("error", message),
	info: (message: string) => show("info", message),

	// One notice for the length of a piece of work: it says the work is under
	// way, and then how it ended.
	//
	// Nothing is returned and nothing is thrown. The work is the caller's, and
	// so is what to do when it fails -- this only watches, so a caller that
	// forgets to catch its own promise is not also left with one of ours.
	promise<T>(work: Promise<T>, messages: PromiseMessages<T>) {
		ensureStack();

		const id = addToast("pending", messages.pending);

		work.then(
			(value) => settleToast(id, "success", describe(messages.success, value)),
			(error) => settleToast(id, "error", describe(messages.error, error)),
		);
	},
};
