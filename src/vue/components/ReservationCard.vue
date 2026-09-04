<script setup lang="ts">
import { ModalReservationDetails } from "../../interfaces.ts";
import { isAmountStringComplete, matchShopwareOrderNumber } from "../../retailVistaUtils.ts";
import ShopwareNote from "./ShopwareNote.vue";

// One reservation in the picker, for the two groups that have something to look
// at: the ones that hold several of the scanned product, and the ones that hold
// it but are not ready to be packed.
//
// The card is the same for both. What separates them is the answer to one
// question -- can this be opened -- and the card says so in the only two ways
// worth spending: the group's heading above it, and the highlighting on the rows
// that are short. An invalid reservation is not a broken one, it is one whose
// picking is not finished, so it is shown in full and simply not offered.
//
// The singleline group does not use this. Those have nothing under the header
// worth drawing a card around; see `ReservationRow.vue`.
const props = defineProps<{
	reservation: ModalReservationDetails;
	showProducts?: boolean;
	showOpenButton?: boolean;
	highlightIncomplete?: boolean;
	// Singleline reservations never show a note: their order data is not
	// fetched.
	showNote?: boolean;
	noteEnabled?: boolean;
}>();

defineEmits<{
	open: [url: string];
	saveNote: [];
}>();

function hasShopwareNote() {
	return matchShopwareOrderNumber(props.reservation.saleOrderReference);
}

// A row is short when the amount picked does not match what was asked for. Only
// marked where that is the point of the group -- on a reservation that is ready
// to pack, every row is complete and marking them all would say nothing.
function isShort(amount: string) {
	return props.highlightIncomplete && !isAmountStringComplete(amount);
}
</script>

<template>
	<article class="pse-rescard" :class="{ 'is-incomplete': highlightIncomplete }">
		<header class="pse-rescard-head">
			<div class="pse-rescard-id">
				<span class="pse-rescard-number">{{ reservation.reservationNumber }}</span>
				<span class="pse-rescard-reference">{{ reservation.saleOrderReference }}</span>
			</div>

			<!-- The three things that decide whether this is the reservation
			     being looked for, each labelled, because the values themselves
			     ("Gereed", "Geraapt") do not say which field they came from. -->
			<dl class="pse-rescard-facts">
				<div class="pse-rescard-fact">
					<dt>Klant</dt>
					<dd>{{ reservation.customer }}</dd>
				</div>

				<div class="pse-rescard-fact">
					<dt>Status</dt>
					<dd>{{ reservation.status }}</dd>
				</div>

				<div class="pse-rescard-fact">
					<dt>Logistiek</dt>
					<dd>{{ reservation.deliveryStatus }}</dd>
				</div>
			</dl>

			<Transition>
				<button v-if="showOpenButton" type="button" class="pse-rescard-open"
					@click="$emit('open', reservation.url)">
					Open
					<span class="material-icons pse-rescard-open-icon" aria-hidden="true">chevron_right</span>
				</button>
			</Transition>
		</header>

		<div class="pse-rescard-products" v-if="showProducts">
			<table class="pse-table">
				<thead>
					<tr>
						<th>Artikel nr</th>
						<th>Omschrijving</th>
						<th>Hoofd barcode</th>
						<th class="pse-table-right">Geraapt</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(product, index) in reservation.products" :key="index">
						<td class="pse-cell-barcode">{{ product.number }}</td>
						<td class="pse-cell-description">{{ product.description }}</td>
						<td class="pse-cell-barcode">{{ product.barcode }}</td>
						<td class="pse-table-right">
							<span class="pse-rescard-amount" :class="{ 'is-short': isShort(product.amount) }">
								{{ product.amount }}
							</span>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<div class="pse-rescard-note" v-if="showNote && hasShopwareNote()">
			<ShopwareNote :order-data="reservation.swOrderData" :enabled="!!noteEnabled"
				@save="$emit('saveNote')" />
		</div>
	</article>
</template>

