// Putting a value on the clipboard, and saying whether it got there.
//
// Shared rather than kept where it started, in the sidebar: every barcode on
// screen is copyable now, and a second copy of this would be a second set of
// answers to the same awkward question -- whether the browser allowed it.
export async function writeToClipboard(value: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(value);

		return true;
	} catch {
		// Refused without a secure context, or while the document is not
		// focused -- which on a portal that opens Shopware in another tab is a
		// real case rather than a theoretical one.
		return copyFallback(value);
	}
}

// The pre-clipboard-API way, for when the above is refused. Reports whether it
// worked: it returns false rather than throwing when the browser will not allow
// it, which is the case the tick must not paper over.
function copyFallback(value: string): boolean {
	const field = document.createElement("textarea");

	field.value = value;
	// Off-screen rather than hidden: a field that is not rendered cannot be
	// selected, and selection is what the old command copies.
	field.style.cssText = "position:fixed;top:-1000px;opacity:0;";

	document.body.append(field);
	field.select();

	let copied = false;

	try {
		copied = document.execCommand("copy");
	} catch (error) {
		console.error("Pack&Ship Extended could not copy to the clipboard.", error);
	}

	field.remove();

	return copied;
}
