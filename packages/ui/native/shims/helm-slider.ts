import { ChangeDetectionStrategy, Component, inject, NO_ERRORS_SCHEMA } from '@angular/core';
import { registerElement } from '@nativescript/angular';
import { Slider } from '@nativescript-community/ui-slider';
import type { EventData, PropertyChangeData, View } from '@nativescript/core';
import { MASON_ELEMENTS } from '../native-elements';
import { MasonKitSlider } from './masonkit-slider';
import { HlmSliderBase, RANGE_TEMPLATE } from './slider-base';

registerElement('ui-slider', () => Slider);

/**
 * Stands in for `@spartan-ng/helm/slider` (vite.config.mts): one value draws @nativescript-community/ui-slider, Material's
 * slider on Android and UISlider on iOS. Below provideMasonElements() it renders the MasonKit slider instead.
 */
@Component({
	selector: 'hlm-slider',
	imports: [MasonKitSlider],
	schemas: [NO_ERRORS_SCHEMA],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { 'data-slot': 'slider', class: 'flex w-full' },
	template: `
		@if (_mason) {
			<masonkit-slider
				class="flex-1"
				[value]="_value()"
				[min]="min()"
				[max]="max()"
				[step]="step()"
				[disabled]="_disabled()"
				[aria-label]="ariaLabel()"
				(valueChange)="_setValue($event)"
			/>
		} @else if (_value().length > 1) {
			${RANGE_TEMPLATE}
		} @else {
			<ui-slider
				class="native-slider flex-1"
				[minValue]="min()"
				[maxValue]="max()"
				[stepSize]="step()"
				[value]="_value()[0] ?? min()"
				[isEnabled]="!_disabled()"
				[accessibilityLabel]="ariaLabel()"
				(loaded)="_hideTicks($event)"
				(valueChange)="_onNativeChange($event)"
			/>
		}
	`,
})
export class HlmSlider extends HlmSliderBase {
	protected readonly _mason = inject(MASON_ELEMENTS);

	protected _onNativeChange(event: PropertyChangeData): void {
		const value = event.value as number;
		// The view also reports the `value` the template writes; only a drag differs from the signal.
		if (value === this._value()[0]) return;
		this._setValue([value]);
	}

	/** Material draws a tick per step; helm's slider shows ticks only when asked to. */
	protected _hideTicks(event: EventData): void {
		const native = (event.object as View).android as { setTickVisible?: (visible: boolean) => void } | undefined;
		native?.setTickVisible?.(false);
	}
}

export const HlmSliderImports = [HlmSlider] as const;
