import { inject, Injectable, type ViewContainerRef } from '@angular/core';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmPickerPanel } from './hlm-picker-panel';
import { HlmPickerPanelRef } from './hlm-picker-panel-ref';
import type { HlmPickerRequest, HlmPickerResult } from './hlm-picker.types';

/** The web default for HlmPickerHost: the panel in a dialog, opened with HlmDialogService. */
@Injectable({ providedIn: 'root' })
export class HlmPickerDialogHost implements HlmPickerHost {
	private readonly _dialog = inject(HlmDialogService);

	public open(request: HlmPickerRequest): Promise<HlmPickerResult | undefined> {
		return new Promise((resolve) => {
			this._dialog
				.open<HlmPickerResult>(HlmPickerPanel, {
					showCloseButton: false,
					ariaLabel: request.title,
					ariaLabelledBy: null,
					providers: [
						{
							provide: HlmPickerPanelRef,
							useFactory: (dialogRef: BrnDialogRef<HlmPickerResult>): HlmPickerPanelRef => ({
								request,
								close: (result) => dialogRef.close(result),
							}),
							deps: [BrnDialogRef],
						},
					],
				})
				.closed$.subscribe(resolve);
		});
	}
}

/**
 * Platform port that shows the picker's panel and resolves with how it closed, `undefined` for a cancel. The web
 * default opens it in a dialog; an app replaces it at the root, as the native app does with a full-screen modal.
 */
@Injectable({ providedIn: 'root', useExisting: HlmPickerDialogHost })
export abstract class HlmPickerHost {
	public abstract open(request: HlmPickerRequest, viewContainerRef: ViewContainerRef): Promise<HlmPickerResult | undefined>;
}
