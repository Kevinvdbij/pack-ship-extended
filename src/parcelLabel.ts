import {
	ERP_ENVIRONMENT_PAGE_ID, ERP_ENVIRONMENT_PARCEL_PRINTER_SELECTOR, ERP_LABEL_PARCEL_SELECTOR,
	ERP_LABEL_PRINT_SELECTOR, ERP_LABEL_PRINTER_SELECTOR, ERP_PAGE_PATH, ERP_PARCEL_LABEL_PAGE_ID
} from "./constants.ts";
import { ErpPage, erpTask } from "./erpFrame.ts";
import { debug } from "./logger.ts";

// Printing a parcel's carrier label again.
//
// The label itself is not ours to produce. It was made when the parcel was
// announced -- the carrier's answer, sent straight to a printer by RetailVista,
// never passing through the browser -- and there is no operation anywhere in the
// API that hands back the label of a parcel already announced. What there is, is
// the ERP's own task for exactly this: print parcel service label. So this drives
// that, which also means a reprint here is the same reprint the office would do,
// with the same rules, the same carrier account and the same audit trail.

// Where a reprint went, or why it did not.
export interface PrintResult {
	// The printer the label was sent to, as RetailVista names it. Worth handing
	// back rather than a bare success: the whole risk in this feature is a label
	// coming out at a bench nobody is standing at.
	printer: string;
}

// The parcel service printer of each environment, once per page.
//
// Read from the environment record rather than guessed from the printer's name.
// The two naming schemes do not line up -- an environment called "Webshop -
// werkplek 1" is served by a printer called "Webshop - Werkplek 01 - Zebrda
// ZD421 (KR-WEB-WP-01)", complete with the vendor's own typo -- and one
// workplace has two printers against its name, so matching by eye would be a
// guess with a wrong bench at the end of it.
//
// What is matched is the description RetailVista stores on the environment
// against the description RetailVista puts in the dialog's own list. Both sides
// are its data, so the comparison is exact and there is nothing to normalise.
const printerCache = new Map<number, string>();

export async function parcelPrinterFor(environmentId: number): Promise<string> {
	const known = printerCache.get(environmentId);

	if (known != undefined) {
		return known;
	}

	const description = await erpTask(async (page) => {
		await page.open(`${ERP_PAGE_PATH}?pageId=${ERP_ENVIRONMENT_PAGE_ID}&itemId=${environmentId}`);

		return page.find<HTMLInputElement>(ERP_ENVIRONMENT_PARCEL_PRINTER_SELECTOR)?.value.trim() ?? "";
	});

	printerCache.set(environmentId, description);

	debug("Parcel service printer for this environment", { environmentId, description });

	return description;
}

// Sends one parcel's label to the printer this workplace prints parcels on.
//
// `parcelId` is the parcel's own id, which the portal already has: the parcels
// form carries it as `Items[n].ItemId`, and it is the same id the dialog lists.
// So the parcel being reprinted is named outright rather than picked by
// position, and a reservation with three boxes reprints the one that was asked
// for.
export async function printParcelLabel(
	reservationId: string,
	parcelId: string,
	environmentId: number
): Promise<PrintResult> {
	const wanted = await parcelPrinterFor(environmentId);

	if (!wanted) {
		throw new Error("This workplace has no parcel service printer configured in RetailVista.");
	}

	return erpTask(async (page) => {
		await page.open(`${ERP_PAGE_PATH}?pageId=${ERP_PARCEL_LABEL_PAGE_ID}&itemId=${reservationId}`);

		selectByValue(page, ERP_LABEL_PARCEL_SELECTOR, parcelId, "parcel");
		selectByText(page, ERP_LABEL_PRINTER_SELECTOR, wanted, "printer");

		const printButton = page.find<HTMLInputElement>(ERP_LABEL_PRINT_SELECTOR);

		if (!printButton) {
			throw new Error("The ERP label dialog has no print control.");
		}

		await page.press(printButton.id, "print");

		debug("Reprinted a parcel label.", { reservationId, parcelId, printer: wanted });

		return { printer: wanted };
	});
}

// Picks an option by its value, which is what the ids are for.
function selectByValue(page: ErpPage, selector: string, value: string, what: string) {
	const list = requireList(page, selector, what);
	const option = Array.from(list.options).find((candidate) => candidate.value == value);

	if (!option) {
		// The parcel is not on this reservation's list. Refused rather than left
		// on whatever the dialog happened to preselect: printing the wrong box's
		// label is worse than printing nothing.
		throw new Error(`The ERP label dialog does not list ${what} ${value}.`);
	}

	apply(list, option.index);
}

// Picks an option by its exact caption. Only ever used with a description read
// back out of RetailVista itself -- never with anything typed here, and never
// with anything shown to an operator.
function selectByText(page: ErpPage, selector: string, text: string, what: string) {
	const list = requireList(page, selector, what);
	const option = Array.from(list.options).find((candidate) => candidate.text.trim() == text);

	if (!option) {
		throw new Error(`The ERP label dialog does not list the ${what} "${text}".`);
	}

	apply(list, option.index);
}

function requireList(page: ErpPage, selector: string, what: string): HTMLSelectElement {
	const list = page.find<HTMLSelectElement>(selector);

	if (!list) {
		throw new Error(`The ERP label dialog has no ${what} list.`);
	}

	return list;
}

// WebForms posts the control's value, so the assignment is what travels. The
// event is for the page's own handlers, which is what any dependent control on
// the dialog is listening for.
function apply(list: HTMLSelectElement, index: number) {
	list.selectedIndex = index;
	list.dispatchEvent(new Event("change", { bubbles: true }));
}
