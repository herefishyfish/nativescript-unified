import { ChangeDetectionStrategy, Component, inject, input, NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { ThemedMarkdownView } from './themed-markdown-view';

/** Renders a Markdown string with the platform's native text view (`@nstudio/nativescript-markdown-view`). */
@Component({
  selector: 'app-markdown',
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<MarkdownView class="md-view" [markdown]="source()"></MarkdownView>`,
})
export class AppMarkdown {
  readonly source = input.required<string>();

  constructor() {
    const router = inject(Router);
    ThemedMarkdownView.onLink = (href) => void router.navigateByUrl(href);
  }
}
