import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HLM_CHART_THEME, HlmChartImports, hlmChartTooltip } from '@spartan-ng/helm/chart';
import { barY, defineChart, lineY } from '@tanstack/charts';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { scalePoint } from '@tanstack/charts/scales/point';

type Range = 6 | 12;

type Revenue = { readonly month: string; readonly revenue: number };
type Visits = { readonly month: string; readonly visits: number; readonly series: 'This year' | 'Last year' };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const REVENUE = [42, 58, 51, 64, 72, 69, 81, 77, 88, 94, 90, 108];
const VISITS_NOW = [3.1, 3.4, 3.9, 4.2, 4.0, 4.8, 5.3, 5.1, 5.9, 6.4, 6.2, 7.1];
const VISITS_BEFORE = [2.4, 2.6, 2.9, 3.0, 3.3, 3.2, 3.6, 3.9, 3.8, 4.3, 4.6, 4.9];

/**
 * TanStack Charts through Spartan's chart helm: a bar chart and a two-series line chart that take the example's
 * --chart-* tokens. The range toggle rebuilds both definitions; tapping a bar or point opens the tooltip.
 */
@Component({
  selector: 'example-charts',
  imports: [HlmCardImports, HlmChartImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'example-charts' },
  template: `
    <div class="example-charts flex flex-col gap-5 p-4 pb-10 bg-background text-foreground">
      <div class="hero flex flex-col gap-3 p-6 rounded-3xl">
        <span class="on-hero-soft text-xs font-semibold">Quarterly review</span>
        <h1 class="on-hero text-3xl font-extrabold">Revenue is up {{ growth() }}%</h1>
        <div class="range-track flex flex-row gap-1 p-1 rounded-full">
          @for (option of ranges; track option) {
            <button class="range-option flex-1 flex flex-row items-center justify-center py-2 rounded-full text-sm font-semibold" [class.active]="range() === option" (click)="range.set(option)">
              Last {{ option }} months
            </button>
          }
        </div>
      </div>

      <div hlmCard class="flex flex-col gap-3 p-5 rounded-3xl">
        <div class="flex flex-col gap-1">
          <h3 hlmCardTitle class="text-lg font-bold">Monthly revenue</h3>
          <p hlmCardDescription class="text-sm">Thousands of USD, billed per month.</p>
        </div>
        <tanstack-chart hlmChart [options]="revenueChart()" />
      </div>

      <div hlmCard class="flex flex-col gap-3 p-5 rounded-3xl">
        <div class="flex flex-col gap-1">
          <h3 hlmCardTitle class="text-lg font-bold">Visitors</h3>
          <p hlmCardDescription class="text-sm">Thousands of visits, this year against last.</p>
        </div>
        <tanstack-chart hlmChart [options]="visitsChart()" />
        <div class="flex flex-row gap-4">
          <div class="flex flex-row items-center gap-2">
            <div class="swatch swatch-1 w-3 h-3 rounded-sm"></div>
            <span class="text-xs text-muted-foreground">This year</span>
          </div>
          <div class="flex flex-row items-center gap-2">
            <div class="swatch swatch-2 w-3 h-3 rounded-sm"></div>
            <span class="text-xs text-muted-foreground">Last year</span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ChartsExample {
  protected readonly ranges: readonly Range[] = [6, 12];
  protected readonly range = signal<Range>(6);

  private readonly months = computed(() => MONTHS.slice(MONTHS.length - this.range()));

  protected readonly growth = computed(() => {
    const revenue = REVENUE.slice(REVENUE.length - this.range());
    return Math.round(((revenue[revenue.length - 1] - revenue[0]) / revenue[0]) * 100);
  });

  protected readonly revenueChart = computed(() => {
    const rows: Revenue[] = this.months().map((month) => ({ month, revenue: REVENUE[MONTHS.indexOf(month)] }));
    return {
      definition: defineChart(
        {
          marks: [barY(rows, { x: 'month', y: 'revenue', radius: 4 })],
          scales: {
            x: { scale: () => scaleBand<string>().padding(0.24) },
            y: { scale: scaleLinear, nice: true, grid: true },
          },
          theme: HLM_CHART_THEME,
        },
        { tooltip: hlmChartTooltip<Revenue, string, number>() },
      ),
      ariaLabel: 'Monthly revenue',
      aspectRatio: 1.6,
    };
  });

  protected readonly visitsChart = computed(() => {
    const rows: Visits[] = this.months().flatMap((month) => {
      const index = MONTHS.indexOf(month);
      return [
        { month, visits: VISITS_NOW[index], series: 'This year' as const },
        { month, visits: VISITS_BEFORE[index], series: 'Last year' as const },
      ];
    });
    return {
      definition: defineChart(
        {
          marks: [lineY(rows, { x: 'month', y: 'visits', z: 'series', strokeWidth: 2.5 })],
          scales: {
            x: { scale: () => scalePoint<string>().padding(0.3) },
            y: { scale: scaleLinear, nice: true, grid: true },
          },
          theme: HLM_CHART_THEME,
        },
        { tooltip: hlmChartTooltip<Visits, string, number>() },
      ),
      ariaLabel: 'Visitors this year and last year',
      aspectRatio: 1.6,
    };
  });
}
