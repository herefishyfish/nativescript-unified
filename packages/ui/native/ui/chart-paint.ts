/**
 * Scene painting ported from @tanstack/charts 0.16.0 `dist/canvas.js` (paintNodes and its helpers) onto a
 * @nativescript/canvas 2D context.
 *
 * MIT License. Copyright (c) 2026-present Tanner Linsley.
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above
 * copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 * LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
 * SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */
import { type Canvas, OffscreenCanvas, Path2D } from '@nativescript/canvas';
import { Screen } from '@nativescript/core';
import type {
	ChartScene,
	ChartTextMeasureOptions,
	ChartTextMetrics,
	SceneNode,
	SceneStyle,
} from '@tanstack/charts';
import type { ChartPaintResolver } from './chart-colors';

export type ChartFont = { readonly family: string; readonly size: number; readonly weight: string };

type Context = ReturnType<Canvas['getContext']> & CanvasRenderingContext2D;

type PaintState = {
	fill: string | null;
	fillOpacity: number;
	stroke: string | null;
	strokeOpacity: number;
	strokeWidth: number;
	opacity: number;
	lineCap: CanvasLineCap;
	lineJoin: CanvasLineJoin;
	strokeDasharray: string;
};

type Bounds = { x: number; y: number; width: number; height: number } | null;

type Painter = { context: Context; colors: ChartPaintResolver; scene: ChartScene; font: ChartFont };

const defaultPaint: PaintState = {
	fill: 'black',
	fillOpacity: 1,
	stroke: null,
	strokeOpacity: 1,
	strokeWidth: 1,
	opacity: 1,
	lineCap: 'butt',
	lineJoin: 'miter',
	strokeDasharray: '',
};

/** Paints `scene` into `canvas` at device resolution, replacing what was there. */
export function paintChartScene(canvas: Canvas, scene: ChartScene, colors: ChartPaintResolver, font: ChartFont): void {
	const scale = Screen.mainScreen.scale;
	const width = Math.max(1, Math.ceil(scene.width * scale));
	const height = Math.max(1, Math.ceil(scene.height * scale));
	if (canvas.width !== width) canvas.width = width;
	if (canvas.height !== height) canvas.height = height;
	const context = canvas.getContext('2d') as Context;
	context.setTransform(scale, 0, 0, scale, 0, 0);
	context.globalAlpha = 1;
	context.setLineDash([]);
	context.clearRect(0, 0, scene.width, scene.height);
	if (scene.theme.background !== 'transparent') {
		const background = colors.resolve(scene.theme.background);
		if (background) {
			context.fillStyle = background;
			context.fillRect(0, 0, scene.width, scene.height);
		}
	}
	paintNodes({ context, colors, scene, font }, scene.nodes, defaultPaint);
}

/** Label metrics from the same Skia text engine that paints them, so axis margins fit the drawn labels. */
export const measureChartText = createCanvasTextMeasurer();

function createCanvasTextMeasurer() {
	let context: Context | undefined;
	const cache = new Map<string, ChartTextMetrics>();
	return (text: string, options: ChartTextMeasureOptions): ChartTextMetrics => {
		const key = `${options.fontSize}\0${options.fontWeight ?? ''}\0${options.fontFamily}\0${options.fontScale}\0${options.anchor}\0${options.baseline}\0${text}`;
		const cached = cache.get(key);
		if (cached) return cached;
		context ??= new OffscreenCanvas(1, 1).getContext('2d') as unknown as Context;
		const fontSize = options.fontSize * (options.fontScale || 1);
		context.font = `${options.fontStyle} ${options.fontWeight ?? 400} ${fontSize}px ${options.fontFamily}`;
		context.textAlign = options.anchor === 'middle' ? 'center' : options.anchor === 'end' ? 'right' : 'left';
		context.textBaseline =
			options.baseline === 'auto' ? 'alphabetic' : options.baseline === 'middle' ? 'middle' : 'hanging';
		const measured = context.measureText(text);
		const left = measured.actualBoundingBoxLeft;
		const right = measured.actualBoundingBoxRight;
		const ascent = measured.actualBoundingBoxAscent;
		const descent = measured.actualBoundingBoxDescent;
		const metrics =
			[left, right, ascent, descent].every(Number.isFinite) && left + right > 0 && ascent + descent > 0
				? { x: -left, y: -ascent, width: left + right, height: ascent + descent }
				: estimate(measured.width, fontSize, options);
		cache.set(key, metrics);
		return metrics;
	};
}

