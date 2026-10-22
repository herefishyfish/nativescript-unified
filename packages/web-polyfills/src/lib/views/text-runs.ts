import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Web fallback for FormattedString. Children are `<Span text="…">`. On device use FormattedString or nFormattedString. */
@Component({
  selector: 'FormattedString',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styles: `:host { display: inline; }`,
})
export class NsFormattedString {}

/**
 * Web fallback for Span. Property `text`; style with `font-weight` and `color`. Also selected as `NSpan`, the tag
 * core's Span keeps on device, where MasonKit owns `Span`.
 */
@Component({
  selector: 'Span, NSpan',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.font-weight]': 'fontWeight() || null',
    '[style.color]': 'color() || null',
  },
  template: `<span class="t">{{ text() }}</span>`,
  styles: `
    :host { display: inline; }
    .t { white-space: pre-wrap; }
  `,
})
export class NsSpan {
  readonly text = input('');
  readonly fontWeight = input('', { alias: 'font-weight' });
  readonly color = input('');
}
