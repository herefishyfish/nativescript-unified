import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { findDoc, neighbours } from '../../docs/content';
import { DocsDemo } from '../../docs/demo';
import { DocsToc } from '../../layout/docs-toc';

/** /docs/:slug renders one Markdown file from packages/shared/content/docs. */
@Component({
  selector: 'web-doc-page',
  imports: [DocsDemo, RouterLink, DocsToc],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (doc(); as d) {
      <div class="mx-auto flex max-w-5xl gap-10">
      <article class="docs-prose min-w-0 max-w-3xl flex-1" data-testid="doc" (click)="onClick($event)">
        <p class="mb-2 text-sm font-medium text-primary">{{ d.section }}</p>
        @for (block of blocks(); track $index) {
          @if (block.kind === 'demo') {
            <figure class="docs-demo" data-testid="demo">
              <div class="docs-demo-preview"><docs-demo [code]="block.code" /></div>
              <div class="docs-demo-code" [innerHTML]="block.html"></div>
            </figure>
          } @else {
            <div [innerHTML]="block.html"></div>
          }
        }
        <nav class="mt-12 flex justify-between gap-4 border-t pt-6 text-sm">
          @if (around().prev; as p) {
            <a [routerLink]="['/docs', p.slug]" class="rounded-md border px-4 py-2 hover:bg-accent">&larr; {{ p.title }}</a>
          } @else {
            <span></span>
          }
          @if (around().next; as n) {
            <a [routerLink]="['/docs', n.slug]" class="rounded-md border px-4 py-2 hover:bg-accent">{{ n.title }} &rarr;</a>
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
    const link = (event.target as Element | null)?.closest('a[href]');
    const href = link?.getAttribute('href');
    if (!href || !href.startsWith('/') || href.startsWith('//') || event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    void this.router.navigateByUrl(href);
  }
}