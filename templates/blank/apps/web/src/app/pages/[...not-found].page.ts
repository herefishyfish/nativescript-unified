import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';

/** Catch-all route. Prerendered at /404 and copied to 404.html so static hosts serve it for unknown URLs. */
@Component({
  selector: 'web-not-found-page',
  imports: [HlmButton, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="main-content" tabindex="-1" class="mx-auto flex min-h-screen max-w-xl flex-col items-start justify-center gap-4 p-4 outline-none">
      <h1 class="text-4xl font-semibold tracking-tight">Page not found</h1>
      <a hlmBtn routerLink="/">Home</a>
    </main>
  `,
})
export default class NotFoundPage {}
