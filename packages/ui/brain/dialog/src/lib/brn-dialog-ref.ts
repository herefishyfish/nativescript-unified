import { afterNextRender, computed, type Injector, signal } from '@angular/core';
import type { BrnOverlaySurface } from '@spartan-ng/brain/core';
import { type Observable, ReplaySubject, Subject } from 'rxjs';
import type { BrnDialogOptions } from './brn-dialog-options';
import type { BrnDialogDismissReason, BrnDialogPhase, BrnDialogState } from './brn-dialog-state';
import { cssClassesToArray } from './brn-dialog-utils';

export class BrnDialogRef<DialogResult = unknown> {
	private readonly _closing = new Subject<void>();
	public readonly closing$ = this._closing.asObservable();

	private readonly _closed = new ReplaySubject<DialogResult | undefined>(1);
	public readonly closed$: Observable<DialogResult | undefined> = this._closed.asObservable();

	private readonly _stateChanged = new ReplaySubject<BrnDialogState>(1);
	public readonly stateChanged$ = this._stateChanged.asObservable();

	private readonly _phase = signal<BrnDialogPhase>('open');
	public readonly phase = this._phase.asReadonly();
	public readonly state = computed<BrnDialogState>(() => (this._phase() === 'open' ? 'open' : 'closed'));

	private _closeGeneration = 0;
	private readonly _descriptionIds = new Set<string>();

	public get open(): boolean {
		return this._phase() === 'open';
	}

	public get id(): string {
		return this.initialOptions.id;
	}

	constructor(
		private readonly _surface: BrnOverlaySurface,
		private readonly _injector: Injector,
		public readonly dialogId: number,
		private readonly initialOptions: BrnDialogOptions,
	) {
		this._surface.setState('open');
		this._stateChanged.next('open');
	}

	public close(result?: DialogResult): void {
		if (!this.open) return;

		const generation = ++this._closeGeneration;
		const finishExit = this._surface.prepareExit();

		this._phase.set('closing');
		this._surface.setState('closed');
		this._closing.next();
		this._stateChanged.next('closed');

		afterNextRender(
			() => {
				void this._finishClose(generation, finishExit, result);
			},
			{ injector: this._injector },
		);
	}

	public dismiss(reason: BrnDialogDismissReason): boolean {
		const options = this.initialOptions;
		const isOutsideInteraction = reason === 'outside' || reason === 'backdrop';
		const outsideCloseAllowed = options.closeOnOutsidePointerEvents;
		if (!this.open || options.disableClose) return false;
		if (isOutsideInteraction && !outsideCloseAllowed) return false;

		this.close();
		return true;
	}

	public reopen(): void {
		if (this._phase() !== 'closing') return;

		this._closeGeneration++;
		this._phase.set('open');
		this._surface.setState('open');
		this._stateChanged.next('open');
	}

	public forceClose(result?: DialogResult): void {
		if (this._phase() === 'closed') return;

		this._closeGeneration++;
		this._dispose(result);
	}

	public setPanelClass(panelClass: string | string[] | null | undefined): void {
		this._surface.setPanelClass(cssClassesToArray(panelClass));
	}

	public setOverlayClass(overlayClass: string | string[] | null | undefined): void {
		this._surface.setBackdropClass(cssClassesToArray(overlayClass));
	}

	public updatePosition(): void {
		this._surface.updatePosition();
	}

	public registerDescription(id: string): void {
		this._descriptionIds.add(id);
		this._syncAriaDescribedBy();
	}

	public unregisterDescription(id: string): void {
		this._descriptionIds.delete(id);
		this._syncAriaDescribedBy();
	}

	private _syncAriaDescribedBy(): void {
		if (this.initialOptions.ariaDescribedBy !== undefined) return;
		this._surface.setAriaDescribedBy(this._descriptionIds.size ? [...this._descriptionIds].join(' ') : undefined);
	}

	private async _finishClose(
		generation: number,
		finishExit: () => Promise<void>,
		result?: DialogResult,
	): Promise<void> {
		if (generation !== this._closeGeneration || this._phase() !== 'closing') return;

		await finishExit();

		if (generation === this._closeGeneration && this._phase() === 'closing') {
			this._dispose(result);
		}
	}

	private _dispose(result?: DialogResult): void {
		this._phase.set('closed');
		this._surface.dispose(result);
		this._closed.next(result);
		this._closed.complete();
		this._closing.complete();
		this._stateChanged.complete();
	}
}
