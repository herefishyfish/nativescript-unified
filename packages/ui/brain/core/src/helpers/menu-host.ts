import { CdkMenuBase, CdkMenuItemSelectable, type Menu } from '@angular/cdk/menu';
import type { MenuAlign, MenuSide } from './menu-align';

/** One choice of a platform menu. */
export interface BrnMenuItem {
	readonly label: string;
	readonly disabled: boolean;
	readonly destructive: boolean;
	/** Set for checkbox and radio items. */
	readonly checked?: boolean;
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
}

/** The items of a rendered CDK menu, in order. Submenus, labels and separators have no item. */
export function cdkMenuItems(menu: Menu | undefined, host: BrnMenuHost): BrnMenuItem[] {
	if (!(menu instanceof CdkMenuBase)) return [];
	return menu.items
		.filter((item) => !item.hasMenu)
		.map((item) => ({
			label: item.typeaheadLabel || host.textOf(item._elementRef.nativeElement),
			disabled: item.disabled,
			destructive: elementAttribute(item._elementRef.nativeElement, 'data-variant') === 'destructive',
			checked: item instanceof CdkMenuItemSelectable ? item.checked : undefined,
			select: () => item.trigger(),
		}));
}

/** Renderers without a DOM (NativeScript) store attributes as properties of the element. */
function elementAttribute(element: unknown, name: string): unknown {
	const dom = element as { getAttribute?: (name: string) => string | null };
	return typeof dom.getAttribute === 'function' ? dom.getAttribute(name) : (element as Record<string, unknown>)[name];
}
