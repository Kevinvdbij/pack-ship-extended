<script setup lang="ts">
import { INSTRUCTIONS } from "../../instructions.ts";
import fanUrl from "../../assets/leaves-fan.svg";
import frondUrl from "../../assets/leaves-frond.svg";
import logoUrl from "../../assets/kampeerhal-roden.svg";
import ModalShell from "./ModalShell.vue";

// The webshop's packing instructions, as a dialog. Raised on its own on the
// first page after signing in and from the footer's help control after that --
// the same dialog both times, so what was read at the start of a shift is what
// is found again in the middle of one.
//
// Drawn as the sheet that hangs at the bench rather than as one of our own
// dialogs: the dark green page, the leaves in its corners, the pale card the
// text sits on. It is the one dialog here that is a thing people already know
// by sight, and recognising it is most of reading it. The leaves are the
// sheet's own artwork -- see `src/assets/leaves-*.svg` -- so the shell is asked
// for its bare panel and everything inside is laid out here.
//
// One thing is not as printed. The sheet carries the logo as a picture with a
// white box around it, hung off the bottom corner of the page where half of it
// is cut away. Here it is the mark itself, whole, at the foot of the card.
//
// Nothing in it takes the cursor. The page behind it has usually just put the
// cursor in a scan field, and a button of ours holding the focus would be
// pressed by the return a scanner sends after every barcode.
defineEmits<{ close: [] }>();
</script>

<template>
	<ModalShell title="Instructies webshop" size="md" bare @close="$emit('close')">
		<div class="pse-sheet">
			<!-- Each decal twice, the second turned half round, which is how the
			     printed sheet fills its four corners from two drawings. -->
			<div class="pse-sheet-leaves" aria-hidden="true">
				<img class="pse-sheet-leaf is-frond is-top" :src="frondUrl" alt="" />
				<img class="pse-sheet-leaf is-fan is-top" :src="fanUrl" alt="" />
				<img class="pse-sheet-leaf is-fan is-bottom" :src="fanUrl" alt="" />
				<img class="pse-sheet-leaf is-frond is-bottom" :src="frondUrl" alt="" />
			</div>

			<div class="pse-sheet-scroll">
				<div class="pse-sheet-card">
					<button type="button" class="pse-sheet-close" aria-label="Sluiten" @click="$emit('close')">
						<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
							stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
							<path d="M6 6l12 12M18 6L6 18" />
						</svg>
					</button>

					<h2 class="pse-sheet-title">Instructies webshop</h2>

					<ul class="pse-instructions">
						<li v-for="(instruction, index) in INSTRUCTIONS" :key="index" class="pse-instruction">
							<!-- The tent from the logo, on the brand green: the mark the
							     printed sheet sets in front of every line. -->
							<span class="pse-instruction-mark" aria-hidden="true">
								<svg viewBox="0 0 49 50" width="19" height="19" fill="currentColor">
									<path d="M24.412 35.6565V11.098L41.6909 43.6364L24.412 35.6565ZM22.0017 0.496094L19.282 1.47322L22.4577 7.45001L0 49.7435L24.0863 38.6205L48.1725 49.7435L25.6985 7.43372L28.8579 1.48951L26.1382 0.528665L24.0863 4.40462L22.018 0.512379L22.0017 0.496094Z" />
								</svg>
							</span>

							<p class="pse-instruction-text">
								<strong v-if="instruction.title" class="pse-instruction-title">
									{{ instruction.title }}
								</strong>
								{{ instruction.text }}
							</p>
						</li>
					</ul>

					<footer class="pse-sheet-foot">
						<button type="button" class="pse-dialog-btn" @click="$emit('close')">
							Begrepen
						</button>

						<img class="pse-sheet-logo" :src="logoUrl" alt="Kampeerhal Roden" />
					</footer>
				</div>
			</div>
		</div>
	</ModalShell>
</template>

<style scoped>
/* The page of the printed sheet. Its three greens are the sheet's own rather
   than the palette's: they are the colours of a picture, not of our controls,
   and the leaves are drawn in two of them. */
.pse-sheet {
	position: relative;
	display: flex;
	flex-direction: column;
	/* The shell's panel is a flex column held to the window's height; this is
	   the one child of it, and the card inside is what scrolls. */
	min-height: 0;
	background-color: #1a5c32;
}

/* Behind the card and never in the way of it: the leaves are a backdrop, and a
   click on one is a click on the sheet. */
