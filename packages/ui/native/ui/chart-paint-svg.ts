import { registerElement } from '@nativescript/angular';
import { Svg } from '@nativescript/canvas-svg';
import type { View } from '@nativescript/core';
import type { ChartScene, ChartTextMeasureOptions, ChartTextMetrics } from '@tanstack/charts';
import { renderChartSvg } from '@tanstack/charts/svg';
import type { ChartPaintResolver } from './chart-colors';
import type { ChartFont, ChartPainter } from './chart-painter';

export const svgChartPainter: ChartPainter = {
	tag: 'Svg',
	register() {
		registerElement('Svg', () => Svg);
	},
	measureText: __ANDROID__ ? createAndroidTextMeasurer() : undefined,
	paint(view: View, scene: ChartScene, colors: ChartPaintResolver, font: ChartFont, ariaLabel: string) {
		const markup = renderChartSvg(scene, { ariaLabel })
			.replace('<svg ', `<svg font-family="${font.family}" font-size="${font.size}" font-weight="${font.weight}" `)
			.replace(/ (fill|stroke|stop-color)="([^"]+)"/g, (attribute, name: string, value: string) => {
				if (!value.includes('var(') && value !== 'currentColor') return attribute;
				return ` ${name}="${colors.resolve(value.replaceAll('&quot;', '"')) ?? 'none'}"`;
			});
		(view as Svg).src = markup;
	},
};

/** Font metrics from the platform text engine, so axis margins fit the labels the SVG renderer draws. */
function createAndroidTextMeasurer() {
	const cache = new Map<string, ChartTextMetrics>();
	let paint: android.graphics.Paint | undefined;
	return (text: string, options: ChartTextMeasureOptions): ChartTextMetrics => {
		const key = `${options.fontSize}\0${options.fontWeight ?? ''}\0${options.fontScale}\0${options.anchor}\0${options.baseline}\0${text}`;
		const cached = cache.get(key);
		if (cached) return cached;
		paint ??= new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
		const fontSize = options.fontSize * (options.fontScale || 1);
		paint.setTextSize(fontSize);
		paint.setTypeface(
			android.graphics.Typeface.create(
				android.graphics.Typeface.SANS_SERIF,
				(options.fontWeight ?? 400) >= 600 ? android.graphics.Typeface.BOLD : android.graphics.Typeface.NORMAL,
			),
		);
		const width = paint.measureText(text);
		const metrics = paint.getFontMetrics();
		const ascent = -metrics.ascent;
		const descent = metrics.descent;
		const x = options.anchor === 'middle' ? -width / 2 : options.anchor === 'end' ? -width : 0;
		const y = options.baseline === 'middle' ? -(ascent + descent) / 2 : options.baseline === 'hanging' ? 0 : -ascent;
		const result = { x, y, width, height: ascent + descent };
		cache.set(key, result);
		return result;
	};
}
