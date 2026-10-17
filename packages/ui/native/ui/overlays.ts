import {
	ApplicationRef,
	Injectable,
	Injector,
	type TemplateRef,
	type ViewContainerRef,
	inject,
	signal,
} from '@angular/core';
import type { ViewWithBottomSheetBase } from '@nativescript-community/ui-material-bottomsheet';
import { HorizontalPosition, VerticalPosition, showPopover } from '@nativescript-community/ui-popover';
import { AndroidApplication, Application, View } from '@nativescript/core';
import { Div } from '@triniwiz/nativescript-masonkit/web';

/** A dialog-like panel centered in a layer above the page, over spartan's dialog backdrop. */
export interface ModalConfig {
	readonly kind: 'modal';
}

export type SheetSide = 'top' | 'right' | 'bottom' | 'left';

/** A panel that slides in from a page edge in the native drawer (edge swipe, drag and backdrop to dismiss). */
export interface SheetConfig {
	readonly kind: 'sheet';
	readonly side: SheetSide;
}

/** A panel in the native modal bottom sheet (drag down to dismiss), like vaul. */
export interface DrawerConfig {
	readonly kind: 'drawer';
}

/** A panel shown in a native popover window (PopupWindow / UIPopoverPresentationController) at `anchor`. */
export interface AnchoredConfig {
	readonly kind: 'anchored';
	readonly anchor: View;
	readonly side: 'top' | 'bottom';
	readonly align: 'start' | 'end';
	readonly offset?: number;
}

export type OverlayConfig = ModalConfig | SheetConfig | DrawerConfig | AnchoredConfig;

export interface OverlayRef {
	close(): void;
}

export type ToastType = 'default' | 'success' | 'info' | 'warning' | 'error';

export interface ToastOptions {
	readonly description?: string;
	readonly type?: ToastType;
	readonly action?: { readonly label: string; readonly onClick: () => void };
	readonly duration?: number;
}

export interface Toast extends ToastOptions {
	readonly id: number;
	readonly title: string;
	readonly ref: OverlayRef;
}

export type OverlayTemplate = TemplateRef<{ $implicit: OverlayRef }>;

export interface ModalEntry {
	readonly id: number;
	readonly template: OverlayTemplate;
	readonly ref: OverlayRef;
}

export interface SheetEntry extends ModalEntry {
	readonly side: SheetSide;
}

/**
 * The CDK-overlay stand-in. Modal panels render in a layer above the demo page's scroll view (the Android back
 * button closes the top one); sheets use the page's native drawer, drawers the native bottom sheet, and anchored
 * panels a native popover window.
 */
@Injectable({ providedIn: 'root' })
export class Overlays {
	private readonly _appRef = inject(ApplicationRef);
	private readonly _injector = inject(Injector);
	private _viewContainer?: ViewContainerRef;
	private _nextId = 0;
	public readonly stack = signal<readonly ModalEntry[]>([]);
	/** The open edge sheet; the demo page renders it into its drawer. */
	public readonly sheet = signal<SheetEntry | null>(null);
	/** Sonner's toasts, rendered by the page at the bottom without a backdrop so the page stays usable. */
	public readonly toasts = signal<readonly Toast[]>([]);
	/** Open native popovers and bottom sheets, which render outside the page. */
	private readonly _native = signal<ReadonlySet<OverlayRef>>(new Set());

	constructor() {
		if (__ANDROID__) {
			Application.android.on(AndroidApplication.activityBackPressedEvent, (args) => {
				const top = this.stack().at(-1);
				if (top) {
					(args as unknown as { cancel: boolean }).cancel = true;
					top.ref.close();
				}
			});
		}
	}

	/** The demo page's view container, which parents native bottom sheets. */
	attach(viewContainer: ViewContainerRef) {
		this._viewContainer = viewContainer;
	}

