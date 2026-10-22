import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideChevronDown, lucideChevronUp, lucideCrown, lucideRocket, lucideSparkles, lucideUsers } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSeparator } from '@spartan-ng/helm/separator';

type Billing = 'monthly' | 'annual';

type Tier = {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly monthly: number;
  readonly blurb: string;
  readonly features: readonly string[];
  readonly featured: boolean;
};

type Faq = { readonly question: string; readonly answer: string };

const ANNUAL_DISCOUNT = 0.2;

const TIERS: readonly Tier[] = [
  {
    id: 'starter',
    name: 'Starter',
    icon: 'lucideRocket',
    monthly: 12,
    blurb: 'For side projects and weekend experiments.',
    features: ['3 projects', 'Community support', 'Basic analytics'],
    featured: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: 'lucideCrown',
    monthly: 29,
    blurb: 'For professionals shipping every week.',
    features: ['Unlimited projects', 'Priority support', 'Advanced analytics', 'Custom domains'],
    featured: true,
  },
  {
    id: 'team',
    name: 'Team',
    icon: 'lucideUsers',
    monthly: 79,
    blurb: 'For teams that collaborate at scale.',
    features: ['Everything in Pro', 'SSO and roles', 'Audit log', '99.9% uptime SLA'],
    featured: false,
  },
];

const FAQS: readonly Faq[] = [
  { question: 'Can I switch plans later?', answer: 'Yes. Upgrades apply right away and downgrades at the end of your billing period.' },
  { question: 'Is there a free trial?', answer: 'Pro comes with 14 days free. No card needed until the trial ends.' },
  { question: 'What counts as a project?', answer: 'One app or site with its own domain, environments and analytics.' },
];

/**
 * Three tiers with a featured plan. The billing toggle reprices every tier; tapping a plan selects it.
 * State on helm hosts goes through data attributes and variant inputs, since helm owns their class list.
 */
@Component({
  selector: 'example-pricing',
  imports: [NgIcon, HlmBadge, HlmButton, HlmCardImports, HlmSeparator],
  providers: [provideIcons({ lucideCheck, lucideChevronDown, lucideChevronUp, lucideCrown, lucideRocket, lucideSparkles, lucideUsers })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'example-pricing' },
  template: `
    <div class="example-pricing flex flex-col gap-5 p-4 pb-10 bg-background text-foreground">
      <div class="hero flex flex-col gap-4 p-6 rounded-3xl">
        <div class="hero-pill flex flex-row items-center gap-2 self-start px-3 py-1 rounded-full">
          <ng-icon name="lucideSparkles" size="14" class="on-hero" />
          <span class="on-hero text-xs font-semibold">Simple, honest pricing</span>
        </div>
        <h1 class="on-hero text-4xl font-extrabold">Choose your plan</h1>
        <p class="on-hero-soft text-base">Start free, upgrade when your team grows. Cancel any time.</p>

        <div class="toggle-track flex flex-row gap-1 p-1 rounded-full">
          <button class="toggle-option flex-1 py-2 rounded-full text-sm font-semibold" [class.active]="billing() === 'monthly'" (click)="billing.set('monthly')">
            Monthly
          </button>
          <button class="toggle-option flex-1 flex flex-row items-center justify-center gap-2 py-2 rounded-full text-sm font-semibold" [class.active]="billing() === 'annual'" (click)="billing.set('annual')">
            <span>Annual</span>
            <span class="save-pill text-xs font-bold px-2 rounded-full">-20%</span>
          </button>
        </div>
      </div>

      @for (tier of priced(); track tier.id) {
        <div hlmCard class="tier flex flex-col gap-4 p-5 rounded-3xl border-2 border-border ring-0" [attr.data-featured]="tier.featured" [attr.data-chosen]="selected() === tier.id">
          <div class="flex flex-row items-center justify-between">
            <div class="flex flex-row items-center gap-3">
              <div class="tier-icon flex items-center justify-center w-10 h-10 rounded-xl bg-secondary text-primary">
                <ng-icon [name]="tier.icon" size="20" />
              </div>
              <h3 hlmCardTitle class="tier-ink text-xl font-bold">{{ tier.name }}</h3>
            </div>
            @if (tier.featured) {
              <span hlmBadge class="popular font-bold px-3">Most popular</span>
            }
          </div>

          <div class="flex flex-col gap-1">
            <div class="flex flex-row items-end gap-1">
              <span class="tier-ink text-xl font-bold pb-2">$</span>
              <span class="tier-ink text-5xl font-extrabold">{{ tier.price }}</span>
              <span class="tier-soft text-sm pb-2 text-muted-foreground">/ month</span>
            </div>
            <span class="tier-soft text-sm text-muted-foreground">{{ tier.billedNote }}</span>
          </div>
          <p hlmCardDescription class="tier-soft text-sm">{{ tier.blurb }}</p>

          <div hlmSeparator class="tier-rule h-px w-full"></div>

          <div class="flex flex-col gap-3">
            @for (feature of tier.features; track feature) {
              <div class="flex flex-row items-center gap-3">
                <div class="check flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-primary">
                  <ng-icon name="lucideCheck" size="14" />
                </div>
                <span class="tier-ink text-sm">{{ feature }}</span>
              </div>
            }
          </div>

          <button hlmBtn size="lg" class="tier-cta h-12 rounded-2xl text-base font-bold" [variant]="selected() === tier.id || tier.featured ? 'default' : 'secondary'" (click)="selected.set(tier.id)">
            {{ selected() === tier.id ? 'Your plan' : tier.featured ? 'Start 14-day trial' : 'Choose ' + tier.name }}
          </button>
        </div>
      }

      <div class="flex flex-col gap-3">
        <h2 class="text-xl font-bold">Questions</h2>
        @for (faq of faqs; track faq.question; let i = $index) {
          <div class="flex flex-col rounded-2xl border border-border bg-card text-card-foreground">
            <button class="flex flex-row items-center justify-between gap-3 p-4" (click)="toggleFaq(i)">
              <span class="text-sm font-semibold">{{ faq.question }}</span>
              <ng-icon [name]="openFaq() === i ? 'lucideChevronUp' : 'lucideChevronDown'" size="18" class="text-primary" />
            </button>
            @if (openFaq() === i) {
              <p class="soft-copy text-sm px-4 pb-4 text-muted-foreground">{{ faq.answer }}</p>
            }
          </div>
        }
      </div>

      <p class="text-xs text-center text-muted-foreground">Prices in USD. Annual plans are charged once a year.</p>
    </div>
  `,
})
export class PricingExample {
  protected readonly faqs = FAQS;
  protected readonly billing = signal<Billing>('annual');
  protected readonly selected = signal<string | null>(null);
  protected readonly openFaq = signal<number | null>(0);

  protected readonly priced = computed(() => {
    const annual = this.billing() === 'annual';
    return TIERS.map((tier) => {
      const price = annual ? Math.round(tier.monthly * (1 - ANNUAL_DISCOUNT)) : tier.monthly;
      const billedNote = annual ? `$${price * 12} billed yearly, save $${(tier.monthly - price) * 12}` : 'Billed monthly';
      return { ...tier, price, billedNote };
    });
  });

  protected toggleFaq(index: number): void {
    this.openFaq.update((open) => (open === index ? null : index));
  }
}
