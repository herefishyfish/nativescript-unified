import type { Direction } from '@angular/cdk/bidi';
import type { AutoFocusTarget, RestoreFocusValue } from '@angular/cdk/dialog';
import type {
	ConnectedPosition,
	FlexibleConnectedPositionStrategyOrigin,
	PositionStrategy,
	ScrollStrategy,
} from '@angular/cdk/overlay';
import type { StaticProvider } from '@angular/core';
import type { BrnOverlayPlacement } from '@spartan-ng/brain/core';

export type BrnDialogOptions = {
	ariaDescribedBy: string | null | undefined;
	ariaLabel: string | null | undefined;
	ariaLabelledBy: string | null | undefined;
	ariaModal: boolean;
	attachPositions: ConnectedPosition[];
	attachTo: FlexibleConnectedPositionStrategyOrigin | null | undefined;
	autoFocus: boolean | AutoFocusTarget | (Record<never, never> & string);
	backdropClass: string | string[];
	direction?: Direction;
	closeOnOutsidePointerEvents: boolean;
	disableClose: boolean;
	hasBackdrop: boolean;
	id: string;
	panelClass: string | string[];
	/** Where the overlay sits. Defaults to anchored at `attachTo` when it has `attachPositions`, else centered. */
	placement?: BrnOverlayPlacement;
	/** Web only: replaces the CDK position strategy derived from `placement`. */
	positionStrategy: PositionStrategy | null | undefined;
	providers?: StaticProvider[] | (() => StaticProvider[]);
	restoreFocus: RestoreFocusValue;
	role: 'dialog' | 'alertdialog';
	/** Web only. */
	scrollStrategy: ScrollStrategy | 'close' | 'reposition' | null | undefined;
};
