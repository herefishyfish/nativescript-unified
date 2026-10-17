import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, NO_ERRORS_SCHEMA, TemplateRef } from '@angular/core';
import type { Tokens } from 'marked';
import { HrefDirective } from './href.directive';
import type { ContentFile, MarkdownToken } from './types';

/**
 * Picks the template for a token. Most tokens use their `type`; these refine it into the
 * element they render as.
 */
const TEMPLATE_KEYS: Partial<Record<string, (token: MarkdownToken) => string>> = {
  heading: (token) => `h${(token as Tokens.Heading).depth}`,
  list: (token) => ((token as Tokens.List).ordered ? 'ol' : 'ul'),
  paragraph: (token) => (isImageParagraph(token as Tokens.Paragraph) ? 'figure' : 'p'),
};

function isImageParagraph(paragraph: Tokens.Paragraph): boolean {
  const children = paragraph.tokens.filter((token) => !(token.type === 'text' && token.raw.trim() === ''));
  return children.length > 0 && children.every((token) => token.type === 'image');
}

/**
 * Renders Markdown tokens as native MasonKit elements: `h1`-`h6`, `p`, `ul`/`ol`/`li`,
 * `blockquote`, `pre > code`, `hr`, `img`, a CSS-grid table, and inline `strong`, `em`,
 * `del`, `code`, `a`, `br`. The `renderers` table in the template maps a template key to
 * the `ng-template` that renders it; unknown keys (raw HTML, `space`) render nothing.
 *
 * Plain text renders as `<span>`, never as a bare text node. MasonKit places an Angular
 * text node by assigning its parent's `text`, which lands after the element children, so
 * `a <strong>b</strong> c` inserted through template outlets would read "b a c".
 */
@Component({
  selector: 'analog-markdown, Markdown',
  imports: [NgTemplateOutlet, HrefDirective],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'markdown' },
  template: `
    @let renderers = {
      h1: h1, h2: h2, h3: h3, h4: h4, h5: h5, h6: h6,
      p: p, figure: figure, ul: ul, ol: ol, blockquote: blockquote, code: code, hr: hr, table: table,
      text: text, escape: text, strong: strong, em: em, del: del, codespan: codespan, link: link, br: br, image: image
    };

    <ng-template #render let-tokens>
      @for (token of tokens; track $index) {
        <ng-container *ngTemplateOutlet="rendererFor(renderers, token); context: { $implicit: token }" />
      }
    </ng-template>

    <ng-template #h1 let-t><h1><ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" /></h1></ng-template>
    <ng-template #h2 let-t><h2><ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" /></h2></ng-template>
    <ng-template #h3 let-t><h3><ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" /></h3></ng-template>
    <ng-template #h4 let-t><h4><ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" /></h4></ng-template>
    <ng-template #h5 let-t><h5><ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" /></h5></ng-template>
    <ng-template #h6 let-t><h6><ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" /></h6></ng-template>
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
    <ng-template #blockquote let-t><blockquote><ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" /></blockquote></ng-template>
    <ng-template #code let-t><pre><code>{{ t.text }}</code></pre></ng-template>
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
        <ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" />
      } @else {
        <span>{{ t.text }}</span>
      }
    </ng-template>
    <ng-template #strong let-t><strong><ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" /></strong></ng-template>
    <ng-template #em let-t><em><ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" /></em></ng-template>
    <ng-template #del let-t><del><ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" /></del></ng-template>
    <ng-template #codespan let-t><code>{{ t.text }}</code></ng-template>
    <ng-template #link let-t><a [href]="t.href"><ng-container *ngTemplateOutlet="render; context: { $implicit: t.tokens }" /></a></ng-template>
    <ng-template #br><br /></ng-template>
    <ng-template #image let-t><img [src]="t.href" [alt]="t.text" /></ng-template>

    <ng-container *ngTemplateOutlet="render; context: { $implicit: tokens() }" />
  `,
})
export class MarkdownComponent {
  /** A content file from `injectContent()`, or `marked` tokens. */
  readonly content = input.required<ContentFile<unknown> | MarkdownToken[] | null | undefined>();

  protected readonly tokens = computed(() => {
    const content = this.content();
    return Array.isArray(content) ? content : (content?.tokens ?? []);
  });

  protected rendererFor(renderers: Record<string, TemplateRef<unknown>>, token: MarkdownToken): TemplateRef<unknown> | null {
    return renderers[TEMPLATE_KEYS[token.type]?.(token) ?? token.type] ?? null;
  }
}
