import { showMenu } from '@nativescript-community/ui-menu';
import { CSSType, type EventData, type View, type ViewBase } from '@nativescript/core';
import { P, Span } from '@triniwiz/nativescript-masonkit/web';

/** MasonKit's element typings omit the View API their classes inherit at run time. */
const asView = (element: object): View => element as unknown as View;

/**
 * `<select>` for helm's native select and plain markup: a box that shows the chosen `<option>`'s text and, on tap,
 * the platform menu of its options. Choosing one sets `value` and fires `change` with the select as `target`, as the
 * web does, so `(change)="… $event.target.value"` reads it.
 */
@CSSType('select')
export class SelectElement extends P {
	#value: string | undefined;
	disabled = false;

	#listening = false;

	constructor() {
		super();
		asView(this).on('loaded', () => {
			this.refresh();
			// MasonKit wires a native click listener only once the view exists, so a constructor listener never fires.
			if (this.#listening) return;
			this.#listening = true;
			asView(this).on('tap', () => void this.#choose());
		});
	}

	/** As on the web, a value that matches no option (helm binds `''` until one is chosen) selects the first. */
	get value(): string {
		const options = this.#options();
		return options.find((option) => option.value === this.#value)?.value ?? options[0]?.value ?? '';
	}
	set value(value: string | null | undefined) {
		this.#value = value ?? undefined;
		this.refresh();
	}

	/** Shows the chosen option's text only, as a closed web select does. */
	refresh(): void {
		const value = this.value;
		for (const option of this.#options()) {
			const chosen = option.value === value;
			asView(option).style.display = chosen ? 'inline' : 'none';
			asView(option).visibility = chosen ? 'visible' : 'collapse';
		}
	}

	#options(): OptionElement[] {
		const options: OptionElement[] = [];
		asView(this).eachChild((child) => {
			if (child instanceof OptionElement) options.push(child);
			return true;
		});
		return options;
	}

	async #choose(): Promise<void> {
		if (this.disabled) return;
		const value = this.value;
		const chosen = await showMenu({
			anchor: themedAnchor(asView(this)),
			items: this.#options().map((option) => ({
				id: option.value,
				title: option.label,
				checked: option.value === value,
				disabled: option.disabled,
			})),
		});
		if (chosen === undefined || chosen.id === value) return;
		this.value = String(chosen.id);
		asView(this).notify({ eventName: 'change', object: asView(this), target: this } as unknown as EventData);
	}
}

/** `<option>`: its text is the label, and `value` defaults to the text, as on the web. */
@CSSType('option')
export class OptionElement extends Span {
	#value: string | undefined;
	disabled = false;

	get value(): string {
		return this.#value ?? this.label;
	}
	set value(value: string | null | undefined) {
		this.#value = value ?? undefined;
		const parent = asView(this).parent;
		if (parent instanceof SelectElement) parent.refresh();
	}

	get label(): string {
		return textOf(asView(this)).trim();
	}
}

/**
 * The view to open the platform menu from. MasonKit creates text elements and component hosts with a themeless
 * context, from which Android cannot inflate a popup menu, so the menu anchors on the nearest ancestor whose context
 * is the activity.
 */
function themedAnchor(view: View): View {
	if (!__ANDROID__) return view;
	for (let current: View | undefined = view; current; current = current.parent as View | undefined) {
		if (current.nativeViewProtected?.getContext?.() instanceof android.app.Activity) return current;
	}
	return view;
}

function textOf(view: ViewBase): string {
	const own: unknown = (view as unknown as { text?: unknown }).text;
	let text = typeof own === 'string' ? own : '';
	view.eachChild((child) => {
		text += textOf(child);
		return true;
	});
	return text;
}
