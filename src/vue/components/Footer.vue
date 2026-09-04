<script setup lang="ts">
import { computed, ref, Teleport, Transition } from 'vue';
import Modal from "../components/SettingsModal.vue";
import CredentialsPrompt from "../components/CredentialsPrompt.vue";
import pkg from "../../../package.json";
import powerIconUrl from "../../assets/power.svg";
import settingsIconUrl from "../../assets/settings.svg";
import Settings from '../../settings.ts';
import { getCurrentUser, onCurrentUserChange } from '../../currentUser.ts';
import { FOOTER_SLOT_SELECTOR } from '../../constants.ts';
import { hasCredentials } from '../../shopware.ts';

// The same bar in two shapes. The full one is the control strip on the pages
// behind the login; `minimal` drops everything that needs a session -- the
// automatic-handling switch, who is signed in, the settings the two of them are
// configured from -- and leaves the build number, which is the part that is
// worth having on any page at all.
//
// One component rather than two, because the shape is the point: whatever the
// bar carries, it is recognisably the same bar in the same place.
const props = withDefaults(defineProps<{
	minimal?: boolean;
	// Where the bar mounts. The login page builds its own slot and passes the
	// element, since the portal serves no footer of the shape below there.
	to?: string | HTMLElement;
}>(), {
	minimal: false,
	to: FOOTER_SLOT_SELECTOR,
});

const showModal = ref(false);

const masterSwitch = ref(Settings.autoMasterSwitch);

// Without client credentials every Shopware call fails, so an empty store is
// asked about up front rather than left to surface as a failed order lookup.
// "Later" only holds for this page: the next load asks again, which is the
// point -- the script cannot do its work until the pair is there.
//
// Not asked on the minimal bar: there is no session to do the work the
// credentials are for, and a dialog over the login form would be the first
// thing somebody meets on a page they came to sign in on.
const showCredentialsPrompt = ref(!props.minimal && !hasCredentials());

// Undefined when no login has been observed, in which case the badge stays
// hidden rather than guessing.
const currentUser = ref(getCurrentUser());
onCurrentUserChange((user) => currentUser.value = user);

// The toggle is the one control here whose state has to be readable at a
// glance, so it carries a word as well as a colour -- the colour on its own is
// a guess for anyone who has not learned which one means "on".
const masterSwitchLabel = computed(() => masterSwitch.value ? "Automatisch" : "Handmatig");

const masterSwitchTitle = computed(() => masterSwitch.value
	? "Automatische afhandeling staat aan — klik om uit te zetten"
	: "Automatische afhandeling staat uit — klik om aan te zetten");

const loginTitle = computed(() => currentUser.value
	? `Ingelogd sinds ${new Date(currentUser.value.loggedInAt).toLocaleString('nl-NL')}`
	: undefined);

// Picked up again after the modal saves, which may have flipped it.
function syncMasterSwitch() {
	masterSwitch.value = Settings.autoMasterSwitch;

	// The settings modal holds the same two fields, so filling them in there
	// settles the prompt as well.
	showCredentialsPrompt.value = !hasCredentials();
}

// Not entirely happy with this but works.
function masterSwitchToggle() {
	Settings.autoMasterSwitch = !Settings.autoMasterSwitch;
	Settings.save();

	masterSwitch.value = Settings.autoMasterSwitch;
}
</script>

