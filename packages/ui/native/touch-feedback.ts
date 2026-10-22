import { CoreTypes, type EventData, TouchManager, type TouchAnimationOptions, View } from '@nativescript/core';

/** A short press-in and release, close to a native button's feel. */
const PRESS: TouchAnimationOptions = {
	down: { scale: { x: 0.97, y: 0.97 }, opacity: 0.75, duration: 90, curve: CoreTypes.AnimationCurve.easeOut },
	up: { scale: { x: 1, y: 1 }, opacity: 1, duration: 160, curve: CoreTypes.AnimationCurve.easeOut },
};

/**
 * Press feedback for every tappable view: buttons, links and any element with a `(click)` or `(tap)` binding.
 *
 * Core's global tap animations only pick up views with a `tap` listener, but MasonKit registers `(click)` and
 * `(tap)` under `click`, so every MasonKit element is also handed to the TouchManager when it loads. Opt a view out
 * with `ignoreTouchAnimation="true"`, or give it its own `touchAnimation`. Call once at startup.
 */
export function installTouchFeedback(animations: TouchAnimationOptions = PRESS): void {
	TouchManager.enableGlobalTapAnimations = true;
	TouchManager.animations = animations;
	View.on(View.loadedEvent, (args: EventData) => {
		const view = args.object as View;
		if (view.ignoreTouchAnimation || view.touchAnimation || view.hasListeners('tap')) return;
		if (view.hasListeners('click')) TouchManager.addAnimations(view);
	});
}
