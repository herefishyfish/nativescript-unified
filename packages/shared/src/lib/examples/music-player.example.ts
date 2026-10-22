import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideHeart,
  lucideListMusic,
  lucideMusic,
  lucidePause,
  lucidePlay,
  lucideRepeat,
  lucideShuffle,
  lucideSkipBack,
  lucideSkipForward,
} from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSeparator } from '@spartan-ng/helm/separator';

type Track = {
  readonly id: string;
  readonly title: string;
  readonly artist: string;
  readonly album: string;
  readonly seconds: number;
  /** Index of the artwork gradient in music-player.example.css (`.art-<n>`). */
  readonly art: 0 | 1 | 2 | 3;
};

const TRACKS: readonly Track[] = [
  { id: 'circuit', title: 'Midnight Circuit', artist: 'Neon Coastline', album: 'After Hours', seconds: 214, art: 0 },
  { id: 'harbour', title: 'Glass Harbour', artist: 'Neon Coastline', album: 'After Hours', seconds: 222, art: 1 },
  { id: 'bloom', title: 'Static Bloom', artist: 'Velvet Arcade', album: 'Soft Machines', seconds: 245, art: 2 },
  { id: 'voltage', title: 'Slow Voltage', artist: 'Lumen Drive', album: 'Night Freight', seconds: 178, art: 3 },
];

const format = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

