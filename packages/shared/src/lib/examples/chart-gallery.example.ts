import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HLM_CHART_THEME, HlmChartImports, hlmChartTooltip } from '@spartan-ng/helm/chart';
import { areaY, barX, barY, colorLegend, defineChart, dot, group, lineY, ruleY, stack, text } from '@tanstack/charts';
import { decorative } from '@tanstack/charts/mark/decorative';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { scalePoint } from '@tanstack/charts/scales/point';

type Kpi = { readonly id: string; readonly label: string; readonly value: string; readonly delta: string; readonly series: readonly number[] };

type Traffic = { readonly week: string; readonly channel: 'Search' | 'Social' | 'Email'; readonly visits: number };

type Orders = { readonly quarter: string; readonly region: 'North' | 'South' | 'West'; readonly orders: number };

type Product = { readonly name: string; readonly units: number };

type Review = { readonly name: string; readonly category: 'Audio' | 'Wearables'; readonly price: number; readonly rating: number; readonly sold: number };

type OrdersLayout = 'stacked' | 'grouped';

const KPIS: readonly Kpi[] = [
  { id: 'visitors', label: 'Visitors', value: '84.1k', delta: '+12%', series: [52, 55, 54, 61, 58, 66, 70, 68, 75, 79, 77, 84] },
  { id: 'orders', label: 'Orders', value: '3,920', delta: '+8%', series: [31, 29, 33, 32, 35, 34, 36, 38, 37, 39, 38, 39] },
  { id: 'refunds', label: 'Refund rate', value: '1.8%', delta: '-0.4', series: [2.6, 2.5, 2.7, 2.4, 2.3, 2.4, 2.1, 2.2, 2.0, 1.9, 1.9, 1.8] },
];

const WEEKS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
const TRAFFIC: readonly Traffic[] = [
  [24, 9, 5], [26, 11, 6], [25, 14, 6], [29, 13, 8], [31, 16, 7], [30, 19, 9], [34, 18, 10], [37, 22, 11],
].flatMap(([search, social, email], index) => [
  { week: WEEKS[index], channel: 'Search' as const, visits: search },
  { week: WEEKS[index], channel: 'Social' as const, visits: social },
  { week: WEEKS[index], channel: 'Email' as const, visits: email },
]);

const ORDERS: readonly Orders[] = [
  [410, 280, 190], [460, 300, 240], [520, 290, 310], [610, 340, 360],
].flatMap(([north, south, west], index) => [
  { quarter: `Q${index + 1}`, region: 'North' as const, orders: north },
  { quarter: `Q${index + 1}`, region: 'South' as const, orders: south },
  { quarter: `Q${index + 1}`, region: 'West' as const, orders: west },
]);

const PRODUCTS: readonly Product[] = [
  { name: 'Studio buds', units: 1240 },
  { name: 'Smart band', units: 980 },
  { name: 'Desk speaker', units: 760 },
  { name: 'Travel case', units: 540 },
  { name: 'Charging dock', units: 410 },
];

const REVIEWS: readonly Review[] = [
  { name: 'Studio buds', category: 'Audio', price: 129, rating: 4.6, sold: 1240 },
  { name: 'Desk speaker', category: 'Audio', price: 199, rating: 4.4, sold: 760 },
  { name: 'Party speaker', category: 'Audio', price: 279, rating: 3.9, sold: 220 },
  { name: 'Sport buds', category: 'Audio', price: 89, rating: 4.1, sold: 610 },
  { name: 'Studio cans', category: 'Audio', price: 249, rating: 4.7, sold: 380 },
  { name: 'Smart band', category: 'Wearables', price: 79, rating: 4.3, sold: 980 },
  { name: 'Smart watch', category: 'Wearables', price: 229, rating: 4.0, sold: 450 },
  { name: 'Ring tracker', category: 'Wearables', price: 299, rating: 3.6, sold: 140 },
  { name: 'Kids watch', category: 'Wearables', price: 59, rating: 3.8, sold: 330 },
];

// toLocaleString('en-US') prints 1240, not 1,240, in the Android app, so group the digits by hand.
const formatThousands = (value: number) => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const AVERAGE_RATING =Math.round((REVIEWS.reduce((sum, review) => sum + review.rating, 0) / REVIEWS.length) * 10) / 10;

