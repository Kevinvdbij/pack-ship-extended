import { computed, ref } from "vue";
import Settings from "../settings.ts";
import { SETTINGS_SAVED_EVENT } from "../constants.ts";

// Whether a bay is picked for the whole order or one per product line. A setting
// because the two ways of working are both real: one bay for the order is what
// the floor does when an order is parked whole, and per line is for the orders
// whose items come in far enough apart to be shelved separately.
//
// One question for the whole workplace rather than per reservation, which is why
// it is here and not on a slot handle: every screen that offers a bay -- the
// sidebar, the product table, the cards in the selection dialog -- asks it, and
// they are separate Vue apps on one document.
//
// Read through a computed rather than copied into a ref, and that is not a style
// choice: this module is evaluated with every other import, which is before
// `main.ts` calls `Settings.load()`. A value taken at import time is the default
// whatever the workplace has configured -- so it is read when something first
// asks for it, by which time the store has been loaded.
//
// The counter is what re-reads it. The settings dialog lives in the footer's
// mount, which is a mount of its own, so the change arrives as an event on the
// document; bumping the counter is what tells the computed its answer is stale.
const settingsVersion = ref(0);

export const slotScope = computed<"order" | "line">(() => {
	settingsVersion.value;

	return Settings.slotScope;
});

// Whether a bay that does not exist yet may be set from a per-line control.
//
// Only while this workplace picks bays per line: on a workplace set to one bay
// per order a line control is being shown because somebody else parked this
// order that way, and what it is there for is reading and correcting their bays
// -- not quietly starting to park the rest of the order by a rule this screen is
// not set to.
export const canAssignLines = computed(() => slotScope.value == "line");

document.addEventListener(SETTINGS_SAVED_EVENT, () => {
	Settings.load();
	settingsVersion.value++;
});
