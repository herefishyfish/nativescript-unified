import { ChangeDetectionStrategy, Component } from '@angular/core';

/** The site mark: an HTML tag on a teal tile. Colours come from the theme tokens, so it follows dark mode. index.html carries the same shape as the favicon. */
@Component({
  selector: 'web-site-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0', 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 24 24" class="size-full" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect width="24" height="24" rx="6" fill="var(--primary)" />
      <path d="M9 8.5 5.5 12 9 15.5M15 8.5l3.5 3.5-3.5 3.5M13.25 6.75l-2.5 10.5" stroke="var(--primary-foreground)" stroke-width="2" />
    </svg>
  `,
})
export class SiteLogo {}
