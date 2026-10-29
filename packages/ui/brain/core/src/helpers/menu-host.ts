import { CdkMenuBase, type CdkMenuItem, CdkMenuItemSelectable, type Menu } from '@angular/cdk/menu';
import type { EmbeddedViewRef } from '@angular/core';
import type { MenuAlign, MenuSide } from './menu-align';

/** One choice of a platform menu. */
export interface BrnMenuItem {
	readonly label: string;
	readonly disabled: boolean;
	readonly destructive: boolean;
	/** Set for checkbox and radio items. */
	readonly checked?: boolean;
	/** The item's keyboard shortcut text (`hlmDropdownMenuShortcut`), kept out of `label`. */
	readonly shortcut?: string;
	/** The item follows a separator, a label or a group boundary. */
	readonly startsSection?: boolean;
	/** The text of the label that heads the item's section, set on the section's first item. */
	readonly sectionLabel?: string;
	/** A separator sits between the section's label and its first item. */
	readonly sectionLabelSeparated?: boolean;
	/** A submenu's items. The item opens them instead of running `select`. */
	readonly items?: readonly BrnMenuItem[];
	/** Runs the item as a tap on it would: emits `triggered` and toggles a checkbox or radio. */
	readonly select: () => void;
}

export interface BrnMenuRequest {
	/** The trigger's element, the menu opens against it. */
	readonly anchor: unknown;
	readonly side: MenuSide;
	readonly align: MenuAlign;
	readonly items: readonly BrnMenuItem[];
}

/**
 * Shows dropdown menus as platform menus. Only platforms without CDK's overlay provide one: on the web, CDK's menu
 * trigger renders the menu in place, with its keyboard handling and focus management, so there is no web host.
 */
export abstract class BrnMenuHost {
	/** Resolves once the menu closed, after the chosen item's `select()` ran. */
	public abstract open(request: BrnMenuRequest): Promise<void>;
	/** The text an item element shows. CDK reads `textContent`, which a renderer without a DOM may not have. */
	public abstract textOf(element: unknown): string;
	/** The child elements of a rendered element, in order. */
	public abstract childrenOf(element: unknown): readonly unknown[];
}

/** A rendered CDK menu as platform menu items, with its submenus rendered too. `destroy` removes the submenus. */
export interface CdkMenuItems {
	readonly items: BrnMenuItem[];
	readonly destroy: () => void;
}

/**
 * The items of a rendered CDK menu, in order. Separators, labels and groups start sections; a submenu trigger becomes
 * an item holding the submenu's items, rendered from its template.
 */
export function cdkMenuItems(menu: Menu | undefined, host: BrnMenuHost): CdkMenuItems {
	const views: EmbeddedViewRef<unknown>[] = [];
	const items = menuItems(menu, host, views);
	return { items, destroy: () => views.forEach((view) => view.destroy()) };
}

function menuItems(menu: Menu | undefined, host: BrnMenuHost, views: EmbeddedViewRef<unknown>[]): BrnMenuItem[] {
	if (!(menu instanceof CdkMenuBase)) return [];
	const byElement = new Map<unknown, CdkMenuItem>(menu.items.map((item) => [item._elementRef.nativeElement, item]));
	const items: BrnMenuItem[] = [];
	let startsSection = false;
	let sectionLabel: string | undefined;
	let sectionLabelSeparated = false;

	const walk = (element: unknown): void => {
		for (const child of host.childrenOf(element)) {
			const item = byElement.get(child);
			if (item) {
				items.push({
					...menuItem(item, host, views),
					startsSection: (startsSection || sectionLabel !== undefined) && items.length > 0,
					sectionLabel,
					sectionLabelSeparated: sectionLabel !== undefined && sectionLabelSeparated,
				});
				startsSection = false;
				sectionLabel = undefined;
				sectionLabelSeparated = false;
				continue;
			}
			const slot = String(elementAttribute(child, 'data-slot') ?? '');
			if (slot.endsWith('-separator')) {
				if (sectionLabel !== undefined) sectionLabelSeparated = true;
				else startsSection = true;
			} else if (slot.endsWith('-label')) {
				sectionLabel = host.textOf(child);
			} else if (slot.endsWith('-group')) {
				startsSection = true;
				walk(child);
				startsSection = true;
			} else {
				walk(child);
			}
		}
	};
	walk(menu.nativeElement);
	return items;
}

function menuItem(item: CdkMenuItem, host: BrnMenuHost, views: EmbeddedViewRef<unknown>[]): BrnMenuItem {
	const element = item._elementRef.nativeElement;
	const shortcutElement = findBySlotSuffix(element, '-shortcut', host);
	const shortcut = shortcutElement === undefined ? undefined : host.textOf(shortcutElement) || undefined;
	return {
		label: withoutSuffix(item.typeaheadLabel || host.textOf(element), shortcut),
		disabled: item.disabled,
		destructive: elementAttribute(element, 'data-variant') === 'destructive',
		checked: item instanceof CdkMenuItemSelectable ? item.checked : undefined,
		shortcut,
		items: item.hasMenu ? submenuItems(item, host, views) : undefined,
		select: () => item.trigger(),
	};
}

/** Renders a submenu trigger's template under its injector, where the submenu registers with the trigger. */
function submenuItems(item: CdkMenuItem, host: BrnMenuHost, views: EmbeddedViewRef<unknown>[]): BrnMenuItem[] {
	const trigger = item.getMenuTrigger();
	const template = trigger?.menuTemplateRef;
	if (!trigger || !template) return [];
	const view = template.createEmbeddedView({ $implicit: trigger.menuData }, trigger.injector);
	view.detectChanges();
	views.push(view);
	return menuItems(trigger.getMenu(), host, views);
}

function findBySlotSuffix(element: unknown, suffix: string, host: BrnMenuHost): unknown {
	for (const child of host.childrenOf(element)) {
		if (String(elementAttribute(child, 'data-slot') ?? '').endsWith(suffix)) return child;
		const found = findBySlotSuffix(child, suffix, host);
		if (found !== undefined) return found;
	}
	return undefined;
}

function withoutSuffix(text: string, suffix: string | undefined): string {
	return suffix && text.endsWith(suffix) ? text.slice(0, -suffix.length).trim() : text;
}

/** Renderers without a DOM (NativeScript) store attributes as properties of the element. */
function elementAttribute(element: unknown, name: string): unknown {
	const dom = element as { getAttribute?: (name: string) => string | null };
	return typeof dom.getAttribute === 'function' ? dom.getAttribute(name) : (element as Record<string, unknown>)[name];
}