	open(template: OverlayTemplate, config: OverlayConfig): OverlayRef {
		switch (config.kind) {
			case 'anchored':
				return this._openPopover(template, config);
			case 'drawer':
				return this._openBottomSheet(template);
			case 'sheet': {
				const id = this._nextId++;
				const ref: OverlayRef = { close: () => this.sheet.update((sheet) => (sheet?.id === id ? null : sheet)) };
				this.sheet.set({ id, template, ref, side: config.side });
				return ref;
			}
		}
		const id = this._nextId++;
		const ref: OverlayRef = { close: () => this.stack.update((stack) => stack.filter((entry) => entry.id !== id)) };
		this.stack.update((stack) => [...stack, { id, template, ref }]);
		return ref;
	}

	/** Sonner's `toast()`: shows a toast that closes itself after `duration` (4s, sonner's default). */
	toast(title: string, options: ToastOptions = {}): OverlayRef {
		const id = this._nextId++;
		const ref: OverlayRef = { close: () => this.toasts.update((toasts) => toasts.filter((toast) => toast.id !== id)) };
		this.toasts.update((toasts) => [...toasts, { ...options, id, title, ref }]);
		setTimeout(() => ref.close(), options.duration ?? 4000);
		return ref;
	}

	/** Whether `ref`'s panel is showing, for a trigger's aria-expanded state. */
	isOpen(ref: OverlayRef | null) {
		return (
			!!ref && (this._native().has(ref) || this.sheet()?.ref === ref || this.stack().some((entry) => entry.ref === ref))
		);
	}

	closeAll() {
		this.stack.set([]);
		this.sheet.set(null);
		this.toasts.set([]);
		this._native().forEach((ref) => ref.close());
	}

	private _track(ref: OverlayRef) {
		this._native.update((refs) => new Set(refs).add(ref));
	}

	private _untrack(ref: OverlayRef) {
		this._native.update((refs) => {
			const next = new Set(refs);
			next.delete(ref);
			return next;
		});
	}

	private _openBottomSheet(template: OverlayTemplate): OverlayRef {
		const parent = this._viewContainer?.element.nativeElement as ViewWithBottomSheetBase | undefined;
		if (!parent) {
			throw new Error('Overlays.attach() must run before a drawer opens.');
		}
		const ref: OverlayRef = { close: () => (root as unknown as ViewWithBottomSheetBase).closeBottomSheet() };
		const { root, teardown } = this._render(template, ref, 'style-vega text-foreground');
		parent.showBottomSheet({
			view: root,
			closeCallback: teardown,
			dismissOnDraggingDownSheet: true,
			skipCollapsedState: true,
			transparent: true,
		});
		return ref;
	}

	private _openPopover(template: OverlayTemplate, config: AnchoredConfig): OverlayRef {
		const ref: OverlayRef = { close: () => popover.close() };
		// p-1 keeps the panel's ring and shadow inside the popover window's bounds; the offsets below cancel it.
		const { root, teardown } = this._render(template, ref, 'style-vega text-foreground p-1');
		const popover = showPopover(root, {
			anchor: config.anchor,
			vertPos: config.side === 'bottom' ? VerticalPosition.BELOW : VerticalPosition.ABOVE,
			horizPos: config.align === 'start' ? HorizontalPosition.ALIGN_LEFT : HorizontalPosition.ALIGN_RIGHT,
			x: config.align === 'start' ? -4 : 4,
			y: config.side === 'bottom' ? (config.offset ?? 4) - 4 : 4 - (config.offset ?? 4),
			hideArrow: true,
			transparent: true,
			onDismiss: teardown,
		});
		return ref;
	}

	/**
	 * Renders `template` into a detached MasonKit root for a native window (popover, bottom sheet). That root is outside
	 * the page, so it carries its own theme scope for the `.style-vega` rules.
	 */
	private _render(template: OverlayTemplate, ref: OverlayRef, className: string) {
		const view = template.createEmbeddedView({ $implicit: ref }, this._injector);
		this._appRef.attachView(view);
		view.detectChanges();

		const root = new Div();
		root.className = className;
		for (const node of view.rootNodes) {
			if (node instanceof View) root.addChild(node);
		}

		let closed = false;
		const teardown = () => {
			if (closed) return;
			closed = true;
			this._untrack(ref);
			this._appRef.detachView(view);
			view.destroy();
		};
		this._track(ref);
		return { root: root as unknown as View, teardown };
	}
}
