import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBadgeCheck, lucideThumbsUp } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';

type Stars = 1 | 2 | 3 | 4 | 5;

type Review = {
  readonly id: string;
  readonly author: string;
  readonly initials: string;
  readonly stars: Stars;
  readonly date: string;
  readonly title: string;
  readonly text: string;
  readonly helpful: number;
  readonly verified: boolean;
};

const STAR_VALUES: readonly Stars[] = [1, 2, 3, 4, 5];

/** Published review counts per star value, before the viewer's own rating. */
const COUNTS: Readonly<Record<Stars, number>> = { 5: 796, 4: 308, 3: 116, 2: 38, 1: 26 };

const REVIEWS: readonly Review[] = [
  { id: 'marta', author: 'Marta Silva', initials: 'MS', stars: 5, date: '2 days ago', title: 'Rock solid from day one', text: 'Set it up in ten minutes and it has not missed a beat since. The sync is instant and the widgets are gorgeous.', helpful: 42, verified: true },
  { id: 'jon', author: 'Jon Peters', initials: 'JP', stars: 4, date: '5 days ago', title: 'Great, with two wishes', text: 'Would love a true black dark mode and slightly faster search, but honestly no real complaints. Easy recommend.', helpful: 17, verified: true },
  { id: 'aisha', author: 'Aisha Khan', initials: 'AK', stars: 5, date: '1 week ago', title: 'Onboarding is a masterclass', text: 'My whole team picked it up in a single afternoon. The guided tour alone deserves five stars.', helpful: 88, verified: false },
];

/** A product rating summary: tap-to-rate stars that move the average and the breakdown bars, plus review cards with helpful votes. */
@Component({
  selector: 'example-ratings',
  imports: [NgIcon, HlmAvatarImports, HlmBadge, HlmButton, HlmCardImports],
  providers: [provideIcons({ lucideBadgeCheck, lucideThumbsUp })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'example-ratings' },
  template: `
    <div class="flex flex-col gap-5 p-4 bg-background text-foreground">
      <div class="hero flex flex-col items-center gap-2 p-6 rounded-3xl">
        <span class="hero-soft text-xs font-bold tracking-widest">CUSTOMER RATING</span>
        <span class="hero-ink text-6xl font-extrabold">{{ average().toFixed(1) }}</span>
        <div class="flex flex-row gap-1">
          @for (n of starValues; track n) {
            <span class="text-2xl" [class.hero-star-on]="n <= roundedAverage()" [class.hero-star-off]="n > roundedAverage()">★</span>
          }
        </div>
        <span class="hero-ink text-sm font-semibold">Based on {{ total().toLocaleString('en-US') }} reviews</span>
      </div>

      <div hlmCard size="sm" class="border border-border">
        <div hlmCardContent class="flex flex-col gap-3">
          @for (row of breakdown(); track row.stars) {
            <div class="flex flex-row items-center gap-3">
              <span class="text-sm font-bold text-card-foreground w-6">{{ row.stars }}★</span>
              <div class="flex flex-row flex-1 h-2 rounded-full bg-muted">
                <div class="fill h-2 rounded-full" [style.width.%]="row.pct"></div>
              </div>
              <span class="text-xs text-muted-foreground w-10 text-right">{{ row.pct }}%</span>
            </div>
          }
        </div>
      </div>

      <div class="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border bg-accent">
        <div class="flex flex-col items-center gap-2">
          <span class="text-base font-bold text-accent-foreground">{{ mine() ? 'Thanks for rating!' : 'How would you rate it?' }}</span>
          <div class="flex flex-row gap-2">
            @for (n of starValues; track n) {
              <button class="star-button text-4xl px-1" [class.star-on]="n <= mine()" [class.star-off]="n > mine()" (click)="rate(n)">★</button>
            }
          </div>
          <span class="text-xs text-accent-foreground">{{ mine() ? 'You gave ' + mine() + ' of 5. Tap the same star to clear.' : 'Tap a star. Your vote updates the score above.' }}</span>
        </div>
      </div>

      <span class="text-xl font-extrabold">Top reviews</span>
      @for (review of reviews; track review.id; let i = $index) {
        <div hlmCard size="sm" class="border border-border">
          <div hlmCardContent class="flex flex-col gap-3">
            <div class="flex flex-row items-center gap-3">
              <hlm-avatar size="lg">
                <span hlmAvatarFallback>
                  <span class="flex items-center justify-center w-full h-full rounded-full text-sm font-bold" [class]="'avatar-' + i">{{ review.initials }}</span>
                </span>
              </hlm-avatar>
              <div class="flex flex-col gap-1 flex-1">
                <span class="text-sm font-bold text-card-foreground">{{ review.author }}</span>
                <div class="flex flex-row items-center gap-2">
                  <span class="text-xs text-muted-foreground">{{ review.date }}</span>
                  @if (review.verified) {
                    <span hlmBadge variant="outline">
                      <ng-icon name="lucideBadgeCheck" />
                      Verified
                    </span>
                  }
                </div>
              </div>
              <span class="star-on text-sm">{{ '★'.repeat(review.stars) }}{{ '☆'.repeat(5 - review.stars) }}</span>
            </div>
            <span class="text-base font-bold text-card-foreground">{{ review.title }}</span>
            <p class="text-sm text-muted-foreground">{{ review.text }}</p>
            <div class="flex flex-row items-center justify-between gap-2">
              <span class="text-xs text-muted-foreground flex-1">{{ review.helpful + (helpful().has(review.id) ? 1 : 0) }} found this helpful</span>
              <button hlmBtn size="sm" class="rounded-full" [variant]="helpful().has(review.id) ? 'default' : 'outline'" (click)="toggleHelpful(review.id)">
                <ng-icon name="lucideThumbsUp" />
                {{ helpful().has(review.id) ? 'Helpful' : 'Helpful?' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class RatingsExample {
  protected readonly starValues = STAR_VALUES;
  protected readonly reviews = REVIEWS;
  /** The viewer's rating, 0 when unrated. */
  protected readonly mine = signal<0 | Stars>(0);
  protected readonly helpful = signal<ReadonlySet<string>>(new Set());

  private readonly counts = computed(() => {
    const mine = this.mine();
    return STAR_VALUES.map((stars) => ({ stars, count: COUNTS[stars] + (stars === mine ? 1 : 0) }));
  });
  protected readonly total = computed(() => this.counts().reduce((sum, row) => sum + row.count, 0));
  protected readonly average = computed(() => this.counts().reduce((sum, row) => sum + row.stars * row.count, 0) / this.total());
  protected readonly roundedAverage = computed(() => Math.round(this.average()));
  protected readonly breakdown = computed(() => {
    const total = this.total();
    return this.counts()
      .map((row) => ({ stars: row.stars, pct: Math.round((row.count / total) * 100) }))
      .reverse();
  });

  protected rate(stars: Stars): void {
    this.mine.update((mine) => (mine === stars ? 0 : stars));
  }

  protected toggleHelpful(id: string): void {
    this.helpful.update((helpful) => {
      const next = new Set(helpful);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }
}
