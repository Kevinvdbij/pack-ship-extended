import Settings from "./settings.ts";
import { debug } from "./logger.ts";

// Audible confirmation of what just happened, for a packer who is looking at the
// box rather than at the screen. Three cues, each switched on its own in the
// settings modal:
//
// - `success`: a scan landed. A bright two-note rise.
// - `warning`: a scan landed but is not right -- the barcode is not in this
//   reservation, or the product is now over its quantity. Two flat mid beeps.
// - `error`: a step of the process itself failed -- the carrier refused the
//   announcement, a save did not go through. One long, low, falling buzz.
//
// They are told apart by register, rhythm and length rather than by pitch
// alone, so they still read from across the room and over a printer: the good
// one goes up and is short, the warning is the only one that repeats, the bad
// one is the only low and long one.
//
// Synthesised on the spot with the Web Audio API rather than played from files.
// A userscript has nowhere to keep audio assets, and a base64 blob inlined into
// the bundle is a wall of characters nobody can check against what it sounds
// like; a dozen lines of oscillator settings can be read.
export type SoundKind = "success" | "warning" | "error";

// Whether each cue is switched on, read from the settings so a change in the
// modal takes effect on the next scan without a reload.
function enabled(kind: SoundKind): boolean {
	switch (kind) {
		case "success": return Settings.soundSuccess;
		case "warning": return Settings.soundWarning;
		case "error": return Settings.soundError;
	}
}

// Returns how long the cue lasts, in milliseconds, so a caller about to leave
// the page can let it finish first -- a navigation stops the audio thread with
// it, and a chime cut off half way is a chime that says the opposite of what
// it meant. Zero when nothing was played.
export function playSound(kind: SoundKind): number {
	if (!enabled(kind)) {
		return 0;
	}

	return previewSound(kind);
}

// Starts the audio context ahead of the first sound. Creating it and bringing
// it out of suspension takes long enough to be heard as a late chime on the
// first scan of a page, so pages that will play call this at mount.
export function warmUpAudio() {
	const context = getContext();

	if (context?.state == "suspended") {
		context.resume().catch(() => {});
	}
}

// Plays regardless of the switch -- the settings modal's own "listen" buttons,
// which have to sound while the switch that is being decided on is still off.
export function previewSound(kind: SoundKind): number {
	const context = getContext();

	if (!context) {
		return 0;
	}

	// The browser only lets a context run after the page has had a user gesture.
	// A scan is a keypress into the page, so on the parcels page this is always
	// already true; a page reached by navigation and nothing else -- the
	// completed screen among them -- may have to wait for the first click.
	if (context.state == "suspended") {
		context.resume().catch(() => {});
	}

	if (context.state != "running") {
		debug("Audio context is not running; the sound is dropped and the next gesture will unlock it.", kind);
		unlockOnGesture(context);

		return 0;
	}

	try {
		return Math.round(SOUNDS[kind](context) * 1000);
	} catch (error) {
		console.error("Pack&Ship Extended failed to play a sound.", error);

		return 0;
	}
}

let audioContext: AudioContext | null | undefined;

function getContext(): AudioContext | null {
	if (audioContext === undefined) {
		try {
			audioContext = new AudioContext({ latencyHint: "interactive" });
		} catch (error) {
			console.error("Pack&Ship Extended could not create an audio context.", error);
			audioContext = null;
		}
	}

	return audioContext;
}

let unlockArmed = false;

// Resumes the context on the next gesture so the sound after this one plays.
// The dropped one is not replayed late: a chime that arrives on the click after
// the thing it was about is a chime about the wrong thing.
function unlockOnGesture(context: AudioContext) {
	if (unlockArmed) {
		return;
	}

	unlockArmed = true;

	const unlock = () => {
		unlockArmed = false;
		context.resume().catch(() => {});
	};

	for (const type of ["pointerdown", "keydown"]) {
		document.addEventListener(type, unlock, { once: true, capture: true });
	}
}

// One note: an oscillator through its own gain envelope, so several can overlap
// without one cutting the other short. Attack and release are a few
// milliseconds so the edges do not click through the speakers.
function tone(context: AudioContext, options: {
	type: OscillatorType;
	from: number;
	to?: number;
	start: number;
	duration: number;
	volume: number;
}) {
	const { type, from, to = from, start, duration, volume } = options;
	const at = context.currentTime + start;
	const oscillator = context.createOscillator();
	const gain = context.createGain();

	oscillator.type = type;
	oscillator.frequency.setValueAtTime(from, at);

	if (to != from) {
		oscillator.frequency.exponentialRampToValueAtTime(to, at + duration);
	}

	gain.gain.setValueAtTime(0.0001, at);
	gain.gain.exponentialRampToValueAtTime(volume, at + 0.012);
	gain.gain.setValueAtTime(volume, at + duration - 0.05);
	gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);

	oscillator.connect(gain).connect(context.destination);
	oscillator.start(at);
	oscillator.stop(at + duration + 0.02);
}

// Each returns the length of what it scheduled, in seconds.
const SOUNDS: Record<SoundKind, (context: AudioContext) => number> = {
	// Two quick notes a fourth apart, going up: E5 then A5. Short, bright, done.
	success(context) {
		tone(context, { type: "triangle", from: 659, start: 0, duration: 0.11, volume: 0.55 });
		tone(context, { type: "triangle", from: 880, start: 0.11, duration: 0.2, volume: 0.55 });

		return 0.31;
	},

	// Two identical flat beeps at A4 with a gap between them. The repeat is what
	// marks it: neither of the others says the same thing twice.
	warning(context) {
		tone(context, { type: "square", from: 440, start: 0, duration: 0.14, volume: 0.28 });
		tone(context, { type: "square", from: 440, start: 0.22, duration: 0.14, volume: 0.28 });

		return 0.36;
	},

	// One long note sliding down from E4 to A3, with a square wave underneath
	// for the buzz. The only low one and the only long one.
	error(context) {
		tone(context, { type: "sawtooth", from: 330, to: 220, start: 0, duration: 0.65, volume: 0.32 });
		tone(context, { type: "square", from: 165, to: 110, start: 0, duration: 0.65, volume: 0.2 });

		return 0.65;
	},
};
