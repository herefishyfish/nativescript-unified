import { getViewClass, getViewMeta, isKnownView, registerElement } from '@nativescript/angular';

/** NativeScript core elements whose tags MasonKit takes over, and the tag each stays reachable under. */
const CORE_ALIASES = [
	['Button', 'NButton'],
	['Span', 'NSpan'],
] as const;

/**
 * Keeps NativeScript's core `Button` and `Span` reachable as `<NButton>` and `<NSpan>`.
 *
 * MasonKit registers its own `Button` and `/web` `Span` over core's, so `<Button>` and `<Span>` become MasonKit
 * elements and a core `FormattedString` would receive MasonKit spans. Call this before `installMasonKit()`, while
 * the core entries are still registered; the alias keeps core's view meta, so `<NButton>Tap</NButton>` and
 * `<FormattedString><NSpan>` behave as core's tags did. An alias that is already registered is left alone.
 */
export function registerCoreElementAliases(): void {
	for (const [core, alias] of CORE_ALIASES) {
		if (isKnownView(alias)) continue;
		const view = getViewClass(core);
		registerElement(alias, () => view, getViewMeta(core));
	}
}
