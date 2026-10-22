import { ChangeDetectionStrategy, Component, computed, linkedSignal, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideDollarSign, lucideEye, lucideTrendingDown, lucideTrendingUp, lucideUserPlus, lucideZap } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSeparator } from '@spartan-ng/helm/separator';

type Range = '7d' | '30d';

type Stat = { readonly label: string; readonly value: string; readonly delta: number; readonly icon: string };

type Bar = { readonly label: string; readonly value: number };

type Channel = { readonly name: string; readonly share: number };

type EventKind = 'signup' | 'payment' | 'warning' | 'risk' | 'release';

type Activity = { readonly text: string; readonly time: string; readonly kind: EventKind };

type RangeData = {
  readonly subtitle: string;
  readonly headline: string;
  readonly headlineDelta: number;
  readonly chartTitle: string;
  readonly stats: readonly Stat[];
  readonly bars: readonly Bar[];
  readonly channels: readonly Channel[];
  readonly activity: readonly Activity[];
};

const RANGES: readonly { readonly id: Range; readonly label: string }[] = [
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
];

const DATA: Readonly<Record<Range, RangeData>> = {
  '7d': {
    subtitle: 'Last 7 days · all channels',
    headline: '$9,640',
    headlineDelta: 6.2,
    chartTitle: 'Daily signups',
    stats: [
      { label: 'Visitors', value: '48.2k', delta: 12.4, icon: 'lucideEye' },
      { label: 'Signups', value: '1,204', delta: 8.1, icon: 'lucideUserPlus' },
      { label: 'Revenue', value: '$9.6k', delta: -2.3, icon: 'lucideDollarSign' },
      { label: 'Conversion', value: '2.5%', delta: 0.4, icon: 'lucideZap' },
    ],
    bars: [
      { label: 'Mon', value: 142 },
      { label: 'Tue', value: 168 },
      { label: 'Wed', value: 155 },
      { label: 'Thu', value: 230 },
      { label: 'Fri', value: 194 },
      { label: 'Sat', value: 118 },
      { label: 'Sun', value: 197 },
    ],
    channels: [
      { name: 'Organic search', share: 46 },
      { name: 'Direct', share: 27 },
      { name: 'Social', share: 18 },
      { name: 'Referral', share: 9 },
    ],
    activity: [
      { text: 'New team signup, Nordwind GmbH', time: '2m', kind: 'signup' },
      { text: 'Invoice paid, $249.00', time: '14m', kind: 'payment' },
      { text: 'Trial ending soon for 3 accounts', time: '1h', kind: 'warning' },
      { text: 'Churn risk flagged on acme.io', time: '3h', kind: 'risk' },
      { text: 'Feature flag enabled: new onboarding', time: '5h', kind: 'release' },
    ],
  },
  '30d': {
    subtitle: 'Last 30 days · all channels',
    headline: '$41,380',
    headlineDelta: 14.8,
    chartTitle: 'Weekly signups',
    stats: [
      { label: 'Visitors', value: '201k', delta: 18.9, icon: 'lucideEye' },
      { label: 'Signups', value: '5,312', delta: 11.6, icon: 'lucideUserPlus' },
      { label: 'Revenue', value: '$41.4k', delta: 14.8, icon: 'lucideDollarSign' },
      { label: 'Conversion', value: '2.6%', delta: -0.2, icon: 'lucideZap' },
    ],
    bars: [
      { label: 'W1', value: 1080 },
      { label: 'W2', value: 1215 },
      { label: 'W3', value: 1390 },
      { label: 'W4', value: 1627 },
    ],
    channels: [
      { name: 'Organic search', share: 41 },
      { name: 'Social', share: 26 },
      { name: 'Direct', share: 22 },
      { name: 'Referral', share: 11 },
    ],
    activity: [
      { text: 'Record week: 1,627 signups', time: '1d', kind: 'signup' },
      { text: 'Annual plan upgrade, Lumen Labs', time: '3d', kind: 'payment' },
      { text: 'Release 4.2 shipped to all users', time: '6d', kind: 'release' },
      { text: 'Payment retries rising in EU', time: '9d', kind: 'warning' },
      { text: '2 enterprise accounts at risk', time: '12d', kind: 'risk' },
    ],
  },
};

/** Theme color per activity kind; literal class names so Tailwind generates them. */
const KIND_CLASS: Readonly<Record<EventKind, string>> = {
  signup: 'bg-chart-4',
  payment: 'bg-chart-3',
  warning: 'bg-chart-5',
  risk: 'bg-destructive',
  release: 'bg-chart-2',
};

/** Theme color per channel rank. */
const CHANNEL_CLASS: readonly string[] = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4'];

