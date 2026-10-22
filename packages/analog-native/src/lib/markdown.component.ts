import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, NO_ERRORS_SCHEMA, TemplateRef, type Type } from '@angular/core';
import type { Tokens } from 'marked';
import { CodeBlockComponent } from './code-block.component';
import { HrefDirective } from './href.directive';
import { calloutOf } from './callout';
import { MARKDOWN_LIVE_CODE_COMPONENT, segmentMarkdown } from './live-code';
import type { ContentFile, MarkdownToken } from './types';

/**
 * Picks the template for a token. Most tokens use their `type`; these refine it into the
 * element they render as.
 */
const TEMPLATE_KEYS: Partial<Record<string, (token: MarkdownToken) => string>> = {
  heading: (token) => `h${(token as Tokens.Heading).depth}`,
  list: (token) => ((token as Tokens.List).ordered ? 'ol' : 'ul'),
  paragraph: (token) => (isImageParagraph(token as Tokens.Paragraph) ? 'figure' : 'p'),
  blockquote: (token) => (calloutOf(token as Tokens.Blockquote) ? 'callout' : 'blockquote'),
};

function isImageParagraph(paragraph: Tokens.Paragraph): boolean {
  const children = paragraph.tokens.filter((token) => !(token.type === 'text' && token.raw.trim() === ''));
  return children.length > 0 && children.every((token) => token.type === 'image');
}

/**
 * Renders Markdown tokens as native MasonKit elements: `h1`-`h6`, `p`, `ul`/`ol`/`li`,
 * `div.md-blockquote`, `div.md-code > pre > code`, `hr`, `img`, a CSS-grid table, and inline
 * `strong`, `em`, `del`, `code`, `a`, `br`. The `renderers` table in the template maps a template
 * key to the `ng-template` that renders it; unknown keys (raw HTML, `space`) render nothing.
 *
 * A quote is a block `div`, not MasonKit's `blockquote`: that is a text element, and a `<p>` inside
 * one loses its inline code and links. A quote starting with `[!NOTE]`, `[!TIP]`, `[!WARNING]`,
 * `[!IMPORTANT]` or `[!CAUTION]` renders as `aside.md-callout.md-callout-<kind>` with a title, as
 * the web docs' callouts do.
 *
 * A fenced block tagged `html live` renders the component registered with
 * `provideMarkdownLiveCode()` (which receives the source as its `code` input), mounted at
 * the component root through {@link segmentMarkdown}; without a registration it renders
 * as `pre > code` like any other block.
 *
 * Plain text renders as a bare text node, so it joins its parent's text run: it takes the
 * parent's font (a heading's size), and spaces next to inline elements survive. A `<span>`
 * per text token would make each text the first and last box of its own container, where
 * MasonKit collapses leading and trailing whitespace as CSS does.
 *
 * A heading's content, and a tight list item's text, sit in one `<p>`, so they flow as a
 * single text run even when an app backs `h1`-`h6` and `li` with block elements (spartan's
 * native glue does), where each inline child would otherwise stack as its own block. Not a
 * `<span>`: a MasonKit span drops the styling and element children of its inline children.
 */
