<script setup lang="ts">
import { computed } from "vue";
import ShopwareLogoIconUrl from "../../assets/shopware.svg";
import { ShopwareOrderEntry } from "../../shopware.ts";

// The customer's note on the webshop order, shown wherever a reservation is.
// One component for both places it appears -- the reservation sidebar and every
// card in the selection modal -- so the box holding a note the packer has to act
// on looks the same whichever screen it is read on.
//
// Presentational only. The order data is fetched, and the save carried out, by
// whoever renders this: the sidebar owns one order, the modal owns one per card,
// and both already hold a Shopware token for their own reasons.
const props = defineProps<{
	// Undefined until the order comes back. The box renders in place at its
	// resting height while it is, rather than appearing once the request lands
	// and pushing everything under it down.
	orderData?: ShopwareOrderEntry;
	enabled: boolean;
	// The sidebar's copy links through to the order in Shopware's admin. The
	// modal's copies do not: there is one per reservation there, and a row of
	// buttons that each open a different tab is not a choice worth offering
	// while picking between reservations.
	showOpen?: boolean;
	// Likewise the banner. In the sidebar the note sits beside a reservation
	// that is already being packed, so an unread one has to interrupt; in the
	// modal the cards are being compared and a banner on each is noise.
	showAlert?: boolean;
}>();

defineEmits<{ save: []; open: [] }>();

// Whitespace is not a note. The field is edited elsewhere in Shopware too, so
// an order can come back holding nothing but a stray newline.
const hasNote = computed(() => Boolean(props.orderData?.customerComment?.trim()));

// The controls are dead until there is an order to act on, whatever the caller
// says about a save being in flight.
const ready = computed(() => props.enabled && Boolean(props.orderData));
</script>

<template>
	<section class="pse-note">
		<!-- The one thing on this card allowed to raise its voice: a note the
		     customer left is an instruction about the parcel being packed, and it
		     is missed if it looks like the rest of the sidebar. -->
		<Transition>
			<p v-if="showAlert && hasNote" class="pse-note-alert">
				<span class="material-icons pse-note-alert-icon" aria-hidden="true">error_outline</span>
				Let op — er is een notitie bij deze order.
			</p>
		</Transition>

		<div class="pse-note-card">
			<header class="pse-note-head">
				<img class="pse-note-logo" :src="ShopwareLogoIconUrl" alt="" />
				<h3 class="pse-note-title">Shopware notitie</h3>
			</header>

			<div class="pse-note-body">
				<!-- Same box either way, so the order arriving does not resize the
				     card. Disabled and empty while it is still on its way. -->
				<textarea v-if="orderData" class="pse-note-field" v-model="orderData.customerComment"
					:disabled="!ready" :placeholder="ready ? 'Nog geen notitie...' : ''"></textarea>
				<div v-else class="pse-note-field pse-note-field-waiting" aria-hidden="true">
					<span class="pse-note-shimmer"></span>
					<span class="pse-note-shimmer pse-note-shimmer-short"></span>
				</div>

				<div class="pse-note-actions">
					<button v-if="showOpen" type="button" class="pse-note-btn pse-note-btn-quiet" :disabled="!ready"
						@click="$emit('open')">
						Open in Shopware
					</button>
					<button type="button" class="pse-note-btn" :disabled="!ready" @click="$emit('save')">
						Opslaan
					</button>
				</div>
			</div>
		</div>
	</section>
</template>

<style scoped>
.pse-note {
	/* The portal wraps every page in `.container-fluid.text-center`, which
	   reaches in here. */
	text-align: left;
}

/* ---- The banner ---- *
 * Amber rather than red: a note is something to read before packing, not an
 * error, and the parcels page already spends red on a product that has not been
 * collected. The old version blinked at 0.75s, which is fast enough to make the
 * sentence hard to read through -- this breathes instead, so the movement
 * catches the eye while the text stays still enough to actually be read.
 */
.pse-note-alert {
	display: flex;
	align-items: flex-start;
	gap: 9px;
	margin: 0 0 12px;
	padding: 11px 13px;
	border: 1px solid rgba(180, 118, 20, 0.32);
	border-left-width: 3px;
	border-radius: 12px;
	background-color: rgba(226, 160, 46, 0.11);
	font-size: 13px;
	font-weight: 600;
	line-height: 1.4;
	color: #8a5a10;
	animation: pse-note-breathe 2.4s ease-in-out infinite;
}

.pse-note-alert-icon {
	flex: none;
	font-size: 18px;
	line-height: 1.2;
}

@keyframes pse-note-breathe {
	50% {
		border-color: rgba(180, 118, 20, 0.75);
		background-color: rgba(226, 160, 46, 0.24);
	}
}

/* ---- The card ---- *
 * The same surface as every other card in the extension: white, a hairline
 * border, the card radius, and a tinted strip for the header.
 *
 * It used to wear Shopware's own navy and blue, on the reasoning that a note
 * from another system should look like it came from one. On the rebuilt pages
 * that reads as a leftover instead -- it is the only dark block in a column of
 * light cards, and it makes the note look like an embedded widget rather than
 * one of the reservation's own fields. The logo says where the note comes from
 * well enough on its own.
 */
