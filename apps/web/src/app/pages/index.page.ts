import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowRight, lucideArchive, lucideBookOpen, lucideBoxes, lucideCode, lucidePalette, lucideRoute } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { FEATURES } from '@nativescript-unified/shared';
import { Seo } from '../core/seo';
import { SiteHeader } from '../layout/site-header';

const SNIPPET = `<div class="flex flex-row items-center gap-3">
  <button hlmBtn>Plain HTML</button>
  <span hlmBadge variant="secondary">Spartan helm</span>
</div>`;

@Component({
  selector: 'web-home-page',
  imports: [RouterLink, HlmButton, HlmBadge, SiteHeader, NgIcon],
  providers: [provideIcons({ lucideArrowRight, lucideArchive, lucideBookOpen, lucideBoxes, lucideCode, lucidePalette, lucideRoute })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <web-site-header />
    <main id="main-content" tabindex="-1" class="outline-none">
      <section class="home-hero" data-testid="hero">
        <div class="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:px-8 md:py-20 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p class="docs-eyebrow">NativeScript docs, rewritten</p>
            <h1 class="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">NativeScript, <span class="text-primary">HTML first</span></h1>
            <p class="mt-5 max-w-xl text-lg text-muted-foreground">
              Write pages with plain HTML, CSS flex and grid, Tailwind and Spartan components. Web and native stay separate at the top and share the pages in the middle.
              Existing NativeScript tags such as <code class="rounded bg-muted px-1.5 py-0.5 text-[0.9em]">&lt;StackLayout&gt;</code> are supported on the web as legacy.
            </p>
            <div class="mt-8 flex flex-wrap gap-3">
              <a hlmBtn size="lg" routerLink="/docs/introduction" data-testid="read-docs">Read the docs <ng-icon name="lucideArrowRight" size="16" /></a>
              <a hlmBtn size="lg" variant="outline" routerLink="/docs/components">Browse components</a>
            </div>
          </div>

          <div class="docs-demo home-demo" data-testid="home-demo">
            <div class="docs-demo-tabs"><span class="px-3 py-2 text-xs font-medium text-muted-foreground">Live HTML and helm</span></div>
            <div class="docs-demo-preview">
              <div class="flex flex-row items-center gap-3" data-testid="home-flex">
                <button hlmBtn>Plain HTML</button>
                <span hlmBadge variant="secondary">Spartan helm</span>
              </div>
            </div>
            <div class="docs-code-wrap"><pre class="docs-code"><code>{{ snippet }}</code></pre></div>
          </div>
        </div>
      </section>

      <section class="mx-auto max-w-6xl px-4 py-14 md:px-8" aria-labelledby="what-why">
        <h2 id="what-why" class="home-h2">What and why</h2>
        <div class="grid gap-4 md:grid-cols-3">
          @for (feature of features; track feature.title) {
            <div class="home-card" data-testid="feature-card">
              <h3 class="text-base font-semibold">{{ feature.title }}</h3>
              <p class="mt-2 text-sm text-muted-foreground">{{ feature.body }}</p>
            </div>
          }
        </div>
      </section>

      <section class="mx-auto max-w-6xl px-4 pb-16 md:px-8" aria-labelledby="quick-links">
        <h2 id="quick-links" class="home-h2">Quick links</h2>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (link of links; track link.href) {
            <a [routerLink]="link.href" class="home-card home-link" data-testid="quick-link">
              <ng-icon [name]="link.icon" size="20" class="text-primary" />
              <span class="mt-3 block font-semibold">{{ link.title }}</span>
              <span class="mt-1 block text-sm text-muted-foreground">{{ link.body }}</span>
            </a>
          }
        </div>
      </section>
    </main>
    <footer class="border-t px-4 py-8 text-center text-sm text-muted-foreground">NativeScript Unified. HTML first, web and native.</footer>
  `,
})
export default class HomePage {
  protected readonly features = FEATURES;
  protected readonly snippet = SNIPPET;

  constructor() {
    inject(Seo).set({
      description: 'HTML-first NativeScript docs: plain HTML, Tailwind and Spartan components for web and native, with legacy NativeScript tags supported on the web.',
      path: '/',
    });
  }
  protected readonly links = [
    { title: 'Introduction', body: 'What the project is and how the pieces fit.', href: '/docs/introduction', icon: 'lucideBookOpen' },
    { title: 'HTML first', body: 'Plain HTML, flex and grid, Tailwind and what replaces each NativeScript tag.', href: '/docs/html-first', icon: 'lucideCode' },
    { title: 'Components', body: 'Live Spartan helm examples: button, card, tabs, dialog and more.', href: '/docs/components', icon: 'lucideBoxes' },
    { title: 'File routing', body: 'Pages from the pages folder, on web and native.', href: '/docs/file-routing', icon: 'lucideRoute' },
    { title: 'Theming', body: 'The cream and teal tokens, and dark mode.', href: '/docs/theming', icon: 'lucidePalette' },
    { title: 'Legacy NativeScript tags', body: 'Legacy support: existing StackLayout and GridLayout markup on the web.', href: '/docs/legacy-tags', icon: 'lucideArchive' },
  ];}