import { ChangeDetectionStrategy, Component, computed, input, NO_ERRORS_SCHEMA } from '@angular/core';
import { type CodeRun, highlightRuns } from './highlight';

/**
 * Token spans are off until MasonKit renders them faithfully. Today a `span` inside `pre > code` loses its classes
 * (a text element nested in another text element drops its children's styling), and text runs ignore
 * `white-space: pre`, so whitespace-only runs and the spaces at each span's edges disappear. Off, the block is one
 * plain text run, which keeps every space and newline.
 */
const HIGHLIGHT_TOKENS = false;

/**
 * A code block: `div.md-code > pre > code`. With {@link HIGHLIGHT_TOKENS} on, it holds one `span` per Prism token run,
 * classed `token <type>...` as in the web docs, so one stylesheet vocabulary colors both; the spans are flat siblings,
 * never nested (see {@link highlightRuns}). `lang` takes a fenced block's info string (html, ts, css, scss, json,
 * bash, md and aliases); any other language renders as plain text.
 */
@Component({
  selector: 'analog-code',
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="md-code"><pre><code>@if (runs(); as runs) {@for (run of runs; track $index) {<span [class]="run.classes">{{ run.text }}</span>}}@else {<ng-container>{{ code() }}</ng-container>}</code></pre></div>`,
})
export class CodeBlockComponent {
  readonly code = input.required<string>();
  readonly lang = input<string | null | undefined>();

  protected readonly runs = computed((): CodeRun[] | null => (HIGHLIGHT_TOKENS ? highlightRuns(this.code(), this.lang()) : null));
}
