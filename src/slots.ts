// The packing rack beside the counter, and the one string in the Shopware order
// that says where a multi-line order's items are parked.
//
// A multi-line order is not packed in one go: the items arrive from the picking
// floor separately, and what is already here waits in a bay of the rack until
// the rest turns up. Which bay that is was written on a slip of paper, which is
// only ever as good as the slip -- so it is written on the order instead, where
// the next packer, and the next workstation, reads it back.
//
// Nothing here touches the DOM or Shopware. The rack is a shape, the marker is a
// string, and both are used from `src/vue/slotStore.ts`.

// ---- The rack ----
//
// Four columns left to right. A and C are three tall bays side by side; B and D
// are the same width and height but hold two rows of three, numbered across the
// top and then across the bottom. The letters are the columns as they are
// painted on the rack itself, which is why they are written out here rather than
// generated -- this is a map of a thing in the building, and it has to match it.
export interface RackColumn {
	letter: string;
	// One entry per row of bays, each holding that row's bay numbers left to
	// right. A single row means the bays are full height.
	rows: number[][];
}

export const RACK: RackColumn[] = [
	{ letter: "A", rows: [[1, 2, 3]] },
	{ letter: "B", rows: [[1, 2, 3], [4, 5, 6]] },
	{ letter: "C", rows: [[1, 2, 3]] },
	{ letter: "D", rows: [[1, 2, 3], [4, 5, 6]] },
];

export const ALL_SLOTS: string[] = RACK.flatMap((column) =>
	column.rows.flatMap((row) => row.map((bay) => `${column.letter}${bay}`))
);

export function isSlot(value: string): boolean {
	return ALL_SLOTS.includes(value.trim().toUpperCase());
}

// ---- What an order's slots are ----
//
// Both shapes at once, because both are in use: the setting decides whether a
// packer picks one bay for the whole order or one per product line, and an order
// can have been written either way -- by the other setting, or by the other
// workstation. So both are read whatever the setting says, and only what is
// shown and written is decided by it.
export interface SlotAssignment {
	// The bay the whole order waits in. Empty when the order is parked per line.
	order: string;
	// Bay per product, keyed by the main barcode -- which is what the parcels
	// page has on every row and what a packer can scan back.
	lines: Record<string, string>;
}

export function emptyAssignment(): SlotAssignment {
	return { order: "", lines: {} };
}

export function hasAnySlot(assignment: SlotAssignment): boolean {
	return Boolean(assignment.order) || Object.keys(assignment.lines).length > 0;
}

// ---- The marker ----
//
// The note field is the customer's, and it is read by more than this screen --
// customer service answers on it, and the shipping desk reads it before the
// parcel goes out. So our data is not mixed into their sentences: it is one
// bracketed block, on its own line, at the very end, and the note box on screen
// never shows it. Someone reading the order in Shopware sees their own note and
// then one line they can tell at a glance is machinery.
//
// The wording is ours and unlikely to be typed by accident, which is the whole
// requirement: a marker that could occur in a customer's Dutch sentence would
// eat part of their note the first time it did.
const MARKER_OPEN = "[PSE-VAK]";
const MARKER_CLOSE = "[/PSE-VAK]";

// Every block, not just the first, and case-insensitively: two workstations that
// both wrote one is exactly the case where the note must not end up with a
// leftover half. They are all taken out, and the one that is written back is
// composed from what was read.
const MARKER_PATTERN = /\[PSE-VAK\][\s\S]*?\[\/PSE-VAK\]/gi;

export interface ParsedComment {
	// The note as it should be shown and edited: the customer's text, with our
	// block and the whitespace that held it taken out.
	text: string;
	slots: SlotAssignment;
}

export function parseComment(comment: string | null | undefined): ParsedComment {
	const full = comment ?? "";
	const slots = emptyAssignment();

	for (const block of full.match(MARKER_PATTERN) ?? []) {
		readBody(block.slice(MARKER_OPEN.length, block.length - MARKER_CLOSE.length), slots);
	}

	return { text: stripMarkers(full), slots };
}

// The customer's text on its own. Trailing whitespace goes with the block, so a
// note that had a slot written on it and then cleared is the note it was before
// rather than the note plus two blank lines.
export function stripMarkers(comment: string | null | undefined): string {
	return (comment ?? "").replace(MARKER_PATTERN, "").replace(/[ \t]+$/gm, "").trimEnd();
}

// The note as it should be saved: the text the packer edited, with the order's
// slots appended. The only writer -- everything that changes a slot changes the
// assignment and then comes through here, so there is one place that decides
// what the field looks like.
export function composeComment(text: string, slots: SlotAssignment): string {
	const body = writeBody(slots);
	const note = stripMarkers(text);

	if (!body) {
		return note;
	}

	// A blank line between, so the block is plainly not part of the sentence
	// above it -- and no leading blank lines on an order that has no note at all.
	return note ? `${note}\n\n${MARKER_OPEN} ${body} ${MARKER_CLOSE}` : `${MARKER_OPEN} ${body} ${MARKER_CLOSE}`;
}

// `A2; 8712345678901=B4` -- the order's own bay first, bare, then one entry per
// product line. Short enough to read off the order without decoding it, which is
// the point of putting it in a field other departments look at.
function writeBody(slots: SlotAssignment): string {
	const parts: string[] = [];

	if (slots.order) {
		parts.push(slots.order);
	}

	for (const [barcode, slot] of Object.entries(slots.lines)) {
		if (slot) {
			parts.push(`${barcode}=${slot}`);
		}
	}

	return parts.join("; ");
}

// Read back leniently: separated by semicolons, commas or newlines, in any case,
// with any spacing. This has been through a text field that people edit, and a
// bay that is written down is worth more than a strict format.
//
// Anything that is not a bay on the rack is dropped. A token we cannot place is
// not something to show a packer as a location.
function readBody(body: string, into: SlotAssignment) {
	for (const token of body.split(/[;,\n\r]+/)) {
		const entry = token.trim();

		if (!entry) {
			continue;
		}

		const separator = entry.indexOf("=");

		if (separator < 0) {
			if (isSlot(entry)) {
				into.order = entry.toUpperCase();
			}

			continue;
		}

		const barcode = entry.slice(0, separator).trim();
		const slot = entry.slice(separator + 1).trim().toUpperCase();

		if (barcode && isSlot(slot)) {
			into.lines[barcode] = slot;
		}
	}
}