/**
 * A store dashboard built from TanStack marks: area and line sparklines with a gradient fill, a stacked area with a
 * legend, bars that switch between stacked and grouped, ranked horizontal bars with value labels, and a scatter plot
 * with a dashed average rule. Every color comes from the example's --chart-* tokens through Spartan's chart helm.
 */
@Component({
  selector: 'example-chart-gallery',
  imports: [HlmCardImports, HlmChartImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'example-chart-gallery' },
  template: `
    <div class="example-chart-gallery flex flex-col gap-5 p-4 pb-10 bg-background text-foreground">
      <div class="hero flex flex-col gap-1 p-6 rounded-3xl">
        <span class="on-hero-soft text-xs font-semibold">Store performance</span>
        <h1 class="on-hero text-3xl font-extrabold">Chart gallery</h1>
        <p class="on-hero-soft text-sm">Six TanStack mark types, one palette. Tap any mark for its values.</p>
      </div>

      <div class="flex flex-col gap-3">
        @for (kpi of kpis; track kpi.id) {
          <div hlmCard class="flex flex-row items-center gap-4 p-4 rounded-2xl">
            <div class="flex flex-col gap-1 w-32">
              <span class="text-xs font-semibold text-muted-foreground">{{ kpi.label }}</span>
              <span class="text-2xl font-extrabold">{{ kpi.value }}</span>
              <span class="delta text-xs font-bold">{{ kpi.delta }} vs last quarter</span>
            </div>
            <div class="flex-1 min-w-0">
              <tanstack-chart hlmChart [options]="sparklines[$index]" />
            </div>
          </div>
        }
      </div>

      <div hlmCard class="flex flex-col gap-3 p-5 rounded-3xl">
        <div class="flex flex-col gap-1">
          <h3 hlmCardTitle class="text-lg font-bold">Traffic by channel</h3>
          <p hlmCardDescription class="text-sm">Stacked area. The top edge is total weekly visits, in thousands.</p>
        </div>
        <tanstack-chart hlmChart [options]="trafficChart" />
      </div>

      <div hlmCard class="flex flex-col gap-3 p-5 rounded-3xl">
        <div class="flex flex-col gap-1">
          <h3 hlmCardTitle class="text-lg font-bold">Orders by region</h3>
          <p hlmCardDescription class="text-sm">The same rows as a stack or side by side. Only the layout changes.</p>
        </div>
        <div class="layout-track flex flex-row gap-1 p-1 rounded-full">
          @for (option of layouts; track option) {
            <button class="layout-option flex-1 flex flex-row items-center justify-center py-2 rounded-full text-sm font-semibold" [class.active]="layout() === option" (click)="layout.set(option)">
              {{ option === 'stacked' ? 'Stacked' : 'Grouped' }}
            </button>
          }
        </div>
        <tanstack-chart hlmChart [options]="ordersChart()" />
      </div>

      <div hlmCard class="flex flex-col gap-3 p-5 rounded-3xl">
        <div class="flex flex-col gap-1">
          <h3 hlmCardTitle class="text-lg font-bold">Best sellers</h3>
          <p hlmCardDescription class="text-sm">Horizontal bars with direct value labels, units this quarter.</p>
        </div>
        <tanstack-chart hlmChart [options]="productsChart" />
      </div>

      <div hlmCard class="flex flex-col gap-3 p-5 rounded-3xl">
        <div class="flex flex-col gap-1">
          <h3 hlmCardTitle class="text-lg font-bold">Price against rating</h3>
          <p hlmCardDescription class="text-sm">One dot per product, sized by units sold. The dashed rule is the average rating.</p>
        </div>
        <tanstack-chart hlmChart [options]="reviewsChart" />
      </div>
    </div>
  `,
})
export class ChartGalleryExample {
  protected readonly kpis = KPIS;
  protected readonly layouts: readonly OrdersLayout[] = ['stacked', 'grouped'];
  protected readonly layout = signal<OrdersLayout>('stacked');

  protected readonly sparklines = KPIS.map((kpi, index) => {
    const color = `var(--chart-${index + 1})`;
    const gradient = `spark-${kpi.id}`;
    const points = kpi.series.map((value, step) => ({ step, value }));
    const low = Math.min(...kpi.series);
    return {
      definition: defineChart({
        marks: [
          areaY(points, { x: 'step', y1: low, y2: 'value', fill: `url(#${gradient})`, fillOpacity: 1 }),
          lineY(points, { x: 'step', y: 'value', stroke: color, strokeWidth: 2 }),
        ],
        scales: { x: { scale: scaleLinear }, y: { scale: scaleLinear } },
        gradients: [{ id: gradient, stops: [{ offset: 0, color, opacity: 0 }, { offset: 1, color, opacity: 0.4 }] }],
        guides: false,
        margin: 3,
        focus: false,
        theme: HLM_CHART_THEME,
      }),
      ariaLabel: `${kpi.label} trend`,
      height: 56,
    };
  });

