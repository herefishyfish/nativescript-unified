import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMenu, lucideX } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { NAV } from '../docs/content';
import { DocsSearch } from '../layout/docs-search';
import { ThemeToggle } from '../layout/theme-toggle';

/** Layout for /docs: top bar, sidebar navigation and the page outlet. */
@Component({
  selector: 'web-docs-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, HlmButton, NgIcon, ThemeToggle, DocsSearch],
  providers: [provideIcons({ lucideMenu, lucideX })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/90 px-4 backdrop-blur">
      <button hlmBtn variant="ghost" size="icon" type="button" class="md:hidden" aria-label="Toggle navigation" data-testid="nav-toggle" (click)="open.set(!open())">
        <ng-icon [name]="open() ? 'lucideX' : 'lucideMenu'" size="18" />
      </button>
      <a routerLink="/" class="flex items-center gap-2 font-semibold">
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

    <div class="mx-auto flex max-w-7xl items-start">
      <nav
        aria-label="Documentation"
        data-testid="sidebar"
        class="fixed inset-x-0 bottom-0 top-14 z-20 overflow-y-auto border-r bg-sidebar p-4 md:sticky md:top-14 md:block md:h-[calc(100dvh-3.5rem)] md:max-h-[calc(100dvh-3.5rem)] md:w-64 md:shrink-0 md:self-start"
        [class.hidden]="!open()"
      >
        @for (section of nav; track section.title) {
          <div class="mb-5">
            <h2 class="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{{ section.title }}</h2>
            <ul class="flex flex-col gap-0.5">
              @for (page of section.pages; track page.slug) {
                <li>
                  <a
                    [routerLink]="['/docs', page.slug]"
                    routerLinkActive="bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    class="block rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent"
                    (click)="open.set(false)"
                    >{{ page.title }}</a
                  >
                </li>
              }
            </ul>
          </div>
        }
      </nav>
      <main class="min-w-0 flex-1 px-4 py-8 md:px-10">
        <router-outlet />
      </main>
    </div>
  `,
})
export default class DocsLayout {
  protected readonly nav = NAV;
  protected readonly open = signal(false);
}
