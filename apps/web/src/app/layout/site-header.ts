import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, input, output, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMenu, lucideX } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { DocsSearch } from './docs-search';
import { ThemeToggle } from './theme-toggle';

/** Sticky top bar shared by the home page and the docs layout. */
@Component({
  selector: 'web-site-header',
  imports: [RouterLink, HlmButton, NgIcon, ThemeToggle, DocsSearch],
  providers: [provideIcons({ lucideMenu, lucideX })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'sticky top-0 z-30 block' },
  template: `
    <header class="flex h-14 items-center gap-2 border-b bg-background/90 px-4 backdrop-blur">
      @if (showMenu()) {
        <button hlmBtn variant="ghost" size="icon" type="button" class="md:hidden" aria-label="Toggle navigation" aria-controls="docs-sidebar" [attr.aria-expanded]="menuOpen()" data-testid="nav-toggle" #navToggle (click)="menuToggle.emit()">
          <ng-icon [name]="menuOpen() ? 'lucideX' : 'lucideMenu'" size="18" aria-hidden="true" />
        </button>
      }
      <a routerLink="/" class="flex items-center gap-2 font-semibold tracking-tight">
        <span class="inline-block size-5 rounded-md bg-primary"></span>
        NativeScript Unified
      </a>
      <span class="ml-1 hidden rounded-full border px-2 py-0.5 text-xs text-muted-foreground sm:inline">HTML first</span>
      <div class="ml-auto flex items-center gap-1">
        <web-docs-search />
        <a hlmBtn variant="ghost" size="sm" routerLink="/docs/introduction" class="hidden sm:inline-flex">Docs</a>
        <web-theme-toggle />
      </div>
    </header>
  `,
})
export class SiteHeader {
  readonly showMenu = input(false, { transform: booleanAttribute });
  readonly menuOpen = input(false);
  readonly menuToggle = output<void>();
  private readonly toggle = viewChild<ElementRef<HTMLElement>>('navToggle');
  focusToggle(): void {
    this.toggle()?.nativeElement.focus();
  }
}