/** A now-playing screen: gradient artwork per track, a live progress bar while playing, transport controls and a tappable up-next queue. */
@Component({
  selector: 'example-music-player',
  imports: [NgIcon, HlmBadge, HlmButton, HlmCardImports, HlmSeparator],
  providers: [
    provideIcons({
      lucideHeart,
      lucideListMusic,
      lucideMusic,
      lucidePause,
      lucidePlay,
      lucideRepeat,
      lucideShuffle,
      lucideSkipBack,
      lucideSkipForward,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'example-music-player' },
  template: `
    <div class="page flex flex-col gap-6 px-5 py-6 text-foreground">
      <div class="flex flex-col items-center gap-1">
        <span class="text-xs font-bold tracking-widest text-primary">PLAYING FROM ALBUM</span>
        <span class="text-sm font-bold text-foreground">{{ track().album }}</span>
      </div>

      <div class="flex flex-col justify-between w-full h-80 p-5 rounded-3xl" [class]="'art-' + track().art">
        <div class="flex flex-row justify-between items-center">
          <span class="art-chip text-xs font-bold px-3 py-1 rounded-full">HI-FI</span>
          <span class="art-chip text-xs font-bold px-3 py-1 rounded-full">{{ index() + 1 }} / {{ tracks.length }}</span>
        </div>
        <div class="flex items-center justify-center">
          <ng-icon name="lucideMusic" class="art-glyph text-8xl" />
        </div>
        <span class="art-title text-3xl font-extrabold">{{ track().artist.toUpperCase() }}</span>
      </div>

      <div class="flex flex-row items-center gap-3">
        <div class="flex flex-col gap-1 flex-1">
          <span class="text-2xl font-extrabold text-foreground">{{ track().title }}</span>
          <span class="text-base text-muted-foreground">{{ track().artist }}</span>
        </div>
        <button hlmBtn variant="ghost" size="icon-lg" (click)="toggleLiked()">
          <ng-icon name="lucideHeart" class="text-2xl" [class.liked]="liked().has(track().id)" [class.text-muted-foreground]="!liked().has(track().id)" />
        </button>
      </div>

      <div class="flex flex-col gap-2">
        <div class="flex flex-row h-2 rounded-full bg-muted">
          <div class="track-fill h-2 rounded-full" [style.width.%]="progress()"></div>
        </div>
        <div class="flex flex-row justify-between">
          <span class="text-xs text-muted-foreground">{{ elapsed() }}</span>
          <span class="text-xs text-muted-foreground">-{{ remaining() }}</span>
        </div>
      </div>

      <div class="flex flex-row items-center justify-between">
        <button hlmBtn variant="ghost" size="icon-lg" (click)="shuffle.set(!shuffle())">
          <ng-icon name="lucideShuffle" class="text-xl" [class.text-primary]="shuffle()" [class.text-muted-foreground]="!shuffle()" />
        </button>
        <button hlmBtn variant="ghost" size="icon-lg" (click)="previous()">
          <ng-icon name="lucideSkipBack" class="text-3xl text-foreground" />
        </button>
        <button class="play flex items-center justify-center w-20 h-20 rounded-full" (click)="playing.set(!playing())">
          <ng-icon [name]="playing() ? 'lucidePause' : 'lucidePlay'" class="play-glyph text-4xl" />
        </button>
        <button hlmBtn variant="ghost" size="icon-lg" (click)="next()">
          <ng-icon name="lucideSkipForward" class="text-3xl text-foreground" />
        </button>
        <button hlmBtn variant="ghost" size="icon-lg" (click)="repeat.set(!repeat())">
          <ng-icon name="lucideRepeat" class="text-xl" [class.text-primary]="repeat()" [class.text-muted-foreground]="!repeat()" />
        </button>
      </div>

      <div hlmCard size="sm" class="border border-border">
        <div hlmCardHeader class="flex flex-row items-center gap-2">
          <ng-icon name="lucideListMusic" class="text-base text-primary" />
          <span class="text-lg font-bold text-card-foreground flex-1">Up next</span>
          <span hlmBadge variant="secondary">{{ shuffle() ? 'Shuffled' : 'In order' }}</span>
        </div>
        <div hlmCardContent class="flex flex-col gap-1">
          <div hlmSeparator></div>
          @for (item of upNext(); track item.id) {
            <button class="queue-row flex flex-row items-center gap-3 py-2" (click)="play(item.id)">
              <div class="flex w-12 h-12 rounded-xl" [class]="'art-' + item.art"></div>
              <div class="flex flex-col flex-1">
                <span class="text-sm font-bold text-card-foreground">{{ item.title }}</span>
                <span class="text-xs text-muted-foreground">{{ item.artist }}</span>
              </div>
              <span class="text-xs text-muted-foreground">{{ duration(item.seconds) }}</span>
            </button>
          }
        </div>
      </div>
    </div>
  `,
})
export class MusicPlayerExample {
  protected readonly tracks = TRACKS;
  protected readonly index = signal(0);
  protected readonly position = signal(83);
  protected readonly playing = signal(false);
  protected readonly shuffle = signal(false);
  protected readonly repeat = signal(false);
  protected readonly liked = signal<ReadonlySet<string>>(new Set(['circuit']));

  protected readonly track = computed(() => TRACKS[this.index()]);
  protected readonly progress = computed(() => (this.position() / this.track().seconds) * 100);
  protected readonly elapsed = computed(() => format(this.position()));
  protected readonly remaining = computed(() => format(this.track().seconds - this.position()));
  protected readonly upNext = computed(() => {
    const index = this.index();
    const rest = [...TRACKS.slice(index + 1), ...TRACKS.slice(0, index)];
    return this.shuffle() ? [...rest].reverse() : rest;
  });

  constructor() {
    const timer = setInterval(() => this.tick(), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected duration(seconds: number): string {
    return format(seconds);
  }

  protected play(id: string): void {
    this.index.set(TRACKS.findIndex((track) => track.id === id));
    this.position.set(0);
    this.playing.set(true);
  }

  protected next(): void {
    this.play(this.upNext()[0].id);
  }

  /** Restarts the current track when past its first few seconds, like most players; otherwise goes back one. */
  protected previous(): void {
    if (this.position() > 3) {
      this.position.set(0);
      return;
    }
    this.play(TRACKS[(this.index() + TRACKS.length - 1) % TRACKS.length].id);
  }

  protected toggleLiked(): void {
    const id = this.track().id;
    this.liked.update((liked) => {
      const next = new Set(liked);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  private tick(): void {
    if (!this.playing()) return;
    if (this.position() + 1 < this.track().seconds) {
      this.position.update((position) => position + 1);
    } else if (this.repeat()) {
      this.position.set(0);
    } else {
      this.next();
    }
  }
}
