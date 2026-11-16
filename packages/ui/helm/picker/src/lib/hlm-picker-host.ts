import { type ElementRef, inject, Injectable, type ViewContainerRef } from '@angular/core';
import { BrnOverlayService } from '@spartan-ng/brain/overlay';
import { HlmPickerPanel } from './hlm-picker-panel';
import { HlmPickerPanelRef } from './hlm-picker-panel-ref';
import type { HlmPickerRequest, HlmPickerResult } from './hlm-picker.types';

/**
 * The web default for HlmPickerHost: the panel drops down from the field, as helm's select does, and an outside
 * click or Escape closes it.
 */
@Injectable({ providedIn: 'root' })
export class HlmPickerDropdownHost implements HlmPickerHost {
	private readonly _overlay = inject(BrnOverlayService);

	public open(
		request: HlmPickerRequest,
		viewContainerRef: ViewContainerRef,
		change: (values: readonly string[]) => void,
	): Promise<HlmPickerResult | undefined> {
		const field = viewContainerRef.element as ElementRef<HTMLElement>;
		return new Promise((resolve) => {
			const overlayRef = this._overlay.open<unknown, HlmPickerResult>(HlmPickerPanel, viewContainerRef, undefined, {
				attachTo: field,
				attachPositions: [
					{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
					{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
				],
				scrollStrategy: 'reposition',
				closeOnOutsidePointerEvents: true,
				autoFocus: true,
				providers: () => [
					{
						provide: HlmPickerPanelRef,
						useValue: {
							request,
							dropdown: { width: field.nativeElement.getBoundingClientRect().width, change },
							close: (result?: HlmPickerResult) => overlayRef.close(result),
						} satisfies HlmPickerPanelRef,
					},
				],
			});
			overlayRef.closed$.subscribe(resolve);
		});
	}
}

/**
 * Platform port that shows the picker's panel and resolves with how it closed, `undefined` for a cancel. The web
 * default drops it down from the field; an app replaces it at the root, as the native app does with a full-screen
 * modal. `change` applies a multiple choice while the panel is open, for a host whose panel has no Done button.
 */
@Injectable({ providedIn: 'root', useExisting: HlmPickerDropdownHost })
export abstract class HlmPickerHost {
	public abstract open(
		request: HlmPickerRequest,
		viewContainerRef: ViewContainerRef,
		change: (values: readonly string[]) => void,
	): Promise<HlmPickerResult | undefined>;
}
