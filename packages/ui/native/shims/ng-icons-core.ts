import { ChangeDetectionStrategy, Component, NO_ERRORS_SCHEMA, type Provider, computed, input } from '@angular/core';
import { lucideGlyph } from '../ui/lucide-glyph';

/**
 * Stands in for `@ng-icons/core` (aliased in vite.config.mts): ng-icon renders SVG markup, which NativeScript cannot
 * display. Same selector and inputs, so helm templates (`<ng-icon name="lucideChevronDown" />`) compile against the
 * real package and render a lucide.ttf glyph that, like the SVG, takes its color and size from CSS.
 */
@Component({
	selector: 'ng-icon',
	schemas: [NO_ERRORS_SCHEMA],
	changeDetection: ChangeDetectionStrategy.OnPush,
	// Registered as a MasonKit text element (provideSpartanNativeScript), so the glyph lays out as an inline run inside
	// helm's text elements (a checkbox indicator span) as well as a box inside flex containers.
	host: { class: 'lucide', '[style.color]': 'color()', '[style.fontSize]': '_fontSize()' },
	template: `
		{{ _glyph() }}
	`,
})
export class NgIcon {
	public readonly name = input<string>();
	public readonly svg = input<string>();
	public readonly size = input<string | undefined, string | number | undefined>(undefined, {
		transform: (value) => (value === undefined || value === '' ? undefined : String(value)),
	});
	public readonly strokeWidth = input<string | number>();
	public readonly color = input<string>();

	protected readonly _glyph = computed(() => lucideGlyph(this.name()));
	protected readonly _fontSize = computed(() => {
		const size = this.size();
		return size && /^\d+(\.\d+)?(px)?$/.test(size) ? parseFloat(size) : undefined;
	});
}

export { NgIcon as NgIconComponent };

/** Glyphs are looked up by name, so the SVG sources registered here are not needed. */
export function provideIcons(_icons: Record<string, string>): Provider[] {
	return [];
}
