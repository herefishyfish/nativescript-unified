import { Color, type View } from '@nativescript/core';

/** A scene paint (`var(--chart-1)`, `currentColor`, `#0d9488`) as a concrete color, or null for no paint. */
export type ChartPaintResolver = {
	resolve(paint: string): string | null;
	withOpacity(color: string, opacity: number): string;
};

/**
 * Resolves scene paints against the CSS variables in scope at `view`, the way the browser computes them for the SVG.
 * Values are read on every call, so a repaint after a theme change picks up the new palette.
 */
export function createChartPaintResolver(view: View): ChartPaintResolver {
	const resolve = (paint: string, depth = 0): string | null => {
		const value = paint.trim();
		if (value === 'none' || depth > 8) return null;
		if (value === 'currentColor') return currentColor(view) ?? resolve('var(--foreground)', depth + 1);
		if (!value.startsWith('var(') || !value.endsWith(')')) return value;
		const { name, fallback } = parseVar(value);
		const raw = view.style.getCssVariable(name);
		if (raw != null && raw !== '') return resolve(raw, depth + 1);
		return fallback === undefined ? null : resolve(fallback, depth + 1);
	};
	return {
		resolve: (paint) => resolve(paint),
		withOpacity(color, opacity) {
			const parsed = new Color(color);
			const alpha = (parsed.a / 255) * Math.max(0, Math.min(1, opacity));
			return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${alpha})`;
		},
	};
}

function currentColor(view: View): string | null {
	const color = view.style.color;
	if (!color) return null;
	return color.a < 255 ? `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})` : color.hex;
}

/** `var(--name, fallback)` with a fallback that may itself hold commas and nested functions. */
function parseVar(value: string): { name: string; fallback?: string } {
	let depth = 0;
	for (let index = 4; index < value.length - 1; index++) {
		const character = value[index];
		if (character === '(') depth++;
		else if (character === ')') depth--;
		else if (character === ',' && depth === 0) {
			return { name: value.slice(4, index).trim(), fallback: value.slice(index + 1, -1).trim() };
		}
	}
	return { name: value.slice(4, -1).trim() };
}