@Component({
  selector: 'analog-markdown, Markdown',
  imports: [NgComponentOutlet, NgTemplateOutlet, HrefDirective, CodeBlockComponent],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'markdown' },
  template: `
    @let renderers = {
      h1: h1, h2: h2, h3: h3, h4: h4, h5: h5, h6: h6,
      p: p, figure: figure, ul: ul, ol: ol, blockquote: blockquote, callout: callout, code: code, hr: hr, table: table,
      text: text, escape: text, strong: strong, em: em, del: del, codespan: codespan, link: link, br: br, image: image
    };

    <ng-template #render let-tokens>
      @for (token of tokens; track $index) {
        <ng-container *ngTemplateOutlet="rendererFor(renderers, token); context: { $implicit: token }" />
      }
    </ng-template>

    <ng-template #h1 let-t><h1><p><ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" /></p></h1></ng-template>
    <ng-template #h2 let-t><h2><p><ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" /></p></h2></ng-template>
    <ng-template #h3 let-t><h3><p><ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" /></p></h3></ng-template>
    <ng-template #h4 let-t><h4><p><ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" /></p></h4></ng-template>
    <ng-template #h5 let-t><h5><p><ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" /></p></h5></ng-template>
    <ng-template #h6 let-t><h6><p><ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" /></p></h6></ng-template>
    <ng-template #p let-t><p><ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" /></p></ng-template>
    <ng-template #figure let-t><div class="md-figure"><ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" /></div></ng-template>
    <ng-template #ul let-t>
      <ul>
        @for (item of t.items; track $index) {
          <li><ng-container *ngTemplateOutlet="render; context: { $implicit: item.tokens }" /></li>
        }
      </ul>
    </ng-template>
    <ng-template #ol let-t>
      <ol>
        @for (item of t.items; track $index) {
          <li><ng-container *ngTemplateOutlet="render; context: { $implicit: item.tokens }" /></li>
        }
      </ol>
    </ng-template>
    <ng-template #blockquote let-t><div class="md-blockquote"><ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" /></div></ng-template>
    <ng-template #callout let-t>
      @let c = asCallout(t)!;
      <aside class="md-callout" [class]="'md-callout-' + c.kind">
        <p class="md-callout-title">{{ c.title }}</p>
        <ng-container *ngTemplateOutlet="render; context: { $implicit: c.tokens }" />
      </aside>
    </ng-template>
    <ng-template #code let-t><analog-code [code]="t.text" [lang]="t.lang" /></ng-template>
    <ng-template #hr><hr /></ng-template>
    <ng-template #table let-t>
      <div class="md-table" [style.grid-template-columns]="'repeat(' + t.header.length + ', auto)'">
        @for (cell of t.header; track $index) {
          <span class="md-th"><ng-container *ngTemplateOutlet="render; context: { $implicit: cell.tokens }" /></span>
        }
        @for (row of t.rows; track $index) {
          @for (cell of row; track $index) {
            <span class="md-td"><ng-container *ngTemplateOutlet="render; context: { $implicit: cell.tokens }" /></span>
          }
        }
      </div>
    </ng-template>

    <ng-template #text let-t>
      @if (t.tokens) {
        <p><ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" /></p>
      } @else {<ng-container>{{ t.text }}</ng-container>}
    </ng-template>
    <ng-template #strong let-t><strong><ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" /></strong></ng-template>
    <ng-template #em let-t><em><ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" /></em></ng-template>
    <ng-template #del let-t><del><ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" /></del></ng-template>
    <ng-template #codespan let-t><code>{{ t.text }}</code></ng-template>
    <ng-template #link let-t><a [href]="t.href"><ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" /></a></ng-template>
    <ng-template #br><br /></ng-template>
    <ng-template #image let-t><img [src]="t.href" [alt]="t.text" /></ng-template>

    @for (segment of segments(); track $index) {
      @if (segment.kind === 'live') {
        <ng-container *ngComponentOutlet="liveCodeComponent; inputs: { code: segment.code }" />
      } @else {
        <ng-container *ngTemplateOutlet="render; context: { $implicit: segment.tokens }" />
      }
    }
  `,
})
export class MarkdownComponent {
  /** A content file from `injectContent()`, or `marked` tokens. */
  readonly content = input.required<ContentFile<unknown> | MarkdownToken[] | null | undefined>();

  /** Component that renders `html live` blocks (Preview / Code tabs); null shows the source only. */
  protected readonly liveCodeComponent = inject(MARKDOWN_LIVE_CODE_COMPONENT, { optional: true }) as Type<unknown> | null;

  protected readonly tokens = computed(() => {
    const content = this.content();
    return Array.isArray(content) ? content : (content?.tokens ?? []);
  });

  protected readonly segments = computed(() => segmentMarkdown(this.tokens(), this.liveCodeComponent !== null));

  protected readonly asCallout = calloutOf;

  protected rendererFor(renderers: Record<string, TemplateRef<unknown>>, token: MarkdownToken): TemplateRef<unknown> | null {
    return renderers[TEMPLATE_KEYS[token.type]?.(token) ?? token.type] ?? null;
  }
}
