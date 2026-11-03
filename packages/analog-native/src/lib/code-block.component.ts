import { ChangeDetectionStrategy, Component, computed, input, NO_ERRORS_SCHEMA } from '@angular/core';
import { highlightLines } from './highlight';

/**
 * A code block: `div.md-code > div.md-pre`, holding one `div.md-code-line > code` per line and one `span` per Prism token
 * run, classed `token <type>...` as in the web docs, so one stylesheet vocabulary colors both. Lines are separate
 * blocks and spaces are no-break spaces, because MasonKit text ignores `white-space: pre` (see {@link highlightLines}).
 * `lang` takes a fenced block's info string (html, ts, css, scss, json, bash, md and aliases); any other language
 * renders as plain text.
 */
@Component({
  selector: 'analog-code',
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="md-code"><div class="md-pre">@for (line of lines(); track $index) {<div class="md-code-line"><code>@for (run of line; track $index) {<span [class]="run.classes">{{ run.text }}</span>}</code></div>}</div></div>`,
})
export class CodeBlockComponent {
  readonly code = input.required<string>();
  readonly lang = input<string | null | undefined>();

  protected readonly lines = computed(() => highlightLines(this.code(), this.lang()));
}
