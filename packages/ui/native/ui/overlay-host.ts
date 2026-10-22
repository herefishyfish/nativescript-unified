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
import { Drawer, type DrawerEventData } from '@nativescript-community/ui-drawer';
import { HorizontalPosition, showPopover, VerticalPosition } from '@nativescript-community/ui-popover';
import {
	type AndroidActivityBackPressedEventData,
	Application,
	type EventData,
	Frame,
	Utils,
	View,
} from '@nativescript/core';
import type {
	BrnOverlayDismissal,
	BrnOverlayEdge,
	BrnOverlayPlacement,
	BrnOverlayRequest,
} from '@spartan-ng/brain/core';
import { BrnOverlaySurface } from '@spartan-ng/brain/core';
import type { BrnDialogHost, BrnDialogRequest } from '@spartan-ng/brain/dialog';
import type { BrnOverlayHost, BrnOverlayHostRequest } from '@spartan-ng/brain/overlay';
import { Subject } from 'rxjs';

type CloseWindow = () => void;

/**
 * Opens spartan's dialogs and overlays in native windows: centered dialogs in a modal dialog, bottom drawers and
 * sheets in a material bottom sheet, left, right and top sheets in a side of the app's `Drawer`, anchored overlays
 * in a popover. The content is the helm markup, rendered into a MasonKit root that carries the theme scope the page
 * would have given it.
 */
@Injectable({ providedIn: 'root' })
export class NativeScriptOverlayHost implements BrnDialogHost, BrnOverlayHost {
	private readonly _appRef = inject(ApplicationRef);
	private readonly _environmentInjector = inject(EnvironmentInjector);
	private readonly _injector = inject(Injector);
	private readonly _renderer: Renderer2 = inject(RendererFactory2).createRenderer(null, null);
	/** Open modal and bottom sheet roots; a new window is presented from the topmost one. */
	private readonly _windows: View[] = [];
	/** The app's drawer shows one side at a time. */
	private _drawerSurface: NativeScriptSurface | null = null;

