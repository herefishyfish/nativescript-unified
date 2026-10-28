import { booleanAttribute } from '@angular/core';
import { Button, CSSType, type EventData } from '@nativescript/core';

/**
 * `<button>` as core's Button, the platform button, with `(click)` and `disabled` as on the web.
 * It draws text only: an `ng-icon` or any other element inside the button is not shown.
 */
@CSSType('button')
export class NativeButton extends Button {
	constructor() {
		super();
		this.on(Button.tapEvent, () => this.notify({ eventName: 'click', object: this, target: this } as EventData));
	}

	get disabled(): boolean {
		return !this.isEnabled;
	}
	set disabled(value: unknown) {
		this.isEnabled = !booleanAttribute(value);
	}
}
