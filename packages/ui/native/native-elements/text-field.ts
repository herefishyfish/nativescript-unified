import { TextField } from '@nativescript-community/ui-textfield';
import { CSSType, unsetValue } from '@nativescript/core';
import { webTextControl } from './index';

type TypeSettings = Partial<
	Pick<TextField, 'keyboardType' | 'returnKeyType' | 'autocapitalizationType' | 'autocorrect' | 'secure'>
>;

/** Each setting a `type` can imply, at core's default. */
const DEFAULT_SETTINGS: Record<keyof TypeSettings, unknown> = {
	keyboardType: unsetValue,
	returnKeyType: unsetValue,
	autocapitalizationType: unsetValue,
	autocorrect: unsetValue,
	secure: unsetValue,
};

/** The text-entry `type`s and the settings each implies. */
const TEXT_TYPES: Readonly<Record<string, TypeSettings>> = {
	text: {},
	search: { returnKeyType: 'search' },
	email: { keyboardType: 'email', autocapitalizationType: 'none', autocorrect: false },
	password: { secure: true },
	number: { keyboardType: 'number' },
	tel: { keyboardType: 'phone' },
	url: { keyboardType: 'url', autocapitalizationType: 'none', autocorrect: false },
};

/**
 * `<input>` as @nativescript-community/ui-textfield: Material's TextInputLayout on Android, UITextField on iOS.
 *
 * It starts without the Material box and floating label, so helm's classes draw the field as on the web. Set
 * `variant="outline"` (or `"filled"`) and `floating="true"` on the element for the Material look.
 *
 * The view is chosen from the tag, before `type` is known, so `<input type="checkbox">` and `"radio"` are text fields
 * too. Spartan's radio keeps one hidden behind its indicator and focuses it on tap; for any type that is not text
 * entry the field takes no touches and refuses focus, so the keyboard stays closed.
 */
@CSSType('input')
export class NativeTextField extends webTextControl(TextField) {
	#type = 'text';

	constructor() {
		super();
		this.variant = 'none';
		this.floating = false;
	}

	get type(): string {
		return this.#type;
	}
	set type(value: string) {
		this.#type = value || 'text';
		const settings = TEXT_TYPES[this.#type];
		Object.assign(this, DEFAULT_SETTINGS, settings);
		this.isUserInteractionEnabled = settings !== undefined;
	}

	override focus(): boolean {
		return this.#type in TEXT_TYPES && super.focus();
	}
}
