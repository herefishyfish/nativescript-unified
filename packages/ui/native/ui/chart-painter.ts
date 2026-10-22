import type { View } from '@nativescript/core';
import type { ChartScene, ChartTextMeasurer } from '@tanstack/charts';
import type { ChartPaintResolver } from './chart-colors';

export type ChartFont = { readonly family: string; readonly size: number; readonly weight: string };

/** Draws a TanStack scene into one native view. */
export interface ChartPainter {
	/** The element the chart host renders, registered by `register()`. */
	readonly tag: 'Canvas' | 'Svg';
	register(): void;
	readonly measureText?: ChartTextMeasurer;
	paint(view: View, scene: ChartScene, colors: ChartPaintResolver, font: ChartFont, ariaLabel: string): void;
}
