import {
	ERP_PAGE_PATH, ERP_RAAPLIJST_REPORT_PREFIX, ERP_REPORT_CONTENT_FRAME_SELECTOR,
	ERP_REPORT_OK_SELECTOR, ERP_REPORT_PAGE_ID, ERP_REPORT_SELECTOR, ERP_RESERVATION_PAGE_ID, ERP_URL
} from "./constants.ts";
import { erpTask } from "./erpFrame.ts";
import { debug } from "./logger.ts";

// Printing raaplijst 110.1 for the reservation on the bench.
//
// By hand this is: open the reservation in RetailVista, press the reports icon,
// pick "110.1 - Raaplijst" out of a list of twelve, press Ok, wait for the
// viewer, press print. Six steps away from the screen the packer is actually
// working on, for a sheet of paper they need before they can start. So it is
// one button, and every one of those steps happens in the ERP frame this
// workstation already keeps.
//
// What comes back is the report as HTML, not as paper. The report dialog has no
// printer field -- unlike the parcel label task, which takes a `printerId` and
// has RetailVista push to the printer itself, this one renders for whoever
// asked and leaves the printing to them. So the last step is the browser's own
// print dialog, which is also what the ERP's print button ends at today; what
// this saves is the six steps in front of it, not the press at the end.
//
// The HTML rather than the PDF the viewer's print button produces. Both are
// there -- the viewer keeps a `DXPrinter` frame with the PDF in it -- but a PDF
// in a frame cannot be handed to `print()`: Chrome renders it in its own viewer
// and drops a scripted print on the floor, silently, which is a button that
// looks like it worked. The HTML is positioned absolutely by the report
// renderer, so what comes out of the printer is the same layout.

export interface RaaplijstResult {
	// The report's own heading, read back so the caller can say which document
	// it just put in front of the operator rather than "done".
	title: string;
}

// How long the viewer is given to render after the dialog is accepted. The
// report is built server-side and the frame is filled by a second request, so
// this is two round trips on a shop connection.
const RENDER_TIMEOUT = 20000;
const POLL_INTERVAL = 150;

export async function printRaaplijst(reservationId: string): Promise<RaaplijstResult> {
	const report = await renderRaaplijst(reservationId);

	return print(report);
}

// The report, as the markup of one printed page.
async function renderRaaplijst(reservationId: string): Promise<string> {
	return erpTask(async (page) => {
		await page.open(`${ERP_PAGE_PATH}?pageId=${ERP_REPORT_PAGE_ID}&ReadOnly=1`
			+ `&reportPageId=${ERP_RESERVATION_PAGE_ID}&itemId=${encodeURIComponent(reservationId)}`);

		const list = page.find<HTMLSelectElement>(ERP_REPORT_SELECTOR);

		if (!list) {
			throw new Error("The ERP report dialog has no report list.");
		}

		const option = Array.from(list.options)
			.find((candidate) => candidate.text.trim().startsWith(ERP_RAAPLIJST_REPORT_PREFIX));

		if (!option) {
			throw new Error(`The ERP report dialog does not offer report ${ERP_RAAPLIJST_REPORT_PREFIX}.`);
		}

		// WebForms posts the control's value, so the assignment is what travels;
		// the event is for the dialog's own handlers.
		list.selectedIndex = option.index;
		list.dispatchEvent(new Event("change", { bubbles: true }));

		const ok = page.find<HTMLElement>(ERP_REPORT_OK_SELECTOR);

		if (!ok) {
			throw new Error("The ERP report dialog has no Ok control.");
		}

		await page.press(ok.id, "report dialog Ok");

		debug("Asked the ERP for the raaplijst.", { reservationId, report: option.text.trim() });

		return await readRenderedReport(page.document);
	});
}

// The viewer fills its content frame after the postback that accepted the
// dialog, so the document that comes back from the press is the viewer with an
// empty frame in it. Polled rather than awaited: the fill is a request the page
// makes for itself and there is no event out here for it.
async function readRenderedReport(document: Document): Promise<string> {
	const deadline = Date.now() + RENDER_TIMEOUT;

	while (Date.now() < deadline) {
		const frame = document.querySelector<HTMLIFrameElement>(ERP_REPORT_CONTENT_FRAME_SELECTOR);
		const rendered = frame?.contentDocument;

		// An empty body is the frame before it has been filled. The report is
		// several kilobytes of positioned markup, so anything at all in there is
		// the report.
		if (rendered?.body?.firstElementChild) {
			return rendered.documentElement.outerHTML;
		}

		await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
	}

	throw new Error("The ERP report viewer did not render the raaplijst in time.");
}

// The report in front of the operator, in the browser's print dialog.
//
// In a frame of ours rather than in the page, because the page is the packing
// screen: printing the document itself would need every one of our blocks
// hidden for print and would still be at the mercy of the portal's own
// stylesheet. A frame carrying nothing but the report has neither problem.
//
// The frame is written rather than pointed at a URL. The report's markup came
// out of a POST -- there is no address to send anyone to -- and its images are
// on the ERP's own origin, which is ours, so a `<base>` is all they need.
async function print(reportHtml: string): Promise<RaaplijstResult> {
	const frame = document.createElement("iframe");

	// Off screen rather than `display: none`: a frame that is not laid out has
	// nothing to print, and Chrome prints a blank page from one.
	frame.setAttribute("aria-hidden", "true");
	frame.tabIndex = -1;
	frame.style.cssText = "position:fixed;left:-10000px;top:0;width:210mm;height:297mm;border:0;";

	document.body.append(frame);

	try {
		const inner = await write(frame, reportHtml);
		const title = inner.document.body.innerText.trim().split("\n")[0]?.trim() ?? "";

		inner.focus();
		inner.print();

		debug("Printed the raaplijst.", { title });

		return { title };
	} finally {
		// After the dialog has been dealt with. `print()` blocks until then in
		// every browser this runs on, but the frame is removed on a turn of its
		// own so a browser that does not block cannot have the document pulled
		// out from under its preview.
		setTimeout(() => frame.remove(), 1000);
	}
}

function write(frame: HTMLIFrameElement, reportHtml: string): Promise<Window> {
	return new Promise((resolve, reject) => {
		const inner = frame.contentWindow;
		const document = frame.contentDocument;

		if (!inner || !document) {
			reject(new Error("The print frame has no document."));

			return;
		}

		// The images the report renders -- the barcode above all -- are served
		// from the ERP against relative addresses, and this frame's own address
		// is the portal's.
		document.open();
		document.write(reportHtml.replace(/<head(\s[^>]*)?>/i, `$&<base href="${ERP_URL}/">`));
		document.close();

		// Printed after the images have loaded, or the barcode is a gap on the
		// sheet. `load` on the frame's own window is what waits for them; the
		// timeout is so a picture that never arrives costs a barcode rather than
		// the whole print.
		if (document.readyState == "complete") {
			resolve(inner);

			return;
		}

		const done = () => resolve(inner);

		inner.addEventListener("load", done, { once: true });
		setTimeout(done, 3000);
	});
}
