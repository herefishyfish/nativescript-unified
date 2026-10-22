import type { ComponentType } from '@angular/cdk/portal';
import type { TemplateRef, ViewContainerRef } from '@angular/core';
import { inject, Injectable, Injector, type StaticProvider } from '@angular/core';
import { cssClassesToArray, resolveOverlayPlacement } from '@spartan-ng/brain/core';
import { takeUntil } from 'rxjs/operators';
import { BrnOverlayHost } from './brn-overlay-host';
import type { BrnOverlayOptions } from './brn-overlay-options';
import { BrnOverlayRef } from './brn-overlay-ref';
import { BRN_OVERLAY_DATA, injectBrnOverlayDefaultOptions } from './brn-overlay-token';

let overlaySequence = 0;

export type BrnOverlayContext<T> = T & { close: (result?: unknown) => void };

@Injectable({ providedIn: 'root' })
export class BrnOverlayService {
	private readonly _host = inject(BrnOverlayHost);
	private readonly _injector = inject(Injector);
	private readonly _defaultOptions = injectBrnOverlayDefaultOptions();
	private readonly _openOverlayIds = new Set<string>();

	public open<OverlayContext, OverlayResult = unknown>(
		content: ComponentType<unknown> | TemplateRef<unknown>,
		vcr?: ViewContainerRef,
		context?: OverlayContext,
		options?: Partial<BrnOverlayOptions>,
	): BrnOverlayRef<OverlayResult> {
		const overlayId = ++overlaySequence;
		const mergedOptions: BrnOverlayOptions = {
			...this._defaultOptions,
			...options,
			id: options?.id ?? `brn-overlay-${overlayId}`,
		};

		if (this._openOverlayIds.has(mergedOptions.id)) {
			throw new Error(`Overlay with ID: ${mergedOptions.id} already exists`);
		}

		let brnOverlayRef!: BrnOverlayRef<OverlayResult>;
		const contextOrData: BrnOverlayContext<OverlayContext> = {
			...(context as OverlayContext),
			close: (result: unknown = undefined) => brnOverlayRef.close(result as OverlayResult),
		};

		const surface = this._host.open({
			id: mergedOptions.id,
			content,
			viewContainerRef: vcr,
			context: contextOrData,
			providers: (surface) => {
				brnOverlayRef = new BrnOverlayRef(surface, this._injector, overlayId, mergedOptions);
				return this._createProviders(brnOverlayRef, contextOrData, mergedOptions);
			},
			placement: resolveOverlayPlacement(mergedOptions),
			hasBackdrop: mergedOptions.hasBackdrop,
			panelClass: cssClassesToArray(mergedOptions.panelClass),
			backdropClass: cssClassesToArray(mergedOptions.backdropClass),
			direction: mergedOptions.direction,
			closeOnOutsidePointerEvents: mergedOptions.closeOnOutsidePointerEvents,
			disableClose: mergedOptions.disableClose,
			positionStrategy: mergedOptions.positionStrategy,
			scrollStrategy: mergedOptions.scrollStrategy,
			role: mergedOptions.role,
			autoFocus: mergedOptions.autoFocus,
		});

		this._openOverlayIds.add(mergedOptions.id);
		const closed$ = brnOverlayRef.closed$;
		closed$.subscribe(() => this._openOverlayIds.delete(mergedOptions.id));
		surface.dismissals.pipe(takeUntil(closed$)).subscribe((dismissal) => {
			if (brnOverlayRef.dismiss(dismissal.reason)) dismissal.accept();
		});
		surface.detached.pipe(takeUntil(closed$)).subscribe(() => brnOverlayRef.forceClose());
		return brnOverlayRef;
	}

	private _createProviders<Result, Context>(
		ref: BrnOverlayRef<Result>,
		context: BrnOverlayContext<Context>,
		options: BrnOverlayOptions,
	): StaticProvider[] {
		const providers: StaticProvider[] = [
			{ provide: BrnOverlayRef, useValue: ref },
			{ provide: BRN_OVERLAY_DATA, useValue: context },
		];
		if (options.providers) {
			providers.push(...(typeof options.providers === 'function' ? options.providers() : options.providers));
		}
		return providers;
	}
}