/** A dashboard: stat cards with deltas, a flexbox bar chart with a tappable readout, channels and an activity feed. */
@Component({
  selector: 'example-analytics',
  imports: [NgIcon, HlmBadge, HlmCardImports, HlmSeparator],
  providers: [provideIcons({ lucideActivity, lucideDollarSign, lucideEye, lucideTrendingDown, lucideTrendingUp, lucideUserPlus, lucideZap })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'example-analytics' },
  template: `
    <div class="example-analytics flex flex-col gap-5 p-4 pb-10 bg-background text-foreground">
      <div class="hero flex flex-col gap-4 p-6 rounded-3xl">
        <div class="flex flex-row items-center justify-between">
          <div class="flex flex-col">
            <span class="on-hero text-2xl font-extrabold">Dashboard</span>
            <span class="on-hero text-sm">{{ data().subtitle }}</span>
          </div>
          <div class="live flex flex-row items-center gap-2 px-3 py-1 rounded-full">
            <div class="live-dot w-2 h-2 rounded-full"></div>
            <span class="live-text text-xs font-bold">LIVE</span>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <span class="on-hero text-xs font-bold uppercase">Revenue</span>
          <div class="flex flex-row items-end gap-3">
            <span class="on-hero text-5xl font-extrabold">{{ data().headline }}</span>
            <span class="hero-delta text-sm font-bold px-2 py-1 mb-2 rounded-full">+{{ data().headlineDelta }}%</span>
          </div>
        </div>
        <div class="range-track flex flex-row gap-1 p-1 rounded-full">
          @for (option of ranges; track option.id) {
            <button class="range-option flex-1 py-2 rounded-full text-sm font-bold" [class.active]="range() === option.id" (click)="range.set(option.id)">
              {{ option.label }}
            </button>
          }
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        @for (stat of data().stats; track stat.label) {
          <div hlmCard class="flex flex-col gap-2 p-4 rounded-2xl border border-border ring-0">
            <div class="flex flex-row items-center justify-between">
              <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-primary">
                <ng-icon [name]="stat.icon" size="16" />
              </div>
              <div class="delta flex flex-row items-center gap-1 px-2 py-1 rounded-full" [class.down]="stat.delta < 0">
                <ng-icon [name]="stat.delta < 0 ? 'lucideTrendingDown' : 'lucideTrendingUp'" size="12" />
                <span class="text-xs font-bold">{{ stat.delta > 0 ? '+' : '' }}{{ stat.delta }}%</span>
              </div>
            </div>
            <span class="text-2xl font-extrabold">{{ stat.value }}</span>
            <span class="text-xs font-semibold text-muted-foreground">{{ stat.label }}</span>
          </div>
        }
      </div>

      <div hlmCard class="flex flex-col gap-4 p-4 rounded-2xl border border-border ring-0">
        <div class="flex flex-row items-start justify-between">
          <div class="flex flex-col">
            <h3 hlmCardTitle class="text-lg font-bold">{{ data().chartTitle }}</h3>
            <p hlmCardDescription class="text-xs">Tap a bar for its value</p>
          </div>
          <div class="flex flex-col items-end">
            <span class="text-2xl font-extrabold text-primary">{{ selectedBar().value }}</span>
            <span class="text-xs text-muted-foreground">{{ selectedBar().label }}</span>
          </div>
        </div>
        <div class="flex flex-row items-stretch gap-2 h-44">
          @for (bar of data().bars; track bar.label; let i = $index) {
            <div class="flex flex-col flex-1 gap-2" (click)="selected.set(i)">
              <div class="flex flex-col flex-1">
                <div class="basis-0" [style.flexGrow]="100 - percent(bar.value)"></div>
                <div class="bar basis-0 rounded-lg" [class.peak]="selected() === i" [style.flexGrow]="percent(bar.value)"></div>
              </div>
              <span class="text-xs text-center font-semibold" [class.text-primary]="selected() === i" [class.text-muted-foreground]="selected() !== i">{{ bar.label }}</span>
            </div>
          }
        </div>
      </div>

      <div hlmCard class="flex flex-col gap-4 p-4 rounded-2xl border border-border ring-0">
        <h3 hlmCardTitle class="text-lg font-bold">Top channels</h3>
        @for (channel of data().channels; track channel.name; let i = $index) {
          <div class="flex flex-col gap-2">
            <div class="flex flex-row justify-between">
              <span class="text-sm font-semibold">{{ channel.name }}</span>
              <span class="text-sm font-bold text-muted-foreground">{{ channel.share }}%</span>
            </div>
            <div class="flex flex-row h-2 rounded-full bg-muted">
              <div class="basis-0 rounded-full" [class]="channelClass[i]" [style.flexGrow]="channel.share"></div>
              <div class="basis-0" [style.flexGrow]="100 - channel.share"></div>
            </div>
          </div>
        }
      </div>

      <div hlmCard class="flex flex-col gap-3 p-4 rounded-2xl border border-border ring-0">
        <div class="flex flex-row items-center gap-2">
          <ng-icon name="lucideActivity" size="18" class="text-primary" />
          <h3 hlmCardTitle class="text-lg font-bold">Recent activity</h3>
        </div>
        @for (event of data().activity; track event.text; let first = $first) {
          @if (!first) {
            <div hlmSeparator class="h-px w-full"></div>
          }
          <div class="flex flex-row items-center gap-3">
            <div class="w-3 h-3 rounded-full" [class]="kindClass[event.kind]"></div>
            <span class="text-sm flex-1">{{ event.text }}</span>
            <span hlmBadge variant="secondary">{{ event.time }}</span>
          </div>
        }
      </div>
    </div>
  `,
})
export class AnalyticsExample {
  protected readonly ranges = RANGES;
  protected readonly kindClass = KIND_CLASS;
  protected readonly channelClass = CHANNEL_CLASS;
  protected readonly range = signal<Range>('7d');
  protected readonly data = computed(() => DATA[this.range()]);
  /** Index of the highlighted bar; snaps to the busiest bar whenever the range changes. */
  protected readonly selected = linkedSignal(() => {
    const bars = this.data().bars;
    return bars.reduce((best, bar, i) => (bar.value > bars[best].value ? i : best), 0);
  });
  protected readonly selectedBar = computed(() => this.data().bars[this.selected()]);
  private readonly max = computed(() => Math.max(...this.data().bars.map((bar) => bar.value)));

  /** Bar height as a share of the tallest bar, kept above 8 so small bars stay visible. */
  protected percent(value: number): number {
    return Math.max(8, Math.round((value / this.max()) * 100));
  }
}
