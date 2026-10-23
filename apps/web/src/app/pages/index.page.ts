import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, PLATFORM_ID, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArchive,
  lucideArrowRight,
  lucideBoxes,
  lucideCode,
  lucideCopy,
  lucideFileText,
  lucideGlobe,
  lucideMonitor,
  lucidePalette,
  lucideRoute,
  lucideSmartphone,
} from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { FEATURES } from '@nativescript-unified/shared';
import { Seo } from '../core/seo';
import { HERO_SOURCE, HeroCard } from '../home/hero-card';
import { HomeShowcase } from '../home/home-showcase';
import { SiteFooter } from '../layout/site-footer';
import { SiteHeader } from '../layout/site-header';

/** Icon per feature, keyed by the docs page the feature links to. */
const FEATURE_ICONS: Record<string, string> = {
  'html-first': 'lucideCode',
  components: 'lucideBoxes',
  'file-routing': 'lucideRoute',
  theming: 'lucidePalette',
  'markdown-on-native': 'lucideFileText',
  'legacy-tags': 'lucideArchive',
};

const QUICK_START = `npm install
npx nx serve web                # the docs site
npx nx run native:android       # the Android app
cd apps/native && ns run ios    # the iOS app, on a Mac`;

@Component({
  selector: 'web-home-page',
  imports: [RouterLink, HlmButton, NgIcon, SiteHeader, SiteFooter, HeroCard, HomeShowcase],
  providers: [
    provideIcons({
      lucideArchive,
      lucideArrowRight,
      lucideBoxes,
      lucideCode,
      lucideCopy,
      lucideFileText,
      lucideGlobe,
      lucideMonitor,
      lucidePalette,
      lucideRoute,
      lucideSmartphone,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <web-site-header />
    <main id="main-content" tabindex="-1" class="outline-none">
      <!-- Hero -->
      <section class="home-hero" data-testid="hero">
        <div class="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 md:px-8 md:pt-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:pb-24">
          <div>
            <a routerLink="/docs/introduction" fragment="platforms" class="home-pill" data-testid="status-pill">
              <span class="home-pill-dot" aria-hidden="true"></span>
              Web, iOS and Android from one codebase
              <ng-icon name="lucideArrowRight" size="14" aria-hidden="true" />
            </a>
            <h1 class="home-title">One HTML template. <span class="block text-primary">Web and native.</span></h1>
            <p class="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Build NativeScript Angular apps HTML first: plain elements, CSS flex and grid, Tailwind classes and Spartan components.
              The browser renders them on the web, and MasonKit draws the same template as real native views on iOS and Android.
            </p>
            <div class="mt-8 flex flex-wrap gap-3">
              <a hlmBtn size="lg" routerLink="/docs/introduction" data-testid="read-docs">Get started <ng-icon name="lucideArrowRight" size="16" aria-hidden="true" /></a>
              <a hlmBtn size="lg" variant="outline" routerLink="/docs/components">Browse components</a>
            </div>
            <p class="mt-10 text-xs font-medium uppercase tracking-wider text-muted-foreground">Built on</p>
            <ul class="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-foreground/80" aria-label="Built on">
              @for (tech of stack; track tech) {
                <li>{{ tech }}</li>
              }
            </ul>
          </div>

          <figure class="home-window" data-testid="home-demo">
            <div class="home-window-bar">
              <span class="home-window-dots" aria-hidden="true"><span></span><span></span><span></span></span>
              <span class="font-mono text-xs text-muted-foreground">hero-card.html</span>
              <span class="home-live"><span class="home-pill-dot" aria-hidden="true"></span>Live</span>
            </div>
            <div class="home-window-preview">
              <web-hero-card data-testid="home-card" />
            </div>
            <pre class="docs-code" tabindex="0" aria-label="Source of the card above"><code [innerHTML]="heroHtml"></code></pre>
            <figcaption class="sr-only">A helm card rendered live from the HTML shown below it.</figcaption>
          </figure>
        </div>
      </section>

      <!-- How it works -->
      <section class="mx-auto max-w-6xl px-4 py-20 md:px-8" aria-labelledby="how-it-works" data-testid="how-it-works">
        <p class="docs-eyebrow text-center">How it works</p>
        <h2 id="how-it-works" class="home-h2 text-center">Write it once. Render it twice.</h2>
        <p class="home-lead mx-auto text-center">A page is an Angular template made of ordinary elements. Each app turns it into its own platform's views, so web and native share the template and keep their own core.</p>

        <div class="mx-auto mt-12 max-w-4xl">
          <div class="home-flow-source">
            <span class="home-flow-icon"><ng-icon name="lucideCode" size="20" aria-hidden="true" /></span>
            <div>
              <h3 class="font-semibold">Your template</h3>
              <p class="mt-1 text-sm text-muted-foreground">
                <code class="home-code">div</code>, <code class="home-code">p</code>, <code class="home-code">ul</code>, flex and grid, Tailwind classes and helm attributes. Shared templates live in <code class="home-code">packages/shared</code>.
              </p>
            </div>
          </div>
          <svg class="home-flow-fork" viewBox="0 0 400 56" preserveAspectRatio="none" aria-hidden="true">
            <path d="M200 0V18C200 30 100 26 100 40V56M200 18C200 30 300 26 300 40V56" fill="none" vector-effect="non-scaling-stroke" />
          </svg>
          <div class="grid gap-4 sm:grid-cols-2">
            @for (target of targets; track target.title) {
              <div class="home-card">
                <div class="flex items-center gap-3">
                  <span class="home-flow-icon"><ng-icon [name]="target.icon" size="20" aria-hidden="true" /></span>
                  <h3 class="font-semibold">{{ target.title }}</h3>
                </div>
                <p class="mt-3 text-sm text-muted-foreground">{{ target.body }}</p>
                <ul class="mt-4 flex flex-wrap gap-1.5" [attr.aria-label]="target.title + ' stack'">
                  @for (tag of target.tags; track tag) {
                    <li class="home-tag">{{ tag }}</li>
                  }
                </ul>
              </div>
            }
          </div>
          <p class="mt-8 text-center text-sm">
            <a routerLink="/docs/web-vs-native" class="home-arrow-link">How web and native split <ng-icon name="lucideArrowRight" size="14" aria-hidden="true" /></a>
          </p>
        </div>
      </section>

      <!-- Examples -->
      <section #examples id="examples" class="home-band scroll-mt-14" aria-labelledby="examples-title">
        <div class="mx-auto max-w-6xl px-4 py-20 md:px-8">
          <p class="docs-eyebrow">Examples</p>
          <h2 id="examples-title" class="home-h2">Real screens from one codebase</h2>
          <p class="home-lead">
            Twelve example screens live in <code class="home-code">packages/shared</code>. Each is one Angular component made of HTML, Tailwind and helm, with its own palette.
            They are running below in your browser, and the native app opens the same components on the device.
          </p>
          <div class="mt-10">
            @defer (when showcaseVisible()) {
              <web-home-showcase />
            } @placeholder {
              <div class="home-showcase-placeholder" aria-hidden="true"><div class="home-phone"></div></div>
            }
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="mx-auto max-w-6xl px-4 py-20 md:px-8" aria-labelledby="features-title">
        <p class="docs-eyebrow">What you get</p>
        <h2 id="features-title" class="home-h2">Everything in one workspace</h2>
        <p class="home-lead">The web home page and the native app read these from the same file in <code class="home-code">packages/shared</code>.</p>
        <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (feature of features; track feature.title) {
            <a [routerLink]="['/docs', feature.docs]" class="home-card home-link group" data-testid="feature-card">
              <span class="home-flow-icon"><ng-icon [name]="featureIcon(feature.docs)" size="20" aria-hidden="true" /></span>
              <span class="mt-4 block font-semibold">{{ feature.title }}</span>
              <span class="mt-1.5 block text-sm text-muted-foreground">{{ feature.body }}</span>
              <span class="home-arrow-link mt-4 text-sm">Read more <ng-icon name="lucideArrowRight" size="14" aria-hidden="true" /></span>
            </a>
          }
        </div>
      </section>

      <!-- Status and quick start -->
      <section class="mx-auto max-w-6xl px-4 pb-24 md:px-8" aria-label="Platforms and quick start">
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div class="home-card p-6 md:p-8">
            <h2 class="text-xl font-semibold tracking-tight">Where it runs</h2>
            <ul class="mt-6 flex flex-col divide-y" data-testid="platforms">
              @for (platform of platforms; track platform.name) {
                <li class="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                  <span class="home-status" [class.home-status-done]="platform.main">
                    <ng-icon [name]="platform.icon" size="16" aria-hidden="true" />
                  </span>
                  <div>
                    <p class="font-medium">{{ platform.name }}</p>
                    <p class="mt-0.5 text-sm text-muted-foreground">{{ platform.body }}</p>
                  </div>
                </li>
              }
            </ul>
            <a routerLink="/docs/components" fragment="native-status" class="home-arrow-link mt-6 text-sm">Component status on native <ng-icon name="lucideArrowRight" size="14" aria-hidden="true" /></a>
          </div>

          <div class="home-card flex flex-col p-6 md:p-8">
            <h2 class="text-xl font-semibold tracking-tight">Up and running</h2>
            <p class="mt-2 text-sm text-muted-foreground">Clone the workspace, then install and start an app. Native needs the NativeScript CLI, plus the Android SDK or Xcode.</p>
            <div class="docs-code-wrap mt-6">
              <button type="button" class="docs-copy" [attr.data-copied]="copied() ? 'true' : null" aria-label="Copy commands" (click)="copy()">{{ copied() ? 'Copied' : 'Copy' }}</button>
              <pre class="docs-code" tabindex="0" data-testid="quick-start"><code>{{ quickStart }}</code></pre>
            </div>
            <div class="mt-auto flex flex-wrap gap-3 pt-6">
              <a hlmBtn routerLink="/docs/installation">Installation guide</a>
              <a hlmBtn variant="outline" routerLink="/docs/project-structure">Project structure</a>
            </div>
          </div>
        </div>
      </section>
    </main>
    <web-site-footer />
  `,
})
export default class HomePage {
  protected readonly features = FEATURES;
  protected readonly quickStart = QUICK_START;
  protected readonly heroHtml = inject(DomSanitizer).bypassSecurityTrustHtml(HERO_SOURCE.html);
  protected readonly copied = signal(false);
  /** Set in the browser once the examples section nears the viewport. It stays false while prerendering, so the static HTML carries the placeholder. */
  protected readonly showcaseVisible = signal(false);
  private readonly examplesSection = viewChild.required<ElementRef<HTMLElement>>('examples');
  protected readonly stack = ['Angular 22', 'AnalogJS', 'NativeScript', 'MasonKit', 'Spartan', 'Tailwind CSS'];
  protected readonly targets = [
    {
      title: 'In the browser',
      icon: 'lucideGlobe',
      body: 'AnalogJS and Vite render the template with the browser’s own elements. Pages are prerendered to static HTML, like this site.',
      tags: ['AnalogJS', 'Vite', 'Prerendered'],
    },
    {
      title: 'On the device',
      icon: 'lucideSmartphone',
      body: 'MasonKit turns each element into a native view, not a web view. Mason, a Rust layout engine built on taffy, lays them out with flex, grid and block flow.',
      tags: ['NativeScript', 'MasonKit', 'iOS', 'Android'],
    },
  ];
  protected readonly platforms = [
    { name: 'Web', main: true, icon: 'lucideGlobe', body: 'AnalogJS in the browser, prerendered to static HTML. This site is the web app.' },
    { name: 'iOS and Android', main: true, icon: 'lucideSmartphone', body: 'NativeScript with MasonKit: real native views, with these docs and their live demos on the device.' },
    { name: 'macOS and Windows', main: false, icon: 'lucideMonitor', body: 'The same NativeScript app runs on the desktop too. Not the main focus yet.' },
  ];

  constructor() {
    inject(Seo).set({
      description: 'HTML-first NativeScript: one Angular template with plain HTML, Tailwind and Spartan components, rendered in the browser and as native views through MasonKit.',
      path: '/',
    });
    // Not `@defer (on viewport)`: in this Analog build, defer triggers and afterNextRender also run during prerender, where
    // IntersectionObserver does not exist. PLATFORM_ID is still 'server' there, so check it before observing.
    const destroyRef = inject(DestroyRef);
    const browser = isPlatformBrowser(inject(PLATFORM_ID));
    afterNextRender(() => {
      if (!browser) return;
      if (typeof IntersectionObserver === 'undefined') return this.showcaseVisible.set(true);
      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          this.showcaseVisible.set(true);
          observer.disconnect();
        },
        { rootMargin: '600px 0px' },
      );
      observer.observe(this.examplesSection().nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected featureIcon(slug: string | undefined): string {
    return FEATURE_ICONS[slug ?? ''] ?? 'lucideCode';
  }

  protected copy(): void {
    void navigator.clipboard?.writeText(this.quickStart.replace(/ +#.*$/gm, '')).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    });
  }
}
