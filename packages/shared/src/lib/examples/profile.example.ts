import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBadgeCheck,
  lucideBookmark,
  lucideCalendar,
  lucideHeart,
  lucideLayoutGrid,
  lucideLink,
  lucideMail,
  lucideMapPin,
  lucideMessageCircle,
  lucideUser,
  lucideUserPlus,
} from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSeparator } from '@spartan-ng/helm/separator';

type Tab = 'posts' | 'saved' | 'about';

type Tone = 'violet' | 'ocean' | 'night' | 'mint' | 'pink' | 'sun';

type Post = { readonly id: string; readonly title: string; readonly glyph: string; readonly tone: Tone; readonly likes: number };

type Saved = { readonly title: string; readonly author: string; readonly tone: Tone };

type Fact = { readonly icon: string; readonly label: string; readonly value: string };

const TABS: readonly { readonly id: Tab; readonly label: string; readonly icon: string }[] = [
  { id: 'posts', label: 'Posts', icon: 'lucideLayoutGrid' },
  { id: 'saved', label: 'Saved', icon: 'lucideBookmark' },
  { id: 'about', label: 'About', icon: 'lucideUser' },
];

const POSTS: readonly Post[] = [
  { id: 'onboarding', title: 'Onboarding flows', glyph: 'O', tone: 'violet', likes: 214 },
  { id: 'type', title: 'Type scales', glyph: 'T', tone: 'ocean', likes: 389 },
  { id: 'dark', title: 'Dark mode kit', glyph: 'D', tone: 'night', likes: 1021 },
  { id: 'empty', title: 'Empty states', glyph: 'E', tone: 'mint', likes: 97 },
  { id: 'motion', title: 'Motion notes', glyph: 'M', tone: 'pink', likes: 452 },
  { id: 'forms', title: 'Form patterns', glyph: 'F', tone: 'sun', likes: 168 },
];

const SAVED: readonly Saved[] = [
  { title: 'Designing for thumbs', author: 'Noah Kim', tone: 'pink' },
  { title: 'The 8pt grid, revisited', author: 'Priya Shah', tone: 'ocean' },
  { title: 'Color systems that scale', author: 'Leo Martins', tone: 'violet' },
];

const FACTS: readonly Fact[] = [
  { icon: 'lucideMapPin', label: 'Based in', value: 'Lisbon, Portugal' },
  { icon: 'lucideCalendar', label: 'Joined', value: 'March 2019' },
  { icon: 'lucideLink', label: 'Website', value: 'ameliareyes.design' },
  { icon: 'lucideMail', label: 'Email', value: 'hello@ameliareyes.design' },
];

const SKILLS: readonly string[] = ['Design systems', 'Motion', 'iOS', 'Prototyping', 'Research'];

const BASE_FOLLOWERS = 12_408;
const POST_COUNT = 248;

