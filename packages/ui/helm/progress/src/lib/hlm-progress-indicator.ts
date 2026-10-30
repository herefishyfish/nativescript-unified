import { Directionality } from '@angular/cdk/bidi';
import { DOCUMENT } from '@angular/common';
import { Directive, computed, inject } from '@angular/core';
import { BrnProgressIndicator, injectBrnProgress } from '@spartan-ng/brain/progress';
import { classes } from '@spartan-ng/helm/utils';

@Directive({
	selector: '[hlmProgressIndicator],hlm-progress-indicator',
	hostDirectives: [BrnProgressIndicator],
	host: {
		'data-slot': 'progress-indicator',
		'[class.animate-indeterminate]': '_indeterminate()',
		'[style.transform]': '_transform()',
		'[style.width]': '_width()',
		'[style.flex-grow]': '_sized ? 0 : null',
	},
})
export class HlmProgressIndicator {
	private readonly _progress = injectBrnProgress();
	private readonly _dir = inject(Directionality);
	// Renderers without a DOM (NativeScript) take no percentages in transforms, so the indicator is sized instead.
	protected readonly _sized = !inject(DOCUMENT).defaultView;
	// Offset the indicator by the unfilled remainder. In RTL the bar fills from the inline-start
	// (visually the right), so translate the opposite way to keep the fill on the correct side.
	protected readonly _transform = computed(() => {
		if (this._sized) return null;
		const offset = 100 - (this._progress.value() ?? 100);
		return `translateX(${this._dir.valueSignal() === 'rtl' ? '' : '-'}${offset}%)`;
	});
	protected readonly _width = computed(() => (this._sized ? `${this._progress.value() ?? 100}%` : null));
	protected readonly _indeterminate = computed(
		() => this._progress.value() === null || this._progress.value() === undefined,
	);

	constructor() {
		classes(() => 'spartan-progress-indicator h-full w-full flex-1 transition-all');
	}
}
