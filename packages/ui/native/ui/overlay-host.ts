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
import { confirm } from '@nativescript-community/ui-dialogs';
import { Drawer, type DrawerEventData } from '@nativescript-community/ui-drawer';
import { HorizontalPosition, showPopover, VerticalPosition } from '@nativescript-community/ui-popover';
import {
	type AndroidActivityBackPressedEventData,
	Application,
	type EventData,
	Frame,
	Utils,
	View,
	type ViewBase,
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
import { MASON_ELEMENTS } from '../native-elements';

type CloseWindow = () => void;

/**
 * Opens spartan's dialogs and overlays in native windows: alert dialogs as the platform's alert, other centered
 * dialogs in a modal dialog, bottom drawers and sheets in a material bottom sheet, left, right and top sheets in a
 * side of the app's `Drawer`, anchored overlays in a popover. The content is the helm markup, rendered into a MasonKit
 * root that carries the theme scope the page would have given it. Below provideMasonElements(), alert dialogs open in
 * the modal dialog too.
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
		const parent = request.viewContainerRef?.injector ?? this._injector;
		if (isDialog(request) && !parent.get(MASON_ELEMENTS)) {
			const dialog = this._openPlatformDialog(request, parent);
			if (dialog) return dialog;
		}
		const window = nativeWindow(request.placement);
		const views = this._createViews(window.kind);
		const theme = window.kind === 'drawer' ? [...themeClasses(), DRAWER_SLOT_BACKGROUND] : themeClasses();
		const surface = new NativeScriptSurface(views, theme, request.panelClass, request.backdropClass);
		const injector = Injector.create({
			parent,
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
	 * Shows helm dialog and alert-dialog content in the platform's dialog: Material's on Android, UIAlertController on
	 * iOS. The header gives its title and message and the footer its buttons; anything between them, such as form
	 * fields, stays in the dialog as its content. Choosing a button clicks the helm button, so its `(click)` and
	 * `hlmDialogClose` run as on the web; the back button or a tap outside chooses the negative button. Content the
	 * platform dialog cannot hold (no title, no button, or more than three) returns null and opens in the modal window.
	 */
	private _openPlatformDialog(request: BrnDialogRequest, parent: Injector): BrnOverlaySurface | null {
		const pane = this._renderer.createElement('div') as View;
		const surface = new NativeScriptSurface({ root: pane, pane, backdrop: null }, themeClasses(), [], []);
		const view = this._render(request, Injector.create({ parent, providers: request.providers(surface) }), pane);
		surface.onTeardown(() => {
			this._appRef.detachView(view);
			view.destroy();
		});
		const dialog = platformDialog(pane, request.role);
		if (!dialog) {
			surface.windowClosed();
			return null;
		}
		const { negative, neutral, positive } = dialog.buttons;
		if (dialog.body) {
			for (const part of dialog.body.hidden) part.visibility = 'collapse';
			// The platform dialog draws the card; helm's content keeps its side padding and the gaps between fields.
			for (const [style, value] of [
				['background', 'transparent'],
				['borderWidth', '0'],
				['boxShadow', 'none'],
				['paddingTop', '0'],
				['paddingBottom', '0'],
			]) {
				this._renderer.setStyle(dialog.body.content, style, value);
			}
		}
		surface.show(() => surface.windowClosed());
		void confirm({
			title: dialog.title,
			message: dialog.message,
			view: dialog.body ? pane : undefined,
			okButtonText: textOf(positive),
			cancelButtonText: negative && textOf(negative),
			neutralButtonText: neutral && textOf(neutral),
			cancelable: !request.disableClose,
		}).then((result: boolean | undefined) => {
			const button = result === true ? positive : result === undefined ? neutral : negative;
			if (button) click(button);
			else surface.dismiss('escape');
			// The platform dialog is gone whichever way it closed. A helm close waits for its exit (a promise), so a
			// result the button gave lands first; a button that does not close the dialog still ends it here.
			setTimeout(() => surface.windowClosed());
		});
		return surface;
	}

	/**
	 * A modal fills its window like the web's overlay container: the backdrop covers it and the pane is centered on
	 * top. Bottom sheets, drawer slots and popovers draw their own window chrome, so the pane is the whole window
	 * content.
	 */
	private _createViews(kind: NativeWindow['kind']): SurfaceViews {
		const pane = this._renderer.createElement('div') as View;
		if (kind === 'popover') {
			// A popover window can be wider than its panel (it spans from the anchor to the screen edge); the panel keeps
			// its own width, as a CDK overlay pane sizes to its content.
			for (const [style, value] of [
				['display', 'flex'],
				['flexDirection', 'column'],
				['alignItems', 'flex-start'],
			]) {
				this._renderer.setStyle(pane, style, value);
			}
		}
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
export function themeClasses(): string[] {
	const dark = Application.getRootView()?.cssClasses.has('ns-dark') ?? false;
	return ['style-vega', dark ? 'ns-dark' : 'ns-light'];
}

/** Helm dialog content as the platform dialog shows it. */
interface PlatformDialog {
	readonly title: string;
	readonly message: string | undefined;
	readonly buttons: DialogButtons;
	/** Set when the content has more than a header and footer: the content view and the parts the dialog draws itself. */
	readonly body: { readonly content: View; readonly hidden: readonly View[] } | null;
}

/** Helm buttons in the platform dialog's places for them. */
interface DialogButtons {
	readonly negative?: ViewBase;
	readonly neutral?: ViewBase;
	readonly positive: ViewBase;
}

/** Slots the platform dialog draws itself, so they are hidden in a body it shows. */
const DIALOG_CHROME = /^(alert-)?dialog-(header|footer|close)$/;

/** Rendered dialog or alert-dialog content as a platform dialog, found by helm's `data-slot`, or null if it does not fit one. */
function platformDialog(root: View, role: BrnDialogRequest['role']): PlatformDialog | null {
	const slots = new Map<string, View[]>();
	const visit = (view: View) => {
		const slot = slotOf(view);
		if (slot) slots.set(slot, [...(slots.get(slot) ?? []), view]);
		view.eachChildView((child) => {
			visit(child);
			return true;
		});
	};
	visit(root);
	const prefix = role === 'alertdialog' ? 'alert-dialog' : 'dialog';
	const title = slots.get(`${prefix}-title`)?.[0];
	const buttons = role === 'alertdialog' ? alertButtons(slots) : footerButtons(slots.get('dialog-footer')?.[0]);
	if (!title || !buttons) return null;
	const description = slots.get(`${prefix}-description`)?.[0];
	const content = slots.get(`${prefix}-content`)?.[0];
	const hidden = [...slots].flatMap(([slot, views]) => (DIALOG_CHROME.test(slot) ? views : []));
	return {
		title: textOf(title),
		message: description && textOf(description),
		buttons,
		body: content && hasBody(content, new Set(hidden)) ? { content, hidden } : null,
	};
}

/**
 * Whether `view` holds anything besides the chrome the platform dialog draws. A view that only wraps chrome, such
 * as the host of a component that HlmDialogService opened, does not count.
 */
function hasBody(view: View, chrome: ReadonlySet<View>): boolean {
	let found = false;
	view.eachChildView((child) => {
		if (!chrome.has(child) && (!wrapsChrome(child, chrome) || hasBody(child, chrome))) found = true;
		return !found;
	});
	return found;
}

function wrapsChrome(view: View, chrome: ReadonlySet<View>): boolean {
	let wraps = false;
	view.eachChildView((child) => {
		wraps = chrome.has(child) || wrapsChrome(child, chrome);
		return !wraps;
	});
	return wraps;
}

/** An alert dialog's cancel button is negative; its last action is positive and an action before it neutral. */
function alertButtons(slots: ReadonlyMap<string, View[]>): DialogButtons | null {
	const actions = slots.get('alert-dialog-action') ?? [];
	if (actions.length === 0 || actions.length > 2) return null;
	const negative = slots.get('alert-dialog-cancel')?.[0];
	return actions.length === 2 ? { negative, neutral: actions[0], positive: actions[1] } : { negative, positive: actions[0] };
}

/** A dialog footer's buttons, in order: the last is positive, the first negative and a middle one neutral. */
function footerButtons(footer: View | undefined): DialogButtons | null {
	const buttons: View[] = [];
	const visit = (view: View) =>
		view.eachChildView((child) => {
			if (child.cssType?.toLowerCase() === 'button') buttons.push(child);
			else visit(child);
			return true;
		});
	if (footer) visit(footer);
	switch (buttons.length) {
		case 1:
			return { positive: buttons[0] };
		case 2:
			return { negative: buttons[0], positive: buttons[1] };
		case 3:
			return { negative: buttons[0], neutral: buttons[1], positive: buttons[2] };
		default:
			return null;
	}
}

function slotOf(view: View): string | undefined {
	const slot = (view as unknown as Record<string, unknown>)['data-slot'];
	return typeof slot === 'string' ? slot : undefined;
}

/** What MasonKit keeps of an element's text: its own `text`, or its children, which include DOM text nodes. */
interface MasonNode {
	readonly nodeType?: number;
	readonly data?: unknown;
	readonly text?: unknown;
	readonly _children?: readonly MasonNode[];
}

/** The text an element and its children draw. */
function textOf(view: ViewBase): string {
	const collect = (node: MasonNode): string => {
		if (node.nodeType === 3) return String(node.data ?? '');
		if (typeof node.text === 'string' && node.text.trim()) return node.text;
		return (node._children ?? []).map(collect).join(' ');
	};
	return collect(view as unknown as MasonNode)
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Runs a helm button's click handlers, as a tap on it would. MasonKit registers `(click)` on the native view, which
 * dispatches it from its click listener on Android and through `mason_dispatch` on iOS. Content the dialog does not
 * show never gets native views, so MasonKit still holds those listeners as pending registrations.
 */
function click(view: ViewBase): void {
	if (!view.nativeViewProtected) {
		const pending = (view as unknown as { _pendingEventsRegistration?: PendingListener[] })._pendingEventsRegistration;
		const event = { type: 'click', target: view, currentTarget: view, preventDefault() {}, stopPropagation() {} };
		for (const { arg, callback, thisArg } of pending ?? []) {
			if (arg === 'click') callback.call(thisArg ?? view, event);
		}
		return;
	}
	if (__ANDROID__) (view.nativeViewProtected as android.view.View).performClick();
	if (__APPLE__) {
		const native = view.nativeViewProtected as { mason_dispatch?: (event: unknown) => void } | undefined;
		native?.mason_dispatch?.(MasonEvent.alloc().initWithTypeBubblesCancelableOptions('click', false, true, null));
	}
}

interface PendingListener {
	readonly arg: string;
	readonly callback: (event: unknown) => void;
	readonly thisArg: unknown;
}

declare const MasonEvent: {
	alloc(): { initWithTypeBubblesCancelableOptions(type: string, bubbles: boolean, cancelable: boolean, options: null): unknown };
};

/** A centered helm dialog or alert dialog; sheets and drawers share the dialog request but open at an edge. */
function isDialog(request: BrnDialogRequest | BrnOverlayHostRequest): request is BrnDialogRequest {
	return 'role' in request && request.placement.kind === 'center';
}
