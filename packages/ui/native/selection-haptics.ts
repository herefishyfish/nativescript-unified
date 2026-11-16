import { type EventData, View } from '@nativescript/core';

/** ARIA roles whose tap changes a selection (helm's switch, checkbox and radio), which get a selection haptic. */
const SELECTABLE_ROLES = new Set(['switch', 'checkbox', 'radio']);

let installed = false;

/**
 * A tap on a switch, checkbox or radio plays the platform's selection haptic, as native toggles do.
 * Call once at startup.
 */
export function installSelectionHaptics(): void {
	if (installed) return;
	installed = true;
	const onLoaded = View.prototype.onLoaded;
	View.prototype.onLoaded = function (this: View) {
		const firstLoad = !this.isLoaded;
		onLoaded.call(this);
		if (firstLoad && SELECTABLE_ROLES.has(String((this as unknown as { role?: unknown }).role))) {
			this.on('tap', selectionHaptic);
		}
	};
}

function selectionHaptic(args: EventData): void {
	if (__ANDROID__) {
		(args.object as View).android?.performHapticFeedback(android.view.HapticFeedbackConstants.CLOCK_TICK);
	} else if (__APPLE__) {
		UISelectionFeedbackGenerator.new().selectionChanged();
	}
}
