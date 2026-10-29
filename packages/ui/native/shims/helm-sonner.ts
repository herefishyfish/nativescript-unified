import {
	booleanAttribute,
	ChangeDetectionStrategy,
	Component,
	computed,
	DestroyRef,
	effect,
	inject,
	input,
	NO_ERRORS_SCHEMA,
	numberAttribute,
	signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircleCheck, lucideInfo, lucideLoader2, lucideOctagonX, lucideTriangleAlert } from '@ng-icons/lucide';
import { type ToastT, toastState, type ToastTypes } from '@spartan-ng/brain/sonner';
import { HlmButton } from '@spartan-ng/helm/button';

const ICONS: Partial<Record<ToastTypes, string>> = {
	success: 'lucideCircleCheck',
	info: 'lucideInfo',
	warning: 'lucideTriangleAlert',
	error: 'lucideOctagonX',
	loading: 'lucideLoader2',
};

/** Toast handlers take the click event; there is no MouseEvent on native, so they get an empty one. */
const TAP = {} as MouseEvent;

/** Every toaster on screen, oldest first; only the oldest draws, so toasts never show twice. */
const toasters = signal<readonly HlmToaster[]>([]);

/**
 * Stands in for `@spartan-ng/helm/sonner` on native. Brain's toaster positions a fixed list and measures each toast
 * in the DOM; here the toasts from brain's `toast()` state are a stack of helm-styled cards, drawn where the
 * toaster is in the layout. Only the oldest `<hlm-toaster>` on screen draws. A toast closes itself after `duration`
 * (loading toasts wait) or on a tap.
 */
@Component({
	selector: 'hlm-toaster',
	imports: [NgIcon, HlmButton],
	providers: [provideIcons({ lucideCircleCheck, lucideInfo, lucideTriangleAlert, lucideOctagonX, lucideLoader2 })],
	schemas: [NO_ERRORS_SCHEMA],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { class: 'flex flex-col' },
	template: `
		<!-- Empty, the toaster takes no space, so it never covers what is under it. -->
		@if (_visible().length) {
		<div class="flex flex-col gap-2 p-4">
		@for (toast of _visible(); track toast.id) {
			<div
				data-slot="toast"
				class="spartan-toast bg-popover text-popover-foreground flex w-full flex-row items-start gap-3 border p-4 shadow-lg"
				(tap)="_tapped(toast)"
			>
				@if (_icon(toast); as icon) {
					<ng-icon [name]="icon" class="text-base" />
				}
				<div class="flex flex-1 flex-col gap-1">
					@if (_text(toast.title); as title) {
						<p class="text-sm font-medium">{{ title }}</p>
					}
					@if (_text(toast.description); as description) {
						<p class="text-muted-foreground text-sm">{{ description }}</p>
					}
				</div>
				@if (toast.cancel; as cancel) {
					<button hlmBtn size="sm" variant="secondary" (click)="_cancel(toast)">{{ cancel.label }}</button>
				}
				@if (toast.action; as action) {
					<button hlmBtn size="sm" (click)="_act(toast)">{{ action.label }}</button>
				}
			</div>
		}
		</div>
		}
	`,
})
export class HlmToaster {
	public readonly duration = input<number, unknown>(4000, { transform: numberAttribute });
	public readonly visibleToasts = input<number, unknown>(3, { transform: numberAttribute });
	public readonly closeButton = input<boolean, unknown>(false, { transform: booleanAttribute });

	private readonly _draws = computed(() => toasters()[0] === this);
	private readonly _timers = new Map<ToastT['id'], ReturnType<typeof setTimeout>>();

	protected readonly _visible = computed(() =>
		this._draws() ? toastState.toasts().filter((toast) => !toast.delete).slice(0, this.visibleToasts()) : [],
	);

	constructor() {
		toasters.update((all) => [...all, this]);
		effect(() => this._schedule(this._visible()));
		inject(DestroyRef).onDestroy(() => {
			this._timers.forEach((timer) => clearTimeout(timer));
			toasters.update((all) => all.filter((toaster) => toaster !== this));
		});
	}

	protected _icon(toast: ToastT): string | undefined {
		return toast.type ? ICONS[toast.type] : undefined;
	}

	/** Titles and descriptions given as components have no text to show here. */
	protected _text(value: ToastT['title']): string | undefined {
		return typeof value === 'string' ? value : undefined;
	}

	protected _tapped(toast: ToastT): void {
		if (toast.dismissible !== false) this._close(toast);
	}

	protected _act(toast: ToastT): void {
		toast.action?.onClick(TAP);
		this._close(toast);
	}

	protected _cancel(toast: ToastT): void {
		toast.cancel?.onClick?.(TAP);
		this._close(toast);
	}

	private _schedule(toasts: ToastT[]): void {
		for (const toast of toasts) {
			if (this._timers.has(toast.id) || toast.type === 'loading') continue;
			const duration = toast.duration ?? this.duration();
			if (!Number.isFinite(duration)) continue;
			this._timers.set(
				toast.id,
				setTimeout(() => {
					toast.onAutoClose?.(toast);
					this._close(toast);
				}, duration),
			);
		}
	}

	private _close(toast: ToastT): void {
		if (!toastState.toasts().some((shown) => shown.id === toast.id)) return;
		clearTimeout(this._timers.get(toast.id));
		this._timers.delete(toast.id);
		toast.onDismiss?.(toast);
		toastState.dismiss(toast.id);
	}
}

export const HlmToasterImports = [HlmToaster] as const;
