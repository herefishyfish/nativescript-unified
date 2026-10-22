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
import type { ViewWithBottomSheetBase } from '@nativescript-community/ui-bottomsheet';
import { HorizontalPosition, showPopover, VerticalPosition } from '@nativescript-community/ui-popover';
import { Application, Frame, View } from '@nativescript/core';
import type { BrnOverlayDismissal, BrnOverlayPlacement, BrnOverlayRequest } from '@spartan-ng/brain/core';
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
		const window = nativeWindow(request.placement);
		const views = this._createViews(window.kind);
		const surface = new NativeScriptSurface(views, themeClasses(), request.panelClass, request.backdropClass);
		const injector = Injector.create({
			parent: request.viewContainerRef?.injector ?? this._injector,
			providers: request.providers(surface),
		});
		const view = this._render(request, injector, views.pane);
		surface.onTeardown(() => {
			this._appRef.detachView(view);
			view.destroy();
		});

		switch (window.kind) {
			case 'modal':
				surface.show(this._showModal(views, surface));
				break;
			case 'bottomSheet':
				surface.show(this._showBottomSheet(views.root, request, surface));
				break;
			case 'popover':
				surface.show(this._showPopover(views.root, request, surface, window.anchor, window.position));
				break;
		}
		return surface;
	}

	/**
	 * A modal fills its window like the web's overlay container: the backdrop covers it and the pane is centered on
	 * top. Bottom sheets and popovers draw their own window chrome, so the pane is the whole window content.
	 */
	private _createViews(kind: NativeWindow['kind']): SurfaceViews {
		const pane = this._renderer.createElement('div') as View;
		if (kind !== 'modal') return { root: pane, pane, backdrop: null };
		const root = this._renderer.createElement('div') as View;
		const backdrop = this._renderer.createElement('div') as View;
		for (const [style, value] of [
			['display', 'flex'],
			['alignItems', 'center'],
			['justifyContent', 'center'],
			['width', '100%'],
			['height', '100%'],
		]) {
			this._renderer.setStyle(root, style, value);
		}
		for (const [style, value] of [
			['position', 'absolute'],
			['inset', '0'],
			// MasonKit's backdrop blur over a transparent window re-samples its own output: the 10% black scrim
			// darkens frame after frame until the page behind is black.
			['backdropFilter', 'none'],
		]) {
			this._renderer.setStyle(backdrop, style, value);
		}
		this._renderer.appendChild(root, backdrop);
		this._renderer.appendChild(root, pane);
		return { root, pane, backdrop };
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

	private _showModal(views: SurfaceViews, surface: NativeScriptSurface): CloseWindow {
		const { root, pane, backdrop } = views;
		const presenter = this._presenter();
		this._track(root, surface);
		// The Android back button reaches a modal as activityBackPressed; cancelling it lets the dialog's own
		// dismissal rules (disableClose, exit animation, result) decide instead of the platform closing it.
		root.on('activityBackPressed', (args) => {
			(args as unknown as { cancel: boolean }).cancel = true;
			surface.dismiss('escape');
		});
		// A touch the pane does not consume falls through to the backdrop under it, so the pane takes its own taps.
		pane.ignoreTouchAnimation = true;
		pane.on('tap', () => undefined);
		if (backdrop) {
			backdrop.ignoreTouchAnimation = true;
			backdrop.on('tap', () => surface.dismiss('backdrop'));
		}
		// A full-screen transparent window, so helm's backdrop and content are the only chrome, as on the web. The
		// platform's own dialog window would draw its background and minimum width around the helm card.
		root.on(View.showingModallyEvent, () => clearWindowBackground(root));
		root.on(View.shownModallyEvent, () => clearWindowBackground(root));
		presenter.showModal(root, {
			context: null,
			closeCallback: () => surface.windowClosed(),
			fullscreen: true,
			animated: true,
			cancelable: false,
			ios: { presentationStyle: IOS_OVER_FULL_SCREEN },
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
			// helm's drawer and sheet draw their own card and handle.
			detents: ['content'],
			transparent: true,
			grabber: false,
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
	private readonly _themeClasses: readonly string[];
	private _closeWindow: CloseWindow | undefined;
	private _disposing = false;
	private _closed = false;

	constructor(
		private readonly _views: SurfaceViews,
		themeClasses: readonly string[],
		panelClass: readonly string[],
		backdropClass: readonly string[],
	) {
		super();
		// helm's rules are scoped under the theme classes, so they go on a node above the pane and backdrop.
		this._themeClasses = _views.root === _views.pane ? themeClasses : [];
		if (_views.root !== _views.pane) _views.root.className = themeClasses.join(' ');
		this.setPanelClass(panelClass);
		this.setBackdropClass(backdropClass);
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
		this._views.pane.className = [...this._themeClasses, ...classes].join(' ');
	}

	public setBackdropClass(classes: readonly string[]): void {
		if (this._views.backdrop) this._views.backdrop.className = classes.join(' ');
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

/** The views a surface owns: the window content, the pane holding the helm content, and a modal's backdrop. */
interface SurfaceViews {
	readonly root: View;
	readonly pane: View;
	readonly backdrop: View | null;
}

/** The native window a placement opens in. */
type NativeWindow =
	| { readonly kind: 'modal' }
	| { readonly kind: 'bottomSheet' }
	| { readonly kind: 'popover'; readonly anchor: View; readonly position: ConnectedPosition | undefined };

/** Bottom edges open a bottom sheet, anchors that are views a popover; native platforms have no other edge windows. */
function nativeWindow(placement: BrnOverlayPlacement): NativeWindow {
	switch (placement.kind) {
		case 'center':
			return { kind: 'modal' };
		case 'edge':
			return placement.side === 'bottom' ? { kind: 'bottomSheet' } : { kind: 'modal' };
		case 'anchored': {
			const anchor = anchorView(placement.origin);
			return anchor ? { kind: 'popover', anchor, position: placement.positions[0] } : { kind: 'modal' };
		}
	}
}

const IOS_OVER_FULL_SCREEN = 5;

/**
 * NativeScript paints a full-screen modal window white each time it starts, and the theme dims what is behind it.
 * helm's backdrop is the scrim, as on the web.
 */
function clearWindowBackground(root: View): void {
	if (__ANDROID__) {
		const window = (root as unknown as { _dialogFragment?: androidx.fragment.app.DialogFragment })._dialogFragment
			?.getDialog()
			?.getWindow();
		window?.setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(android.graphics.Color.TRANSPARENT));
		window?.clearFlags(android.view.WindowManager.LayoutParams.FLAG_DIM_BEHIND);
	}
	if (__APPLE__) {
		const controller = (root as unknown as { viewController?: UIViewController }).viewController;
		if (controller) controller.view.backgroundColor = UIColor.clearColor;
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
