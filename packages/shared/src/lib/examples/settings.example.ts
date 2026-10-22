import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBell,
  lucideDownload,
  lucideGlobe,
  lucideLayoutGrid,
  lucideLogOut,
  lucideMoon,
  lucideRotateCcw,
  lucideShield,
  lucideSmartphone,
  lucideTrash2,
  lucideTriangleAlert,
} from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';

type PrefKey = 'darkMode' | 'notifications' | 'compact' | 'autoplay';

type Visibility = 'public' | 'friends' | 'private';

type SettingsState = {
  readonly name: string;
  readonly email: string;
  readonly prefs: Readonly<Record<PrefKey, boolean>>;
  readonly visibility: Visibility;
};

type Pref = { readonly key: PrefKey; readonly title: string; readonly description: string; readonly icon: string; readonly tone: string };

const DEFAULTS: SettingsState = {
  name: 'Amelia Reyes',
  email: 'amelia@example.com',
  prefs: { darkMode: true, notifications: true, compact: false, autoplay: false },
  visibility: 'friends',
};

const PREFS: readonly Pref[] = [
  { key: 'darkMode', title: 'Dark mode', description: 'Easier on the eyes at night', icon: 'lucideMoon', tone: 'indigo' },
  { key: 'notifications', title: 'Push notifications', description: 'Mentions, replies and digests', icon: 'lucideBell', tone: 'red' },
  { key: 'compact', title: 'Compact layout', description: 'Denser lists, smaller cards', icon: 'lucideLayoutGrid', tone: 'teal' },
  { key: 'autoplay', title: 'Autoplay video', description: 'Only on Wi-Fi', icon: 'lucideSmartphone', tone: 'amber' },
];

const VISIBILITY: readonly { readonly id: Visibility; readonly label: string }[] = [
  { id: 'public', label: 'Public' },
  { id: 'friends', label: 'Friends' },
  { id: 'private', label: 'Private' },
];

