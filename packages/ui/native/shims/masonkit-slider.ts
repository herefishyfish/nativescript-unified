import { ChangeDetectionStrategy, Component, computed, NO_ERRORS_SCHEMA, signal } from '@angular/core';
import type { EventData, View } from '@nativescript/core';
import { HlmSliderBase, RANGE_TEMPLATE } from './helm-slider';

type RangeInput = View & { value: string };

/** MasonKit's `<input type="range">` on Android is a FrameLayout around a SeekBar running from 0 to its max (100). */
function seekBarOf(input: RangeInput): android.widget.SeekBar | null {
	if (!__ANDROID__) return null;
	const frame = input.android as android.view.ViewGroup | undefined;
	for (let i = 0; i < (frame?.getChildCount() ?? 0); i++) {
		const child = frame!.getChildAt(i);
		if (child instanceof android.widget.SeekBar) return child;
	}
	return null;
}

/**
 * Stands in for `@spartan-ng/helm/slider` everywhere but the native-widget screens: one value draws MasonKit's
 * `<input type="range">`, the platform SeekBar on Android. That input has no `min`, `max` or `step`, so its progress
 * counts steps from `min`: on Android the SeekBar's max is set to the number of steps; elsewhere progress is a
 * percentage, rounded to a step.
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
			<input
				type="range"
				class="masonkit-slider flex-1"
				[value]="'' + _progress()"
				[isEnabled]="!_disabled()"
				[accessibilityLabel]="ariaLabel()"
				(loaded)="_onLoaded($event)"
				(input)="_onInput()"
			/>
		}
	`,
})
export class HlmSlider extends HlmSliderBase {
	private _input?: RangeInput;
	/** The input's progress at its max: the step count once the SeekBar takes it. */
	private readonly _scale = signal(100);

	private readonly _steps = computed(() => Math.max(1, Math.round((this.max() - this.min()) / this.step())));

	protected readonly _progress = computed(() => {
		const value = this._value()[0] ?? this.min();
		return Math.round(((value - this.min()) / (this.max() - this.min())) * this._scale());
	});

	protected _onLoaded(event: EventData): void {
		const input = event.object as RangeInput;
		this._input = input;
		const bar = seekBarOf(input);
		if (!bar) return;
		bar.setMax(this._steps());
		this._scale.set(this._steps());
		// Helm's range is bg-primary on bg-muted; the class gives the input `color: var(--primary)`.
		const color = input.style.color;
		if (color) {
			const tint = android.content.res.ColorStateList.valueOf(color.android);
			bar.setProgressTintList(tint);
			bar.setThumbTintList(tint);
		}
	}

	protected _onInput(): void {
		if (!this._input) return;
		const steps = Math.round((Number(this._input.value) / this._scale()) * this._steps());
		const value = this.min() + steps * this.step();
		if (value === this._value()[0]) return;
		this._setValue([value]);
	}
}

export const HlmSliderImports = [HlmSlider] as const;