<template>
	<!-- Everything here reads from the GM value store, so it renders complete on
	     the first try, and it is mounted as soon as the footer slot is parsed
	     rather than at DOM-ready.

	     One wrapper element, styled entirely by this component: the portal's own
	     Bootstrap classes are deliberately not borrowed, so the bar keeps its
	     shape whatever the portal decides `.col` and `.btn-link` should look
	     like around it. -->
	<Teleport :to="to">
		<div class="pse-bar" :class="{ 'is-minimal': minimal }">
			<button v-if="!minimal" type="button" class="pse-pill pse-toggle" :class="masterSwitch ? 'is-on' : 'is-off'"
				:aria-pressed="masterSwitch" :title="masterSwitchTitle" @click="masterSwitchToggle()">
				<img class="pse-icon" :src="powerIconUrl" alt="" />
				<span class="pse-toggle-label">{{ masterSwitchLabel }}</span>
			</button>

			<span v-if="!minimal" class="pse-divider" aria-hidden="true"></span>

			<!-- Identity in the middle: who is logged in, and which build of
			     ours is doing the work. Both read-only, so they sit between the
			     two controls rather than competing with them for the ends. -->
			<span v-if="currentUser && !minimal" class="pse-user" :title="loginTitle">
				<span class="pse-dot" aria-hidden="true"></span>
				<span class="pse-user-name">{{ currentUser.userName }}</span>
			</span>

			<span class="pse-version" title="Pack&Ship Extended">
				<span class="pse-brand">P&amp;S Extended</span>
				<span class="pse-version-number">v{{ pkg.version }}</span>
			</span>

			<span v-if="!minimal" class="pse-divider" aria-hidden="true"></span>

			<button v-if="!minimal" type="button" class="pse-pill pse-settings"
				title="Pack&Ship Extended instellingen" @click="showModal = true;">
				<img class="pse-icon" :src="settingsIconUrl" alt="" />
				<span class="pse-settings-label">Instellingen</span>
			</button>
		</div>
	</Teleport>

	<!-- Both of these are opened from controls the minimal bar does not carry,
	     so with those gone there is nothing left to render here either. -->
	<Teleport v-if="!minimal" to="body">
		<!-- Named, so the modal fades instead of taking the default vertical
		     collapse that suits the small footer items. -->
		<Transition name="modal">
			<Modal v-if="showModal" @close="showModal = false" @save="syncMasterSwitch()" />
		</Transition>

		<Transition name="modal">
			<CredentialsPrompt v-if="showCredentialsPrompt && !showModal"
				@saved="showCredentialsPrompt = false" @dismiss="showCredentialsPrompt = false" />
		</Transition>
	</Teleport>
</template>

<style scoped>
/* The portal's footer is a dark green band, so every colour here is drawn from
   white at varying strength rather than from a palette of its own: it reads as
   part of the band instead of as a panel dropped onto it, and it survives the
   band's exact green changing. The two accents are the only exceptions, because
   on/off has to be a colour and not a shade.

   The bar shares its row with the environment label on the right, so it is
   inline-flex and sized by its contents -- it takes the room it needs and
   nothing beside it moves. */
.pse-bar {
	--pse-on: #a8dcab;
	--pse-off: #f5bd74;
	--pse-ink: rgba(255, 255, 255, 0.72);
	--pse-ink-strong: #ffffff;
	--pse-ink-soft: rgba(255, 255, 255, 0.45);
	--pse-well: rgba(255, 255, 255, 0.08);

	display: inline-flex;
	align-items: center;
	gap: 2px;
	padding: 2px;
	/* The pill wants to be thicker than the footer's line of text, and the band
	   is as tall as its tallest cell -- so the bar is pulled back in by exactly
	   what it stands proud, and contributes the height of a line of text like
	   everything else in the row. It then paints into the band's own padding
	   instead of pushing it open: full-size control, unchanged footer. */
	margin-top: -5px;
	margin-bottom: -5px;
	border-radius: 999px;
	/* One capsule around the lot, so the four items read as a single control
	   strip rather than as loose footer text that happens to be adjacent. */
	background-color: var(--pse-well);
	/* The portal's footer sets its own family; inheriting it keeps the bar from
	   reading as a foreign widget bolted onto the page. */
	font-family: inherit;
	font-size: 12.5px;
	line-height: 1;
	color: var(--pse-ink);
	white-space: nowrap;
	vertical-align: middle;
}

/* With only the build number left there is no strip of controls to draw a
   capsule around, and one drawn around a single line of muted text reads as a
   button that cannot be pressed. The pull-in goes with it: nothing here stands
   proud of a line of text any more, so there is no surplus height to hide. */
.pse-bar.is-minimal {
	margin: 0;
	padding: 0;
	background-color: transparent;
}

/* The portal's own footer rules reach everything inside this cell, and Bootstrap
   sizes buttons by padding on top of whatever box model is in force. Both are
   settled here rather than fought item by item further down. */
.pse-bar,
.pse-bar * {
	box-sizing: border-box;
	line-height: 1;
}

/* Both controls are the same pill -- shape here, colour on each below. */
.pse-pill {
	display: inline-flex;
	align-items: center;
	gap: 7px;
	margin: 0;
	padding: 5px 11px;
	border: 0;
	border-radius: 999px;
	background-color: transparent;
	font: inherit;
	font-weight: 600;
	color: inherit;
	cursor: pointer;
	transition: background-color 0.15s ease, color 0.15s ease;
}

