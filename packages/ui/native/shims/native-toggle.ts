import { booleanAttribute, Directive, inject, input, linkedSignal, output } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import type { PropertyChangeData } from '@nativescript/core';
import { MASON_ELEMENTS } from '../native-elements';

/**
 * What helm's switch and checkbox share, for the shims that draw them as platform toggles: `checked`,
 * `(checkedChange)`, `disabled`, `aria-label` and the ControlValueAccessor. The subclass binds them to its view, or
 * below provideMasonElements() to spartan's own component.
 */
@Directive()
export abstract class NativeToggle implements ControlValueAccessor {
	public readonly checkedInput = input<boolean, unknown>(false, { alias: 'checked', transform: booleanAttribute });
	public readonly checked = linkedSignal(this.checkedInput);
	public readonly checkedChange = output<boolean>();
	public readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

	protected readonly _disabled = linkedSignal(this.disabled);
	protected readonly _mason = inject(MASON_ELEMENTS);
	private _onChange?: (value: boolean) => void;
	private _onTouched?: () => void;

	protected _onNativeChange(event: PropertyChangeData): void {
		const value = event.value as boolean;
		// The view also reports the `checked` the template writes; only a user toggle differs from the signal.
		if (value !== this.checked()) this._setChecked(value);
	}

	protected _setChecked(value: boolean): void {
		this.checked.set(value);
		this._onChange?.(value);
		this._onTouched?.();
		this.checkedChange.emit(value);
	}

	writeValue(value: boolean): void {
		this.checked.set(Boolean(value));
	}

	registerOnChange(fn: (value: boolean) => void): void {
		this._onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this._onTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this._disabled.set(isDisabled);
	}
}
