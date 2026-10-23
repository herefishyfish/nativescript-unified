import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteLogo } from './site-logo';

/** Footer for the home page: a docs index and the projects this workspace is built on. */
@Component({
  selector: 'web-site-footer',
  imports: [RouterLink, SiteLogo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block border-t bg-sidebar' },
  template: `
    <footer>
      <div class="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-8">
        <div>
          <a routerLink="/" class="flex items-center gap-2 font-semibold tracking-tight">
            <web-site-logo class="size-6" />
            NativeScript Unified
          </a>
          <p class="mt-3 max-w-xs text-sm text-muted-foreground">HTML-first NativeScript Angular. One set of templates for the web, iOS and Android.</p>
        </div>
        @for (column of columns; track column.title) {
          <nav [attr.aria-label]="column.title">
            <h2 class="text-sm font-semibold">{{ column.title }}</h2>
            <ul class="mt-3 flex flex-col gap-2 text-sm">
              @for (link of column.links; track link.label) {
                <li>
                  @if (link.href.startsWith('/')) {
                    <a [routerLink]="link.href" class="text-muted-foreground transition-colors hover:text-foreground">{{ link.label }}</a>
                  } @else {
                    <a [href]="link.href" target="_blank" rel="noopener" class="text-muted-foreground transition-colors hover:text-foreground">{{ link.label }}</a>
                  }
                </li>
              }
            </ul>
          </nav>
        }
      </div>
      <p class="border-t px-4 py-5 text-center text-xs text-muted-foreground">MIT licensed. Colours inspired by the New Balance Numeric 306 in Sea Salt and Vintage Teal.</p>
    </footer>
  `,
})
export class SiteFooter {
  protected readonly columns = [
    {
      title: 'Get started',
      links: [
        { label: 'Introduction', href: '/docs/introduction' },
        { label: 'Installation', href: '/docs/installation' },
        { label: 'Web vs native', href: '/docs/web-vs-native' },
        { label: 'FAQ', href: '/docs/faq' },
      ],
    },
    {
      title: 'Build',
      links: [
        { label: 'HTML first', href: '/docs/html-first' },
        { label: 'Components', href: '/docs/components' },
        { label: 'Theming', href: '/docs/theming' },
        { label: 'File-based routing', href: '/docs/file-routing' },
      ],
    },
    {
      title: 'Built on',
      links: [
        { label: 'Angular', href: 'https://angular.dev' },
        { label: 'AnalogJS', href: 'https://analogjs.org' },
        { label: 'NativeScript', href: 'https://nativescript.org' },
        { label: 'MasonKit', href: 'https://github.com/triniwiz/nativescript-mason' },
        { label: 'Spartan', href: 'https://spartan.ng' },
        { label: 'Tailwind CSS', href: 'https://tailwindcss.com' },
      ],
    },
  ];
}