/* Sized for the longer of the two words, so flipping the switch changes the
   colour and the label and nothing else. A pill that grows and shrinks under
   the cursor drags everything to the right of it along with it, which reads as
   the footer twitching rather than as a control responding. */
.pse-toggle-label {
	display: inline-block;
	min-width: 74px;
	text-align: left;
}

/* Bootstrap gives every button in the portal a focus ring and a shadow on
   click; neither suits a bar this small, so both are dropped and the ring is
   put back for keyboard use only. */
.pse-pill:focus,
.pse-pill:active {
	outline: none;
	box-shadow: none;
}

.pse-pill:focus-visible {
	outline: 2px solid currentColor;
	outline-offset: 2px;
}

.pse-icon {
	width: 15px;
	height: 15px;
	flex: none;
}

/* Both icons ship black, so every colour they take is a filter over the one
   source rather than a second file. Each starts from `brightness(0)` to
   normalise the source before the hue is dialled in. */
.pse-toggle.is-on {
	color: var(--pse-on);
	background-color: rgba(168, 220, 171, 0.16);
}

.pse-toggle.is-on:hover {
	background-color: rgba(168, 220, 171, 0.28);
}

.pse-toggle.is-on .pse-icon {
	filter: brightness(0) invert(88%) sepia(19%) saturate(505%) hue-rotate(72deg) brightness(97%) contrast(90%);
}

.pse-toggle.is-off {
	color: var(--pse-off);
	background-color: rgba(245, 189, 116, 0.16);
}

.pse-toggle.is-off:hover {
	background-color: rgba(245, 189, 116, 0.28);
}

.pse-toggle.is-off .pse-icon {
	filter: brightness(0) invert(84%) sepia(29%) saturate(958%) hue-rotate(324deg) brightness(101%) contrast(92%);
}

.pse-settings {
	color: var(--pse-ink);
}

.pse-settings:hover {
	color: var(--pse-ink-strong);
	background-color: rgba(255, 255, 255, 0.14);
}

.pse-settings .pse-icon {
	filter: brightness(0) invert(1);
	opacity: 0.72;
	transition: transform 0.3s ease, opacity 0.15s ease;
}

.pse-settings:hover .pse-icon {
	opacity: 1;
	transform: rotate(60deg);
}

.pse-divider {
	width: 1px;
	height: 15px;
	margin: 0 4px;
	background-color: currentColor;
	opacity: 0.18;
}

/* The read-only middle, on the same line as everything else: the footer band is
   as tall as its tallest cell, so a second line here costs height across the
   whole width of the page. */
.pse-user {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 0 6px;
}

.pse-user-name {
	font-weight: 600;
	color: var(--pse-ink-strong);
}

/* A live session, shown the way a status light is rather than spelled out --
   the same green the toggle uses for "on", so one colour means one thing. */
.pse-dot {
	width: 6px;
	height: 6px;
	flex: none;
	border-radius: 50%;
	background-color: var(--pse-on);
	box-shadow: 0 0 0 3px rgba(168, 220, 171, 0.2);
}

.pse-version {
	display: inline-flex;
	align-items: baseline;
	gap: 5px;
	padding: 0 6px;
	color: var(--pse-ink-soft);
	font-size: 10.5px;
	letter-spacing: 0.04em;
	text-transform: uppercase;
}

/* The padding is what holds the version off the pills beside it; on its own it
   is the start of the row and lines up with the band's own edge instead. */
.pse-bar.is-minimal .pse-version {
	padding-left: 0;
}

.pse-version-number {
	font-variant-numeric: tabular-nums;
	letter-spacing: 0.02em;
}

/* Narrow enough and the footer row runs out of width before anything else
   does. What goes first is whatever only repeats something already on screen:
   the product name (the bar is the only thing of ours in the footer) and the
   settings label (its gear is unambiguous). The toggle keeps its word, because
   its icon is the same in both states. */
@media (max-width: 991px) {
	/* Only while the bar is a strip of controls. On the minimal one the name is
	   what says whose version number this is, and dropping it would leave a
	   number on the band with nothing to attach it to. */
	.pse-bar:not(.is-minimal) .pse-brand {
		display: none;
	}

	/* The pull-in only earns its keep while the band is one line tall and the
	   bar is what would make it taller. Once the cells stack, the surplus it
	   hides is surplus the row above and below actually needs, and the bar
	   crowds them instead. */
	.pse-bar {
		margin-top: 0;
		margin-bottom: 0;
	}
}

@media (max-width: 767px) {
	.pse-settings-label {
		display: none;
	}
}
</style>
