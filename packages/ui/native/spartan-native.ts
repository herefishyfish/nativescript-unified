import { Platform } from '@angular/cdk/platform';
import { DOCUMENT, IMAGE_CONFIG } from '@angular/common';
import {
	type EnvironmentProviders,
	inject,
	makeEnvironmentProviders,
	provideEnvironmentInitializer,
} from '@angular/core';
import { registerElement } from '@nativescript/angular';
import { CSSType } from '@nativescript/core';
import { masonMeta } from '@triniwiz/nativescript-masonkit/angular';
import { Div, Span } from '@triniwiz/nativescript-masonkit/web';
import { BrnDialogHost } from '@spartan-ng/brain/dialog';
import { BrnOverlayHost } from '@spartan-ng/brain/overlay';
import { chartPainter } from './ui/chart-paint';
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
		provideEnvironmentInitializer(() => {
			// brain looks labels up with document.querySelector; NativeScript's DOCUMENT has no queries.
			const document = inject(DOCUMENT) as Partial<Document>;
			document.querySelector ??= () => null;
			document.querySelectorAll ??= () => [] as unknown as NodeListOf<Element>;
		}),
		// Angular's dev-mode image checks read the DOM document, which NativeScript does not have.
		{ provide: IMAGE_CONFIG, useValue: { disableImageSizeWarning: true, disableImageLazyLoadWarning: true } },
	]);
}

/**
 * Element mappings spartan's markup needs on MasonKit. Call after installMasonKit(), before bootstrap.
 *
 * MasonKit lays out `button`, `a`, `li`, `kbd`, `label` and headings as inline text runs that ignore flex and cannot
 * hold block children, but spartan styles them as flex boxes (buttons and links with icons and gaps, list items, key
 * caps, labels around a control, the accordion's heading around its trigger), so they are backed by a block element.
 * Each keeps its own tag as its CSS type, so type selectors (`h1`, `.markdown li`, `a`) match as they do on the web.
 * The @ng-icons/core shim draws a glyph, so `ng-icon` is text that can also sit inside helm's text elements.
 */
export function registerSpartanNativeElements(): void {
	for (const tag of ['button', 'a', 'li', 'kbd', 'label', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']) {
		@CSSType(tag)
		class Block extends Div {}
		registerElement(tag, () => Block, masonMeta);
	}
	registerElement('ng-icon', () => Span, masonMeta);
	chartPainter.register();
}
