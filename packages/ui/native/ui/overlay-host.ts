import type { ConnectedPosition, FlexibleConnectedPositionStrategyOrigin } from '@angular/cdk/overlay';
import {
	ApplicationRef,
	createComponent,
	ElementRef,
	EnvironmentInjector,
	inject,
	Injectable,
	Injector,
	type Renderer2,
	RendererFactory2,
	TemplateRef,
	type ViewRef,
} from '@angular/core';
import type { ViewWithBottomSheetBase } from '@nativescript-community/ui-material-bottomsheet';
import { HorizontalPosition, showPopover, VerticalPosition } from '@nativescript-community/ui-popover';
import { Application, Frame, View } from '@nativescript/core';
import type { BrnOverlayDismissal, BrnOverlayRequest } from '@spartan-ng/brain/core';
import { BrnOverlaySurface } from '@spartan-ng/brain/core';
import type { BrnDialogHost, BrnDialogRequest } from '@spartan-ng/brain/dialog';
import type { BrnOverlayHost, BrnOverlayHostRequest } from '@spartan-ng/brain/overlay';
import { Subject } from 'rxjs';

type CloseWindow = () => void;

/**
 * Opens spartan's dialogs and overlays in native windows: centered dialogs (and sheets on any side but the bottom) in
 * a modal dialog, bottom drawers and sheets in a material bottom sheet, anchored overlays in a popover. The content
 * is the helm markup, rendered into a MasonKit root that carries the theme scope the page would have given it.
 */
@Injectable({ providedIn: 'root' })
export class NativeScriptOverlayHost implements BrnDialogHost, BrnOverlayHost {
	private readonly _appRef = inject(ApplicationRef);
	private readonly _environmentInjector = inject(EnvironmentInjector);
	private readonly _injector = inject(Injector);
	private readonly _renderer: Renderer2 = inject(RendererFactory2).createRenderer(null, null);
	/** Open modal and bottom sheet roots; a new window is presented from the topmost one. */
	private readonly _windows: View[] = [];

	public open(request: BrnDialogRequest | BrnOverlayHostRequest): BrnOverlaySurface {
		const root = this._renderer.createElement('div') as View;
		const surface = new NativeScriptSurface(root, themeClasses(), request.panelClass);
		const injector = Injector.create({
			parent: request.viewContainerRef?.injector ?? this._injector,
			providers: request.providers(surface),
		});
		const view = this._render(request, injector, root);
		surface.onTeardown(() => {
			this._appRef.detachView(view);
			view.destroy();
		});

		const placement = request.placement;
		switch (placement.kind) {
			case 'center':
				surface.show(this._showModal(root, request, surface));
				break;
			case 'edge':
				surface.show(
					placement.side === 'bottom'
						? this._showBottomSheet(root, request, surface)
						: this._showModal(root, request, surface),
				);
				break;
			case 'anchored': {
				const anchor = anchorView(placement.origin);
				surface.show(
					anchor
						? this._showPopover(root, request, surface, anchor, placement.positions[0])
						: this._showModal(root, request, surface),
				);
				break;
			}
		}
		return surface;
	}

	private _render(request: BrnOverlayRequest, injector: Injector, root: View): ViewRef {
		const content = request.content;
		if (content instanceof TemplateRef) {
			const view = content.createEmbeddedView({ $implicit: request.context }, injector);
			this._appRef.attachView(view);
			for (const node of view.rootNodes) this._renderer.appendChild(root, node);
			view.detectChanges();
			return view;
		}
		const componentRef = createComponent(content, {
			environmentInjector: this._environmentInjector,
			elementInjector: injector,
		});
		this._appRef.attachView(componentRef.hostView);
		this._renderer.appendChild(root, componentRef.location.nativeElement);
		componentRef.changeDetectorRef.detectChanges();
		return componentRef.hostView;
	}

	private _presenter(): View {
		const presenter = this._windows.at(-1) ?? Frame.topmost()?.currentPage ?? Application.getRootView();
		if (!presenter) throw new Error('No NativeScript view is showing to present an overlay from.');
		return presenter;
	}

	private _track(root: View, surface: NativeScriptSurface): void {
		this._windows.push(root);
		surface.onTeardown(() => this._windows.splice(this._windows.indexOf(root), 1));
	}

