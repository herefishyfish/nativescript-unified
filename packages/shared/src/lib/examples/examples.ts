import type { Type } from '@angular/core';
import { PricingExample } from './pricing.example';
import { CheckoutExample } from './checkout.example';
import { ProfileExample } from './profile.example';
import { AnalyticsExample } from './analytics.example';
import { SettingsExample } from './settings.example';
import { EventsExample } from './events.example';
import { RatingsExample } from './ratings.example';
import { SignInExample } from './sign-in.example';
import { MusicPlayerExample } from './music-player.example';
import { ArticleExample } from './article.example';
import { ChartsExample } from './charts.example';
import pricingCode from './pricing.example.ts?raw';
import pricingStyles from './pricing.example.css?raw';
import checkoutCode from './checkout.example.ts?raw';
import checkoutStyles from './checkout.example.css?raw';
import profileCode from './profile.example.ts?raw';
import profileStyles from './profile.example.css?raw';
import analyticsCode from './analytics.example.ts?raw';
import analyticsStyles from './analytics.example.css?raw';
import settingsCode from './settings.example.ts?raw';
import settingsStyles from './settings.example.css?raw';
import eventsCode from './events.example.ts?raw';
import eventsStyles from './events.example.css?raw';
import ratingsCode from './ratings.example.ts?raw';
import ratingsStyles from './ratings.example.css?raw';
import signInCode from './sign-in.example.ts?raw';
import signInStyles from './sign-in.example.css?raw';
import musicPlayerCode from './music-player.example.ts?raw';
import musicPlayerStyles from './music-player.example.css?raw';
import articleCode from './article.example.ts?raw';
import articleStyles from './article.example.css?raw';
import chartsCode from './charts.example.ts?raw';
import chartsStyles from './charts.example.css?raw';

/**
 * One example screen. HTML, Tailwind and helm only, so web and native both render it.
 * `icon` is a lucide icon name; each example styles itself in `<slug>.example.css` under `.example-<slug>`.
 * `source` is that file pair as text (Vite `?raw`), for the example page's Code and Styles tabs.
 */
export type Example = {
  readonly slug: string;
  readonly title: string;
  readonly blurb: string;
  readonly icon: string;
  readonly component: Type<unknown>;
  /** The component file and its stylesheet, shown on the Code and Styles tabs. */
  readonly source: { readonly code: string; readonly styles: string };
};

export const EXAMPLES: readonly Example[] = [
  { slug: 'pricing', title: 'Pricing', blurb: 'Three tiers, a featured plan and a monthly or annual toggle.', icon: 'tag', component: PricingExample, source: { code: pricingCode, styles: pricingStyles } },
  { slug: 'checkout', title: 'Checkout', blurb: 'Cart with quantity steppers, a promo code and an order summary.', icon: 'shopping-cart', component: CheckoutExample, source: { code: checkoutCode, styles: checkoutStyles } },
  { slug: 'profile', title: 'Profile', blurb: 'Cover, avatar, stats, bio and a tabbed post grid.', icon: 'user-round', component: ProfileExample, source: { code: profileCode, styles: profileStyles } },
  { slug: 'analytics', title: 'Analytics', blurb: 'Stat cards, a flexbox bar chart and an activity feed.', icon: 'chart-column', component: AnalyticsExample, source: { code: analyticsCode, styles: analyticsStyles } },
  { slug: 'settings', title: 'Settings', blurb: 'Grouped settings with inputs, switches and a danger zone.', icon: 'settings', component: SettingsExample, source: { code: settingsCode, styles: settingsStyles } },
  { slug: 'events', title: 'Events', blurb: 'Date badges, filter chips and RSVP toggles.', icon: 'calendar-days', component: EventsExample, source: { code: eventsCode, styles: eventsStyles } },
  { slug: 'ratings', title: 'Ratings', blurb: 'Tap-to-rate stars, breakdown bars and review cards.', icon: 'star', component: RatingsExample, source: { code: ratingsCode, styles: ratingsStyles } },
  { slug: 'sign-in', title: 'Sign in', blurb: 'A form with validation and social buttons.', icon: 'log-in', component: SignInExample, source: { code: signInCode, styles: signInStyles } },
  { slug: 'music-player', title: 'Music player', blurb: 'Album art, a progress bar and transport controls.', icon: 'music', component: MusicPlayerExample, source: { code: musicPlayerCode, styles: musicPlayerStyles } },
  { slug: 'article', title: 'Article', blurb: 'A reader page with byline, hero and pull quote.', icon: 'newspaper', component: ArticleExample, source: { code: articleCode, styles: articleStyles } },
  { slug: 'charts', title: 'Charts', blurb: 'TanStack bar and line charts with tooltips and a range toggle.', icon: 'chart-line', component: ChartsExample, source: { code: chartsCode, styles: chartsStyles } },
];

export function findExample(slug: string): Example | undefined {
  return EXAMPLES.find((example) => example.slug === slug);
}
