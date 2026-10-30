import { Injectable } from '@angular/core';
import { type MenuItem, type MenuPlacement, showMenu } from '@nativescript-community/ui-menu';
import { type View, ViewBase } from '@nativescript/core';
import type { BrnMenuHost, BrnMenuItem, BrnMenuRequest } from '@spartan-ng/brain/core';

/** Shows helm's dropdown menus as platform menus: a Material 3 popup menu on Android, a UIMenu on iOS. */
@Injectable({ providedIn: 'root' })
export class NativeScriptMenuHost implements BrnMenuHost {
	public async open(request: BrnMenuRequest): Promise<void> {
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

function menuPlacement({ side, align }: BrnMenuRequest): MenuPlacement {
	return {
		horizontal: align,
		vertical: side === 'top' ? 'above' : side === 'bottom' ? 'below' : 'auto',
	};
}
