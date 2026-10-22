import { Directive, forwardRef, input, linkedSignal } from '@angular/core';
import type { BrnOverlayPlacement } from '@spartan-ng/brain/core';
import { BrnDialog } from '@spartan-ng/brain/dialog';

@Directive({
	selector: '[brnSheet],brn-sheet',
	exportAs: 'brnSheet',
	providers: [
		{
			provide: BrnDialog,
			useExisting: forwardRef(() => BrnSheet),
		},
	],
})
export class BrnSheet extends BrnDialog {
	/** Specifies the side of the screen where the sheet will appear. */
	public readonly side = input<'top' | 'bottom' | 'left' | 'right'>('top');
	public readonly sideState = linkedSignal(this.side);

	protected override getPlacement(): BrnOverlayPlacement {
		return { kind: 'edge', side: this.sideState() };
	}
}
