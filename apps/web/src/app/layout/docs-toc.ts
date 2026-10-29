import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { TocItem } from '../docs/content';

@Component({
  selector: 'web-docs-toc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (items().length) {
      <nav aria-label="On this page" data-testid="toc" class="sticky top-20 hidden max-h-[calc(100vh-6rem)] w-52 shrink-0 self-start overflow-y-auto text-sm lg:block">
        <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">On this page</p>
        <ul class="flex flex-col gap-1 border-l">
          @for (item of items(); track item.id) {
            <li>
              <a
                [href]="hrefFor(item.id)"
                class="-ml-px block border-l py-0.5 hover:text-foreground"
                [class]="item.id === active() ? 'border-primary font-medium text-primary' : 'border-transparent text-muted-foreground'"
                [class.pl-6]="item.depth === 3"
                [class.pl-3]="item.depth === 2"
                [attr.aria-current]="item.id === active() ? 'location' : null"
                (click)="jump($event, item.id)"
                >{{ item.text }}</a
              >
            </li>
          }
        </ul>
      </nav>
    }
  `,
})
export class DocsToc {
  readonly items = input.required<TocItem[]>();
  protected readonly active = signal('');
  private readonly router = inject(Router);

  /** The page's own path plus the fragment. A bare `#id` resolves against `<base href="/">`, the home page. */
  protected hrefFor(id: string): string {
    return `${this.router.url.split('#')[0]}#${id}`;
  }

  constructor() {
    effect((onCleanup) => {
      const items = this.items();
      if (typeof IntersectionObserver === 'undefined' || !items.length) return;
      const visible = new Set<string>();
      const observer = new IntersectionObserver(
        (entries) => {
          for (const e of entries) e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id);
          this.active.set(items.find((i) => visible.has(i.id))?.id ?? this.active());
        },
        { rootMargin: '-80px 0px -65% 0px' },
      );
      const timer = setTimeout(() => {
        this.active.set(items[0].id);
        for (const item of items) {
          const el = document.getElementById(item.id);
          if (el) observer.observe(el);
        }
      });
      onCleanup(() => {
        clearTimeout(timer);
        observer.disconnect();
      });
    });
  }

  protected jump(event: Event, id: string): void {
    event.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', this.hrefFor(id));
    this.active.set(id);
  }
}