	public open(request: BrnDialogRequest | BrnOverlayHostRequest): BrnOverlaySurface {
		const window = nativeWindow(request.placement);
		const views = this._createViews(window.kind);
		const theme = window.kind === 'drawer' ? [...themeClasses(), DRAWER_SLOT_BACKGROUND] : themeClasses();
		const surface = new NativeScriptSurface(views, theme, request.panelClass, request.backdropClass);
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
			case 'drawer':
				surface.show(this._showDrawer(views.pane, surface, window.drawer, window.side));
				break;
		}
		return surface;
	}

	/**
	 * A modal fills its window like the web's overlay container: the backdrop covers it and the pane is centered on
	 * top. Bottom sheets, drawer slots and popovers draw their own window chrome, so the pane is the whole window
	 * content.
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

	private _showDrawer(pane: View, surface: NativeScriptSurface, drawer: Drawer, side: DrawerSide): CloseWindow {
		this._drawerSurface?.windowClosed();
		this._drawerSurface = surface;
		const slot = DRAWER_SLOTS[side];
		if (side !== 'top') {
			this._renderer.setStyle(pane, 'width', `${sideSheetWidth(drawer)}px`);
			this._renderer.setStyle(pane, 'height', '100%');
		}
		// The drawer spans the screen under the system bars, as a fixed web sheet spans the viewport. The slot draws
		// the sheet's background under the bars and keeps the sheet itself clear of them.
		const insets = systemBarInsets(drawer);
		this._renderer.setStyle(pane, 'paddingTop', `${insets.top}px`);
		if (side !== 'top') this._renderer.setStyle(pane, 'paddingBottom', `${insets.bottom}px`);
		pane.ignoreTouchAnimation = true;
		pane.on('tap', () => undefined);
		const backdrop = drawer.backDrop;
		const onBackdropTap = () => surface.dismiss('backdrop');
		backdrop.on('tap', onBackdropTap);
		// The drawer is part of the page rather than a window, so the back button reaches the activity.
		const onBack = (args: AndroidActivityBackPressedEventData) => {
			args.cancel = true;
			surface.dismiss('escape');
		};
		if (__ANDROID__) Application.android.on(Application.android.activityBackPressedEvent, onBack);
		const onClose = (args: EventData) => {
			if ((args as DrawerEventData).side === side) surface.windowClosed();
		};
		drawer.on('close', onClose);
		const onLayout = () => {
			pane.off(View.layoutChangedEvent, onLayout);
			// The drawer moves a new slot view off screen in a timer after its first layout; opening sooner races it.
			setTimeout(() => {
				if (drawer[slot] !== pane) return;
				drawer.applyTrData(drawer.computeTranslationData(side, slotSize(pane, side)), side);
				void drawer.open(side);
			});
		};
		surface.onTeardown(() => {
			pane.off(View.layoutChangedEvent, onLayout);
			backdrop.off('tap', onBackdropTap);
			if (__ANDROID__) Application.android.off(Application.android.activityBackPressedEvent, onBack);
			drawer.off('close', onClose);
			if (drawer[slot] === pane) drawer[slot] = undefined;
			if (this._drawerSurface === surface) this._drawerSurface = null;
		});
		drawer[slot] = pane;
		// After the drawer's own layout listener, which measures the slot.
		pane.on(View.layoutChangedEvent, onLayout);
		// close() returns early, without a close event, for a slot that never laid out.
		return () => void drawer.close(side).then(() => surface.windowClosed());
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
	| { readonly kind: 'popover'; readonly anchor: View; readonly position: ConnectedPosition | undefined }
	| { readonly kind: 'drawer'; readonly drawer: Drawer; readonly side: DrawerSide };

type DrawerSide = Exclude<BrnOverlayEdge, 'bottom'>;

const DRAWER_SLOTS = { left: 'leftDrawer', right: 'rightDrawer', top: 'topDrawer' } as const satisfies Record<
	DrawerSide,
	keyof Drawer
>;

/** helm's `.spartan-sheet-content` background, for the part of a drawer slot under the system bars. */
const DRAWER_SLOT_BACKGROUND = 'bg-popover';

/** Bottom edges open a bottom sheet, the other edges a side of the app's drawer, anchors that are views a popover. */
function nativeWindow(placement: BrnOverlayPlacement): NativeWindow {
	switch (placement.kind) {
		case 'center':
			return { kind: 'modal' };
		case 'edge':
			return placement.side === 'bottom'
				? { kind: 'bottomSheet' }
				: { kind: 'drawer', drawer: appDrawer(), side: placement.side };
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

/** The `Drawer` the app wraps its router outlet in, found above the showing frame. */
function appDrawer(): Drawer {
	for (let view: View | undefined = Frame.topmost(); view; view = view.parent as View | undefined) {
		if (view instanceof Drawer) return view;
	}
	throw new Error('Left, right and top sheets open in a Drawer around the router outlet, and there is none.');
}

/**
 * helm's side sheets are `w-3/4 sm:max-w-sm` against the viewport. In a drawer slot the percentage would resolve
 * against the pane's own content, so the pane takes the width the viewport would give.
 */
function sideSheetWidth(drawer: Drawer): number {
	const width = drawer.getActualSize().width;
	return width >= 640 ? Math.min(width * 0.75, 384) : width * 0.75;
}

function systemBarInsets(view: View): { readonly top: number; readonly bottom: number } {
	if (__ANDROID__) {
		const insets = androidx.core.view.ViewCompat.getRootWindowInsets(view.android)?.getInsets(
			androidx.core.view.WindowInsetsCompat.Type.systemBars(),
		);
		return insets
			? {
					top: Utils.layout.toDeviceIndependentPixels(insets.top),
					bottom: Utils.layout.toDeviceIndependentPixels(insets.bottom),
				}
			: { top: 0, bottom: 0 };
	}
	const insets = Application.ios.window.safeAreaInsets;
	return { top: insets.top, bottom: insets.bottom };
}

function slotSize(pane: View, side: DrawerSide): number {
	const size = pane.getActualSize();
	return side === 'top' ? size.height : size.width;
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
