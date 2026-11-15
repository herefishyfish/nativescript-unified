import { ChangeDetectionStrategy, Component, inject, Injectable, NO_ERRORS_SCHEMA, type ViewContainerRef } from '@angular/core';
import { ModalDialogParams, ModalDialogService } from '@nativescript/angular';
import {
	type HlmPickerHost,
	HlmPickerPanel,
	HlmPickerPanelRef,
	type HlmPickerRequest,
	type HlmPickerResult,
} from '@spartan-ng/helm/picker';
import { themeClasses } from './overlay-host';

/**
 * The picker's panel as a full-screen screen, as a GridLayout around the helm panel. A modal window is not under the
 * page, so its root carries the theme scope the page would have given it. The `-page` selector keeps MasonKit's
 * component host transparent (installMasonKit's passthrough in main.ts), so the GridLayout is the window's root.
 */
@Component({
	selector: 'native-picker-page',
	imports: [HlmPickerPanel],
	schemas: [NO_ERRORS_SCHEMA],
	providers: [
		{
			provide: HlmPickerPanelRef,
			useFactory: (params: ModalDialogParams): HlmPickerPanelRef => ({
				request: params.context as HlmPickerRequest,
				close: (result) => params.closeCallback(result),
			}),
			deps: [ModalDialogParams],
		},
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<!-- A core layout fills the modal window and, with androidOverflowEdge="none", keeps clear of the system bars. -->
		<GridLayout [class]="theme" class="bg-background" androidOverflowEdge="none">
			<div class="text-foreground flex size-full flex-col px-4 pt-4 pb-6">
				<hlm-picker-panel fullscreen />
			</div>
		</GridLayout>
	`,
})
class NativePickerScreen {
	protected readonly theme = themeClasses().join(' ');
}

/** Shows the picker's panel full screen with ModalDialogService; the Android back button cancels it. */
@Injectable({ providedIn: 'root' })
export class NativeScriptPickerHost implements HlmPickerHost {
	private readonly _modal = inject(ModalDialogService);

	public open(request: HlmPickerRequest, viewContainerRef: ViewContainerRef): Promise<HlmPickerResult | undefined> {
		return this._modal.showModal(NativePickerScreen, {
			viewContainerRef,
			context: request,
			fullscreen: true,
			animated: true,
		});
	}
}
