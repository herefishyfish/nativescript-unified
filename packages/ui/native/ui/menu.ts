import '@nstudio/nativescript-menu';
import type { MenuAction } from '@nstudio/nativescript-menu';

/**
 * Adapts UIMenu-shaped options for nativescript-menu's Android controller, which has no inline groups (an unnamed
 * group renders as an "Untitled" submenu) and lists root items bottom-up. Inline groups are flattened into their
 * parent and the root pre-reversed so both platforms read top-down.
 */
export function nativeMenu<T>(options: MenuAction<T>[]): MenuAction<T>[] {
	if (!__ANDROID__) return options;
	return flatten(options).reverse();
}

function flatten<T>(options: MenuAction<T>[]): MenuAction<T>[] {
	return options.flatMap((option) =>
		option.childrenStyle === 'inline' && option.children
			? [...(option.name ? [{ name: option.name, disabled: true }] : []), ...flatten(option.children)]
			: [option.children ? { ...option, children: flatten(option.children) } : option],
	);
}