<style scoped>
.pse-rescard {
	overflow: hidden;
	border: 1px solid var(--pse-line);
	border-radius: 16px;
	background-color: #ffffff;
	transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.pse-rescard + .pse-rescard {
	margin-top: 10px;
}

/* Only the ones that can be acted on lift under the cursor. A card that cannot
   be opened responding to the pointer is an offer that is not there. */
.pse-rescard:not(.is-incomplete):hover {
	border-color: var(--pse-brand);
	box-shadow: 0 1px 2px rgba(20, 48, 33, 0.04), 0 14px 30px -24px rgba(20, 48, 33, 0.5);
}

.pse-rescard-head {
	display: flex;
	align-items: center;
	gap: 20px;
	padding: 13px 16px;
	background-color: var(--pse-well);
	border-bottom: 1px solid var(--pse-line);
}

/* The reservation number is the handle on the whole card, so it is the biggest
   thing on it and the reference sits under it as the same order's other name. */
.pse-rescard-id {
	flex: none;
	min-width: 108px;
}

.pse-rescard-number {
	display: block;
	font-size: 17px;
	font-weight: 700;
	font-variant-numeric: tabular-nums;
	line-height: 1.2;
	color: var(--pse-ink);
}

.pse-rescard-reference {
	display: block;
	margin-top: 1px;
	font-size: 12px;
	font-variant-numeric: tabular-nums;
	color: var(--pse-ink-soft);
}

.pse-rescard-facts {
	display: flex;
	gap: 26px;
	flex: 1;
	min-width: 0;
	margin: 0;
}

.pse-rescard-fact {
	min-width: 0;
}

.pse-rescard-fact dt {
	margin: 0;
	font-size: 10.5px;
	font-weight: 650;
	letter-spacing: 0.06em;
	text-transform: uppercase;
	color: var(--pse-ink-faint);
}

.pse-rescard-fact dd {
	margin: 2px 0 0;
	overflow: hidden;
	font-size: 13.5px;
	font-weight: 600;
	white-space: nowrap;
	text-overflow: ellipsis;
	color: var(--pse-ink);
}

/* The one thing on the card that does something, so unlike the row's quiet Open
   this one is filled: the card is a block of reference with a single way out of
   it, and that way out should not have to be looked for. */
.pse-rescard-open {
	display: inline-flex;
	align-items: center;
	gap: 2px;
	flex: none;
	height: 36px;
	padding: 0 10px 0 15px;
	border: 0;
	border-radius: 10px;
	background-color: var(--pse-brand-ink);
	font: inherit;
	font-size: 13.5px;
	font-weight: 650;
	color: #ffffff;
	cursor: pointer;
	transition: background-color 0.15s ease;
}

.pse-rescard-open:hover {
	background-color: var(--pse-brand-ink-strong);
}

.pse-rescard-open:focus {
	outline: none;
}

.pse-rescard-open:focus-visible {
	outline: none;
	box-shadow: 0 0 0 3px var(--pse-brand-ring);
}

.pse-rescard-open-icon {
	font-size: 18px;
}

/* The table is the shared one from `src/style.css`; the card is already a
   surface with a border and a radius, so it goes in bare rather than in the
   `.pse-products-card` the pages wrap it in. */
.pse-rescard-products {
	overflow-x: auto;
}

.pse-rescard-amount {
	display: inline-block;
	padding: 2px 9px;
	border-radius: 8px;
	font-size: 13px;
	font-weight: 600;
	font-variant-numeric: tabular-nums;
	white-space: nowrap;
}

/* Why this reservation is in the group it is in. Amber and not red: nothing has
   gone wrong, the picking is simply not finished -- the same distinction, and
   the same colour, the parcels page draws for a count that is part way there. */
.pse-rescard-amount.is-short {
	background-color: rgba(226, 160, 46, 0.18);
	color: #8a5a10;
}

.pse-rescard-note {
	padding: 14px 16px;
	border-top: 1px solid var(--pse-line);
}

/* The facts are the first thing that stops fitting beside the number and the
   button, and they are three short values -- so they wrap under rather than
   being cut down to nothing. */
@media (max-width: 720px) {
	.pse-rescard-head {
		flex-wrap: wrap;
		gap: 12px 20px;
	}

	.pse-rescard-facts {
		order: 1;
		flex-basis: 100%;
		gap: 18px;
	}

	.pse-rescard-open {
		margin-left: auto;
	}
}
</style>
