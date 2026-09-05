import { MAIN_CONTENT_SELECTOR } from "./constants.ts";

// Takes the portal's version of a page off the screen around a block of ours.
//
// The pages we stand in for are appended to the end of the cell the portal lays
// its page out in, so hiding the one block ours replaces is not enough: the
// reservation sidebar, the rows around it and whatever else the portal put in
// that cell stay where they are, and our card is pushed to the bottom of a
// screen that still shows the page it was meant to replace. That is what the
// completed screen looked like -- the old sidebar above, our card far below it.
//
// So everything in the cell except our own block is hidden, by walking from our
// block up to the cell and hiding each level's other children. Nothing is
// removed -- `pse-portal-replaced` is `display: none`, and the portal's hidden
// inputs and its own buttons are still read and clicked through it.
//
// Answers the undo, because a page of ours that cannot find the control it
// drives has to be able to put the vendor's screen back.
export function standInForPortalPage(block: Element): () => void {
	const main = block.closest(MAIN_CONTENT_SELECTOR);

	if (!main) {
		return () => {};
	}

	const hidden: Element[] = [];

	for (let node: Element = block; node != main && node.parentElement; node = node.parentElement) {
		for (const sibling of node.parentElement.children) {
			if (sibling == node || sibling.classList.contains("pse-portal-replaced")) {
				continue;
			}

			sibling.classList.add("pse-portal-replaced");
			hidden.push(sibling);
		}
	}

	return () => {
		for (const element of hidden) {
			element.classList.remove("pse-portal-replaced");
		}
	};
}
