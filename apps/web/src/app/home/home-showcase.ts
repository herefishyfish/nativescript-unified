import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, computed, signal, viewChildren } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideApple,
  lucideCalendarDays,
  lucideChartColumn,
  lucideChartLine,
  lucideChartScatter,
  lucideLogIn,
  lucideMusic,
  lucideNewspaper,
  lucidePlay,
  lucideSettings,
  lucideShoppingCart,
  lucideStar,
  lucideTag,
  lucideUserRound,
  lucideZap,
} from '@ng-icons/lucide';
import { EXAMPLES } from '@nativescript-unified/shared';
import { EXAMPLES_APP_LINKS } from '../core/site';

type View = 'preview' | 'code' | 'styles';

/** `shopping-cart` → `lucideShoppingCart`, the ng-icons name for an example's lucide icon. */
const iconName = (icon: string) => 'lucide' + icon.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase());

/**
 * The shared example screens (packages/shared/src/lib/examples), rendered live in a phone frame.
 * Loaded with @defer from the home page, so the twelve components and their sources stay out of the first bundle.
 */
@Component({
  selector: 'web-home-showcase',
  imports: [NgComponentOutlet, NgIcon],
  providers: [
    provideIcons({
      lucideTag,
      lucideShoppingCart,
      lucideUserRound,
      lucideChartColumn,
      lucideSettings,
      lucideCalendarDays,
      lucideStar,
      lucideLogIn,
      lucideMusic,
      lucideNewspaper,
      lucideChartLine,
      lucideChartScatter,
      lucideApple,
      lucidePlay,
      lucideZap,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block', 'data-testid': 'showcase' },
  template: `
    <div role="tablist" aria-label="Example screens" class="home-showcase-tabs" (keydown)="onTabKey($event)">
      @for (example of examples; track example.slug; let i = $index) {
        <button
          #tab
          type="button"
          role="tab"
          class="home-showcase-tab"
          [id]="'example-tab-' + example.slug"
          [attr.aria-selected]="i === index()"
          aria-controls="example-panel"
          [tabIndex]="i === index() ? 0 : -1"
          data-testid="example-tab"
          (click)="index.set(i)"
        >
          <ng-icon [name]="icon(example.icon)" size="15" aria-hidden="true" />
          {{ example.title }}
        </button>
      }
    </div>

    <div id="example-panel" role="tabpanel" [attr.aria-labelledby]="'example-tab-' + current().slug" class="mt-8 grid items-start gap-8 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-12">
      <div class="lg:sticky lg:top-24">
        <div class="flex items-center gap-3">
          <span class="home-showcase-icon example-tile-{{ current().slug }}"><ng-icon [name]="icon(current().icon)" size="20" aria-hidden="true" /></span>
          <h3 class="text-xl font-semibold tracking-tight" data-testid="example-title">{{ current().title }}</h3>
        </div>
        <p class="mt-3 text-muted-foreground">{{ current().blurb }}</p>
        <p class="mt-4 break-all font-mono text-xs text-muted-foreground">packages/shared/src/lib/examples/{{ current().slug }}.example.ts</p>

        <div role="group" aria-label="Show" class="home-segmented mt-6">
          @for (option of views; track option.id) {
            <button type="button" [attr.aria-pressed]="view() === option.id" [attr.data-testid]="'example-view-' + option.id" (click)="view.set(option.id)">{{ option.label }}</button>
          }
        </div>
        <p class="mt-6 text-sm text-muted-foreground">
          One component and one stylesheet, with no platform imports. The native app opens the same component from its UI tab, with the same Code and Styles views.
        </p>

        <div role="group" aria-labelledby="example-get-app-title" class="mt-6" data-testid="example-get-app">
          <p id="example-get-app-title" class="text-sm font-medium">Run it on a device</p>
          <div class="mt-3 grid gap-2">
            @for (link of appLinks; track link.id) {
              @if (link.url; as url) {
                <a class="home-store-link" [href]="url" target="_blank" rel="noopener" [attr.data-testid]="'example-get-app-' + link.id">
                  <ng-icon [name]="link.icon" size="20" aria-hidden="true" />
                  <span class="home-store-text"><span class="home-store-caption">{{ link.caption }}</span>{{ link.label }}</span>
                </a>
              } @else {
                <span class="home-store-link" aria-disabled="true" [attr.data-testid]="'example-get-app-' + link.id">
                  <ng-icon [name]="link.icon" size="20" aria-hidden="true" />
                  <span class="home-store-text"><span class="home-store-caption">{{ link.caption }}</span>{{ link.label }}</span>
                  <span class="home-tag">Coming soon</span>
                </span>
              }
            }
          </div>
        </div>
      </div>

      <div class="flex min-w-0 justify-center">
        @if (view() === 'preview') {
          <div class="home-phone" data-testid="example-phone">
            <div class="home-phone-screen bg-background text-foreground example-{{ current().slug }}" tabindex="0" [attr.aria-label]="current().title + ' example, scrollable'">
              <ng-container *ngComponentOutlet="current().component" />
            </div>
          </div>
        } @else {
          <pre class="docs-code home-showcase-code" tabindex="0" [attr.aria-label]="current().title + (view() === 'code' ? ' component source' : ' stylesheet')" data-testid="example-source"><code>{{ view() === 'code' ? current().source.code : current().source.styles }}</code></pre>
        }
      </div>
    </div>
  `,
})
export class HomeShowcase {
  protected readonly examples = EXAMPLES;
  protected readonly appLinks = EXAMPLES_APP_LINKS;
  protected readonly icon = iconName;
  protected readonly views: readonly { id: View; label: string }[] = [
    { id: 'preview', label: 'Preview' },
    { id: 'code', label: 'Code' },
    { id: 'styles', label: 'Styles' },
  ];
  protected readonly index = signal(0);
  protected readonly view = signal<View>('preview');
  protected readonly current = computed(() => this.examples[this.index()]);
  private readonly tabs = viewChildren<ElementRef<HTMLButtonElement>>('tab');

  /** Arrow keys, Home and End move between tabs and select them, as in the WAI-ARIA tabs pattern with automatic activation. */
  protected onTabKey(event: KeyboardEvent): void {
    const last = this.examples.length - 1;
    const moves: Record<string, number> = { ArrowRight: this.index() + 1, ArrowLeft: this.index() - 1, Home: 0, End: last };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const next = (moves[event.key] + last + 1) % (last + 1);
    this.index.set(next);
    const tab = this.tabs()[next]?.nativeElement;
    tab?.focus();
    tab?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
}