.pse-note-card {
	overflow: hidden;
	border: 1px solid var(--pse-line);
	border-radius: 14px;
	background-color: #ffffff;
	box-shadow: 0 1px 2px rgba(20, 48, 33, 0.04);
}

.pse-note-head {
	display: flex;
	align-items: center;
	gap: 9px;
	padding: 10px 14px;
	border-bottom: 1px solid var(--pse-line);
	background-color: var(--pse-well);
}

/* Desaturated to sit with the label beside it. In Shopware's own blue on the
   old navy strip the mark carried the header; against a light tint it is the
   only saturated thing in the sidebar, so it pulled the eye to a caption rather
   than to the note underneath. Greyed, it does the job it is actually there for
   -- saying which system this came from -- without asking to be looked at.

   A filter rather than a second copy of the file: it is the vendor's mark, and
   we should not be shipping a recoloured edit of it. */
.pse-note-logo {
	flex: none;
	width: 18px;
	height: 18px;
	/* Desaturated and darkened to roughly `--pse-ink-soft`, the weight the text
	   beside it carries. Fading it instead of darkening it -- which is what
	   `opacity` did -- only moved it towards the card, and a mark you have to
	   look for is not doing the one job it is here for. */
	filter: grayscale(1) brightness(0.72);
}

/* Set like the column headings on the product table rather than like a title:
   the card underneath is what is being read, and this only says what it is. */
.pse-note-title {
	margin: 0;
	font-size: 10.5px;
	font-weight: 650;
	letter-spacing: 0.06em;
	text-transform: uppercase;
	line-height: 1.6;
	color: var(--pse-ink-faint);
}

.pse-note-body {
	padding: 12px 14px 14px;
}

/* `field-sizing: content` so the box grows with a long note instead of
   scrolling one line at a time, with a floor that keeps an empty one from
   collapsing to a slot and a ceiling that keeps a very long one from pushing
   the sidebar past the page. */
.pse-note-field {
	box-sizing: border-box;
	display: block;
	width: 100%;
	min-height: 76px;
	max-height: 260px;
	margin: 0;
	padding: 9px 11px;
	border: 1px solid var(--pse-line);
	border-radius: 10px;
	background-color: var(--pse-well);
	field-sizing: content;
	font: inherit;
	font-size: 14px;
	line-height: 1.45;
	color: var(--pse-ink);
	resize: vertical;
	transition: border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
}

.pse-note-field::placeholder {
	color: var(--pse-ink-faint);
}

.pse-note-field:focus {
	outline: none;
	border-color: var(--pse-brand);
	background-color: #ffffff;
	box-shadow: 0 0 0 3px var(--pse-brand-ring);
}

.pse-note-field:disabled {
	color: var(--pse-ink-soft);
	cursor: default;
}

/* The box before the order has arrived: the same geometry with two lines of
   tint in it, so the swap to the real field moves nothing. */
.pse-note-field-waiting {
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 9px;
	resize: none;
}

.pse-note-shimmer {
	height: 10px;
	border-radius: 5px;
	background-color: var(--pse-line);
	animation: pse-note-pulse 1.4s ease-in-out infinite;
}

.pse-note-shimmer-short {
	width: 62%;
	animation-delay: 0.2s;
}

@keyframes pse-note-pulse {
	50% {
		opacity: 0.45;
	}
}

.pse-note-actions {
	display: flex;
	gap: 8px;
	margin-top: 10px;
}

/* The same pair as the product table's actions: the save is filled in the house
   green, and opening the order -- which leaves the packing screen -- is the
   quieter outline beside it. */
.pse-note-btn {
	flex: 1;
	height: 36px;
	min-width: 0;
	padding: 0 12px;
	border: 1px solid transparent;
	border-radius: 10px;
	background-color: var(--pse-brand-ink);
	font: inherit;
	font-size: 13px;
	font-weight: 650;
	color: #ffffff;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	cursor: pointer;
	transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.pse-note-btn:hover:not(:disabled) {
	background-color: var(--pse-brand-ink-strong);
}

.pse-note-btn:focus {
	outline: none;
}

.pse-note-btn:focus-visible {
	outline: none;
	box-shadow: 0 0 0 3px var(--pse-brand-ring);
}

.pse-note-btn:disabled {
	background-color: #dfe6e2;
	color: #ffffff;
	cursor: not-allowed;
}

.pse-note-btn-quiet {
	border-color: var(--pse-line);
	background-color: #ffffff;
	color: var(--pse-ink-soft);
}

.pse-note-btn-quiet:hover:not(:disabled) {
	border-color: var(--pse-brand);
	background-color: var(--pse-brand-soft);
	color: var(--pse-brand-ink);
}

.pse-note-btn-quiet:disabled {
	border-color: var(--pse-line);
	background-color: #ffffff;
	color: var(--pse-ink-faint);
}

@media (prefers-reduced-motion: reduce) {
	.pse-note-alert {
		animation: none;
		border-color: rgba(180, 118, 20, 0.75);
		background-color: rgba(226, 160, 46, 0.24);
	}

	.pse-note-shimmer {
		animation: none;
	}
}
</style>
