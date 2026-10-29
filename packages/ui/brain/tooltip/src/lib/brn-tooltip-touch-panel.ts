import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BRN_OVERLAY_DATA } from '@spartan-ng/brain/overlay';
import type { ClassValue } from 'clsx';
import type { BrnTooltipPosition } from './brn-tooltip-position';
import { BrnTooltipStringTemplateOutlet } from './brn-tooltip-string-template-outlet';
import type { BrnTooltipType } from './brn-tooltip-type';

export interface BrnTooltipTouchData {
	readonly text: BrnTooltipType;
	readonly position: BrnTooltipPosition;
	readonly classes: ClassValue;
}

/**
 * The tooltip a tap or long press opens where there is no DOM (NativeScript), through the overlay host's anchored
 * window. It has the content's classes and text but no arrow, which the web content draws as an inline SVG.
 */
@Component({
	selector: 'brn-tooltip-touch-panel',
	imports: [BrnTooltipStringTemplateOutlet],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'[class]': 'data.classes',
		'[attr.data-side]': 'data.position',
		'data-state': 'open',
		role: 'tooltip',
	},
	template: `<ng-container *brnTooltipStringTemplateOutlet="data.text">{{ data.text }}</ng-container>`,
})
export class BrnTooltipTouchPanel {
	protected readonly data = inject<BrnTooltipTouchData>(BRN_OVERLAY_DATA);
}
