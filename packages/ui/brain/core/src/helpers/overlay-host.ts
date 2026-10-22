import type { Direction } from '@angular/cdk/bidi';
import type {
	ConnectedPosition,
	FlexibleConnectedPositionStrategyOrigin,
	PositionStrategy,
	ScrollStrategy,
} from '@angular/cdk/overlay';
import type { StaticProvider, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import type { Observable } from 'rxjs';

export type BrnOverlayEdge = 'top' | 'right' | 'bottom' | 'left';

/** Where an overlay sits, independent of the platform that draws it. */
export type BrnOverlayPlacement =
	| { readonly kind: 'center' }
	| { readonly kind: 'edge'; readonly side: BrnOverlayEdge }
	| {
			readonly kind: 'anchored';
			readonly origin: FlexibleConnectedPositionStrategyOrigin;
			/** Candidate positions relative to the origin, in order of preference. */
			readonly positions: readonly ConnectedPosition[];
			/** Whether the overlay may be shifted to stay on screen when no position fits. */
			readonly push: boolean;
	  };

/** An explicit placement, else anchored at `attachTo` when it has positions, else centered. */
export function resolveOverlayPlacement(options: {
	readonly placement?: BrnOverlayPlacement;
	readonly attachTo: FlexibleConnectedPositionStrategyOrigin | null | undefined;
	readonly attachPositions: readonly ConnectedPosition[];
}): BrnOverlayPlacement {
	if (options.placement) return options.placement;
	return options.attachTo && options.attachPositions.length
		? { kind: 'anchored', origin: options.attachTo, positions: options.attachPositions, push: true }
		: { kind: 'center' };
}

export type BrnDismissReason = 'backdrop' | 'escape' | 'outside';

/** A user gesture asking an overlay to close. The Android back button is reported as `escape`. */
export interface BrnOverlayDismissal {
	readonly reason: BrnDismissReason;
	/** Tells the platform the overlay closed for this gesture, so it stops handling it (web: Escape's default). */
	readonly accept: () => void;
}

/** One open overlay window, as a platform host draws it. */
export abstract class BrnOverlaySurface {
	public abstract readonly dismissals: Observable<BrnOverlayDismissal>;
	/** Emits when the platform closed the window on its own (a dragged-down sheet, a cancelled native popover). */
	public abstract readonly detached: Observable<void>;
	public abstract setState(state: 'open' | 'closed'): void;
	/** Replaces the classes previously set through this method (or the request's) on the overlay panel. */
	public abstract setPanelClass(classes: readonly string[]): void;
	public abstract setBackdropClass(classes: readonly string[]): void;
	public abstract setAriaDescribedBy(id: string | undefined): void;
	public abstract updatePosition(): void;
	/**
	 * Call before the overlay switches to its closed state. The returned function, called after the next render,
	 * resolves once the exit animations that started in between have finished.
	 */
	public abstract prepareExit(): () => Promise<void>;
	public abstract dispose(result?: unknown): void;
}

/** What a platform host needs to open one overlay window. */
export interface BrnOverlayRequest<Context = unknown> {
	readonly id: string;
	readonly content: Type<unknown> | TemplateRef<unknown>;
	readonly viewContainerRef: ViewContainerRef | undefined;
	/** The `$implicit` template context, also provided as the overlay's data. */
	readonly context: Context;
	/** Providers for the content's injector; receives the surface so a ref can wrap it before content renders. */
	readonly providers: (surface: BrnOverlaySurface) => StaticProvider[];
	readonly placement: BrnOverlayPlacement;
	readonly hasBackdrop: boolean;
	readonly panelClass: readonly string[];
	readonly backdropClass: readonly string[];
	readonly direction: Direction | undefined;
	readonly closeOnOutsidePointerEvents: boolean;
	readonly disableClose: boolean;
	/** Web only: replaces the position strategy derived from `placement`. */
	readonly positionStrategy: PositionStrategy | null | undefined;
	/** Web only. */
	readonly scrollStrategy: ScrollStrategy | 'close' | 'reposition' | null | undefined;
}
