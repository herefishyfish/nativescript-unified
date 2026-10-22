import {
	ChangeDetectionStrategy,
	Component,
	DestroyRef,
	Directive,
	ElementRef,
	NO_ERRORS_SCHEMA,
	TemplateRef,
	computed,
	effect,
	inject,
	input,
	signal,
	viewChild,
} from '@angular/core';
import { Application, type EventData, type TapGestureEventData, type View } from '@nativescript/core';
import type {
	ChartDefinition,
	ChartFocusState,
	ChartHostOptions,
	ChartPoint,
	ChartScene,
	ChartSize,
	ChartTooltipOptions,
} from '@tanstack/charts';
import {
	resolveChartFocusStrategy,
	resolveChartPointerFocus,
	resolveFocusPresentation,
	resolveMarkStateScene,
} from '@tanstack/charts/cursor/host';
import { createChartRuntime } from '@tanstack/charts/runtime';
import { findNearestPoint, viewportInteractionPoints } from '@tanstack/charts/scene';
import {
	createChartTooltipContent,
	orderChartTooltipPoints,
	resolveChartTooltipAnchor,
	resolveChartTooltipPlacement,
} from '@tanstack/charts/tooltip/model';
import { createChartPaintResolver } from '../ui/chart-colors';
import { chartPainter } from '../ui/chart-paint';

type ChartOptions = ChartHostOptions & { class?: string; style?: string };

type TooltipRow = { readonly label: string; readonly value: string; readonly color: string | null };

type Tooltip = {
	readonly title?: string;
	readonly color: string | null;
	readonly rows: readonly TooltipRow[];
	readonly text?: string;
	readonly left: number;
	readonly top: number;
	readonly placed: boolean;
};

/**
 * Stands in for `@tanstack/angular-charts` (aliased in vite.config.mts): the real `Chart` renders its SVG through
 * `innerHTML` and measures with DOM APIs. Same selector and inputs, so `<tanstack-chart hlmChart [options]>` in helm
 * and app templates compiles against the real package, while the scene from TanStack's DOM-free runtime is drawn
 * into a native view (`chartPainter`). A tap focuses the nearest datum and, when the definition has a tooltip, shows
 * TanStack's tooltip content placed by its placement helpers.
 */
