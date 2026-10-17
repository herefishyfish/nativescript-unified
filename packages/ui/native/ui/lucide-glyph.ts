import codepoints from 'lucide-static/font/codepoints.json';

/** The lucide.ttf character for an `@ng-icons/lucide` export name (`lucideChevronDown`), or '' when unknown. */
export function lucideGlyph(name: string | undefined): string {
	if (!name) return '';
	const kebab = name
		.replace(/^lucide/, '')
		.replace(/(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|(?<=[a-zA-Z])(?=[0-9])/g, '-');
	const codepoint = (codepoints as Record<string, number>)[kebab.toLowerCase()];
	return codepoint === undefined ? '' : String.fromCodePoint(codepoint);
}
