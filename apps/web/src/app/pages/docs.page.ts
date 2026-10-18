import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NAV } from '../docs/content';
import { SiteHeader } from '../layout/site-header';

/** Layout for /docs: top bar, sidebar navigation and the page outlet. */
@Component({
  selector: 'web-docs-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SiteHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <web-site-header showMenu [menuOpen]="open()" (menuToggle)="open.set(!open())" />

    <!-- Three columns: the sidebar column grows with the window so its background reaches the left edge on wide screens. -->
    <div class="md:grid md:grid-cols-[minmax(16rem,1fr)_minmax(0,68rem)_minmax(0,1fr)]">
      <nav
        aria-label="Documentation"
        data-testid="sidebar"
        class="fixed inset-x-0 bottom-0 top-14 z-20 overflow-y-auto border-r bg-sidebar md:sticky md:top-14 md:block md:h-[calc(100dvh-3.5rem)] md:max-h-[calc(100dvh-3.5rem)] md:self-start"
        [class.hidden]="!open()"
      >
        <div class="p-4 md:ml-auto md:w-64 md:py-6">
          @for (section of nav; track section.title) {
            <div class="mb-6">
              <h2 class="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{{ section.title }}</h2>
              <ul class="flex flex-col gap-0.5">
                @for (page of section.pages; track page.slug) {
                  <li>
                    <a
                      [routerLink]="['/docs', page.slug]"
                      routerLinkActive="bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      class="block rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent"
                      (click)="open.set(false)"
                      >{{ page.title }}</a
                    >
                  </li>
                }
              </ul>
            </div>
          }
        </div>
      </nav>
      <main class="min-w-0 px-4 py-8 md:px-10 md:py-10">
        <router-outlet />
      </main>
    </div>
  `,
})
export default class DocsLayout {
  protected readonly nav = NAV;
  protected readonly open = signal(false);
}