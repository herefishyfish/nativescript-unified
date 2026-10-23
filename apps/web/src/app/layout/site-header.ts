import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, input, output, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideGithub, lucideMenu, lucideX } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { DocsSearch } from './docs-search';
import { SiteLogo } from './site-logo';
import { ThemeToggle } from './theme-toggle';

/** Sticky top bar shared by the home page and the docs layout. */
@Component({
  selector: 'web-site-header',
  imports: [RouterLink, HlmButton, NgIcon, ThemeToggle, DocsSearch, SiteLogo],
  providers: [provideIcons({ lucideGithub, lucideMenu, lucideX })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'sticky top-0 z-30 block' },
  template: `
    <header class="flex h-14 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur">
      @if (showMenu()) {
        <button hlmBtn variant="ghost" size="icon" type="button" class="md:hidden" aria-label="Toggle navigation" aria-controls="docs-sidebar" [attr.aria-expanded]="menuOpen()" data-testid="nav-toggle" #navToggle (click)="menuToggle.emit()">
          <ng-icon [name]="menuOpen() ? 'lucideX' : 'lucideMenu'" size="18" aria-hidden="true" />
        </button>
      }
      <a routerLink="/" class="flex items-center gap-2 font-semibold tracking-tight" data-testid="home-link">
        <web-site-logo class="size-6" />
        NativeScript Unified
      </a>
      <nav aria-label="Main" class="ml-4 hidden items-center gap-1 md:flex">
        @for (link of links; track link.label) {
          <a
            [routerLink]="link.path"
            [fragment]="link.fragment"
            class="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >{{ link.label }}</a
          >
        }
      </nav>
      <div class="ml-auto flex items-center gap-1">
        <web-docs-search />
        <a hlmBtn variant="ghost" size="icon" href="https://github.com/herefishyfish/nativescript-unified" target="_blank" rel="noopener" aria-label="GitHub repository" data-testid="github-link">
          <ng-icon name="lucideGithub" size="18" aria-hidden="true" />
        </a>
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
  protected readonly links = [
    { label: 'Docs', path: '/docs/introduction', fragment: undefined },
    { label: 'Components', path: '/docs/components', fragment: undefined },
    { label: 'Examples', path: '/', fragment: 'examples' },
  ];

  focusToggle(): void {
    this.toggle()?.nativeElement.focus();
  }
}
