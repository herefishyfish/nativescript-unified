import {
	booleanAttribute,
	inject,
	InjectionToken,
	type Provider,
	type Renderer2,
	RendererFactory2,
	type RendererType2,
} from '@angular/core';
import { getViewClass, getViewMeta, registerElement } from '@nativescript/angular';
import type { EditableTextBase, EventData, View } from '@nativescript/core';

/** A view a template tag can create. */
export type NativeElementClass = new () => View;

/** Each tag registerNativeElements() took over, and the tag MasonKit's view for it stays reachable under. */
const masonTags = new Map<string, string>();

/**
 * Makes template tags create platform views across the app, in place of the MasonKit views `installMasonKit()`
 * registered for them. Call after `installMasonKit()`, before bootstrap.
 *
 * Keys are tags (`input`, `textarea`), values the view each creates. The adapters in this folder keep the web contract
 * the shared templates rely on, so `<input hlmInput [value] (input)>` works unchanged:
 *
 * ```ts
 * registerNativeElements({ input: NativeTextField, textarea: NativeTextView });
 * ```
 *
 * Each adapter imports only its own package, so an app installs just the ones it maps. MasonKit's views stay
 * reachable through provideMasonElements().
 */
export function registerNativeElements(elements: Readonly<Record<string, NativeElementClass>>): void {
	for (const [tag, view] of Object.entries(elements)) {
		if (!masonTags.has(tag)) {
			const masonTag = `mason-${tag}`;
			const masonView = getViewClass(tag);
			registerElement(masonTag, () => masonView, getViewMeta(tag));
			masonTags.set(tag, masonTag);
		}
		registerElement(tag, () => view);
	}
}

/** True below a provideMasonElements() scope, where the helm shims draw spartan's MasonKit components. */
export const MASON_ELEMENTS = new InjectionToken<boolean>('MASON_ELEMENTS', { factory: () => false });

/**
 * Draws one part of the app with MasonKit where the rest draws platform widgets: the tags registerNativeElements()
 * took over create MasonKit's views again, and helm's switch, checkbox and slider render spartan's components.
 *
 * Put it on the component that hosts the part: components Angular creates below it through `ngComponentOutlet` or
 * `createComponent` build those tags with MasonKit, all the way down. The host's own template keeps the platform views.
 */
export function provideMasonElements(): Provider[] {
	return [
		{
			provide: RendererFactory2,
			useFactory: () => scopedRendererFactory(inject(RendererFactory2, { skipSelf: true }), masonTags),
		},
		{ provide: MASON_ELEMENTS, useValue: true },
	];
}

/** `factory`, with every renderer creating each tag in `tags` under the tag it maps to. */
function scopedRendererFactory(factory: RendererFactory2, tags: ReadonlyMap<string, string>): RendererFactory2 {
	const scoped = new WeakMap<Renderer2, Renderer2>();
	return Object.assign(Object.create(factory) as RendererFactory2, {
		createRenderer(host: unknown, type: RendererType2 | null): Renderer2 {
			const renderer = factory.createRenderer(host, type);
			let wrapped = scoped.get(renderer);
			if (wrapped === undefined) {
				wrapped = Object.assign(Object.create(renderer) as Renderer2, {
					createElement: (name: string, namespace?: string | null) =>
						renderer.createElement(tags.get(name) ?? name, namespace),
				});
				scoped.set(renderer, wrapped);
			}
			return wrapped;
		},
	});
}

/**
 * What `<input>` and `<textarea>` markup sets and listens to, on a core text view: `value`, `placeholder`, `disabled`
 * and an `input` event whose `target.value` is the text, as Angular's DefaultValueAccessor and `$event.target.value`
 * read it.
 */
export function webTextControl<T extends new (...args: any[]) => EditableTextBase>(Base: T) {
	return class WebTextControl extends Base {
		#writingValue = false;

		constructor(...args: any[]) {
			super(...args);
			// Core reports every text change; the web fires `input` for user edits only, not for `value` writes.
			this.on('textChange', () => {
				if (!this.#writingValue) {
					this.notify({ eventName: 'input', object: this, target: this, value: this.value } as EventData);
				}
			});
		}

		get value(): string {
			return this.text ?? '';
		}
		set value(value: string | null | undefined) {
			this.#writingValue = true;
			try {
				this.text = value ?? '';
			} finally {
				this.#writingValue = false;
			}
		}

		get placeholder(): string {
			return this.hint;
		}
		set placeholder(value: string) {
			this.hint = value;
		}

		get disabled(): boolean {
			return !this.isEnabled;
		}
		set disabled(value: unknown) {
			this.isEnabled = !booleanAttribute(value);
		}
	};
}