  protected readonly trafficChart = {
    definition: defineChart(
      {
        marks: [
          areaY(TRAFFIC, { x: 'week', y: 'visits', color: 'channel', layout: stack({ order: ['Search', 'Social', 'Email'] }), fillOpacity: 0.85 }),
          decorative(ruleY([0])),
        ],
        scales: {
          x: { scale: () => scalePoint<string>().padding(0.1) },
          y: { scale: scaleLinear, nice: true, grid: true },
        },
        color: { legend: colorLegend({ itemWidth: 76 }) },
        theme: HLM_CHART_THEME,
      },
      { tooltip: hlmChartTooltip<Traffic, string, number>() },
    ),
    ariaLabel: 'Weekly visits by channel',
    aspectRatio: 1.5,
  };

  protected readonly ordersChart = computed(() => ({
    definition: defineChart(
      {
        marks: [
          barY(ORDERS, {
            x: 'quarter',
            y: 'orders',
            color: 'region',
            radius: 3,
            layout: this.layout() === 'grouped' ? group({ padding: 0.12 }) : stack(),
          }),
        ],
        scales: {
          x: { scale: () => scaleBand<string>().padding(0.24) },
          y: { scale: scaleLinear, nice: true, grid: true },
        },
        color: { legend: colorLegend({ itemWidth: 76 }) },
        theme: HLM_CHART_THEME,
      },
      { tooltip: hlmChartTooltip<Orders, string, number>() },
    ),
    ariaLabel: 'Orders per quarter by region',
    aspectRatio: 1.5,
  }));

  protected readonly productsChart = {
    definition: defineChart(
      {
        marks: [
          barX(PRODUCTS, { x: 'units', y: 'name', fill: 'var(--chart-1)', radius: 4 }),
          decorative(text(PRODUCTS, { x: 'units', y: 'name', text: (product) => formatThousands(product.units), anchor: 'start', dx: 6, fontSize: 11, fontWeight: 600 })),
        ],
        scales: {
          x: { scale: scaleLinear().domain([0, 1500]), grid: true },
          y: { scale: () => scaleBand<string>().padding(0.28) },
        },
        theme: HLM_CHART_THEME,
      },
      {
        tooltip: hlmChartTooltip<Product, number, string>({
          items: [
            { channel: 'y', label: 'Product' },
            { channel: 'x', label: 'Units', text: (point) => formatThousands(point.xValue) },
          ],
        }),
      },
    ),
    ariaLabel: 'Units sold per product',
    aspectRatio: 1.4,
  };

  protected readonly reviewsChart = {
    definition: defineChart(
      {
        marks: [
          decorative(ruleY([AVERAGE_RATING], { stroke: 'var(--chart-3)', strokeOpacity: 1, strokeWidth: 1.5, strokeDasharray: '5 4' })),
          decorative(text([AVERAGE_RATING], { x: () => 320, y: (rating) => rating, text: (rating) => `Avg ${rating}`, anchor: 'end', dy: -6, fontSize: 11, fontWeight: 600, fill: 'var(--chart-3)' })),
          dot(REVIEWS, { x: 'price', y: 'rating', color: 'category', r: 'sold', rScale: (sold) => 3 + Math.sqrt(sold) / 4, fillOpacity: 0.75, stroke: 'var(--card)', strokeWidth: 1 }),
        ],
        scales: {
          x: { scale: scaleLinear().domain([40, 320]), grid: true },
          y: { scale: scaleLinear().domain([3.4, 4.9]), grid: true },
        },
        color: { legend: colorLegend({ itemWidth: 76 }) },
        theme: HLM_CHART_THEME,
      },
      {
        tooltip: hlmChartTooltip<Review, number, number>({
          items: [
            { field: 'name', label: 'Product' },
            { channel: 'x', label: 'Price', text: (point) => `$${point.xValue}` },
            { channel: 'y', label: 'Rating', text: (point) => point.yValue.toFixed(1) },
          ],
        }),
      },
    ),
    ariaLabel: 'Product price against average rating',
    aspectRatio: 1.3,
  };
}