@Component({
	selector: 'tanstack-chart',
	schemas: [NO_ERRORS_SCHEMA],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div class="relative">
			@if (_tag === 'Canvas') {
				<Canvas #surface (layoutChanged)="_measure()" (tap)="_tap($event)"></Canvas>
			} @else {
				<Svg #surface (layoutChanged)="_measure()" (tap)="_tap($event)"></Svg>
			}
			@if (_tooltip(); as tooltip) {
				<div
					class="spartan-chart-tooltip absolute flex flex-col gap-1 rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground"
					[style.left]="tooltip.left"
					[style.top]="tooltip.top"
					[style.opacity]="tooltip.placed ? 1 : 0"
					(layoutChanged)="_measureTooltip($event)"
				>
					@if (tooltip.text !== undefined) {
						<span>{{ tooltip.text }}</span>
					} @else {
						@if (tooltip.title) {
							<div class="flex flex-row items-center gap-1.5">
								@if (tooltip.color) {
									<div class="h-2 w-2 rounded-sm" [style.background-color]="tooltip.color"></div>
								}
								<span class="font-semibold">{{ tooltip.title }}</span>
							</div>
						}
						@for (row of tooltip.rows; track $index) {
							<div class="flex flex-row items-center gap-1.5">
								@if (row.color) {
									<div class="h-2 w-2 rounded-sm" [style.background-color]="row.color"></div>
								}
								<span class="grow">{{ row.label }}</span>
								<span class="font-medium">{{ row.value }}</span>
							</div>
						}
					}
				</div>
			}
		</div>
	`,
})
export class Chart {
	public readonly options = input.required<ChartOptions>();

	protected readonly _tag = chartPainter.tag;
	private readonly _surface = viewChild('surface', { read: ElementRef<View> });
	private readonly _view = computed(() => this._surface()?.nativeElement);
	private readonly _width = signal(0);
	private readonly _theme = signal(0);
	private readonly _focus = signal<ChartFocusState | null>(null);
	private readonly _tooltipSize = signal<{ width: number; height: number } | null>(null);
	private readonly _runtime = createChartRuntime();

	private readonly _size = computed((): ChartSize | null => {
		const { width, height, aspectRatio } = this.options();
		const resolvedWidth = width ?? this._width();
		if (!resolvedWidth) return null;
		return { width: resolvedWidth, height: height ?? (aspectRatio ? resolvedWidth / aspectRatio : 320) };
	});

	private readonly _font = computed(() => {
		this._theme();
		const style = this._view()?.style;
		return { family: 'sans-serif', size: style?.fontSize || 12, weight: String(style?.fontWeight ?? '400') };
	});

	private readonly _scene = computed((): ChartScene | null => {
		const size = this._size();
		if (!size) return null;
		const started = Date.now();
		const scene = this._runtime.render(this.options().definition as ChartDefinition, size, {
			measureText: chartPainter.measureText,
			typography: { fontFamily: this._font().family },
		});
		console.log(`CHARTPROBE render ${Date.now() - started}ms`);
		return scene;
	});

	protected readonly _tooltip = computed((): Tooltip | null => {
		const scene = this._scene();
		const focus = this._focus();
		const options = this.options().definition.tooltip as ChartTooltipOptions | undefined;
		const view = this._view();
		if (!scene || !focus || !options || !view) return null;
		this._theme();
		const colors = createChartPaintResolver(view);
		const paint = (value: string | undefined) => (value ? colors.resolve(value) : null);
		const points = orderChartTooltipPoints(focus.group, scene, options.sort);
		const content = createChartTooltipContent(points, scene, focus.pinned, options, focus.primary);
		const size = this._tooltipSize();
		const anchor = resolveChartTooltipAnchor(focus.primary, points, scene, null, options, focus);
		const position = size
			? resolveChartTooltipPlacement(
					anchor,
					size,
					{ left: 0, top: 0, right: scene.width, bottom: scene.height },
					options.placement,
					options.offset,
				)
			: { left: 0, top: 0 };
		const base = { left: position.left, top: position.top, placed: size !== null };
		if (typeof content === 'string') return { ...base, text: content, color: null, rows: [] };
		return {
			...base,
			title: content.title,
			color: paint(content.color),
			rows: content.rows.map((row) => ({ label: row.label, value: row.value, color: paint(row.color) })),
		};
	});

	constructor() {
		effect(() => {
			const { width, height, aspectRatio } = this.options();
			this._view()?.setInlineStyle(
				[
					`width: ${width ?? '100%'}`,
					height !== undefined ? `height: ${height}` : aspectRatio ? `aspect-ratio: ${aspectRatio}` : 'height: 320',
				].join('; '),
			);
		});

		effect(() => {
			const started = Date.now();
			const scene = this._scene();
			if (!scene) return;
			const rendered = Date.now();
			const focus = this._focus();
			const view = this._view();
			if (!view) return;
			const presented = resolveMarkStateScene(scene, focus, null).scene;
			const { under, over } = resolveFocusPresentation(presented, focus, null);
			const painted = under.length || over.length ? { ...presented, nodes: [...under, ...presented.nodes, ...over] } : presented;
			chartPainter.paint(view, painted, createChartPaintResolver(view), this._font(), this.options().ariaLabel ?? '');
			console.log(`CHARTPROBE ${chartPainter.tag} ${scene.width}x${scene.height} scene=${rendered - started}ms paint=${Date.now() - rendered}ms`);
		});

		// A new scene invalidates the focused points and the tooltip's measured size.
		effect(() => {
			this._scene();
			this._focus.set(null);
		});
		effect(() => {
			this._focus();
			this._tooltipSize.set(null);
		});

		// The palette lives in CSS variables that switch with the .ns-dark root class, which is applied after this event.
		const repaint = () => setTimeout(() => this._theme.update((tick) => tick + 1));
		Application.on(Application.systemAppearanceChangedEvent, repaint);
		inject(DestroyRef).onDestroy(() => {
			Application.off(Application.systemAppearanceChangedEvent, repaint);
			this._runtime.destroy();
		});
	}

	protected _measure(): void {
		this._width.set(this._view()?.getActualSize().width ?? 0);
	}

	protected _measureTooltip(event: EventData): void {
		const { width, height } = (event.object as View).getActualSize();
		const current = this._tooltipSize();
		if (current?.width !== width || current?.height !== height) this._tooltipSize.set({ width, height });
	}

	/** Tapping a datum pins its focus group; tapping it again, or empty space, clears it. */
	protected _tap(event: TapGestureEventData): void {
		const scene = this._scene();
		if (!scene) return;
		const definition = this.options().definition;
		const points = this._pointsAt(scene, definition as ChartDefinition, event.getX(), event.getY());
		const primary = points[0];
		const current = this._focus();
		if (!primary || (current && current.primary.key === primary.key)) {
			this._focus.set(null);
			return;
		}
		this._focus.set({ primary, group: points, source: 'pointer', pinned: true });
	}

	private _pointsAt(scene: ChartScene, definition: ChartDefinition, x: number, y: number): readonly ChartPoint[] {
		if (definition.focus === false) return [];
		const points = viewportInteractionPoints(scene);
		const maxDistance = definition.maxFocusDistance ?? 48;
		const strategy = resolveChartFocusStrategy(definition.focus);
		const focused = resolveChartPointerFocus(scene, strategy, x, y, maxDistance, points);
		if (focused?.length) return focused;
		const nearest = findNearestPoint(scene, x, y, maxDistance, points);
		return nearest ? (strategy?.group(points, { point: nearest }) ?? [nearest]) : [];
	}
}

@Directive({ selector: 'ng-template[tanstackChartTooltipBody]' })
export class ChartTooltipBodyDirective {
	public readonly definition = input.required<ChartDefinition>({ alias: 'tanstackChartTooltipBody' });
	public readonly templateRef = inject(TemplateRef);
}
