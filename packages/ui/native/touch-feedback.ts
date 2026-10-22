import { CoreTypes, TouchManager, type TouchAnimationOptions, View } from '@nativescript/core';

/** A short press-in and release, close to a native button's feel. */
const PRESS: TouchAnimationOptions = {
	down: { scale: { x: 0.97, y: 0.97 }, opacity: 0.75, duration: 90, curve: CoreTypes.AnimationCurve.easeOut },
	up: { scale: { x: 1, y: 1 }, opacity: 1, duration: 160, curve: CoreTypes.AnimationCurve.easeOut },
};

/** CSS types that get press feedback: MasonKit's button and anchor, and the block-backed `button`/`a` spartan registers. */
const PRESSABLE = new Set(['button', 'a']);

let installed = false;

/**
 * Press feedback on every button and anchor, through core's TouchManager.
 *
 * Core attaches tap animations in `onLoaded`, but only to views with a `tap` listener, and MasonKit folds `(tap)` and
 * `(click)` into `click`, so buttons and anchors are attached here by element type instead. An anchor needs no
 * binding to qualify. Opt a view out with `ignoreTouchAnimation="true"`, or give it its own `touchAnimation`.
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
	};
}
