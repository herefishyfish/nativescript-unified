import {
	booleanAttribute,
	inject,
	type Provider,
	type Renderer2,
	RendererFactory2,
	type RendererType2,
} from '@angular/core';
import { registerElement } from '@nativescript/angular';
import type { EditableTextBase, EventData, View } from '@nativescript/core';

/** A view a template tag can create. */
export type NativeElementClass = new () => View;

const registeredTags = new Map<NativeElementClass, string>();

/** A tag of its own that creates `view`, so a scope can use it while the web tag stays MasonKit's everywhere else. */
function tagFor(view: NativeElementClass): string {
	let tag = registeredTags.get(view);
	if (tag === undefined) {
		tag = `native-element-${registeredTags.size}`;
		registerElement(tag, () => view);
		registeredTags.set(view, tag);
	}
	return tag;
}

/**
 * Draws template tags with platform views in one part of the app, where MasonKit draws them everywhere else.
 *
 * Keys are tags (`input`, `textarea`, `button`), values the view each creates. Put the provider on the component that
 * hosts the part: components Angular creates below it through `ngComponentOutlet` or `createComponent` build those
 * tags with these views, all the way down. The host's own template keeps MasonKit. The adapters in this folder keep
 * the web contract the shared templates rely on, so `<input hlmInput [value] (input)>` works unchanged:
 *
 * ```ts
 * providers: [provideNativeElements({ input: NativeTextField, textarea: NativeTextView })]
 * ```
 *
 * Each adapter imports only its own package, so an app installs just the ones it maps.
 */
export function provideNativeElements(elements: Readonly<Record<string, NativeElementClass>>): Provider {
	const tags = new Map(Object.entries(elements).map(([tag, view]) => [tag, tagFor(view)]));
	return {
		provide: RendererFactory2,
		useFactory: () => scopedRendererFactory(inject(RendererFactory2, { skipSelf: true }), tags),
	};
}

/** `factory`, with every renderer creating each mapped tag under the tag of its native view. */
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
