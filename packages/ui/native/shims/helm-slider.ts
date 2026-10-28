import {
	booleanAttribute,
	ChangeDetectionStrategy,
	Component,
	input,
	linkedSignal,
	NO_ERRORS_SCHEMA,
	numberAttribute,
	output,
} from '@angular/core';
import { registerElement } from '@nativescript/angular';
import { Slider } from '@nativescript-community/ui-slider';
import type { PropertyChangeData } from '@nativescript/core';
import { HlmSlider as SpartanSlider } from '../../helm/slider/src/lib/hlm-slider';

registerElement('ui-slider', () => Slider);

/**
 * Stands in for `@spartan-ng/helm/slider` where vite.config.mts resolves it here: a one-thumb `<hlm-slider>` draws
 * @nativescript-community/ui-slider, Material's slider on Android and UISlider on iOS. A range (two or more values)
 * is spartan's slider, through its `<brn-slider hlm>` selector, because the platform slider has one thumb.
 */
@Component({
	selector: 'hlm-slider',
	imports: [SpartanSlider],
	schemas: [NO_ERRORS_SCHEMA],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { 'data-slot': 'slider', class: 'flex w-full' },
	template: `
		@if (_value().length > 1) {
			<brn-slider
				hlm
				[value]="_value()"
				[min]="min()"
				[max]="max()"
				[step]="step()"
				[disabled]="disabled()"
				[aria-label]="ariaLabel()"
				(valueChange)="_setValue($event)"
			/>
		} @else {
			<ui-slider
				class="flex-1"
				[minValue]="min()"
				[maxValue]="max()"
				[stepSize]="step()"
				[value]="_value()[0] ?? min()"
				[isEnabled]="!disabled()"
				[accessibilityLabel]="ariaLabel()"
				(valueChange)="_onNativeChange($event)"
			/>
		}
	`,
})
export class HlmSlider {
	public readonly value = input<number[]>([]);
	public readonly min = input<number, unknown>(0, { transform: numberAttribute });
	public readonly max = input<number, unknown>(100, { transform: numberAttribute });
	public readonly step = input<number, unknown>(1, { transform: numberAttribute });
	public readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
	public readonly valueChange = output<number[]>();

	protected readonly _value = linkedSignal(this.value);

	protected _onNativeChange(event: PropertyChangeData): void {
		const value = event.value as number;
		// The view also reports the `value` the template writes; only a drag differs from the signal.
		if (value === this._value()[0]) return;
		this._setValue([value]);
	}

	protected _setValue(value: number[]): void {
		this._value.set(value);
		this.valueChange.emit(value);
	}
}

export const HlmSliderImports = [HlmSlider] as const;
