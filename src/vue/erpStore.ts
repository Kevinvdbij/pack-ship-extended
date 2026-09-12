import { computed, ref } from "vue";
import { erpLogin, probeErpSession } from "../erpSession.ts";
import { pauseErpKeepAlive, resumeErpKeepAlive } from "../erpKeepAlive.ts";
import { resetReservationNoteFrame } from "../reservationNote.ts";
import { getCurrentUser } from "../currentUser.ts";

// Whether the ERP will answer for us, and the one place that asks for a new
// sign-in when it will not.
//
// The ERP session is not the portal's. It is created alongside it at sign-in --
// see `LoginPage.vue` -- and from then on it keeps its own clock: it can lapse
// while the portal's is still perfectly good, and a packer would find out by
// pressing a bay and being told it did not save. So the state is held here,
// where every mount on the page can see it, and the prompt is raised once
// rather than per control.
//
// Nothing is stored to sign in again with. The password is used at sign-in and
// dropped, which is why the way back from an expired session is to ask -- and
// asking is the whole of what this module is for.

// Raised when the ERP has turned us away. Cleared by a successful sign-in.
const signedOut = ref(false);

// A sign-in is being tried, so the dialog can hold its buttons.
const busy = ref(false);

// The last attempt was refused. Distinct from `signedOut`, which says the
// session is gone; this says the credentials just offered did not restore it.
const refused = ref(false);

// What to run once the session is back.
//
// Whoever was turned away asked the operator to sign in, and by the time they
// have, the work that raised the prompt is long finished -- failed, logged and
// forgotten. Without this, signing in correctly leaves the screen exactly as it
// was, bays still missing, and the only way to see them is to reload the page --
// which reads as the sign-in not having worked.
//
// A list rather than an import: this module is what `slotStore` depends on, so
// it cannot depend on `slotStore` in turn. What can cross that line is a
// callback the other side registers.
const restoreHandlers: Array<() => void> = [];

export const erpStore = {
	signedOut: computed(() => signedOut.value),
	busy: computed(() => busy.value),
	refused: computed(() => refused.value),

	// The name and company the portal was signed into with, so the dialog can
	// offer them back rather than making somebody retype what the portal already
	// knows. Absent when the chain that records them was broken -- see
	// `src/currentUser.ts` -- in which case the dialog asks for all three.
	suggested: computed(() => {
		const user = getCurrentUser();

		return { userName: user?.userName ?? "", companyNumber: user?.companyNumber ?? "" };
	}),

	// Told by whoever tried to use the ERP and was turned away.
	//
	// The frame is dropped with it: it is parked on a login form at this point,
	// and the next call should start from a fresh load rather than from that.
	reportSignedOut() {
		if (!signedOut.value) {
			resetReservationNoteFrame();
		}

		// Nothing left to keep alive until somebody signs in again.
		pauseErpKeepAlive();
		signedOut.value = true;
	},

	// Checks quietly, without raising the dialog on a session that is fine. Used
	// where something is about to depend on the ERP and would rather ask first
	// than fail in front of the operator.
	//
	// Only a session the ERP has actually ended raises the prompt. An ERP that
	// cannot be reached is a different failure with a different remedy, and a
	// password would not fix it.
	async verify(): Promise<boolean> {
		const state = await probeErpSession();

		if (state == "signed-out") {
			this.reportSignedOut();
		}

		return state == "alive";
	},

	// Signs in again from the dialog. Resolves to whether it worked, so the
	// dialog can stay up and say so when it did not.
	async signIn(companyNumber: string, userName: string, password: string): Promise<boolean> {
		busy.value = true;
		refused.value = false;

		const ok = await erpLogin(companyNumber, userName, password);

		busy.value = false;

		if (ok) {
			// Whatever the frame was showing belongs to the session that ended.
			resetReservationNoteFrame();
			signedOut.value = false;
			resumeErpKeepAlive();

			// Pick up whatever was dropped when the session went. Guarded one by
			// one: this is a list of other people's work, and one handler that
			// throws must not stop the rest running.
			for (const handler of restoreHandlers) {
				try {
					handler();
				} catch (error) {
					console.error("Pack&Ship Extended failed to resume after signing into the ERP.", error);
				}
			}
		} else {
			refused.value = true;
		}

		return ok;
	},

	// Registered at import time by anything that reads the ERP and would other-
	// wise sit empty until the page is reloaded.
	onRestored(handler: () => void) {
		restoreHandlers.push(handler);
	},

	// Puts the dialog away without signing in. The bays stay unavailable and say
	// so; this is the way past a prompt raised in the middle of something more
	// urgent than a rack bay.
	dismiss() {
		signedOut.value = false;
		refused.value = false;
	},
};
