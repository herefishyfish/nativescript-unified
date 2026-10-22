import { ChangeDetectionStrategy, Component, computed, input, NO_ERRORS_SCHEMA } from '@angular/core';
import { highlightRuns } from './highlight';

/**
 * A syntax-highlighted code block: `div.md-code > pre > code` holding one `span` per Prism token
 * run, classed `token <type>...` as in the web docs, so one stylesheet vocabulary colors both.
 * `lang` takes a fenced block's info string (html, ts, css, scss, json, bash, md and aliases);
 * any other language renders as plain text.
 *
 * The spans are flat siblings, never nested: see {@link highlightRuns}.
 */
@Component({
  selector: 'analog-code',
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="md-code"><pre><code>@for (run of runs(); track $index) {<span [class]="run.classes">{{ run.text }}</span>}</code></pre></div>`,
})
export class CodeBlockComponent {
  readonly code = input.required<string>();
  readonly lang = input<string | null | undefined>();

  protected readonly runs = computed(() => highlightRuns(this.code(), this.lang()));
}
