import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBell,
  lucideCalendar,
  lucideCheck,
  lucideEllipsis,
  lucideLink,
  lucideMenu,
  lucideMessageCircle,
  lucidePlus,
  lucideShare2,
  lucideSlidersHorizontal,
  lucideTrash2,
} from '@ng-icons/lucide';
import { injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialogImports, HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';

const TAGS = ['Design', 'Build', 'Research'] as const;
type Tag = (typeof TAGS)[number];

type Member = { readonly initials: string; readonly name: string; readonly role: string; readonly tone: number };
type Task = {
  readonly id: number;
  readonly title: string;
  readonly tag: Tag;
  readonly due: string;
  /** Days from today, for sorting by due date. */
  readonly dueIn: number;
  readonly owner: string;
  readonly done: boolean;
};

const MEMBERS: readonly Member[] = [
  { initials: 'AM', name: 'Ana Moreira', role: 'Product designer', tone: 1 },
  { initials: 'JK', name: 'Jonas Koch', role: 'Mobile engineer', tone: 2 },
  { initials: 'PS', name: 'Priya Shah', role: 'Researcher', tone: 3 },
  { initials: 'LT', name: 'Leo Tan', role: 'Web engineer', tone: 4 },
];

const TASKS: readonly Task[] = [
  { id: 1, title: 'Welcome screen copy', tag: 'Design', due: 'Today', dueIn: 0, owner: 'AM', done: false },
  { id: 2, title: 'Sign-up form validation', tag: 'Build', due: 'Tomorrow', dueIn: 1, owner: 'JK', done: false },
  { id: 3, title: 'Interview five new users', tag: 'Research', due: 'Thu', dueIn: 3, owner: 'PS', done: true },
  { id: 4, title: 'Permission prompts on Android', tag: 'Build', due: 'Fri', dueIn: 4, owner: 'LT', done: false },
  { id: 5, title: 'Empty states for the inbox', tag: 'Design', due: 'Mon', dueIn: 7, owner: 'AM', done: false },
];

const NOTIFICATIONS = [
  { who: 'Jonas', what: 'moved Sign-up form validation to Review', when: '5m' },
  { who: 'Priya', what: 'shared notes from Interview five new users', when: '1h' },
  { who: 'Leo', what: 'commented on Permission prompts on Android', when: '3h' },
] as const;

const BOARDS = ['Onboarding', 'Payments', 'Growth experiments'] as const;

/** Opened from code with HlmDialogService.open(); the board name arrives as its context. */
@Component({
  selector: 'example-overlays-share',
  imports: [NgIcon, HlmButton, HlmDialogImports],
  providers: [provideIcons({ lucideLink })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'example-overlays flex flex-col gap-4' },
  template: `
    <hlm-dialog-header>
      <h3 hlmDialogTitle>Share {{ context.board }}</h3>
      <p hlmDialogDescription>Anyone with the link can view the board and leave comments.</p>
    </hlm-dialog-header>
    <div class="flex flex-row items-center gap-2 px-3 py-2 rounded-xl bg-muted">
      <ng-icon name="lucideLink" class="text-sm text-muted-foreground" />
      <span class="text-sm text-muted-foreground flex-1">tasks.app/b/{{ slug }}</span>
    </div>
    <hlm-dialog-footer>
      <button hlmBtn variant="outline" (click)="context.close('closed')">Done</button>
      <button hlmBtn (click)="context.close('link copied')">Copy link</button>
    </hlm-dialog-footer>
  `,
})
class OverlaysShare {
  protected readonly context = injectBrnDialogContext<{ board: string; close: (result: string) => void }>();
  protected readonly slug = this.context.board.toLowerCase().replace(/\s+/g, '-');
}

/**
 * A sprint board where every overlay does a job: a left sheet switches boards, a top sheet lists notifications, a
 * popover shows a teammate, a right sheet filters, a dropdown menu sorts and clears, a drawer shows a task, an alert
 * dialog confirms a delete, a dialog adds a task, and HlmDialogService opens a share dialog from code.
 * Overlay content renders outside the screen, so each carries `example-overlays` to keep this example's palette.
 */
@Component({
  selector: 'example-overlays',
  imports: [
    NgIcon,
    HlmBadge,
    HlmButton,
    HlmCardImports,
    HlmInput,
    HlmAlertDialogImports,
    HlmDialogImports,
    HlmDrawerImports,
    HlmDropdownMenuImports,
    HlmPopoverImports,
    HlmSheetImports,
  ],
  providers: [
    provideIcons({
      lucideBell,
      lucideCalendar,
      lucideCheck,
      lucideEllipsis,
      lucideMenu,
      lucideMessageCircle,
      lucidePlus,
      lucideShare2,
      lucideSlidersHorizontal,
      lucideTrash2,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'example-overlays' },
  template: `
    <div class="flex flex-col gap-5 p-4 bg-background text-foreground">
      <div class="hero flex flex-col gap-4 p-5 rounded-3xl">
        <div class="flex flex-row items-center justify-between">
          <hlm-sheet side="left" (closed)="note('Switched to ' + board())">
            <button hlmSheetTrigger class="hero-chip flex flex-row items-center gap-2 px-3 py-2 rounded-full" aria-label="Boards">
              <ng-icon name="lucideMenu" class="hero-ink text-base" />
              <span class="hero-ink text-sm font-bold">{{ board() }}</span>
            </button>
            <hlm-sheet-content *hlmSheetPortal="let ctx" class="example-overlays">
              <div hlmSheetHeader>
                <h3 hlmSheetTitle>Boards</h3>
                <p hlmSheetDescription>Pick the board to work on.</p>
              </div>
              <div class="flex flex-col gap-2 px-4">
                @for (option of boards; track option) {
                  <button hlmBtn class="justify-start" [variant]="option === board() ? 'default' : 'ghost'" (click)="board.set(option); ctx.close()">
                    {{ option }}
                  </button>
                }
              </div>
            </hlm-sheet-content>
          </hlm-sheet>

          <hlm-sheet side="top" (closed)="$event === 'read' && unread.set(0)">
            <button hlmSheetTrigger class="hero-chip flex flex-row items-center gap-1 px-3 py-2 rounded-full" aria-label="Notifications">
              <ng-icon name="lucideBell" class="hero-ink text-base" />
              @if (unread()) {
                <span class="hero-ink text-xs font-bold">{{ unread() }}</span>
              }
            </button>
            <hlm-sheet-content *hlmSheetPortal="let ctx" class="example-overlays">
              <div hlmSheetHeader>
                <h3 hlmSheetTitle>Notifications</h3>
                <p hlmSheetDescription>{{ unread() ? unread() + ' new since this morning' : 'You are all caught up' }}</p>
              </div>
              <div class="flex flex-col gap-3 px-4">
                @for (item of notifications; track item.what) {
                  <div class="flex flex-row items-start gap-3">
                    <span class="unread-dot w-2 h-2 mt-2 rounded-full" [class.read]="!unread()"></span>
                    <span class="text-sm flex-1"><strong>{{ item.who }}</strong> {{ item.what }}</span>
                    <span class="text-xs text-muted-foreground">{{ item.when }}</span>
                  </div>
                }
              </div>
              <div hlmSheetFooter>
                <button hlmBtn (click)="ctx.close('read')">Mark all as read</button>
              </div>
            </hlm-sheet-content>
          </hlm-sheet>
        </div>

        <div class="flex flex-col gap-1">
          <span class="hero-soft text-xs font-bold tracking-widest">SPRINT 14 · 3 DAYS LEFT</span>
          <span class="hero-ink text-3xl font-extrabold">Ship the new onboarding</span>
        </div>

        <div class="flex flex-col gap-2">
          <div class="hero-track h-2 rounded-full">
            <div class="hero-fill h-2 rounded-full" [style.width.%]="progress()"></div>
          </div>
          <div class="flex flex-row items-center justify-between">
            <span class="hero-soft text-sm">{{ doneCount() }} of {{ tasks().length }} tasks done</span>
            <div class="flex flex-row gap-1">
              @for (member of members; track member.initials) {
                <hlm-popover>
                  <button hlmPopoverTrigger class="avatar w-8 h-8 rounded-full flex items-center justify-center" [class]="'tone-' + member.tone" [attr.aria-label]="member.name">
                    <span class="avatar-ink text-xs font-bold">{{ member.initials }}</span>
                  </button>
                  <hlm-popover-content *hlmPopoverPortal="let ctx" class="example-overlays w-64">
                    <div class="flex flex-row items-center gap-3">
                      <div class="avatar w-12 h-12 rounded-full flex items-center justify-center" [class]="'tone-' + member.tone">
                        <span class="avatar-ink text-base font-bold">{{ member.initials }}</span>
                      </div>
                      <div class="flex flex-col flex-1">
                        <span class="text-base font-bold">{{ member.name }}</span>
                        <span class="text-xs text-muted-foreground">{{ member.role }}</span>
                      </div>
                    </div>
                    <span class="text-sm text-muted-foreground">{{ count(openFor(member.initials), 'open task') }} on this board</span>
                    <button hlmBtn size="sm" variant="outline" (click)="note('Message to ' + member.name); ctx.close()">
                      <ng-icon name="lucideMessageCircle" />
                      Message
                    </button>
                  </hlm-popover-content>
                </hlm-popover>
              }
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-row items-center gap-2">
        <span class="text-lg font-bold flex-1">Tasks</span>

        <hlm-sheet side="right" [closeOnOutsidePointerEvents]="false">
          <button hlmBtn hlmSheetTrigger variant="outline" size="sm" class="rounded-full">
            <ng-icon name="lucideSlidersHorizontal" />
            {{ tagFilter().size ? count(tagFilter().size, 'filter') : 'Filter' }}
          </button>
          <hlm-sheet-content *hlmSheetPortal="let ctx" class="example-overlays">
            <div hlmSheetHeader>
              <h3 hlmSheetTitle>Filter tasks</h3>
              <p hlmSheetDescription>Show only some tags. This sheet stays open on a backdrop tap.</p>
            </div>
            <div class="flex flex-row flex-wrap gap-2 px-4">
              @for (tag of tags; track tag) {
                <button hlmBtn size="sm" class="rounded-full px-4" [variant]="tagFilter().has(tag) ? 'default' : 'outline'" (click)="toggleTag(tag)">
                  {{ tag }}
                </button>
              }
            </div>
            <div hlmSheetFooter>
              <button hlmBtn (click)="ctx.close()">Show {{ count(visible().length, 'task') }}</button>
              <button hlmBtn variant="outline" (click)="tagFilter.set(emptyTags)">Clear filters</button>
            </div>
          </hlm-sheet-content>
        </hlm-sheet>

        <button hlmBtn variant="outline" size="icon-sm" class="rounded-full" aria-label="Board options" [hlmDropdownMenuTrigger]="boardMenu">
          <ng-icon name="lucideEllipsis" />
        </button>
        <ng-template #boardMenu>
          <hlm-dropdown-menu class="w-56">
            <button hlmDropdownMenuCheckbox [checked]="sortByDue()" (triggered)="sortByDue.set(!sortByDue())">
              <hlm-dropdown-menu-checkbox-indicator />
              Sort by due date
            </button>
            <button hlmDropdownMenuCheckbox [checked]="hideDone()" (triggered)="hideDone.set(!hideDone())">
              <hlm-dropdown-menu-checkbox-indicator />
              Hide completed
            </button>
            <hlm-dropdown-menu-separator />
            <button hlmDropdownMenuItem disabled>Archive board</button>
            <button hlmDropdownMenuItem variant="destructive" (triggered)="clearDone()">Clear completed</button>
          </hlm-dropdown-menu>
        </ng-template>
      </div>

      <div class="flex flex-col gap-3">
        @for (task of visible(); track task.id) {
          <div hlmCard size="sm" class="border border-border">
            <div hlmCardContent class="flex flex-row items-center gap-3">
              <button
                class="check w-7 h-7 rounded-full flex items-center justify-center"
                [class.checked]="task.done"
                [attr.aria-label]="task.done ? 'Reopen ' + task.title : 'Complete ' + task.title"
                (click)="toggleDone(task.id)"
              >
                @if (task.done) {
                  <ng-icon name="lucideCheck" class="check-ink text-sm" />
                }
              </button>

              <hlm-drawer class="flex-1">
                <button hlmDrawerTrigger class="flex flex-col items-start gap-1 flex-1 text-left">
                  <span class="text-base font-bold text-card-foreground" [class.line-through]="task.done" [class.text-muted-foreground]="task.done">{{ task.title }}</span>
                  <div class="flex flex-row items-center gap-2">
                    <span hlmBadge variant="secondary">{{ task.tag }}</span>
                    <span class="text-xs font-bold" [class.text-primary]="task.dueIn < 2" [class.text-muted-foreground]="task.dueIn >= 2">{{ task.due }}</span>
                  </div>
                </button>
                <hlm-drawer-content *hlmDrawerPortal="let ctx" class="example-overlays">
                  <div hlmDrawerHeader>
                    <h3 hlmDrawerTitle>{{ task.title }}</h3>
                    <p hlmDrawerDescription>{{ task.tag }} · due {{ task.due.toLowerCase() }} · {{ ownerName(task.owner) }}</p>
                  </div>
                  <div class="flex flex-row gap-3 px-4">
                    <div class="flex flex-col gap-1 flex-1 p-3 rounded-2xl bg-muted">
                      <span class="text-xs text-muted-foreground">Status</span>
                      <span class="text-sm font-bold">{{ task.done ? 'Done' : 'In progress' }}</span>
                    </div>
                    <div class="flex flex-col gap-1 flex-1 p-3 rounded-2xl bg-muted">
                      <span class="text-xs text-muted-foreground">Due</span>
                      <span class="text-sm font-bold">{{ task.due }}</span>
                    </div>
                  </div>
                  <div hlmDrawerFooter>
                    <button hlmBtn (click)="toggleDone(task.id); ctx.close()">{{ task.done ? 'Reopen task' : 'Mark as done' }}</button>
                    <button hlmBtn hlmDrawerClose variant="outline">Close</button>
                  </div>
                </hlm-drawer-content>
              </hlm-drawer>

              <hlm-alert-dialog (closed)="$event === 'delete' && remove(task)">
                <button hlmBtn hlmAlertDialogTrigger variant="ghost" size="icon-sm" class="rounded-full" [attr.aria-label]="'Delete ' + task.title">
                  <ng-icon name="lucideTrash2" class="text-muted-foreground" />
                </button>
                <hlm-alert-dialog-content *hlmAlertDialogPortal="let ctx" class="example-overlays">
                  <hlm-alert-dialog-header>
                    <h3 hlmAlertDialogTitle>Delete this task?</h3>
                    <p hlmAlertDialogDescription>"{{ task.title }}" and its comments will be removed from {{ board() }}.</p>
                  </hlm-alert-dialog-header>
                  <hlm-alert-dialog-footer>
                    <button hlmAlertDialogCancel (click)="ctx.close('cancel')">Keep it</button>
                    <button hlmAlertDialogAction class="bg-destructive text-white" (click)="ctx.close('delete')">Delete</button>
                  </hlm-alert-dialog-footer>
                </hlm-alert-dialog-content>
              </hlm-alert-dialog>
            </div>
          </div>
        } @empty {
          <div hlmCard class="border border-border">
            <div hlmCardContent class="flex flex-col items-center gap-2">
              <ng-icon name="lucideCalendar" class="text-3xl text-muted-foreground" />
              <span class="text-sm text-muted-foreground">No tasks match. Clear the filters or add one.</span>
            </div>
          </div>
        }
      </div>

      <div class="flex flex-row gap-3">
        <hlm-dialog class="flex-1" (closed)="$event === 'added' && note('Added a task')">
          <button hlmBtn hlmDialogTrigger class="flex-1 h-11 rounded-xl">
            <ng-icon name="lucidePlus" />
            New task
          </button>
          <hlm-dialog-content *hlmDialogPortal="let ctx" class="example-overlays">
            <hlm-dialog-header>
              <h3 hlmDialogTitle>New task</h3>
              <p hlmDialogDescription>Add it to {{ board() }}. You can change the tag later.</p>
            </hlm-dialog-header>
            <input hlmInput #titleInput class="h-11 px-3 rounded-xl" placeholder="What needs doing?" [value]="draft()" (input)="draft.set(titleInput.value)" />
            <div class="flex flex-row flex-wrap gap-2">
              @for (tag of tags; track tag) {
                <button hlmBtn size="sm" class="rounded-full px-4" [variant]="draftTag() === tag ? 'default' : 'outline'" (click)="draftTag.set(tag)">{{ tag }}</button>
              }
            </div>
            <hlm-dialog-footer>
              <button hlmBtn variant="outline" (click)="ctx.close('cancelled')">Cancel</button>
              <button hlmBtn [disabled]="!draft().trim()" (click)="addTask(); ctx.close('added')">Add task</button>
            </hlm-dialog-footer>
          </hlm-dialog-content>
        </hlm-dialog>

        <button hlmBtn variant="secondary" class="flex-1 h-11 rounded-xl" (click)="share()">
          <ng-icon name="lucideShare2" />
          Share board
        </button>
      </div>

      <div class="activity flex flex-row items-center gap-3 p-4 rounded-2xl bg-foreground">
        <span class="activity-dot w-2 h-2 rounded-full"></span>
        <span class="text-sm flex-1 text-background" data-testid="last-result">{{ lastAction() }}</span>
      </div>
    </div>
  `,
})
export class OverlaysExample {
  private readonly _dialogs = inject(HlmDialogService);

  protected readonly members = MEMBERS;
  protected readonly notifications = NOTIFICATIONS;
  protected readonly boards = BOARDS;
  protected readonly tags = TAGS;
  protected readonly emptyTags: ReadonlySet<Tag> = new Set();

  protected readonly board = signal<string>(BOARDS[0]);
  protected readonly tasks = signal<readonly Task[]>(TASKS);
  protected readonly unread = signal<number>(NOTIFICATIONS.length);
  protected readonly tagFilter = signal<ReadonlySet<Tag>>(this.emptyTags);
  protected readonly sortByDue = signal(true);
  protected readonly hideDone = signal(false);
  protected readonly draft = signal('');
  protected readonly draftTag = signal<Tag>('Build');
  protected readonly lastAction = signal('Tap anything: every control opens an overlay.');

  protected readonly doneCount = computed(() => this.tasks().filter((task) => task.done).length);
  protected readonly progress = computed(() =>
    this.tasks().length ? Math.round((this.doneCount() / this.tasks().length) * 100) : 0,
  );
  protected readonly visible = computed(() => {
    const tags = this.tagFilter();
    const shown = this.tasks().filter((task) => (!tags.size || tags.has(task.tag)) && !(this.hideDone() && task.done));
    return this.sortByDue() ? [...shown].sort((a, b) => a.dueIn - b.dueIn) : shown;
  });

  protected count(n: number, noun: string): string {
    return `${n} ${noun}${n === 1 ? '' : 's'}`;
  }

  protected note(text: string): void {
    this.lastAction.set(text);
  }

  protected openFor(initials: string): number {
    return this.tasks().filter((task) => task.owner === initials && !task.done).length;
  }

  protected ownerName(initials: string): string {
    return MEMBERS.find((member) => member.initials === initials)?.name ?? initials;
  }

  protected toggleTag(tag: Tag): void {
    const next = new Set(this.tagFilter());
    if (next.has(tag)) next.delete(tag);
    else next.add(tag);
    this.tagFilter.set(next);
  }

  protected toggleDone(id: number): void {
    this.tasks.update((tasks) => tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
    const task = this.tasks().find((item) => item.id === id);
    if (task) this.note(task.done ? `Completed ${task.title}` : `Reopened ${task.title}`);
  }

  protected remove(task: Task): void {
    this.tasks.update((tasks) => tasks.filter((item) => item.id !== task.id));
    this.note(`Deleted ${task.title}`);
  }

  protected clearDone(): void {
    const cleared = this.doneCount();
    this.tasks.update((tasks) => tasks.filter((task) => !task.done));
    this.note(`Cleared ${cleared} completed`);
  }

  protected addTask(): void {
    const title = this.draft().trim();
    if (!title) return;
    const id = Math.max(0, ...this.tasks().map((task) => task.id)) + 1;
    this.tasks.update((tasks) => [{ id, title, tag: this.draftTag(), due: 'Today', dueIn: 0, owner: 'AM', done: false }, ...tasks]);
    this.draft.set('');
  }

  protected share(): void {
    const ref = this._dialogs.open<string>(OverlaysShare, { context: { board: this.board() } });
    ref.closed$.subscribe((result) => result && this.note(`Share: ${result}`));
  }
}
