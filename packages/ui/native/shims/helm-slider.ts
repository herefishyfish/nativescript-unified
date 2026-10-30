import {
	booleanAttribute,
	ChangeDetectionStrategy,
	Component,
	computed,
	Directive,
	input,
	linkedSignal,
	NO_ERRORS_SCHEMA,
	numberAttribute,
	output,
	signal,
} from '@angular/core';
import { registerElement } from '@nativescript/angular';
import { Slider } from '@nativescript-community/ui-slider';
import type { EventData, PropertyChangeData, TouchGestureEventData, View } from '@nativescript/core';

registerElement('ui-slider', () => Slider);

/** Half of spartan's `size-4` thumb: the range slider insets its track by it so a thumb's centre meets the value. */
const THUMB_RADIUS = 8;

/**
 * Helm's track, range and thumbs as plain elements, for two or more values. They are placed with flex-grow spacers
 * (transforms take no percentages here) and moved with a touch gesture. The thumb row overlaps the track by a
 * negative margin: MasonKit does not stretch an absolute box between left and right.
 */
export const RANGE_TEMPLATE = `
	<div
		class="flex w-full flex-col px-2 py-1"
		[class.opacity-50]="_disabled()"
		[attr.aria-label]="ariaLabel()"
		(touch)="_onTouch($event)"
	>
		<div class="spartan-slider-track flex h-1.5 w-full flex-row" data-horizontal>
			<div [style.flex-grow]="_spans()[0]"></div>
			<div class="spartan-slider-range h-full" [style.flex-grow]="_spans()[1]"></div>
			<div [style.flex-grow]="_spans()[2]"></div>
		</div>
		<div class="-mt-[11px] flex h-4 w-full flex-row items-center">
			<div [style.flex-grow]="_spans()[0]"></div>
			<div class="spartan-slider-thumb -mx-2 shrink-0"></div>
			<div [style.flex-grow]="_spans()[1]"></div>
			<div class="spartan-slider-thumb -mx-2 shrink-0"></div>
			<div [style.flex-grow]="_spans()[2]"></div>
		</div>
	</div>
`;

/**
 * Helm's slider API and the touch-driven range, shared by the native slider shims. Spartan's slider measures its track
 * and follows pointer events, which a NativeScript view has neither of; each shim draws one value with a platform
 * control and two or more with RANGE_TEMPLATE.
 */
@Directive()
export abstract class HlmSliderBase {
	public readonly value = input<number[]>([]);
	public readonly min = input<number, unknown>(0, { transform: numberAttribute });
	public readonly max = input<number, unknown>(100, { transform: numberAttribute });
	public readonly step = input<number, unknown>(1, { transform: numberAttribute });
	public readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
	public readonly valueChange = output<number[]>();

	protected readonly _value = linkedSignal(this.value);
	protected readonly _disabled = linkedSignal(this.disabled);

	/** The range's three flex-grow spans: below the first thumb, between the thumbs, above the last. */
	protected readonly _spans = computed(() => {
		const [low, high] = [...this._value()].sort((a, b) => a - b);
		return [low - this.min(), high - low, this.max() - high];
	});

	/** The thumb the current touch moves. */
	private readonly _dragging = signal<number | null>(null);

	protected _onTouch(event: TouchGestureEventData): void {
		if (this._disabled()) return;
		const view = event.view as View;
		const track = view.getActualSize().width - 2 * THUMB_RADIUS;
		if (track <= 0) return;
		const values = [...this._value()];
		const fraction = Math.min(1, Math.max(0, (event.getX() - THUMB_RADIUS) / track));
		const raw = this.min() + fraction * (this.max() - this.min());
		const next = Math.round(raw / this.step()) * this.step();

		if (event.action === 'down') {
			const distances = values.map((value) => Math.abs(value - next));
			this._dragging.set(distances.indexOf(Math.min(...distances)));
		} else if (event.action === 'up' || event.action === 'cancel') {
			this._dragging.set(null);
			return;
		}
		const index = this._dragging();
		if (index === null || values[index] === next) return;
		values[index] = next;
		this._setValue(values.sort((a, b) => a - b));
	}

	protected _setValue(value: number[]): void {
		this._value.set(value);
		this.valueChange.emit(value);
	}
}

/**
 * Stands in for `@spartan-ng/helm/slider` where the app draws @nativescript-community widgets (docs/native-elements):
 * one value draws @nativescript-community/ui-slider, Material's slider on Android and UISlider on iOS.
 */
@Component({
	selector: 'hlm-slider',
	schemas: [NO_ERRORS_SCHEMA],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { 'data-slot': 'slider', class: 'flex w-full' },
	template: `
		@if (_value().length > 1) {
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
