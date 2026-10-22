import { CdkMenuTrigger } from '@angular/cdk/menu';
import {
	computed,
	Directive,
	effect,
	ElementRef,
	forwardRef,
	inject,
	Injector,
	input,
	type TemplateRef,
} from '@angular/core';
import {
	BrnMenuHost,
	cdkMenuItems,
	createMenuPosition,
	MENU_SIDE,
	type MenuAlign,
	type MenuSide,
} from '@spartan-ng/brain/core';
import { injectHlmDropdownMenuConfig } from './hlm-dropdown-menu-token';

@Directive({
	selector: '[hlmDropdownMenuTrigger]',
	providers: [{ provide: MENU_SIDE, useExisting: forwardRef(() => HlmDropdownMenuTrigger) }],
	hostDirectives: [
		{
			directive: CdkMenuTrigger,
			inputs: ['cdkMenuTriggerData: hlmDropdownMenuTriggerData'],
			outputs: ['cdkMenuOpened: hlmDropdownMenuOpened', 'cdkMenuClosed: hlmDropdownMenuClosed'],
		},
	],
	host: { 'data-slot': 'dropdown-menu-trigger', '(click)': '_openInMenuHost()' },
})
export class HlmDropdownMenuTrigger {
	private readonly _cdkTrigger = inject(CdkMenuTrigger, { host: true });
	private readonly _config = injectHlmDropdownMenuConfig();
	private readonly _menuHost = inject(BrnMenuHost, { optional: true });
	private readonly _injector = inject(Injector);
	private readonly _elementRef = inject(ElementRef);

	public readonly menu = input<TemplateRef<unknown> | null>(null, { alias: 'hlmDropdownMenuTrigger' });
	public readonly align = input<MenuAlign>(this._config.align);
	public readonly side = input<MenuSide>(this._config.side);

	private readonly _menuPosition = computed(() => createMenuPosition(this.align(), this.side()));

	constructor() {
		// CDK sets transform-origin on the menu content from the resolved position; the content reads it to
		// animate from the anchored corner and to derive its data-side. Cast tolerates @angular/cdk < 21.2
		// (we still support >=21.0), where the property is absent and the assignment is a harmless no-op.
		(this._cdkTrigger as { transformOriginSelector?: string }).transformOriginSelector = '[data-slot="dropdown-menu"]';

		effect(() => {
			this._cdkTrigger.menuPosition = this._menuPosition();
		});
		// With a menu host, CDK's trigger gets no template, so it never opens its overlay.
		if (!this._menuHost) {
			effect(() => {
				this._cdkTrigger.menuTemplateRef = this.menu();
			});
		}
	}

	protected _openInMenuHost(): void {
		const template = this.menu();
		const menuHost = this._menuHost;
		if (!menuHost || !template) return;
		// The content resolves CDK's menu stack and trigger from this injector, as it does in CDK's overlay.
		const view = template.createEmbeddedView({ $implicit: this._cdkTrigger.menuData }, this._injector);
		view.detectChanges();
		this._cdkTrigger.opened.next();
		void menuHost
			.open({
				anchor: this._elementRef.nativeElement,
				side: this.side(),
				align: this.align(),
				items: cdkMenuItems(this._cdkTrigger.getMenu(), menuHost),
			})
			.finally(() => {
				view.destroy();
				this._cdkTrigger.closed.next();
			});
	}
}
