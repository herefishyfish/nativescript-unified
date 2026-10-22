import { InteractivityChecker } from '@angular/cdk/a11y';
import { Overlay, OverlayPositionBuilder, type OverlayRef, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import { afterNextRender, inject, Injectable, Injector, TemplateRef } from '@angular/core';
import {
	type BrnOverlayDismissal,
	BrnOverlaySurface,
	captureExitAnimations,
	cdkPositionStrategy,
	cdkScrollStrategy,
} from '@spartan-ng/brain/core';
import { merge, type Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import type { BrnOverlayHost, BrnOverlayHostRequest } from './brn-overlay-host';

/** The web overlay host: a CDK Overlay pane, positioned from the request's placement. */
@Injectable({ providedIn: 'root' })
export class CdkOverlayHost implements BrnOverlayHost {
	private readonly _overlay = inject(Overlay);
	private readonly _positionBuilder = inject(OverlayPositionBuilder);
	private readonly _scrollStrategies = inject(ScrollStrategyOptions);
	private readonly _injector = inject(Injector);
	private readonly _interactivityChecker = inject(InteractivityChecker);
	private readonly _document = inject(DOCUMENT);
	private readonly _stack: OverlayRef[] = [];

	public open(request: BrnOverlayHostRequest): BrnOverlaySurface {
		const elementToRestoreFocusTo = this._document.activeElement;
		const overlayRef = this._overlay.create({
			positionStrategy: cdkPositionStrategy(this._positionBuilder, request),
			scrollStrategy: cdkScrollStrategy(this._scrollStrategies, request),
			hasBackdrop: request.hasBackdrop,
			panelClass: [...request.panelClass],
			backdropClass: [...request.backdropClass],
			direction: request.direction,
		});

		const surface = new CdkOverlaySurface(overlayRef, request, this._dismissals(overlayRef, request), () => {
			this._removeFromStack(overlayRef);
			this._restoreFocus(elementToRestoreFocusTo);
		});
		const injector = Injector.create({
			parent: request.viewContainerRef?.injector ?? this._injector,
			providers: request.providers(surface),
		});

		const element = overlayRef.overlayElement;
		element.id = request.id;
		if (request.role) {
			element.tabIndex = -1;
			element.setAttribute('role', request.role);
		}
		this._stack.push(overlayRef);

		try {
			if (request.content instanceof TemplateRef) {
				if (!request.viewContainerRef) {
					throw new Error('A ViewContainerRef is required to open an overlay from a TemplateRef');
				}
				overlayRef.attach(
					new TemplatePortal(request.content, request.viewContainerRef, { $implicit: request.context }, injector),
				);
			} else {
				overlayRef.attach(new ComponentPortal(request.content, request.viewContainerRef, injector));
			}
		} catch (error) {
			surface.dispose();
			throw error;
		}

		if (request.autoFocus) this._focusInitialElement(overlayRef, surface);
		return surface;
	}

	private _dismissals(overlayRef: OverlayRef, request: BrnOverlayHostRequest): Observable<BrnOverlayDismissal> {
		const noop = () => undefined;
		return merge(
			overlayRef.outsidePointerEvents().pipe(
				// The trigger lives outside the overlay panel, so CDK reports clicks on it as "outside". Treat them as
				// inside the widget and let the trigger's own handler toggle instead: this avoids a close/re-open race
				// that flickers the open/close animation.
				filter((event) => !this._isWithinOrigin(request, event.target)),
				map(() => ({ reason: 'outside' as const, accept: noop })),
			),
			overlayRef.backdropClick().pipe(map(() => ({ reason: 'backdrop' as const, accept: noop }))),
			overlayRef.keydownEvents().pipe(
				filter((event) => event.key === 'Escape'),
				map((event) => ({ reason: 'escape' as const, accept: () => event.preventDefault() })),
			),
		).pipe(filter(() => this._stack.at(-1) === overlayRef));
	}

	private _isWithinOrigin(request: BrnOverlayHostRequest, target: EventTarget | null): boolean {
		if (request.placement.kind !== 'anchored' || !(target instanceof Node)) return false;
		const origin = request.placement.origin;
		const element = origin instanceof Element ? origin : 'nativeElement' in origin ? origin.nativeElement : null;
		return element instanceof Element && element.contains(target);
	}

	/**
	 * Moves focus to the first tabbable element inside the overlay once its content has rendered.
	 * If the overlay has no tabbable content (e.g. a select listbox), focus is left untouched so the
	 * trigger keeps it - this is what keeps the `aria-activedescendant` keyboard model working.
	 */
	private _focusInitialElement(overlayRef: OverlayRef, surface: CdkOverlaySurface): void {
		afterNextRender(
			() => {
				if (surface.disposed) return;
				const root = overlayRef.overlayElement;
				if (!root) return;
				this._firstTabbableElement(root)?.focus();
			},
			{ injector: this._injector },
		);
	}

	private _firstTabbableElement(root: HTMLElement): HTMLElement | null {
		const candidates = root.querySelectorAll<HTMLElement>(
			'a[href], button, input, textarea, select, [tabindex], [contenteditable="true"]',
		);
		for (const candidate of Array.from(candidates)) {
			if (this._interactivityChecker.isTabbable(candidate)) return candidate;
		}
		return null;
	}

	private _restoreFocus(element: Element | null): void {
		const HTMLElementCtor = this._document.defaultView?.HTMLElement;
		if (
			!HTMLElementCtor ||
			!(element instanceof HTMLElementCtor) ||
			element === this._document.body ||
			!element.isConnected
		) {
			return;
		}

		const activeElement = this._document.activeElement;
		const shouldRestoreFocus = activeElement === this._document.body || !activeElement || !activeElement.isConnected;

		if (shouldRestoreFocus) element.focus({ preventScroll: true });
	}

	private _removeFromStack(overlayRef: OverlayRef): void {
		const index = this._stack.indexOf(overlayRef);
		if (index !== -1) this._stack.splice(index, 1);
	}
}

class CdkOverlaySurface extends BrnOverlaySurface {
	public readonly detached: Observable<void>;
	public disposed = false;
	private readonly _destroyed = new Subject<void>();
	private _panelClasses: readonly string[];
	private _backdropClasses: readonly string[];

	constructor(
		private readonly _overlayRef: OverlayRef,
		request: BrnOverlayHostRequest,
		public readonly dismissals: Observable<BrnOverlayDismissal>,
		private readonly _onDisposed: () => void,
	) {
		super();
		this._panelClasses = request.panelClass;
		this._backdropClasses = request.backdropClass;
		this.detached = _overlayRef.detachments().pipe(takeUntil(this._destroyed));
	}

	public setState(state: 'open' | 'closed'): void {
		this._overlayRef.overlayElement.setAttribute('data-state', state);
		this._overlayRef.backdropElement?.setAttribute('data-state', state);
	}

	public setPanelClass(classes: readonly string[]): void {
		if (this._panelClasses.length) this._overlayRef.removePanelClass([...this._panelClasses]);
		this._panelClasses = classes;
		if (classes.length) this._overlayRef.addPanelClass([...classes]);
	}

	public setBackdropClass(classes: readonly string[]): void {
		const backdrop = this._overlayRef.backdropElement;
		if (!backdrop) return;

		backdrop.classList.remove(...this._backdropClasses);
		this._backdropClasses = classes;
		backdrop.classList.add(...classes);
	}

	public setAriaDescribedBy(): void {
		// Non-modal overlays leave description wiring to their content.
	}

	public updatePosition(): void {
		this._overlayRef.updatePosition();
	}

	public prepareExit(): () => Promise<void> {
		return captureExitAnimations(() => [this._overlayRef.overlayElement, this._overlayRef.backdropElement]);
	}

	public dispose(): void {
		if (this.disposed) return;
		this.disposed = true;
		this._destroyed.next();
		this._destroyed.complete();
		this._overlayRef.dispose();
		this._onDisposed();
	}
}
