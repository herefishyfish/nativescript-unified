import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendar, lucideClock, lucideMapPin, lucideSparkles, lucideTicket, lucideUsers } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';

const CATEGORIES = ['Tech', 'Music', 'Food', 'Sport'] as const;
type Category = (typeof CATEGORIES)[number];
type Filter = Category | 'All';

type EventItem = {
  readonly id: string;
  readonly title: string;
  readonly venue: string;
  readonly day: string;
  readonly month: string;
  readonly weekday: string;
  readonly time: string;
  readonly category: Category;
  readonly attendees: number;
};

const EVENTS: readonly EventItem[] = [
  { id: 'meetup', title: 'NativeScript Meetup', venue: 'Hub Lisbon, Rua do Alecrim 12', day: '14', month: 'JUN', weekday: 'SAT', time: '18:30', category: 'Tech', attendees: 86 },
  { id: 'jazz', title: 'Jazz in the Park', venue: 'Parque Eduardo VII', day: '15', month: 'JUN', weekday: 'SUN', time: '20:00', category: 'Music', attendees: 412 },
  { id: 'ramen', title: 'Ramen Night Market', venue: 'LX Factory, Hall B', day: '18', month: 'JUN', weekday: 'WED', time: '17:00', category: 'Food', attendees: 238 },
  { id: 'run', title: 'Morning 10K Run', venue: 'Marginal Promenade', day: '21', month: 'JUN', weekday: 'SAT', time: '08:00', category: 'Sport', attendees: 154 },
  { id: 'design', title: 'Design Systems Talk', venue: 'Marvila Startup Hub', day: '24', month: 'JUN', weekday: 'TUE', time: '19:00', category: 'Tech', attendees: 63 },
  { id: 'vinyl', title: 'Vinyl Swap Fair', venue: 'Galeria Zé dos Bois', day: '28', month: 'JUN', weekday: 'SAT', time: '14:00', category: 'Music', attendees: 97 },
];

/** An events feed: a gradient hero with RSVP stats, category chips that filter the list, and per-event RSVP toggles. */
@Component({
  selector: 'example-events',
  imports: [NgIcon, HlmBadge, HlmButton, HlmCardImports],
  providers: [provideIcons({ lucideCalendar, lucideClock, lucideMapPin, lucideSparkles, lucideTicket, lucideUsers })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'example-events' },
  template: `
    <div class="flex flex-col gap-5 p-4 bg-background text-foreground">
      <div class="hero flex flex-col gap-4 p-5 rounded-3xl">
        <div class="flex flex-row items-center gap-2">
          <ng-icon name="lucideSparkles" class="hero-soft text-sm" />
          <span class="hero-soft text-xs font-bold tracking-widest">LISBON · JUNE</span>
        </div>
        <span class="hero-ink text-4xl font-extrabold">What's on this month</span>
        <div class="flex flex-row gap-3">
          <div class="hero-stat flex flex-col gap-1 flex-1 px-4 py-3 rounded-2xl">
            <span class="hero-ink text-2xl font-extrabold">{{ events.length }}</span>
            <span class="hero-soft text-xs">events nearby</span>
          </div>
          <div class="hero-stat flex flex-col gap-1 flex-1 px-4 py-3 rounded-2xl">
            <span class="hero-ink text-2xl font-extrabold">{{ going().size }}</span>
            <span class="hero-soft text-xs">on your calendar</span>
          </div>
        </div>
      </div>

      <div class="flex flex-row flex-wrap gap-2">
        @for (option of filters; track option) {
          <button hlmBtn size="sm" class="rounded-full px-4" [variant]="filter() === option ? 'default' : 'outline'" (click)="filter.set(option)">
            {{ option }}
          </button>
        }
      </div>

      <div class="flex flex-col gap-3">
        @for (event of visible(); track event.id) {
          <div hlmCard size="sm" class="border border-border">
            <div hlmCardContent class="flex flex-row items-center gap-3">
              <div class="date-badge flex flex-col items-center justify-center w-16 h-16 rounded-2xl">
                <span class="date-ink text-2xl font-extrabold">{{ event.day }}</span>
                <span class="date-ink text-xs font-bold">{{ event.month }}</span>
              </div>
              <div class="flex flex-col gap-1 flex-1">
                <div class="flex flex-row items-center gap-2">
                  <span hlmBadge variant="secondary">{{ event.category }}</span>
                  <span class="text-xs font-bold text-primary">{{ event.weekday }} {{ event.time }}</span>
                </div>
                <span class="text-base font-bold text-card-foreground">{{ event.title }}</span>
                <div class="flex flex-row items-center gap-1">
                  <ng-icon name="lucideMapPin" class="text-xs text-muted-foreground" />
                  <span class="text-xs text-muted-foreground">{{ event.venue }}</span>
                </div>
                <div class="flex flex-row items-center gap-1">
                  <ng-icon name="lucideUsers" class="text-xs text-muted-foreground" />
                  <span class="text-xs text-muted-foreground">{{ event.attendees + (going().has(event.id) ? 1 : 0) }} going</span>
                </div>
              </div>
              <button hlmBtn size="sm" class="rounded-full" [variant]="going().has(event.id) ? 'default' : 'outline'" (click)="toggle(event.id)">
                {{ going().has(event.id) ? 'Going ✓' : 'RSVP' }}
              </button>
            </div>
          </div>
        } @empty {
          <div hlmCard class="border border-border">
            <div hlmCardContent class="flex flex-col items-center gap-2">
              <ng-icon name="lucideCalendar" class="text-3xl text-muted-foreground" />
              <span class="text-sm text-muted-foreground">No {{ filter() }} events this month.</span>
            </div>
          </div>
        }
      </div>

      <div class="footer-text flex flex-row items-center gap-3 p-4 rounded-2xl bg-foreground text-background">
        <ng-icon name="lucideTicket" class="text-2xl text-chart-2" />
        <p class="text-sm flex-1 text-background">
          Passes for events you RSVP to land in <strong>My Tickets</strong> the day before.
        </p>
      </div>
    </div>
  `,
})
export class EventsExample {
  protected readonly events = EVENTS;
  protected readonly filters: readonly Filter[] = ['All', ...CATEGORIES];
  protected readonly filter = signal<Filter>('All');
  protected readonly going = signal<ReadonlySet<string>>(new Set(['meetup', 'run']));

  protected readonly visible = computed(() => {
    const filter = this.filter();
    return filter === 'All' ? EVENTS : EVENTS.filter((event) => event.category === filter);
  });

  protected toggle(id: string): void {
    this.going.update((going) => {
      const next = new Set(going);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }
}
