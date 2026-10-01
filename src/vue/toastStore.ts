import { reactive } from "vue";

// The notices on screen, and how long each one stays.
//
// Apart from `toast.ts`, which is what everything else calls, because the stack
// component reads this and `toast.ts` mounts the stack component -- two files
// that each needed the other. The state has no need of either.
export type ToastKind = "pending" | "success" | "error" | "info";

export interface ToastEntry {
	id: number;
	kind: ToastKind;
	message: string;
}

// Newest last, which is the order they are drawn in: a new notice arrives under
// the ones already there instead of pushing them out from under the eye.
export const toasts = reactive<ToastEntry[]>([]);

// How long a notice stands once there is nothing left to wait for. A failure
// gets longer: it is the one that has to be read rather than recognised, and
// the packer it is for has usually looked away by the time it appears.
const LIFETIME_MS: Record<Exclude<ToastKind, "pending">, number> = {
	success: 4000,
	info: 5000,
	error: 8000,
};

const timers = new Map<number, ReturnType<typeof setTimeout>>();

let nextId = 1;

export function addToast(kind: ToastKind, message: string): number {
	const id = nextId++;

	toasts.push({ id, kind, message });
	resumeToast(id);

	return id;
}

// A notice that was waiting on something and now has its answer. Changed in
// place rather than replaced, so the card that said "wordt opgeslagen" is the
// card that says it worked -- one thing on screen per thing that happened.
export function settleToast(id: number, kind: Exclude<ToastKind, "pending">, message: string) {
	const entry = toasts.find((candidate) => candidate.id == id);

	// Closed by hand while it was still waiting. The answer is still worth
	// having -- more so if it is a failure -- so it is said afresh.
	if (!entry) {
		addToast(kind, message);

		return;
	}

	entry.kind = kind;
	entry.message = message;

	resumeToast(id);
}

export function dismissToast(id: number) {
	pauseToast(id);

	const index = toasts.findIndex((candidate) => candidate.id == id);

	if (index >= 0) {
		toasts.splice(index, 1);
	}
}

// Held for as long as the pointer is on it: a notice that leaves while it is
// being read is worse than one that overstays.
export function pauseToast(id: number) {
	clearTimeout(timers.get(id));
	timers.delete(id);
}

// Starts the clock, from the beginning. A notice still waiting has none -- it
// stays until whatever it is waiting on has answered.
export function resumeToast(id: number) {
	pauseToast(id);

	const entry = toasts.find((candidate) => candidate.id == id);

	if (!entry || entry.kind == "pending") {
		return;
	}

	timers.set(id, setTimeout(() => dismissToast(id), LIFETIME_MS[entry.kind]));
}