	private _showModal(root: View, request: BrnOverlayRequest, surface: NativeScriptSurface): CloseWindow {
		const presenter = this._presenter();
		this._track(root, surface);
		// The Android back button reaches a modal as activityBackPressed; cancelling it lets the dialog's own
		// dismissal rules (disableClose, exit animation, result) decide instead of the platform closing it.
		root.on('activityBackPressed', (args) => {
			(args as unknown as { cancel: boolean }).cancel = true;
			surface.dismiss('escape');
		});
		presenter.showModal(root, {
			context: null,
			closeCallback: () => surface.windowClosed(),
			fullscreen: false,
			animated: true,
			cancelable: request.closeOnOutsidePointerEvents && !request.disableClose,
		});
		return () => root.closeModal();
	}

	private _showBottomSheet(root: View, request: BrnOverlayRequest, surface: NativeScriptSurface): CloseWindow {
		const presenter = this._presenter() as ViewWithBottomSheetBase;
		this._track(root, surface);
		presenter.showBottomSheet({
			view: root,
			closeCallback: () => surface.windowClosed(),
			dismissOnBackgroundTap: request.closeOnOutsidePointerEvents && !request.disableClose,
			dismissOnDraggingDownSheet: !request.disableClose,
			dismissOnBackButton: !request.disableClose,
			skipCollapsedState: true,
			transparent: true,
		});
		return () => (root as ViewWithBottomSheetBase).closeBottomSheet();
	}

	private _showPopover(
		root: View,
		request: BrnOverlayRequest,
		surface: NativeScriptSurface,
		anchor: View,
		position: ConnectedPosition | undefined,
	): CloseWindow {
		const above = position?.originY === 'top';
		const popover = showPopover(root, {
			anchor,
			vertPos: above ? VerticalPosition.ABOVE : VerticalPosition.BELOW,
			horizPos:
				position?.originX === 'start'
					? HorizontalPosition.ALIGN_LEFT
					: position?.originX === 'end'
						? HorizontalPosition.ALIGN_RIGHT
						: HorizontalPosition.CENTER,
			x: position?.offsetX ?? 0,
			y: position?.offsetY ?? 0,
			outsideTouchable: request.closeOnOutsidePointerEvents && !request.disableClose,
			hideArrow: true,
			transparent: true,
			onDismiss: () => surface.windowClosed(),
		});
		return () => popover.close();
	}
}

class NativeScriptSurface extends BrnOverlaySurface {
	public readonly dismissals = new Subject<BrnOverlayDismissal>();
	public readonly detached = new Subject<void>();
	private readonly _teardowns: (() => void)[] = [];
	private _closeWindow: CloseWindow | undefined;
	private _disposing = false;
	private _closed = false;

	constructor(
		private readonly _root: View,
		private readonly _themeClasses: readonly string[],
		panelClass: readonly string[],
	) {
		super();
		this.setPanelClass(panelClass);
	}

	public show(closeWindow: CloseWindow): void {
		this._closeWindow = closeWindow;
	}

	public onTeardown(teardown: () => void): void {
		this._teardowns.push(teardown);
	}

	public dismiss(reason: BrnOverlayDismissal['reason']): void {
		this.dismissals.next({ reason, accept: () => undefined });
	}

	/** The native window closed, whether this surface asked it to or the platform did. */
	public windowClosed(): void {
		if (this._closed) return;
		this._closed = true;
		for (const teardown of this._teardowns) teardown();
		if (!this._disposing) this.detached.next();
		this.dismissals.complete();
		this.detached.complete();
	}

	public setState(): void {
		// The native window animates itself; helm content binds its own data-state.
	}

	public setPanelClass(classes: readonly string[]): void {
		this._root.className = [...this._themeClasses, ...classes].join(' ');
	}

	public setBackdropClass(): void {
		// Native windows dim the page themselves; there is no backdrop element to style.
	}

	public setAriaDescribedBy(): void {
		// NativeScript views have no aria-describedby.
	}

	public updatePosition(): void {
		// Native windows position themselves.
	}

	public prepareExit(): () => Promise<void> {
		return () => Promise.resolve();
	}

	public dispose(): void {
		if (this._closed || this._disposing) return;
		this._disposing = true;
		if (this._closeWindow) this._closeWindow();
		else this.windowClosed();
	}
}

/** The NativeScript view an anchored overlay points at, when its origin is one (a point has no view). */
function anchorView(origin: FlexibleConnectedPositionStrategyOrigin): View | null {
	const element: unknown = origin instanceof ElementRef ? origin.nativeElement : origin;
	return element instanceof View ? element : null;
}

/**
 * A native window's content is not under the page, so it carries the page's theme scope itself: `style-vega` for
 * helm's rules and the root view's light/dark class for the color tokens.
 */
function themeClasses(): string[] {
	const dark = Application.getRootView()?.cssClasses.has('ns-dark') ?? false;
	return ['style-vega', dark ? 'ns-dark' : 'ns-light'];
}
