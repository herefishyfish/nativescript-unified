import { CoreTypes, type EventData, TouchManager, type TouchAnimationOptions, View } from '@nativescript/core';

/** A short press-in and release, close to a native button's feel. */
const PRESS: TouchAnimationOptions = {
	down: { scale: { x: 0.97, y: 0.97 }, opacity: 0.75, duration: 90, curve: CoreTypes.AnimationCurve.easeOut },
	up: { scale: { x: 1, y: 1 }, opacity: 1, duration: 160, curve: CoreTypes.AnimationCurve.easeOut },
};

/** CSS types that get press feedback: MasonKit's button and anchor, and the block-backed `button`/`a` spartan registers. */
const PRESSABLE = new Set(['button', 'a']);

/** ARIA roles whose tap changes a selection (helm's switch, checkbox and radio), which get a selection haptic. */
const SELECTABLE_ROLES = new Set(['switch', 'checkbox', 'radio']);

let installed = false;

/**
 * Press feedback on every button and anchor, through core's TouchManager.
 *
 * Core attaches tap animations in `onLoaded`, but only to views with a `tap` listener, and MasonKit folds `(tap)` and
 * `(click)` into `click`, so buttons and anchors are attached here by element type instead. An anchor needs no
 * binding to qualify. Opt a view out with `ignoreTouchAnimation="true"`, or give it its own `touchAnimation`.
 * A tap on a switch, checkbox or radio also plays the platform's selection haptic, as native toggles do.
 * Call once at startup.
 */
export function installTouchFeedback(animations: TouchAnimationOptions = PRESS): void {
	TouchManager.animations = animations;
	if (installed) return;
	installed = true;
	const onLoaded = View.prototype.onLoaded;
	View.prototype.onLoaded = function (this: View) {
		const firstLoad = !this.isLoaded;
		onLoaded.call(this);
		if (firstLoad && !this.ignoreTouchAnimation && !this.touchAnimation && PRESSABLE.has(this.cssType?.toLowerCase())) {
			TouchManager.addAnimations(this);
		}
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