function estimate(width: number, fontSize: number, options: ChartTextMeasureOptions): ChartTextMetrics {
	const x = options.anchor === 'middle' ? -width / 2 : options.anchor === 'end' ? -width : 0;
	const y = options.baseline === 'middle' ? -fontSize / 2 : options.baseline === 'hanging' ? 0 : -fontSize * 0.8;
	return { x, y, width, height: fontSize };
}

function paintNodes(painter: Painter, nodes: readonly SceneNode[], parent: PaintState): void {
	for (let index = 0; index < nodes.length; index++) {
		const node = nodes[index];
		if (!node) continue;
		if (node.kind === 'dot') index = paintDotRun(painter, nodes, index, parent);
		else paintNode(painter, node, parent);
	}
}

function paintNode(painter: Painter, node: SceneNode, parent: PaintState): void {
	const state = resolveStyle(parent, node.style);
	const { context } = painter;
	context.save();
	try {
		switch (node.kind) {
			case 'group':
				if (node.focus) return;
				context.translate(node.translateX ?? 0, node.translateY ?? 0);
				if (node.clip) {
					context.beginPath();
					context.rect(node.clip.x, node.clip.y, node.clip.width, node.clip.height);
					context.clip();
				}
				paintNodes(painter, node.children, state);
				return;
			case 'rule':
				context.beginPath();
				context.moveTo(node.x1, node.y1);
				context.lineTo(node.x2, node.y2);
				strokeCurrentPath(painter, state, boundsForNode(node));
				return;
			case 'polyline':
				if (node.path) paintPath(painter, new Path2D(node.path), state, boundsForNode(node));
				else {
					beginPointPath(context, node.points, false);
					paintCurrentPath(painter, state, boundsForNode(node));
				}
				return;
			case 'area':
				if (node.polygons !== undefined) {
					beginPolygonPath(context, node.polygons);
					paintCurrentPath(painter, state, boundsForNode(node), 'evenodd');
				} else if (node.path) {
					paintPath(painter, new Path2D(node.path), state, boundsForNode(node));
				} else {
					beginPointPath(context, node.points, true);
					paintCurrentPath(painter, state, boundsForNode(node));
				}
				return;
			case 'dot':
				context.beginPath();
				context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
				paintCurrentPath(painter, state, boundsForNode(node));
				return;
			case 'rect':
				beginRoundedRect(context, node.x, node.y, node.width, node.height, node.radius ?? 0);
				paintCurrentPath(painter, state, boundsForNode(node));
				return;
			case 'label':
				paintLabel(painter, node, state);
		}
	} finally {
		context.restore();
	}
}

function paintDotRun(painter: Painter, nodes: readonly SceneNode[], start: number, parent: PaintState): number {
	const first = nodes[start];
	if (!first || first.kind !== 'dot') return start;
	const state = resolveStyle(parent, first.style);
	if (usesGradient(state)) {
		paintNode(painter, first, parent);
		return start;
	}
	const { context } = painter;
	context.save();
	try {
		context.beginPath();
		let index = start;
		for (; index < nodes.length; index++) {
			const node = nodes[index];
			if (!node || node.kind !== 'dot' || !samePaintState(resolveStyle(parent, node.style), state)) break;
			context.moveTo(node.x + node.radius, node.y);
			context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
		}
		paintCurrentPath(painter, state, null);
		return index - 1;
	} finally {
		context.restore();
	}
}

function usesGradient(state: PaintState): boolean {
	return Boolean(state.fill?.startsWith('url(#') || state.stroke?.startsWith('url(#'));
}

function samePaintState(left: PaintState, right: PaintState): boolean {
	return (
		left.fill === right.fill &&
		left.fillOpacity === right.fillOpacity &&
		left.stroke === right.stroke &&
		left.strokeOpacity === right.strokeOpacity &&
		left.strokeWidth === right.strokeWidth &&
		left.opacity === right.opacity &&
		left.lineCap === right.lineCap &&
		left.lineJoin === right.lineJoin &&
		left.strokeDasharray === right.strokeDasharray
	);
}

