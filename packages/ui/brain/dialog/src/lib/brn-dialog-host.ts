import type { AutoFocusTarget, RestoreFocusValue } from '@angular/cdk/dialog';
import { Injectable } from '@angular/core';
import type { BrnOverlayRequest, BrnOverlaySurface } from '@spartan-ng/brain/core';
import { CdkDialogHost } from './cdk-dialog-host';

export interface BrnDialogRequest<Context = unknown> extends BrnOverlayRequest<Context> {
	readonly role: 'dialog' | 'alertdialog';
	readonly ariaLabel: string | null | undefined;
	readonly ariaLabelledBy: string | null | undefined;
	readonly ariaDescribedBy: string | null | undefined;
	readonly ariaModal: boolean;
	readonly autoFocus: boolean | AutoFocusTarget | (Record<never, never> & string);
	readonly restoreFocus: RestoreFocusValue;
}

/** Platform port that opens modal dialog windows. The web default draws them with the CDK Dialog. */
@Injectable({ providedIn: 'root', useExisting: CdkDialogHost })
export abstract class BrnDialogHost {
	public abstract open(request: BrnDialogRequest): BrnOverlaySurface;
}