/** A social profile: cover, avatar, follow button, stats and a tabbed grid of posts that can be liked. */
@Component({
  selector: 'example-profile',
  imports: [NgIcon, HlmAvatarImports, HlmBadge, HlmButton, HlmCardImports, HlmSeparator],
  providers: [
    provideIcons({
      lucideBadgeCheck,
      lucideBookmark,
      lucideCalendar,
      lucideHeart,
      lucideLayoutGrid,
      lucideLink,
      lucideMail,
      lucideMapPin,
      lucideMessageCircle,
      lucideUser,
      lucideUserPlus,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'example-profile' },
  template: `
    <div class="example-profile flex flex-col pb-10 bg-background text-foreground">
      <div class="cover flex flex-col justify-end h-40 p-4">
        <span class="cover-tag self-end text-xs font-semibold px-3 py-1 rounded-full">Open to freelance</span>
      </div>

      <div class="flex flex-col gap-4 px-4">
        <div class="flex flex-row items-end justify-between -mt-12">
          <hlm-avatar size="lg" class="w-28 h-28 rounded-full">
            <div hlmAvatarFallback class="avatar-fallback w-28 h-28 rounded-full border-4 border-background">
              <span class="text-4xl font-extrabold">AR</span>
            </div>
          </hlm-avatar>
          <div class="flex flex-row gap-2 pb-2">
            <button hlmBtn variant="outline" size="icon-lg" class="w-11 h-11 rounded-full" aria-label="Message">
              <ng-icon name="lucideMessageCircle" size="18" />
            </button>
            <button hlmBtn size="lg" class="h-11 px-5 rounded-full font-bold" [variant]="following() ? 'secondary' : 'default'" (click)="following.set(!following())">
              @if (!following()) {
                <ng-icon name="lucideUserPlus" size="16" />
              }
              <span>{{ following() ? 'Following' : 'Follow' }}</span>
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <div class="flex flex-row items-center gap-2">
            <h1 class="text-3xl font-extrabold">Amelia Reyes</h1>
            <ng-icon name="lucideBadgeCheck" size="22" class="text-primary" />
          </div>
          <span class="text-sm text-muted-foreground">&#64;amelia.builds · Product designer</span>
        </div>

        <p class="copy text-base">Designing calm interfaces for busy products. Previously at two startups you have never heard of. Coffee first, wireframes second.</p>

        <div class="flex flex-row flex-wrap gap-2">
          @for (skill of skills; track skill) {
            <span hlmBadge variant="secondary" class="h-7 px-3 text-xs font-semibold">{{ skill }}</span>
          }
        </div>

        <div hlmCard class="flex flex-row items-stretch p-4 rounded-2xl border border-border ring-0">
          <div class="flex flex-col items-center flex-1">
            <span class="text-xl font-extrabold">{{ postCount }}</span>
            <span class="text-xs text-muted-foreground">Posts</span>
          </div>
          <div hlmSeparator orientation="vertical" class="w-px self-stretch"></div>
          <div class="flex flex-col items-center flex-1">
            <span class="text-xl font-extrabold">{{ followers() }}</span>
            <span class="text-xs text-muted-foreground">Followers</span>
          </div>
          <div hlmSeparator orientation="vertical" class="w-px self-stretch"></div>
          <div class="flex flex-col items-center flex-1">
            <span class="text-xl font-extrabold">{{ totalLikes() }}</span>
            <span class="text-xs text-muted-foreground">Likes</span>
          </div>
        </div>

        <div class="flex flex-row border-b border-border">
          @for (item of tabs; track item.id) {
            <button class="tab flex flex-row flex-1 items-center justify-center gap-2 py-3 border-b-2 text-muted-foreground" [class.active]="tab() === item.id" (click)="tab.set(item.id)">
              <ng-icon [name]="item.icon" size="16" />
              <span class="text-sm font-bold">{{ item.label }}</span>
            </button>
          }
        </div>

        @switch (tab()) {
          @case ('posts') {
            <div class="grid grid-cols-2 gap-3">
              @for (post of posts; track post.id) {
                <div class="flex flex-col justify-between h-40 p-3 rounded-2xl" [class]="'tone-' + post.tone">
                  <span class="post-glyph text-4xl font-extrabold">{{ post.glyph }}</span>
                  <div class="flex flex-col gap-2">
                    <span class="post-title text-sm font-bold">{{ post.title }}</span>
                    <button class="like flex flex-row items-center gap-1 self-start px-2 py-1 rounded-full" [class.liked]="liked().has(post.id)" (click)="toggleLike(post.id)">
                      <ng-icon name="lucideHeart" size="14" />
                      <span class="text-xs font-bold">{{ post.likes + (liked().has(post.id) ? 1 : 0) }}</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          }
          @case ('saved') {
            <div class="flex flex-col gap-3">
              @for (item of saved; track item.title) {
                <div hlmCard class="flex flex-row items-center gap-3 p-3 rounded-2xl border border-border ring-0">
                  <div class="w-14 h-14 rounded-xl" [class]="'tone-' + item.tone"></div>
                  <div class="flex flex-col flex-1">
                    <span class="text-base font-bold">{{ item.title }}</span>
                    <span class="text-xs text-muted-foreground">by {{ item.author }}</span>
                  </div>
                  <ng-icon name="lucideBookmark" size="18" class="text-primary" />
                </div>
              }
            </div>
          }
          @case ('about') {
            <div hlmCard class="flex flex-col gap-4 p-4 rounded-2xl border border-border ring-0">
              <p class="copy text-sm">Seven years designing mobile products. I write about design systems, motion and the occasional side project.</p>
              <div hlmSeparator class="h-px w-full"></div>
              @for (fact of facts; track fact.label) {
                <div class="flex flex-row items-center gap-3">
                  <div class="flex items-center justify-center w-9 h-9 rounded-xl bg-secondary text-primary">
                    <ng-icon [name]="fact.icon" size="16" />
                  </div>
                  <div class="flex flex-col">
                    <span class="text-xs text-muted-foreground">{{ fact.label }}</span>
                    <span class="text-sm font-semibold">{{ fact.value }}</span>
                  </div>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class ProfileExample {
  protected readonly tabs = TABS;
  protected readonly posts = POSTS;
  protected readonly saved = SAVED;
  protected readonly facts = FACTS;
  protected readonly skills = SKILLS;
  protected readonly postCount = POST_COUNT;

  protected readonly tab = signal<Tab>('posts');
  protected readonly following = signal(false);
  protected readonly liked = signal<ReadonlySet<string>>(new Set());

  protected readonly followers = computed(() => grouped(BASE_FOLLOWERS + (this.following() ? 1 : 0)));
  protected readonly totalLikes = computed(() => grouped(POSTS.reduce((sum, post) => sum + post.likes, 0) + this.liked().size));

  protected toggleLike(id: string): void {
    this.liked.update((liked) => {
      const next = new Set(liked);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }
}

/** 12408 -> "12,408". Hand-rolled because Intl support varies across NativeScript runtimes. */
function grouped(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
