import { getViewClass, getViewMeta, isKnownView, registerElement } from '@nativescript/angular';
import { CSSType } from '@nativescript/core';

/** NativeScript core elements whose tags MasonKit takes over, and the tag each stays reachable under. */
const CORE_ALIASES = [
	['Button', 'NButton'],
	['Span', 'NSpan'],
	// The web polyfill's SegmentedBar takes `ns-segmented-bar-item` children; on a device they are core's items.
	['SegmentedBarItem', 'ns-segmented-bar-item'],
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

/** Core views whose `items` the web polyfills read as a comma-separated list (packages/web-polyfills). */
const ITEM_LIST_VIEWS = ['ListPicker', 'ListView', 'Repeater'] as const;

/**
 * Lets `<ListPicker items="Small, Medium, Large">` mean the same on native as on the web.
 *
 * The polyfills split a string `items` on commas. Core takes any array-like, so a string became one item per
 * character. Each view is re-registered as a subclass that splits a string and passes arrays through.
 */
export function registerCommaSeparatedItems(): void {
	for (const tag of ITEM_LIST_VIEWS) {
		const Base = getViewClass(tag) as new () => object;
		const items = itemsDescriptor(Base.prototype);
		@CSSType(tag)
		class CommaSeparatedItems extends Base {
			get items(): unknown {
				return items.get!.call(this);
			}
			set items(value: unknown) {
				items.set!.call(this, typeof value === 'string' ? splitItems(value) : value);
			}
		}
		registerElement(tag, () => CommaSeparatedItems as never, getViewMeta(tag));
	}
}

function itemsDescriptor(prototype: object | null): PropertyDescriptor {
	for (let proto = prototype; proto; proto = Object.getPrototypeOf(proto)) {
		const descriptor = Object.getOwnPropertyDescriptor(proto, 'items');
		if (descriptor?.set) return descriptor;
	}
	throw new TypeError('No items property to wrap');
}

function splitItems(value: string): string[] {
	return value
		.split(',')
		.map((item) => item.trim())
		.filter((item) => item.length > 0);
}