.pse-sheet-leaves {
	position: absolute;
	inset: 0;
	overflow: hidden;
	pointer-events: none;
}

.pse-sheet-leaf {
	position: absolute;
	display: block;
	height: auto;
}

/* Sized as shares of the sheet's width, the way they are on the page: the frond
   reaches about half way across and the fan a little further. Each is drawn for
   one corner and turned half round for the one opposite. */
.pse-sheet-leaf.is-frond {
	width: 50%;
}

.pse-sheet-leaf.is-fan {
	width: 60%;
}

.pse-sheet-leaf.is-frond.is-top {
	top: -12px;
	left: -22px;
}

.pse-sheet-leaf.is-fan.is-top {
	top: 0;
	right: 0;
	transform: rotate(180deg);
}

.pse-sheet-leaf.is-fan.is-bottom {
	bottom: 0;
	left: 0;
}

.pse-sheet-leaf.is-frond.is-bottom {
	right: -22px;
	bottom: -12px;
	transform: rotate(180deg);
}

/* The margin of green around the card is the scroller's padding, so on a short
   window the card moves under the leaves the way a sheet would move on a desk,
   and the page behind it stays where it is. */
.pse-sheet-scroll {
	position: relative;
	flex: 1;
	min-height: 0;
	padding: 38px 36px;
	overflow-y: auto;
}

/* The pale card. Not quite opaque, as on the sheet: the leaves it covers show
   through as a watermark, which is what makes it one page rather than a white
   box on a green one. */
.pse-sheet-card {
	position: relative;
	padding: 34px 32px 24px;
	border-radius: 22px;
	background-color: rgba(255, 255, 255, 0.86);
	text-align: left;
	color: #26402d;
}

/* The shell's own close control, restated here because the bare panel has no
   title bar for it to sit in. */
.pse-sheet-close {
	position: absolute;
	top: 12px;
	right: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	padding: 0;
	border: 0;
	border-radius: 9px;
	background-color: transparent;
	color: #5b7262;
	cursor: pointer;
	transition: background-color 0.15s ease, color 0.15s ease;
}

.pse-sheet-close:hover {
	background-color: rgba(26, 92, 50, 0.1);
	color: #26402d;
}

.pse-sheet-close:focus {
	outline: none;
}

.pse-sheet-close:focus-visible {
	outline: none;
	box-shadow: 0 0 0 3px var(--pse-brand-ring);
}

/* The plaque the sheet sets its heading on: a lighter card with a hard shadow
   to one side, as if cut out and laid on the page. */
.pse-sheet-title {
	width: fit-content;
	max-width: 100%;
	margin: 0 auto 28px;
	padding: 13px 34px;
	background-color: #edf6ee;
	box-shadow: 4px 4px 0 #2f4a36;
	font-size: 25px;
	font-weight: 700;
	line-height: 1.2;
	letter-spacing: 0.01em;
	text-align: center;
	color: #2f5a36;
}

.pse-instructions {
	display: flex;
	flex-direction: column;
	gap: 17px;
	margin: 0;
	padding: 0;
	list-style: none;
}

.pse-instruction {
	display: flex;
	align-items: flex-start;
	gap: 14px;
}

.pse-instruction-mark {
	display: flex;
	align-items: center;
	justify-content: center;
	flex: none;
	width: 34px;
	height: 34px;
	border-radius: 4px;
	background-color: var(--pse-brand);
	color: #ffffff;
}

/* Held down by the difference between the mark and a line of text, so a line
   that is one line long sits against the middle of its mark and a longer one
   starts level with it. */
.pse-instruction-text {
	margin: 0;
	padding-top: 6px;
	font-size: 14.5px;
	line-height: 1.5;
}

.pse-instruction-title {
	display: block;
	font-weight: 700;
}

/* The foot of the card: the way out on the left, and the mark where the sheet
   has it -- the bottom right -- set on the card itself so all of it is there. */
.pse-sheet-foot {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	margin-top: 28px;
	padding-top: 20px;
	border-top: 1px solid rgba(26, 92, 50, 0.16);
}

.pse-sheet-logo {
	display: block;
	width: auto;
	height: 34px;
}

@media (max-width: 640px) {
	.pse-sheet-scroll {
		padding: 20px 16px;
	}

	.pse-sheet-card {
		padding: 30px 20px 20px;
	}

	.pse-sheet-title {
		padding: 11px 22px;
		font-size: 21px;
	}

	.pse-sheet-logo {
		height: 28px;
	}
}
</style>
