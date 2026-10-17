import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmKbd } from '@spartan-ng/helm/kbd';
import { search, type SearchEntry, type SearchHit } from '../docs/search';

@Component({
  selector: 'web-docs-search',
  imports: [FormsModule, NgIcon, HlmButton, HlmInput, HlmKbd, HlmDialogImports],
  providers: [provideIcons({ lucideSearch })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown)': 'onKey($event)' },
  template: `
    <button hlmBtn variant="outline" size="sm" type="button" class="gap-2 text-muted-foreground" aria-label="Search docs" data-testid="search-open" (click)="show()">
      <ng-icon name="lucideSearch" size="16" />
      <span class="hidden sm:inline">Search docs</span>
      <kbd hlmKbd class="hidden sm:inline-flex">Ctrl K</kbd>
    </button>
    <hlm-dialog [state]="open() ? 'open' : 'closed'" (closed)="open.set(false)">
      <hlm-dialog-content *hlmDialogPortal="let ctx" class="sm:max-w-xl" [showCloseButton]="false" data-testid="search-dialog">
        <hlm-dialog-header>
          <h2 hlmDialogTitle class="sr-only">Search docs</h2>
        </hlm-dialog-header>
        <input hlmInput type="search" placeholder="Search the docs…" aria-label="Search docs" data-testid="search-input" autocomplete="off" class="h-10 rounded-md border px-3"
          [ngModel]="query()" (ngModelChange)="query.set($event); active.set(0)" (keydown)="onInputKey($event)" />
        <ul class="max-h-80 overflow-y-auto" data-testid="search-results">
          @for (hit of hits(); track hit.slug + hit.id; let i = $index) {
            <li>
              <button type="button" class="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent" [class.bg-accent]="i === active()" data-testid="search-hit" (click)="go(hit)">
                <span class="font-medium">{{ hit.title }}@if (hit.heading) {<span class="text-muted-foreground"> › {{ hit.heading }}</span>}</span>
                <span class="block truncate text-xs text-muted-foreground">{{ hit.snippet }}</span>
              </button>
            </li>
          } @empty {
            @if (query()) {
              <li class="px-3 py-6 text-center text-sm text-muted-foreground" data-testid="search-empty">No results for "{{ query() }}"</li>
            }
          }
        </ul>
      </hlm-dialog-content>
    </hlm-dialog>
  `,
})
export class DocsSearch {
  private readonly router = inject(Router);
  private readonly entries = signal<readonly SearchEntry[]>([]);
  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly active = signal(0);
  protected readonly hits = computed<SearchHit[]>(() => search(this.entries(), this.query()));

  protected async show(): Promise<void> {
    this.query.set('');
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
    } else if (event.key === 'Enter' && n) this.go(this.hits()[this.active()]);
  }

  protected go(hit: SearchHit): void {
    this.open.set(false);
    void this.router.navigate(['/docs', hit.slug], { fragment: hit.id || undefined });
  }
}