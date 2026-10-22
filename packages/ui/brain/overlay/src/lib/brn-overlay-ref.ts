import { afterNextRender, computed, type Injector, signal } from '@angular/core';
import { type BrnOverlaySurface, cssClassesToArray } from '@spartan-ng/brain/core';
import { type Observable, ReplaySubject, Subject } from 'rxjs';
import type { BrnOverlayOptions } from './brn-overlay-options';
import type { BrnOverlayDismissReason, BrnOverlayPhase, BrnOverlayState } from './brn-overlay-state';

export class BrnOverlayRef<OverlayResult = unknown> {
	private readonly _closing = new Subject<void>();
	public readonly closing$ = this._closing.asObservable();

	private readonly _closed = new ReplaySubject<OverlayResult | undefined>(1);
	public readonly closed$: Observable<OverlayResult | undefined> = this._closed.asObservable();

	private readonly _stateChanged = new ReplaySubject<BrnOverlayState>(1);
	public readonly stateChanged$ = this._stateChanged.asObservable();

	private readonly _phase = signal<BrnOverlayPhase>('open');
	public readonly phase = this._phase.asReadonly();
	public readonly state = computed<BrnOverlayState>(() => (this._phase() === 'open' ? 'open' : 'closed'));

	private _closeGeneration = 0;

	public get open(): boolean {
		return this._phase() === 'open';
	}

	public get id(): string {
		return this.initialOptions.id;
	}

	constructor(
		private readonly _surface: BrnOverlaySurface,
		private readonly _injector: Injector,
		public readonly overlayId: number,
		private readonly initialOptions: BrnOverlayOptions,
	) {
		this._surface.setState('open');
		this._stateChanged.next('open');
	}

	public close(result?: OverlayResult): void {
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

	public dismiss(reason: BrnOverlayDismissReason): boolean {
		const options = this.initialOptions;
		if (!this.open || options.disableClose) return false;
		if (reason === 'outside' && !options.closeOnOutsidePointerEvents) return false;

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

	public forceClose(result?: OverlayResult): void {
		if (this._phase() === 'closed') return;

		this._closeGeneration++;
		this._dispose(result);
	}

	public setPanelClass(panelClass: string | string[] | null | undefined): void {
		this._surface.setPanelClass(cssClassesToArray(panelClass));
	}

	public setBackdropClass(backdropClass: string | string[] | null | undefined): void {
		this._surface.setBackdropClass(cssClassesToArray(backdropClass));
	}

	public updatePosition(): void {
		this._surface.updatePosition();
	}

	private async _finishClose(
		generation: number,
		finishExit: () => Promise<void>,
		result?: OverlayResult,
	): Promise<void> {
		if (generation !== this._closeGeneration || this._phase() !== 'closing') return;

		await finishExit();

		if (generation === this._closeGeneration && this._phase() === 'closing') {
			this._dispose(result);
		}
	}

	private _dispose(result?: OverlayResult): void {
		this._phase.set('closed');
		this._surface.dispose(result);
		this._closed.next(result);
		this._closed.complete();
		this._closing.complete();
		this._stateChanged.complete();
	}
}
