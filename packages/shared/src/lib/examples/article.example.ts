import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBookmark, lucideBookmarkCheck, lucideHeart, lucideLayoutGrid, lucideQuote, lucideShare2 } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmSeparator } from '@spartan-ng/helm/separator';

type TextSize = 'base' | 'large';

const TAGS = ['Layout', 'CSS', 'Native', 'Performance'] as const;
type Tag = (typeof TAGS)[number];

const BASE_LIKES = 312;

/** A long-form reader: kicker, headline, byline, gradient hero, body with inline emphasis, pull quote and followable tags. */
@Component({
  selector: 'example-article',
  imports: [NgIcon, HlmAvatarImports, HlmBadge, HlmButton, HlmSeparator],
  providers: [provideIcons({ lucideBookmark, lucideBookmarkCheck, lucideHeart, lucideLayoutGrid, lucideQuote, lucideShare2 })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'example-article' },
  template: `
    <div class="flex flex-col gap-5 px-5 py-6 bg-background text-foreground">
      <div class="flex flex-row items-center gap-2">
        <span hlmBadge>ENGINEERING NOTES</span>
        <span class="text-xs text-muted-foreground">Issue 42</span>
      </div>

      <span class="text-4xl font-extrabold text-foreground">The quiet rebirth of layout on mobile</span>
      <span class="text-lg text-muted-foreground">Why the web's layout model finally feels at home on native, and what changes for the teams who ship there.</span>

      <div class="flex flex-row items-center gap-3">
        <hlm-avatar size="lg">
          <span hlmAvatarFallback class="avatar font-bold">DK</span>
        </hlm-avatar>
        <div class="flex flex-col flex-1">
          <span class="text-sm font-bold text-foreground">Dana Kovac</span>
          <span class="text-xs text-muted-foreground">June 12 · 6 min read</span>
        </div>
        <button hlmBtn size="sm" class="rounded-full" [variant]="saved() ? 'default' : 'outline'" (click)="saved.set(!saved())">
          <ng-icon [name]="saved() ? 'lucideBookmarkCheck' : 'lucideBookmark'" />
          {{ saved() ? 'Saved' : 'Save' }}
        </button>
      </div>

      <div class="hero flex flex-col justify-between h-56 p-5 rounded-3xl">
        <ng-icon name="lucideLayoutGrid" class="hero-glyph text-6xl" />
        <div class="flex flex-col gap-1">
          <span class="hero-caption text-xs font-bold tracking-widest">FIG. 1</span>
          <span class="hero-title text-xl font-bold">One style tree, two platforms, zero bridges.</span>
        </div>
      </div>

      <div class="flex flex-row items-center justify-between px-4 py-2 rounded-2xl border border-border bg-card">
        <span class="text-xs font-bold text-muted-foreground">TEXT SIZE</span>
        <div class="flex flex-row gap-2">
          <button hlmBtn size="sm" class="rounded-full" [variant]="size() === 'base' ? 'secondary' : 'ghost'" (click)="size.set('base')">A</button>
          <button hlmBtn size="sm" class="rounded-full text-lg" [variant]="size() === 'large' ? 'secondary' : 'ghost'" (click)="size.set('large')">A</button>
        </div>
      </div>

      <p class="lede text-foreground" [class]="ledeSize()">
        For a decade, mobile layout meant one of two things: springs and struts, or a flex engine tuned for the web and
        bolted onto native views. <strong>Both worked.</strong> Neither felt like it belonged.
      </p>
      <p class="body text-muted-foreground" [class]="bodySize()">
        The web solved this a long time ago. Flexbox gave us distribution along an axis; Grid gave us two dimensions and
        the honesty to say so. The trouble was never <em>the model</em>. It was the host. Native widgets speak a
        different dialect, and every bridge charged a toll at the border.
      </p>

      <span class="text-2xl font-bold text-foreground">Shared memory changes the equation</span>
      <p class="body text-muted-foreground" [class]="bodySize()">
        The newer generation of layout engines keeps the whole style tree in a <strong>shared buffer</strong>. The UI
        thread reads exactly what the style thread wrote, with no serialization in between. A dirty node invalidates a
        subtree, the engine recomputes, and the native layer receives a plain array of frames from
        <code class="code">computeLayout()</code>.
      </p>

      <div class="flex flex-col gap-2 py-2 pl-4 border-l-4 border-primary">
        <ng-icon name="lucideQuote" class="text-3xl text-chart-2" />
        <span class="quote-text text-2xl font-bold text-primary">Layout is not a rendering problem. It is a bookkeeping problem, and bookkeeping is what computers are good at.</span>
        <span class="text-sm text-muted-foreground">Ravi Menon, Mason core team</span>
      </div>

      <span class="text-2xl font-bold text-foreground">What this means for product teams</span>
      <p class="body text-muted-foreground" [class]="bodySize()">
        Designers can hand over <em>the same CSS</em> they use for the web prototype. Engineers stop maintaining parallel
        constraint systems for iOS and Android. QA gets identical geometry on both platforms, which quietly deletes an
        entire class of screenshot-test diffs.
      </p>
      <p class="body text-muted-foreground" [class]="bodySize()">
        None of this is glamorous, and glamour was never the point. The point is that a junior developer should be able
        to <strong>centre a card</strong> vertically and horizontally without a three-hundred-comment forum thread.
      </p>

      <div hlmSeparator></div>

      <div class="flex flex-col gap-3">
        <span class="text-xs font-bold tracking-widest text-muted-foreground">FOLLOW TOPICS</span>
        <div class="flex flex-row flex-wrap gap-2">
          @for (tag of tags; track tag) {
            <button hlmBtn size="sm" class="rounded-full" [variant]="following().has(tag) ? 'default' : 'outline'" (click)="toggleTag(tag)">
              {{ following().has(tag) ? '✓ ' + tag : '# ' + tag }}
            </button>
          }
        </div>
      </div>

      <div class="flex flex-col p-4 rounded-2xl border border-border bg-secondary">
        <div class="flex flex-row items-center gap-3">
          <button hlmBtn size="sm" class="rounded-full" [variant]="liked() ? 'default' : 'outline'" (click)="liked.set(!liked())">
            <ng-icon name="lucideHeart" />
            {{ likes() }}
          </button>
          <span class="text-sm flex-1 text-secondary-foreground">{{ liked() ? 'You and ' + (likes() - 1) + ' others liked this.' : 'Enjoyed it? Let Dana know.' }}</span>
          <ng-icon name="lucideShare2" class="text-lg text-secondary-foreground" />
        </div>
      </div>
    </div>
  `,
})
export class ArticleExample {
  protected readonly tags = TAGS;
  protected readonly size = signal<TextSize>('base');
  protected readonly saved = signal(false);
  protected readonly liked = signal(false);
  protected readonly following = signal<ReadonlySet<Tag>>(new Set(['Layout']));

  protected readonly bodySize = computed(() => (this.size() === 'large' ? 'text-lg' : 'text-base'));
  protected readonly ledeSize = computed(() => (this.size() === 'large' ? 'text-2xl' : 'text-xl'));
  protected readonly likes = computed(() => BASE_LIKES + (this.liked() ? 1 : 0));

  protected toggleTag(tag: Tag): void {
    this.following.update((following) => {
      const next = new Set(following);
      if (!next.delete(tag)) next.add(tag);
      return next;
    });
  }
}
