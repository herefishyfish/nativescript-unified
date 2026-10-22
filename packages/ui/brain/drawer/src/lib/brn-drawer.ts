import { Directive, forwardRef, input, linkedSignal } from '@angular/core';
import type { BrnOverlayPlacement } from '@spartan-ng/brain/core';
import { BrnDialog } from '@spartan-ng/brain/dialog';

@Directive({
	selector: '[brnDrawer],brn-drawer',
	exportAs: 'brnDrawer',
	providers: [
		{
			provide: BrnDialog,
			useExisting: forwardRef(() => BrnDrawer),
		},
	],
})
export class BrnDrawer extends BrnDialog {
	public readonly directionInput = input<'bottom' | 'top' | 'left' | 'right'>('bottom', { alias: 'direction' });
	public readonly direction = linkedSignal(this.directionInput);

	protected override getPlacement(): BrnOverlayPlacement {
		return { kind: 'edge', side: this.direction() };
	}
}
