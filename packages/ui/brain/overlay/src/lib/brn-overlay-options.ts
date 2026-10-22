import type { Direction } from '@angular/cdk/bidi';
import type {
	ConnectedPosition,
	FlexibleConnectedPositionStrategyOrigin,
	PositionStrategy,
	ScrollStrategy,
} from '@angular/cdk/overlay';
import type { StaticProvider } from '@angular/core';
import type { BrnOverlayPlacement } from '@spartan-ng/brain/core';

export type BrnOverlayOptions = {
	attachPositions: ConnectedPosition[];
	attachTo: FlexibleConnectedPositionStrategyOrigin | null | undefined;
	/** Move focus to the first tabbable element inside the overlay when it opens. */
	autoFocus: boolean;
	backdropClass: string | string[];
	closeOnOutsidePointerEvents: boolean;
	direction?: Direction;
	disableClose: boolean;
	hasBackdrop: boolean;
	id: string;
	panelClass: string | string[];
	/** Where the overlay sits. Defaults to anchored at `attachTo` when it has `attachPositions`, else centered. */
	placement?: BrnOverlayPlacement;
	/** Web only: replaces the CDK position strategy derived from `placement`. */
	positionStrategy: PositionStrategy | null | undefined;
	providers?: StaticProvider[] | (() => StaticProvider[]);
	role: string | null;
	/** Web only. */
	scrollStrategy: ScrollStrategy | 'close' | 'reposition' | null | undefined;
};
