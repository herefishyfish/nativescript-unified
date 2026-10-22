import { Dialog, type DialogRef } from '@angular/cdk/dialog';
import {
	type FlexibleConnectedPositionStrategy,
	OverlayOutsideClickDispatcher,
	OverlayPositionBuilder,
	type OverlayRef,
	ScrollStrategyOptions,
} from '@angular/cdk/overlay';
import { ElementRef, inject, Injectable } from '@angular/core';
import {
	type BrnOverlayDismissal,
	BrnOverlaySurface,
	captureExitAnimations,
	cdkPositionStrategy,
	cdkScrollStrategy,
} from '@spartan-ng/brain/core';
import { merge, type Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import type { BrnDialogHost, BrnDialogRequest } from './brn-dialog-host';

/** The web dialog host: a CDK Dialog with its focus trap, aria wiring and backdrop. */
@Injectable({ providedIn: 'root' })
export class CdkDialogHost implements BrnDialogHost {
	private readonly _dialog = inject(Dialog);
	private readonly _overlayCloseDispatcher = inject(OverlayOutsideClickDispatcher);
	private readonly _positionBuilder = inject(OverlayPositionBuilder);
	private readonly _scrollStrategies = inject(ScrollStrategyOptions);

	public open(request: BrnDialogRequest): BrnOverlaySurface {
		let surface!: CdkDialogSurface;
		this._dialog.open(request.content, {
			id: request.id,
			role: request.role,
			viewContainerRef: request.viewContainerRef,
			templateContext: () => ({ $implicit: request.context }),
			data: request.context,
			direction: request.direction,
			hasBackdrop: request.hasBackdrop,
			panelClass: [...request.panelClass],
			backdropClass: [...request.backdropClass],
			positionStrategy: cdkPositionStrategy(this._positionBuilder, request),
			scrollStrategy: cdkScrollStrategy(this._scrollStrategies, request),
			restoreFocus: request.restoreFocus,
			disableClose: true,
			autoFocus: request.autoFocus,
			ariaDescribedBy: request.ariaDescribedBy,
			ariaLabelledBy: request.ariaLabelledBy,
			ariaLabel: request.ariaLabel,
			ariaModal: request.ariaModal,
			providers: (dialogRef) => {
				surface = new CdkDialogSurface(dialogRef, request, this._dismissals(dialogRef.overlayRef));
				return request.providers(surface);
			},
		});
		return surface;
	}

	private _dismissals(overlayRef: OverlayRef): Observable<BrnOverlayDismissal> {
		const noop = () => undefined;
		return merge(
			overlayRef.outsidePointerEvents().pipe(
				filter(() => this._isTopmostOutsideTarget(overlayRef)),
				map(() => ({ reason: 'outside' as const, accept: noop })),
			),
			overlayRef.backdropClick().pipe(map(() => ({ reason: 'backdrop' as const, accept: noop }))),
			overlayRef.keydownEvents().pipe(
				filter((event) => event.key === 'Escape' && this._overlayCloseDispatcher._attachedOverlays.at(-1) === overlayRef),
				map((event) => ({ reason: 'escape' as const, accept: () => event.preventDefault() })),
			),
		);
	}

	private _isTopmostOutsideTarget(overlayRef: OverlayRef): boolean {
		const overlays = this._overlayCloseDispatcher._attachedOverlays;
		const index = overlays.indexOf(overlayRef);
		return index === overlays.length - 1 || (overlays.length > 1 && !this._isNested(overlayRef, overlays.at(-1)!));
	}

	private _isNested(parent: OverlayRef, child: OverlayRef): boolean {
		const childOrigin = (child.getConfig().positionStrategy as FlexibleConnectedPositionStrategy)._origin;
		if (!childOrigin) return false;

		if ('x' in childOrigin && 'y' in childOrigin) {
			const rect = parent.hostElement.getBoundingClientRect();
			return (
				childOrigin.x >= rect.left &&
				childOrigin.x <= rect.right &&
				childOrigin.y >= rect.top &&
				childOrigin.y <= rect.bottom
			);
		}

		const element = childOrigin instanceof ElementRef ? childOrigin.nativeElement : childOrigin;
		return typeof Node !== 'undefined' && element instanceof Node ? parent.hostElement.contains(element) : false;
	}
}

class CdkDialogSurface extends BrnOverlaySurface {
	public readonly detached: Observable<void>;
	private _panelClasses: readonly string[];
	private _backdropClasses: readonly string[];

	constructor(
		private readonly _dialogRef: DialogRef<unknown>,
		request: BrnDialogRequest,
		public readonly dismissals: Observable<BrnOverlayDismissal>,
	) {
		super();
		this._panelClasses = request.panelClass;
		this._backdropClasses = request.backdropClass;
		this.detached = _dialogRef.closed.pipe(map(() => undefined));
	}

	private get _overlayRef(): OverlayRef {
		return this._dialogRef.overlayRef;
	}

	public setState(state: 'open' | 'closed'): void {
		this._overlayRef.overlayElement.setAttribute('data-state', state);
		this._overlayRef.backdropElement?.setAttribute('data-state', state);
	}

	public setPanelClass(classes: readonly string[]): void {
		if (this._panelClasses.length) this._dialogRef.removePanelClass([...this._panelClasses]);
		this._panelClasses = classes;
		if (classes.length) this._dialogRef.addPanelClass([...classes]);
	}

	public setBackdropClass(classes: readonly string[]): void {
		const backdrop = this._overlayRef.backdropElement;
		if (!backdrop) return;

		backdrop.classList.remove(...this._backdropClasses);
		this._backdropClasses = classes;
		backdrop.classList.add(...classes);
	}

	public setAriaDescribedBy(id: string | undefined): void {
		this._dialogRef.config.ariaDescribedBy = id;
		const container = this._overlayRef.overlayElement.querySelector('cdk-dialog-container');
		if (id) container?.setAttribute('aria-describedby', id);
		else container?.removeAttribute('aria-describedby');
	}

	public updatePosition(): void {
		this._dialogRef.updatePosition();
	}

	public prepareExit(): () => Promise<void> {
		return captureExitAnimations(() => [this._overlayRef.overlayElement, this._overlayRef.backdropElement]);
	}

	public dispose(result?: unknown): void {
		this._dialogRef.close(result);
	}
}
