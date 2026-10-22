import { DIALOG_DATA } from '@angular/cdk/dialog';
import type { ComponentType } from '@angular/cdk/overlay';
import type { TemplateRef, ViewContainerRef } from '@angular/core';
import { inject, Injectable, type InjectOptions, Injector, type StaticProvider } from '@angular/core';
import { cssClassesToArray, resolveOverlayPlacement } from '@spartan-ng/brain/core';
import { takeUntil } from 'rxjs/operators';
import { BrnDialogHost } from './brn-dialog-host';
import type { BrnDialogOptions } from './brn-dialog-options';
import { BrnDialogRef } from './brn-dialog-ref';
import { injectBrnDialogDefaultOptions } from './brn-dialog-token';

let dialogSequence = 0;

export type BrnDialogContext<T> = T & { close: (result?: unknown) => void };

export const injectBrnDialogContext = <DialogContext = unknown>(options: InjectOptions = {}) =>
	inject(DIALOG_DATA, options) as DialogContext;

@Injectable({ providedIn: 'root' })
export class BrnDialogService {
	private readonly _host = inject(BrnDialogHost);
	private readonly _injector = inject(Injector);
	private readonly _defaultOptions = injectBrnDialogDefaultOptions();
	private readonly _openDialogIds = new Set<string>();

	public open<DialogContext, DialogResult = unknown>(
		content: ComponentType<unknown> | TemplateRef<unknown>,
		vcr?: ViewContainerRef,
		context?: DialogContext,
		options?: Partial<BrnDialogOptions>,
	): BrnDialogRef<DialogResult> {
		const dialogId = ++dialogSequence;
		const mergedOptions: BrnDialogOptions = {
			...this._defaultOptions,
			...options,
			id: options?.id ?? `brn-dialog-${dialogId}`,
		};

		if (this._openDialogIds.has(mergedOptions.id)) {
			throw new Error(`Dialog with ID: ${mergedOptions.id} already exists`);
		}

		let brnDialogRef!: BrnDialogRef<DialogResult>;
		const contextOrData: BrnDialogContext<DialogContext> = {
			...(context as DialogContext),
			close: (result: unknown = undefined) => brnDialogRef.close(result as DialogResult),
		};

		const surface = this._host.open({
			id: mergedOptions.id,
			content,
			viewContainerRef: vcr,
			context: contextOrData,
			providers: (surface) => {
				brnDialogRef = new BrnDialogRef(surface, this._injector, dialogId, mergedOptions);
				return this._createProviders(brnDialogRef, contextOrData, mergedOptions);
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
			ariaLabel: mergedOptions.ariaLabel,
			ariaLabelledBy:
				mergedOptions.ariaLabelledBy === undefined ? `brn-dialog-title-${dialogId}` : mergedOptions.ariaLabelledBy,
			ariaDescribedBy: mergedOptions.ariaDescribedBy,
			ariaModal: mergedOptions.ariaModal,
			autoFocus: mergedOptions.autoFocus,
			restoreFocus: mergedOptions.restoreFocus,
		});

		this._openDialogIds.add(mergedOptions.id);
		const closed$ = brnDialogRef.closed$;
		closed$.subscribe(() => this._openDialogIds.delete(mergedOptions.id));
		surface.dismissals.pipe(takeUntil(closed$)).subscribe((dismissal) => {
			if (brnDialogRef.dismiss(dismissal.reason)) dismissal.accept();
		});
		surface.detached.pipe(takeUntil(closed$)).subscribe(() => brnDialogRef.forceClose());
		return brnDialogRef;
	}

	private _createProviders<Result, Context>(
		dialogRef: BrnDialogRef<Result>,
		context: BrnDialogContext<Context>,
		options: BrnDialogOptions,
	): StaticProvider[] {
		const providers: StaticProvider[] = [
			{ provide: BrnDialogRef, useValue: dialogRef },
			{ provide: DIALOG_DATA, useValue: context },
		];
		if (options.providers) {
			providers.push(...(typeof options.providers === 'function' ? options.providers() : options.providers));
		}
		return providers;
	}
}
