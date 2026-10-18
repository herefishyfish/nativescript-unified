import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <a href="#main-content" data-testid="skip-link" class="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground" (click)="skip($event)">Skip to content</a>
    <router-outlet />
  `,
})
export class App {
  private readonly doc = inject(DOCUMENT);

  /** A plain #hash link would resolve against <base href="/"> and leave the page, so move focus by hand. */
  protected skip(event: Event): void {
    event.preventDefault();
    const main = this.doc.getElementById('main-content');
    main?.focus();
    main?.scrollIntoView();
  }
}
