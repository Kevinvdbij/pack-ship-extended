import { GM_getValue, GM_setValue } from "$";
import { STORAGE_KEYS } from "./constants.ts";
import { getCurrentUser } from "./currentUser.ts";

// The webshop's packing instructions: the sheet that hangs at the bench, shown
// to whoever signs in and kept behind the footer's help control after that.
//
// Written out here rather than shipped as the PDF it came from. A userscript
// has nowhere to keep a binary, and a page of seven lines is better read as
// seven lines in a dialog of ours than as a document in a viewer. The wording is
// the sheet's own -- when the sheet changes, this is the list to change with it.
export interface Instruction {
	// The question a line answers, where it is put as one.
	title?: string;
	text: string;
}

export const INSTRUCTIONS: Instruction[] = [
	{
		title: "Bestelling nog niet compleet?",
		text: "Vermeld het vak waar je het product in legt in de Shopware notitie en vergeet niet op opslaan te klikken.",
	},
	{
		title: "Geeft het product \"geen resultaat\"?",
		text: "Geef het aan de shiftleader voor controle.",
	},
	{
		text: "Krijg je bij het afhandelen van een order een foutmelding of geen label uit de printer? Vraag de shiftleader om hulp.",
	},
	{
		text: "Verpak steen, glas, breekbare en vloeibare producten altijd in een doos met opvulpapier en/of bubbelplastic.",
	},
	{
		text: "Controleer kleding met de kledingscanner op beveiligingstags.",
	},
	{
		text: "Haal de prijskaartjes van kleding.",
	},
	{
		text: "Je hebt recht op een kwartier en een half uur pauze per dag.",
	},
];

// The reminder on the wait between announcing the parcels and the label coming
// out of the printer -- the one moment the box is still open and the packer has
// nothing to do but look at the screen.
export const FLYER_REMINDER = "Denk om het toevoegen van de \"Bedankt voor je bestelling\" flyer!";

// Whether the sheet is still owed to whoever is signed in.
//
// Once per login, and a login is told apart by the moment it was submitted --
// which `currentUser` already records. So there is nothing to reset on the way
// out: the next sign-in carries a new time and is owed the sheet again, whoever
// it is, and every page after the first sees the time it already answered for.
//
// A session with no login on record -- one that was already there when the
// script was installed -- is owed nothing. There is no telling it from a page
// reload, and a dialog on every page is worse than one that is missed once.
export function instructionsDue(): boolean {
	const loggedInAt = getCurrentUser()?.loggedInAt;

	return loggedInAt !== undefined
		&& GM_getValue<number | undefined>(STORAGE_KEYS.instructionsSeen, undefined) !== loggedInAt;
}

// Recorded when the dialog is closed rather than when it is raised: a page that
// navigates away under it -- a scan that lands while it is open -- has not been
// read, and the next page asks again.
export function markInstructionsSeen() {
	const loggedInAt = getCurrentUser()?.loggedInAt;

	if (loggedInAt !== undefined) {
		GM_setValue(STORAGE_KEYS.instructionsSeen, loggedInAt);
	}
}