function beginPointPath(context: Context, points: readonly (readonly [number, number])[], close: boolean): void {
	context.beginPath();
	points.forEach(([x, y], index) => (index === 0 ? context.moveTo(x, y) : context.lineTo(x, y)));
	if (close && points.length) context.closePath();
}

function beginPolygonPath(context: Context, polygons: readonly (readonly (readonly (readonly [number, number])[])[])[]): void {
	context.beginPath();
	for (const polygon of polygons) {
		for (const ring of polygon) {
			ring.forEach(([x, y], index) => (index === 0 ? context.moveTo(x, y) : context.lineTo(x, y)));
			if (ring.length) context.closePath();
		}
	}
}

function beginRoundedRect(context: Context, x: number, y: number, width: number, height: number, radius: number): void {
	const resolved = Math.max(0, Math.min(radius, width / 2, height / 2));
	context.beginPath();
	if (resolved === 0) {
		context.rect(x, y, width, height);
		return;
	}
	context.moveTo(x + resolved, y);
	context.lineTo(x + width - resolved, y);
	context.arcTo(x + width, y, x + width, y + resolved, resolved);
	context.lineTo(x + width, y + height - resolved);
	context.arcTo(x + width, y + height, x + width - resolved, y + height, resolved);
	context.lineTo(x + resolved, y + height);
	context.arcTo(x, y + height, x, y + height - resolved, resolved);
	context.lineTo(x, y + resolved);
	context.arcTo(x, y, x + resolved, y, resolved);
	context.closePath();
}

function paintPath(painter: Painter, path: Path2D, state: PaintState, bounds: Bounds): void {
	const fill = resolvePaint(painter, state.fill, bounds);
	if (fill) {
		painter.context.globalAlpha = state.opacity * state.fillOpacity;
		painter.context.fillStyle = fill;
		painter.context.fill(path as unknown as globalThis.Path2D);
	}
	const stroke = resolvePaint(painter, state.stroke, bounds);
	if (stroke) {
		configureStroke(painter.context, state, stroke);
		painter.context.stroke(path as unknown as globalThis.Path2D);
	}
}

function paintCurrentPath(painter: Painter, state: PaintState, bounds: Bounds, fillRule?: CanvasFillRule): void {
	const fill = resolvePaint(painter, state.fill, bounds);
	if (fill) {
		painter.context.globalAlpha = state.opacity * state.fillOpacity;
		painter.context.fillStyle = fill;
		if (fillRule === undefined) painter.context.fill();
		else painter.context.fill(fillRule);
	}
	strokeCurrentPath(painter, state, bounds);
}

function strokeCurrentPath(painter: Painter, state: PaintState, bounds: Bounds): void {
	const stroke = resolvePaint(painter, state.stroke, bounds);
	if (!stroke) return;
	configureStroke(painter.context, state, stroke);
	painter.context.stroke();
}

function configureStroke(context: Context, state: PaintState, stroke: string | CanvasGradient): void {
	context.globalAlpha = state.opacity * state.strokeOpacity;
	context.strokeStyle = stroke;
	context.lineWidth = state.strokeWidth;
	context.lineCap = state.lineCap;
	context.lineJoin = state.lineJoin;
	context.setLineDash(parseDasharray(state.strokeDasharray));
}

function paintLabel(painter: Painter, node: Extract<SceneNode, { kind: 'label' }>, state: PaintState): void {
	const { context, font } = painter;
	context.translate(node.x, node.y);
	if (node.rotate !== undefined) context.rotate((node.rotate * Math.PI) / 180);
	context.font = `normal ${node.fontWeight ?? font.weight} ${node.fontSize ?? font.size}px ${font.family}`;
	context.textAlign = node.anchor === 'middle' ? 'center' : node.anchor === 'end' ? 'right' : 'left';
	context.textBaseline = node.baseline === 'middle' ? 'middle' : node.baseline === 'hanging' ? 'hanging' : 'alphabetic';
	const fill = resolvePaint(painter, state.fill, null);
	if (fill) {
		context.globalAlpha = state.opacity * state.fillOpacity;
		context.fillStyle = fill;
		context.fillText(node.text, 0, 0);
	}
	const stroke = resolvePaint(painter, state.stroke, null);
	if (stroke) {
		configureStroke(context, state, stroke);
		context.strokeText(node.text, 0, 0);
	}
}

