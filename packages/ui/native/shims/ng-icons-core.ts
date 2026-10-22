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
	// A style map holding only the keys that are set: per-property bindings left at undefined make the renderer remove
	// the style, which wipes the CSS color and size an icon created after first render has just been given.
	host: { class: 'lucide', '[style]': '_style()' },
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
	protected readonly _style = computed(() => {
		const style: Record<string, string | number> = {};
		const color = this.color();
		if (color) style['color'] = color;
		const size = this.size();
		if (size && /^\d+(\.\d+)?(px)?$/.test(size)) style['font-size'] = parseFloat(size);
		return style;
	});
}

export { NgIcon as NgIconComponent };

/** Glyphs are looked up by name, so the SVG sources registered here are not needed. */
export function provideIcons(_icons: Record<string, string>): Provider[] {
	return [];
}