/** Grouped settings with text fields, switches and a segmented control. Edits stay a draft until saved. */
@Component({
  selector: 'example-settings',
  imports: [NgIcon, HlmBadge, HlmButton, HlmCardImports, HlmInput, HlmSeparator, HlmSwitchImports],
  providers: [
    provideIcons({
      lucideBell,
      lucideDownload,
      lucideGlobe,
      lucideLayoutGrid,
      lucideLogOut,
      lucideMoon,
      lucideRotateCcw,
      lucideShield,
      lucideSmartphone,
      lucideTrash2,
      lucideTriangleAlert,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'example-settings' },
  template: `
    <div class="example-settings flex flex-col gap-6 p-4 pb-10 bg-background text-foreground">
      <div class="hero flex flex-row items-center gap-4 p-5 rounded-3xl">
        <div class="avatar-fallback flex shrink-0 items-center justify-center w-16 h-16 rounded-2xl">
          <span class="text-2xl font-extrabold">{{ initials() }}</span>
        </div>
        <div class="flex flex-col flex-1 gap-1">
          <span class="on-hero text-xl font-extrabold">{{ draft().name || 'Your name' }}</span>
          <span class="on-hero-soft text-sm">{{ draft().email }}</span>
          <span hlmBadge class="plan self-start font-bold">PRO PLAN</span>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <span class="text-xs font-bold uppercase px-1 text-muted-foreground">Account</span>
        <div hlmCard class="flex flex-col gap-4 p-4 rounded-2xl border border-border ring-0">
          <div class="flex flex-col gap-2">
            <span class="text-sm font-semibold">Display name</span>
            <input hlmInput #nameInput class="h-11 px-3 rounded-xl bg-background" [value]="draft().name" (input)="patch({ name: nameInput.value })" />
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-sm font-semibold">Email</span>
            <input hlmInput #emailInput type="email" class="h-11 px-3 rounded-xl bg-background" [value]="draft().email" (input)="patch({ email: emailInput.value })" />
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <span class="text-xs font-bold uppercase px-1 text-muted-foreground">Preferences</span>
        <div class="flex flex-col rounded-2xl border border-border bg-card text-card-foreground">
          @for (pref of prefs; track pref.key; let first = $first) {
            @if (!first) {
              <div hlmSeparator class="h-px w-full"></div>
            }
            <div class="flex flex-row items-center gap-3 p-4">
              <div class="icon-tile flex items-center justify-center w-9 h-9 rounded-xl" [class]="'tone-' + pref.tone">
                <ng-icon [name]="pref.icon" size="18" />
              </div>
              <div class="flex flex-col flex-1">
                <span class="text-sm font-semibold">{{ pref.title }}</span>
                <span class="text-xs text-muted-foreground">{{ pref.description }}</span>
              </div>
              <hlm-switch [checked]="draft().prefs[pref.key]" (checkedChange)="setPref(pref.key, $event)" [aria-label]="pref.title" />
            </div>
          }
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <span class="text-xs font-bold uppercase px-1 text-muted-foreground">Privacy</span>
        <div hlmCard class="flex flex-col gap-3 p-4 rounded-2xl border border-border ring-0">
          <div class="flex flex-row items-center gap-3">
            <div class="icon-tile tone-slate flex items-center justify-center w-9 h-9 rounded-xl">
              <ng-icon name="lucideShield" size="18" />
            </div>
            <div class="flex flex-col flex-1">
              <span class="text-sm font-semibold">Profile visibility</span>
              <span class="text-xs text-muted-foreground">{{ visibilityNote() }}</span>
            </div>
          </div>
          <div class="flex flex-row gap-1 p-1 rounded-xl bg-muted">
            @for (option of visibility; track option.id) {
              <button hlmBtn size="sm" class="flex-1 rounded-lg font-semibold" [variant]="draft().visibility === option.id ? 'default' : 'ghost'" (click)="patch({ visibility: option.id })">
                {{ option.label }}
              </button>
            }
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <span class="text-xs font-bold uppercase px-1 text-muted-foreground">About</span>
        <div class="flex flex-col rounded-2xl border border-border bg-card text-card-foreground">
          <div class="flex flex-row items-center gap-3 p-4">
            <div class="icon-tile tone-blue flex items-center justify-center w-9 h-9 rounded-xl">
              <ng-icon name="lucideGlobe" size="18" />
            </div>
            <span class="text-sm font-semibold flex-1">Version</span>
            <span class="text-sm text-muted-foreground">2.4.1 (build 318)</span>
          </div>
          <div hlmSeparator class="h-px w-full"></div>
          <div class="flex flex-row items-center gap-3 p-4">
            <div class="icon-tile tone-teal flex items-center justify-center w-9 h-9 rounded-xl">
              <ng-icon name="lucideDownload" size="18" />
            </div>
            <span class="text-sm font-semibold flex-1">Export my data</span>
            <span hlmBadge variant="secondary">ZIP · 12 MB</span>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <span class="text-xs font-bold uppercase px-1 text-destructive">Danger zone</span>
        <div hlmCard class="danger flex flex-col gap-3 p-4 rounded-2xl border-2 ring-0">
          <div class="flex flex-row items-center gap-3 text-destructive">
            <ng-icon name="lucideTriangleAlert" size="20" />
            <span class="text-sm font-semibold flex-1">These actions cannot be undone.</span>
          </div>
          <button hlmBtn variant="outline" size="lg" class="h-11 rounded-xl text-destructive" (click)="note.set('Signed out of 3 other devices.')">
            <ng-icon name="lucideLogOut" size="16" />
            <span>Sign out everywhere</span>
          </button>
          <button hlmBtn variant="destructive" size="lg" class="delete h-11 rounded-xl font-bold" [attr.data-armed]="confirmDelete()" (click)="deleteAccount()">
            <ng-icon name="lucideTrash2" size="16" />
            <span>{{ confirmDelete() ? 'Tap again to delete forever' : 'Delete account' }}</span>
          </button>
        </div>
      </div>

      @if (note(); as text) {
        <span class="success text-sm text-center font-semibold">{{ text }}</span>
      }

      <div class="flex flex-row gap-3">
        <button hlmBtn variant="outline" size="lg" class="h-12 px-4 rounded-xl" (click)="reset()">
          <ng-icon name="lucideRotateCcw" size="16" />
          <span>Reset</span>
        </button>
        <button hlmBtn size="lg" class="flex-1 h-12 rounded-xl font-bold" [variant]="dirty() ? 'default' : 'secondary'" (click)="save()">
          {{ dirty() ? 'Save changes' : 'All changes saved' }}
        </button>
      </div>
    </div>
  `,
})
export class SettingsExample {
  protected readonly prefs = PREFS;
  protected readonly visibility = VISIBILITY;

  private readonly saved = signal<SettingsState>(DEFAULTS);
  protected readonly draft = signal<SettingsState>(DEFAULTS);
  protected readonly note = signal('');
  protected readonly confirmDelete = signal(false);

  protected readonly dirty = computed(() => JSON.stringify(this.draft()) !== JSON.stringify(this.saved()));
  protected readonly initials = computed(() =>
    this.draft()
      .name.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join(''),
  );
  protected readonly visibilityNote = computed(() => {
    switch (this.draft().visibility) {
      case 'public':
        return 'Anyone can see your profile';
      case 'friends':
        return 'Only people you follow back';
      case 'private':
        return 'Hidden from search and other people';
    }
  });

  protected patch(change: Partial<Omit<SettingsState, 'prefs'>>): void {
    this.draft.update((draft) => ({ ...draft, ...change }));
    this.note.set('');
  }

  protected setPref(key: PrefKey, value: boolean): void {
    this.draft.update((draft) => ({ ...draft, prefs: { ...draft.prefs, [key]: value } }));
    this.note.set('');
  }

  protected save(): void {
    if (!this.dirty()) return;
    this.saved.set(this.draft());
    this.note.set('Settings saved.');
  }

  protected reset(): void {
    this.draft.set(DEFAULTS);
    this.saved.set(DEFAULTS);
    this.confirmDelete.set(false);
    this.note.set('Restored the default settings.');
  }

  protected deleteAccount(): void {
    if (this.confirmDelete()) {
      this.confirmDelete.set(false);
      this.note.set('Just a demo, so your account is safe.');
    } else {
      this.confirmDelete.set(true);
    }
  }
}
