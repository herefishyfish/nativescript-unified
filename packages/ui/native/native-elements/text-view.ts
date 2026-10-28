import { TextView } from '@nativescript-community/ui-textview';
import { CSSType } from '@nativescript/core';
import { webTextControl } from './index';

/**
 * `<textarea>` as @nativescript-community/ui-textview: Material's TextInputLayout on Android, UITextView on iOS.
 * Like `NativeTextField`, it starts without the Material box and floating label.
 */
@CSSType('textarea')
export class NativeTextView extends webTextControl(TextView) {
	constructor() {
		super();
		this.variant = 'none';
		this.floating = false;
	}
}
