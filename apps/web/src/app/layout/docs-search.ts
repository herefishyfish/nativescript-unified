import { NgTemplateOutlet } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmKbd } from '@spartan-ng/helm/kbd';
import { search, suggestions, type SearchEntry, type SearchHit } from '../docs/search';

@Component({
  selector: 'web-docs-search',
  imports: [FormsModule, NgIcon, NgTemplateOutlet, HlmButton, HlmKbd, HlmDialogImports],
  providers: [provideIcons({ lucideSearch })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown)': 'onKey($event)' },
  template: `
    <button hlmBtn variant="outline" size="sm" type="button" class="gap-2 text-muted-foreground" aria-keyshortcuts="Control+K Meta+K" aria-haspopup="dialog" data-testid="search-open" (click)="show()">
      <ng-icon name="lucideSearch" size="16" aria-hidden="true" />
      <span class="sr-only sm:not-sr-only">Search docs</span>
      <kbd hlmKbd class="hidden sm:inline-flex" aria-hidden="true">{{ shortcut() }} K</kbd>
    </button>
    <!-- helm's own dialog rules beat utility classes on the host, so its width, padding and gap are inline styles. -->
    <hlm-dialog [state]="open() ? 'open' : 'closed'" (closed)="open.set(false)">
      <hlm-dialog-content *hlmDialogPortal="let ctx" [showCloseButton]="false" data-testid="search-dialog" style="max-width: min(40rem, calc(100% - 2rem)); padding: 0; gap: 0; overflow: hidden">
        <hlm-dialog-header>
          <h2 hlmDialogTitle class="sr-only">Search docs</h2>
        </hlm-dialog-header>
        <div class="flex items-center gap-3 border-b px-4">
          <ng-icon name="lucideSearch" size="18" class="shrink-0 text-muted-foreground" aria-hidden="true" />
          <input type="search" placeholder="Search the docs" aria-label="Search docs" role="combobox" aria-autocomplete="list" aria-controls="search-results" [attr.aria-expanded]="hits().length > 0" [attr.aria-activedescendant]="hits().length ? 'search-hit-' + active() : null" data-testid="search-input" autocomplete="off"
            class="h-14 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            [ngModel]="query()" (ngModelChange)="query.set($event); active.set(0)" (keydown)="onInputKey($event)" />
        </div>
        <p class="sr-only" role="status" aria-live="polite">{{ status() }}</p>
        <ul id="search-results" role="listbox" aria-label="Search results" class="max-h-[min(26rem,60vh)] overflow-y-auto p-2" data-testid="search-results">
          @if (!query() && hits().length) {
            <li role="presentation" aria-hidden="true" class="px-3 pb-1 pt-2 text-xs text-muted-foreground">Start here</li>
          }
          @for (hit of hits(); track hit.slug + hit.id; let i = $index) {
            <li role="presentation">
              <button type="button" role="option" tabindex="-1" [id]="'search-hit-' + i" [attr.aria-selected]="i === active()" class="flex w-full flex-col gap-1 rounded-md px-3 py-2.5 text-left" [class.bg-accent]="i === active()" data-testid="search-hit" (mouseenter)="active.set(i)" (click)="go(hit)">
                <span class="flex items-baseline justify-between gap-3">
                  <span class="min-w-0 truncate text-sm font-medium">
                    <ng-container *ngTemplateOutlet="marked; context: { $implicit: hit.titleParts }" />
                    @if (hit.heading) {
                      <span class="text-muted-foreground"> › </span><ng-container *ngTemplateOutlet="marked; context: { $implicit: hit.headingParts }" />
                    }
                  </span>
                  <span class="shrink-0 text-xs text-muted-foreground">{{ hit.section }}</span>
                </span>
                @if (hit.snippet.length) {
                  <span class="line-clamp-2 text-xs leading-5 text-muted-foreground"><ng-container *ngTemplateOutlet="marked; context: { $implicit: hit.snippet }" /></span>
                }
              </button>
            </li>
          }
        </ul>
        @if (query() && !hits().length) {
          <p class="px-4 pb-10 pt-8 text-center text-sm text-muted-foreground" data-testid="search-empty">No results for "{{ query() }}". Try fewer or shorter words.</p>
        }
        <div class="hidden items-center gap-4 border-t px-4 py-2.5 text-xs text-muted-foreground sm:flex" aria-hidden="true">
          <span class="flex items-center gap-1.5"><kbd hlmKbd>↑</kbd><kbd hlmKbd>↓</kbd> to move</span>
          <span class="flex items-center gap-1.5"><kbd hlmKbd>Enter</kbd> to open</span>
          <span class="flex items-center gap-1.5"><kbd hlmKbd>Esc</kbd> to close</span>
        </div>
      </hlm-dialog-content>
    </hlm-dialog>
    <ng-template #marked let-parts>@for (part of parts; track $index) {@if (part.match) {<mark class="rounded-sm bg-primary/20 text-foreground">{{ part.text }}</mark>} @else {{{ part.text }}}}</ng-template>
  `,
})
export class DocsSearch {
  private readonly router = inject(Router);
  /** Server and first client render say Ctrl so hydration matches. macOS switches to Cmd after render. */
  protected readonly shortcut = signal('Ctrl');
  private readonly detect = afterNextRender(() => {
    if (/mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent)) this.shortcut.set('Cmd');
  });
  private readonly entries = signal<readonly SearchEntry[]>([]);
  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly active = signal(0);
  /** Results for the query, or the pages to start from while the query is empty. */
  protected readonly hits = computed<SearchHit[]>(() => (this.query().trim() ? search(this.entries(), this.query()) : suggestions(this.entries())));
  protected readonly status = computed(() => {
    if (!this.query()) return '';
    const n = this.hits().length;
    return n ? `${n} result${n === 1 ? '' : 's'}` : 'No results';
  });

  protected async show(): Promise<void> {
    this.query.set('');
    this.active.set(0);
    this.open.set(true);
    if (!this.entries().length) this.entries.set((await import('virtual:docs-search')).default);
  }

  protected onKey(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      void this.show();
    }
  }

  protected onInputKey(event: KeyboardEvent): void {
    const n = this.hits().length;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.active.update((i) => (n ? (i + (event.key === 'ArrowDown' ? 1 : n - 1)) % n : 0));
      setTimeout(() => document.getElementById('search-hit-' + this.active())?.scrollIntoView({ block: 'nearest' }));
    } else if (event.key === 'Enter' && n) this.go(this.hits()[this.active()]);
  }

  protected go(hit: SearchHit): void {
    this.open.set(false);
    void this.router.navigate(['/docs', hit.slug], { fragment: hit.id || undefined });
  }
}
