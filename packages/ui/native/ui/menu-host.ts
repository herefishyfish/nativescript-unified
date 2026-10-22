import { Injectable } from '@angular/core';
import { type MenuPlacement, showMenu } from '@nativescript-community/ui-menu';
import { type View, ViewBase } from '@nativescript/core';
import type { BrnMenuHost, BrnMenuRequest } from '@spartan-ng/brain/core';

/** Shows helm's dropdown menus as platform menus: a Material 3 popup menu on Android, a UIMenu on iOS. */
@Injectable({ providedIn: 'root' })
export class NativeScriptMenuHost implements BrnMenuHost {
	public async open(request: BrnMenuRequest): Promise<void> {
		const chosen = await showMenu({
			anchor: request.anchor as View,
			placement: menuPlacement(request),
			items: request.items.map((item, index) => ({
				id: index,
				title: item.label,
				disabled: item.disabled,
				destructive: item.destructive,
				checked: item.checked,
			})),
		});
		if (chosen) request.items[chosen.id as number].select();
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
