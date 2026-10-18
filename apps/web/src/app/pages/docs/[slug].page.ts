import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { findDoc, neighbours } from '../../docs/content';
import { DocsDemoFrame } from '../../layout/docs-demo-frame';
import { DocsToc } from '../../layout/docs-toc';

/** /docs/:slug renders one Markdown file from packages/shared/content/docs. */
@Component({
  selector: 'web-doc-page',
  imports: [DocsDemoFrame, RouterLink, DocsToc],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (doc(); as d) {
      <div class="mx-auto flex max-w-5xl gap-10 xl:max-w-6xl">
      <article class="docs-prose min-w-0 max-w-3xl flex-1" data-testid="doc" (click)="onClick($event)">
        <p class="docs-eyebrow">{{ d.section }}</p>
        @for (block of blocks(); track $index) {
          @if (block.kind === 'demo') {
            <web-demo-frame [code]="block.code" [html]="block.html" />
          } @else {
            <div [innerHTML]="block.html"></div>
          }
        }
        <nav class="mt-12 flex justify-between gap-4 border-t pt-6 text-sm">
          @if (around().prev; as p) {
            <a [routerLink]="['/docs', p.slug]" class="rounded-lg border bg-card px-4 py-2.5 transition-colors hover:bg-accent">&larr; {{ p.title }}</a>
          } @else {
            <span></span>
          }
          @if (around().next; as n) {
            <a [routerLink]="['/docs', n.slug]" class="rounded-lg border bg-card px-4 py-2.5 transition-colors hover:bg-accent">{{ n.title }} &rarr;</a>
          }
        </nav>
      </article>
      <web-docs-toc [items]="toc()" />
      </div>
    } @else {
      <article class="docs-prose mx-auto max-w-3xl" data-testid="not-found">
        <h1>Page not found</h1>
        <p>There is no docs page called <code>{{ slug() }}</code>. Pick one from the sidebar.</p>
      </article>
    }
  `,
})
export default class DocPage {
  readonly slug = input.required<string>();

  private readonly sanitizer = inject(DomSanitizer);
  private readonly router = inject(Router);
  protected readonly doc = computed(() => findDoc(this.slug()));
  protected readonly toc = computed(() => { return this.doc()?.headings ?? []; });
  protected readonly around = computed(() => neighbours(this.slug()));
  protected readonly blocks = computed(() => {
    const doc = this.doc();
    if (!doc) return [];
    return doc.blocks.map((block) => ({ ...block, html: this.sanitizer.bypassSecurityTrustHtml(block.html) }));
  });

  constructor() {
    const title = inject(Title);
    effect(() => {
      const doc = this.doc();
      title.setTitle(doc ? `${doc.title} | NativeScript Unified` : 'Not found | NativeScript Unified');
    });
  }

  /** Markdown links to other docs pages are plain <a href>. Route them without a full reload. */
  protected onClick(event: MouseEvent): void {
    const copy = (event.target as Element | null)?.closest<HTMLElement>('[data-copy]');
    if (copy) {
      const text = copy.parentElement?.querySelector('pre')?.textContent ?? '';
      void navigator.clipboard?.writeText(text).then(() => {
        copy.textContent = 'Copied';
        copy.dataset['copied'] = 'true';
        setTimeout(() => { copy.textContent = 'Copy'; delete copy.dataset['copied']; }, 1500);
      });
      return;
    }
    const link = (event.target as Element | null)?.closest('a[href]');
    const href = link?.getAttribute('href');
    if (!href || !href.startsWith('/') || href.startsWith('//') || event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    void this.router.navigateByUrl(href);
  }
}