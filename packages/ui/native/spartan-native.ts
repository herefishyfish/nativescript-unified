import { Platform } from '@angular/cdk/platform';
import { DOCUMENT, IMAGE_CONFIG } from '@angular/common';
import {
	type EnvironmentProviders,
	inject,
	makeEnvironmentProviders,
	provideEnvironmentInitializer,
} from '@angular/core';
import { registerElement } from '@nativescript/angular';
import { Canvas } from '@nativescript/canvas';
import { CSSType, ViewBase } from '@nativescript/core';
import { masonMeta } from '@triniwiz/nativescript-masonkit/angular';
import { Div, Span } from '@triniwiz/nativescript-masonkit/web';
import { OptionElement, SelectElement } from './select-element';
import { BrnMenuHost } from '@spartan-ng/brain/core';
import { BrnDialogHost } from '@spartan-ng/brain/dialog';
import { BrnOverlayHost } from '@spartan-ng/brain/overlay';
import { NativeScriptMenuHost } from './ui/menu-host';
import { NativeScriptOverlayHost } from './ui/overlay-host';

/**
 * CDK reads `isBrowser` from PLATFORM_ID, which NativeScript reports as 'browser', and then reaches for `window`
 * and `document` listeners (FocusMonitor, InputModalityDetector, ...). Reporting no browser sends every CDK
 * service down the path it takes on the server. Built without CDK's constructor, whose field initializers read
 * `navigator`.
 */
function nativePlatform(): Platform {
	return Object.assign(Object.create(Platform.prototype) as Platform, {
		isBrowser: false,
		EDGE: false,
		TRIDENT: false,
		BLINK: false,
		WEBKIT: false,
		IOS: false,
		FIREFOX: false,
		ANDROID: false,
		SAFARI: false,
	});
}

/** Providers spartan's helm and brain libraries need to run on NativeScript views. */
export function provideSpartanNativeScript(): EnvironmentProviders {
	return makeEnvironmentProviders([
		{ provide: Platform, useFactory: nativePlatform },
		// CDK Dialog and Overlay build their panes under document.body, which NativeScript does not have.
		{ provide: BrnDialogHost, useExisting: NativeScriptOverlayHost },
		{ provide: BrnOverlayHost, useExisting: NativeScriptOverlayHost },
		// CDK's menu trigger opens an overlay pane under document.body too.
		{ provide: BrnMenuHost, useExisting: NativeScriptMenuHost },
		provideEnvironmentInitializer(() => {
			// brain looks labels up with document.querySelector; NativeScript's DOCUMENT has no queries.
			const document = inject(DOCUMENT) as Partial<Document>;
			document.querySelector ??= () => null;
			document.querySelectorAll ??= () => [] as unknown as NodeListOf<Element>;
			// The drawer's drag handle removes its document pointer listeners when it is destroyed.
			document.addEventListener ??= () => undefined;
			document.removeEventListener ??= () => undefined;
			// CDK's menu directives set `role` and `type` through the element API. NativeScript's renderer stores
			// attributes as view properties, so these read and write the same place.
			const element = ViewBase.prototype as unknown as Partial<Element> & Record<string, unknown>;
			element.setAttribute ??= function (this: Record<string, unknown>, name: string, value: string) {
				this[name] = value;
			};
			element.getAttribute ??= function (this: Record<string, unknown>, name: string) {
				return (this[name] as string | undefined) ?? null;
			};
			element.removeAttribute ??= function (this: Record<string, unknown>, name: string) {
				this[name] = undefined;
			};
			// Brain keeps the active option in view with scrollIntoView, guarded by isPlatformBrowser, which is true
			// here. Native lists scroll themselves, so it does nothing.
			element.scrollIntoView ??= () => undefined;
		}),
		// Angular's dev-mode image checks read the DOM document, which NativeScript does not have.
		{ provide: IMAGE_CONFIG, useValue: { disableImageSizeWarning: true, disableImageLazyLoadWarning: true } },
	]);
}

const BLOCK_TAGS = ['button', 'a', 'li', 'kbd', 'label', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
const TABLE_TAGS = ['table', 'caption', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td'];
// Elements whose content is text: the icon glyph, and the value hosts brain fills through `textContent`, which a
// block box does not draw.
const TEXT_TAGS = ['ng-icon', 'hlm-select-value', 'hlm-combobox-value'];

/**
 * Element mappings spartan's markup needs on MasonKit. Call after installMasonKit(), before bootstrap.
 *
 * MasonKit lays out `button`, `a`, `li`, `kbd`, `label` and headings as inline text runs that ignore flex and cannot
 * hold block children, but spartan styles them as flex boxes (buttons and links with icons and gaps, list items, key
 * caps, labels around a control, the accordion's heading around its trigger), so they are backed by a block element.
 * Each keeps its own tag as its CSS type, so type selectors (`h1`, `.markdown li`, `a`) match as they do on the web.
 * MasonKit has no table elements, so helm's table and calendar markup gets block-backed `table`, `tr`, `td` and the
 * rest; native-overrides.css lays a row's cells out side by side. `select` shows the chosen `option` and opens the
 * platform menu of the options (select-element.ts).
 * The @ng-icons/core shim draws a glyph, so `ng-icon` is text that can also sit inside helm's text elements.
 * The @tanstack/angular-charts shim paints into a `Canvas`.
 */
export function registerSpartanNativeElements(): void {
	for (const tag of [...BLOCK_TAGS, ...TABLE_TAGS]) {
		@CSSType(tag)
		class Block extends Div {}
		registerElement(tag, () => Block, masonMeta);
	}
	registerElement('select', () => SelectElement, masonMeta);
	registerElement('option', () => OptionElement, masonMeta);
	for (const tag of TEXT_TAGS) registerElement(tag, () => Span, masonMeta);
	registerElement('Canvas', () => Canvas);
}
