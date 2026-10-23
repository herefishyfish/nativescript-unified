import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { Seo } from '../core/seo';
import { SiteLogo } from '../layout/site-logo';
import { ThemeToggle } from '../layout/theme-toggle';

/** Catch-all route. Prerendered at /404 and copied to 404.html so static hosts serve it for unknown URLs. */
@Component({
  selector: 'web-not-found-page',
  imports: [HlmButton, RouterLink, SiteLogo, ThemeToggle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto flex min-h-screen max-w-xl flex-col px-4 py-6">
      <header class="flex items-center justify-between">
        <a routerLink="/" class="flex items-center gap-2 font-semibold">
          <web-site-logo class="size-6" />
          NativeScript Unified
        </a>
        <web-theme-toggle />
      </header>
      <main id="main-content" tabindex="-1" class="flex flex-1 flex-col items-start justify-center gap-4 outline-none" data-testid="not-found-page">
        <p class="text-sm font-medium text-primary">404</p>
        <h1 class="text-4xl font-semibold tracking-tight">Page not found</h1>
        <p class="text-muted-foreground">That address does not match a page. It may have moved, or the link may be wrong.</p>
        <div class="flex gap-3">
          <a hlmBtn routerLink="/docs/introduction">Read the docs</a>
          <a hlmBtn variant="outline" routerLink="/">Home</a>
        </div>
      </main>
    </div>
  `,
})
export default class NotFoundPage {
  constructor() {
    inject(Seo).set({ title: 'Page not found', description: 'That address does not match a page in the NativeScript Unified docs.', path: '/404', noindex: true });
  }
}
