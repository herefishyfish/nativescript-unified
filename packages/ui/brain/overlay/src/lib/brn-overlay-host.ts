import { Injectable } from '@angular/core';
import type { BrnOverlayRequest, BrnOverlaySurface } from '@spartan-ng/brain/core';
import { CdkOverlayHost } from './cdk-overlay-host';

export interface BrnOverlayHostRequest<Context = unknown> extends BrnOverlayRequest<Context> {
	readonly role: string | null;
	/** Move focus to the first tabbable element inside the overlay when it opens. */
	readonly autoFocus: boolean;
}

/** Platform port that opens anchored and non-modal overlays. The web default draws them with the CDK Overlay. */
@Injectable({ providedIn: 'root', useExisting: CdkOverlayHost })
export abstract class BrnOverlayHost {
	public abstract open(request: BrnOverlayHostRequest): BrnOverlaySurface;
}