function resolveStyle(parent: PaintState, style: SceneStyle | undefined): PaintState {
	if (!style) return parent;
	return {
		fill: style.fill === undefined ? parent.fill : paintValue(style.fill),
		fillOpacity: style.fillOpacity ?? parent.fillOpacity,
		stroke: style.stroke === undefined ? parent.stroke : paintValue(style.stroke),
		strokeOpacity: style.strokeOpacity ?? parent.strokeOpacity,
		strokeWidth: style.strokeWidth ?? parent.strokeWidth,
		opacity: parent.opacity * (style.opacity ?? 1),
		lineCap: (style.lineCap as CanvasLineCap | undefined) ?? parent.lineCap,
		lineJoin: resolveLineJoin(style.lineJoin) ?? parent.lineJoin,
		strokeDasharray: style.strokeDasharray ?? parent.strokeDasharray,
	};
}

function paintValue(value: string): string | null {
	return value === 'none' ? null : value;
}

function resolveLineJoin(value: string | undefined): CanvasLineJoin | undefined {
	if (value === 'arcs') return 'round';
	if (value === 'miter-clip') return 'miter';
	return value as CanvasLineJoin | undefined;
}

function resolvePaint(painter: Painter, value: string | null, bounds: Bounds): string | CanvasGradient | null {
	if (!value) return null;
	const match = /^url\(#([^)]+)\)$/.exec(value);
	if (!match) return painter.colors.resolve(value);
	const gradient = painter.scene.gradients.find((candidate) => candidate.id === match[1]);
	if (!gradient || !bounds) return null;
	const canvasGradient = painter.context.createLinearGradient(
		bounds.x + (gradient.x1 ?? 0) * bounds.width,
		bounds.y + (gradient.y1 ?? 1) * bounds.height,
		bounds.x + (gradient.x2 ?? 0) * bounds.width,
		bounds.y + (gradient.y2 ?? 0) * bounds.height,
	);
	for (const stop of gradient.stops) {
		const color = painter.colors.resolve(stop.color);
		if (!color) continue;
		canvasGradient.addColorStop(
			Math.max(0, Math.min(1, stop.offset)),
			stop.opacity === undefined ? color : painter.colors.withOpacity(color, stop.opacity),
		);
	}
	return canvasGradient;
}

function boundsForNode(node: SceneNode): Bounds {
	switch (node.kind) {
		case 'rule':
			return boundsFromPoints([
				[node.x1, node.y1],
				[node.x2, node.y2],
			]);
		case 'polyline':
			return boundsFromPoints(node.points);
		case 'area':
			return node.polygons === undefined ? boundsFromPoints(node.points) : boundsFromPoints(node.polygons.flatMap((polygon) => polygon.flat()));
		case 'dot':
			return { x: node.x - node.radius, y: node.y - node.radius, width: node.radius * 2, height: node.radius * 2 };
		case 'rect':
			return { x: node.x, y: node.y, width: node.width, height: node.height };
		default:
			return null;
	}
}

function boundsFromPoints(points: readonly (readonly [number, number])[]): Bounds {
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	for (const [x, y] of points) {
		if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
		minX = Math.min(minX, x);
		minY = Math.min(minY, y);
		maxX = Math.max(maxX, x);
		maxY = Math.max(maxY, y);
	}
	if (!Number.isFinite(minX) || !Number.isFinite(minY)) return null;
	return { x: minX, y: minY, width: Math.max(0, maxX - minX), height: Math.max(0, maxY - minY) };
}

function parseDasharray(value: string): number[] {
	if (!value || value === 'none') return [];
	return value
		.split(/[,\s]+/)
		.map(Number)
		.filter((part) => Number.isFinite(part) && part >= 0);
}
