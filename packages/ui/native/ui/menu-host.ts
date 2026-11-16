import { Injectable } from '@angular/core';
import { type MenuColors, type MenuItem, type MenuPlacement, setMenuColors, showMenu } from '@nativescript-community/ui-menu';
import { Color, type View, ViewBase } from '@nativescript/core';
import type { BrnMenuHost, BrnMenuItem, BrnMenuRequest } from '@spartan-ng/brain/core';

/** Shows helm's dropdown menus as platform menus: a popup drawn like helm's menu on Android, a UIMenu on iOS. */
@Injectable({ providedIn: 'root' })
export class NativeScriptMenuHost implements BrnMenuHost {
	public async open(request: BrnMenuRequest): Promise<void> {
		if (__ANDROID__) setMenuColors(menuColors(request.anchor as View));
		const chosen = await showMenu({
			anchor: request.anchor as View,
			placement: menuPlacement(request),
			items: menuItems(request.items),
		});
		(chosen?.['item'] as BrnMenuItem | undefined)?.select();
	}

	public textOf(element: unknown): string {
		return element instanceof ViewBase
			? masonText(element)
					// Icon fonts (the ng-icon glyphs) draw from the private use area; a menu title shows text only.
					.replace(/[-]/g, '')
					.replace(/\s+/g, ' ')
					.trim()
			: '';
	}

	public childrenOf(element: unknown): readonly unknown[] {
		const children: ViewBase[] = [];
		if (element instanceof ViewBase) {
			element.eachChild((child) => {
				children.push(child);
				return true;
			});
		}
		return children;
	}
}

/**
 * Helm's menu as platform menu items. A section starts with a separator; a platform menu has no headings, so a
 * section's label is a disabled item at its top. The shortcut text is the item's subtitle, which both platforms show
 * muted beside or below the title.
 */
function menuItems(items: readonly BrnMenuItem[]): MenuItem[] {
	return items.flatMap((item) => [
		...(item.startsSection ? [{ separator: true }] : []),
		...(item.sectionLabel ? [{ title: item.sectionLabel, disabled: true }] : []),
		...(item.sectionLabelSeparated ? [{ separator: true }] : []),
		{
			title: item.label,
			subtitle: item.shortcut,
			disabled: item.disabled,
			destructive: item.destructive,
			checked: item.checked,
			items: item.items && menuItems(item.items),
			item,
		},
	]);
}

/** A MasonKit element holds its text in `text`, beside its child elements. */
function masonText(view: ViewBase): string {
	const own: unknown = (view as unknown as { text?: unknown }).text;
	let text = typeof own === 'string' ? own : '';
	view.eachChild((child) => {
		text += masonText(child);
		return true;
	});
	return text;
}

/** The Android popup's colours: helm's tokens in scope at the trigger, read on every open so a theme change applies. */
const MENU_TOKENS: Record<keyof MenuColors, string> = {
	surface: '--popover',
	row: '--popover',
	selected: '--accent',
	onSelected: '--accent-foreground',
	onSurface: '--popover-foreground',
	onSurfaceVariant: '--muted-foreground',
	accent: '--primary',
	onAccent: '--primary-foreground',
	outline: '--border',
	error: '--destructive',
};

function menuColors(anchor: View): Partial<MenuColors> {
	const colors: Partial<MenuColors> = {};
	for (const [role, token] of Object.entries(MENU_TOKENS) as [keyof MenuColors, string][]) {
		const value = anchor.style.getCssVariable(token);
		// An unset or unparsable token keeps the Material theme's colour.
		if (value && Color.isValid(value)) colors[role] = argbHex(new Color(value));
	}
	return colors;
}

/** Android's Color.parseColor reads #AARRGGBB. */
function argbHex({ a, r, g, b }: Color): string {
	return `#${[a, r, g, b].map((part) => part.toString(16).padStart(2, '0')).join('')}`;
}

function menuPlacement({ side, align }: BrnMenuRequest): MenuPlacement {
	return {
		horizontal: align,
		vertical: side === 'top' ? 'above' : side === 'bottom' ? 'below' : 'auto',
	};
}
