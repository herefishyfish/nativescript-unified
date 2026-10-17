import { ChangeDetectionStrategy, Component, NO_ERRORS_SCHEMA, computed, input } from '@angular/core';
import type * as lucide from '@ng-icons/lucide';
import { lucideGlyph } from './lucide-glyph';

/** Spartan's icon names, as used with `ng-icon` (`lucideChevronDown`). */
export type IconName = keyof typeof lucide;

/**
 * A Lucide icon drawn from the lucide.ttf glyph font, so it renders in any MasonKit text element and, like
 * `ng-icon`, takes its color and size from the CSS `color` and `font-size`.
 */
@Component({
	selector: 'ui-icon',
	schemas: [NO_ERRORS_SCHEMA],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { class: 'inline-flex shrink-0 items-center justify-center' },
	template: `
		<span class="lucide">{{ _glyph() }}</span>
	`,
})
export class Icon {
	public readonly name = input.required<IconName>();
	protected readonly _glyph = computed(() => lucideGlyph(this.name()));
}
