import { toast } from "vue3-toastify";
import { ReservationParcel } from "../interfaces.ts";
import { printParcelLabel } from "../parcelLabel.ts";
import { ErpSignedOutError } from "../erpFrame.ts";
import { erpStore } from "./erpStore.ts";
import { playSound } from "../sounds.ts";
import Settings from "../settings.ts";

// Reprinting one parcel's label, with everything that has to happen around it.
//
// Three places ask for this now -- the button on the parcel card, the log beside
// the search, and the picker the log opens when a reservation has more than one
// label -- and they were on their way to three copies of the same eight lines.
// What differs between them is only which parcel is meant and what is on screen
// while it happens; the reporting is the same, and a reprint that told the
// operator different things depending on where it was pressed from would be
// worse than one that told them nothing.
//
// Resolves to whether it worked, so a caller that is a dialog can close itself
// on success and stay up on failure.
export async function reprintParcel(reservationId: string, parcel: ReservationParcel): Promise<boolean> {
	// The workplace decides the printer, the same way it decides where the portal
	// prints everything else. Worth catching here rather than letting it through:
	// RetailVista's own refusal does not mention the setting that needs filling
	// in, because RetailVista does not know we have one.
	if (Settings.environmentId <= 0) {
		toast.error("Stel eerst de omgeving van deze werkplek in bij Instellingen.");

		return false;
	}

	const work = printParcelLabel(reservationId, parcel.id, Settings.environmentId);

	toast.promise(work, {
		pending: `Etiket ${parcel.barcode} wordt opnieuw geprint...`,
		// The printer is named on the way out. The one real risk in this feature
		// is a label appearing at a bench nobody is standing at, and the answer to
		// that is to say which bench before anyone goes looking for it.
		success: {
			render: ({ data }) => `Etiket ${parcel.barcode} geprint op ${(data as { printer: string }).printer}.`,
		},
		error: `Etiket ${parcel.barcode} kon niet opnieuw geprint worden.`,
	}).catch(() => undefined);

	try {
		await work;

		return true;
	} catch (error) {
		if (error instanceof ErpSignedOutError) {
			erpStore.reportSignedOut();
		}

		console.error("Pack&Ship Extended could not reprint the parcel label.", error);
		// The toast says so on screen; this says so to whoever has already turned
		// back to the bench.
		playSound("error");

		return false;
	}
}
