import { NgComponentOutlet } from '@angular/common';
import { CodeBlockComponent, HrefDirective } from '@nativescript-unified/analog-native';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Injector,
  input,
  NO_ERRORS_SCHEMA,
  PendingTasks,
  signal,
  type Type,
} from '@angular/core';
import { HlmAccordionImports } from '@spartan-ng/helm/accordion';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmBreadcrumbImports } from '@spartan-ng/helm/breadcrumb';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCalendarImports } from '@spartan-ng/helm/calendar';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { HlmCollapsibleImports } from '@spartan-ng/helm/collapsible';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmHoverCardImports } from '@spartan-ng/helm/hover-card';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmKbdImports } from '@spartan-ng/helm/kbd';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmNativeSelectImports } from '@spartan-ng/helm/native-select';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { HlmProgressImports } from '@spartan-ng/helm/progress';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { HlmPickerImports } from '@spartan-ng/helm/picker';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { HlmToggle } from '@spartan-ng/helm/toggle';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { HlmToasterImports } from '@spartan-ng/helm/sonner';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmSliderImports } from '@spartan-ng/helm/slider';
import { provideMasonElements } from '../../../../../packages/ui/native/native-elements';

/**
 * Helm pieces a docs `html live` block can use, mirroring the web demo's import list
 * (apps/web/src/app/docs/demo.ts). Elements a demo does not use are never instantiated;
 * helm tags without native glue degrade to empty containers through NO_ERRORS_SCHEMA.
 * vite.config.mts resolves the checkbox, switch and slider to the native shims.
 */
const DEMO_IMPORTS = [
  HlmCheckbox,
  ...HlmSwitchImports,
  ...HlmSliderImports,
  HrefDirective,
  HlmButton,
  HlmBadge,
  ...HlmCardImports,
  HlmInput,
  HlmLabel,
  HlmTextarea,
  ...HlmRadioGroupImports,
  ...HlmTabsImports,
  ...HlmAccordionImports,
  ...HlmDialogImports,
  ...HlmAlertImports,
  ...HlmProgressImports,
  HlmSkeleton,
  ...HlmAvatarImports,
  HlmSeparator,
  ...HlmAlertDialogImports,
  ...HlmBreadcrumbImports,
  ...HlmCalendarImports,
  ...HlmCollapsibleImports,
  ...HlmDrawerImports,
  ...HlmDropdownMenuImports,
  ...HlmHoverCardImports,
  ...HlmKbdImports,
  ...HlmNativeSelectImports,
  ...HlmPopoverImports,
  ...HlmPickerImports,
  ...HlmSelectImports,
  ...HlmSheetImports,
  HlmSpinner,
  ...HlmTableImports,
  HlmToggle,
  ...HlmToggleGroupImports,
  ...HlmTooltipImports,
  ...HlmToasterImports,
];

/**
 * The Angular JIT compiler loads on demand (`@nativescript/vite` code-splits the import and
 * its dynamic-import plugin maps the chunk onto the device file system). The bundler drops
 * the module's own publishFacade(globalThis) side effect, so call it here.
 */
let compilerReady: Promise<unknown> | undefined;
const loadCompiler = () =>
  (compilerReady ??= import('@angular/compiler').then((compiler) => {
    compiler.publishFacade(globalThis);
  }));

const cache = new Map<string, Type<unknown>>();

/** Compiles the template string in a docs code block into a standalone component (Angular JIT). The code on the page is the code that runs. */
function demoComponent(template: string): Type<unknown> {
  let cmp = cache.get(template);
  if (!cmp) {
    class Demo {
      /** brain's toast(), so a demo can show one from a click. */
      protected readonly toast = toast;
    }
    Component({
      selector: 'ns-live-demo-view',
      imports: DEMO_IMPORTS,
      schemas: [NO_ERRORS_SCHEMA],
      changeDetection: ChangeDetectionStrategy.OnPush,
      template,
    })(Demo);
    cmp = Demo;
    cache.set(template, cmp);
  }
  return cmp;
}

/**
 * A live docs demo with Preview / Code tabs, the native counterpart of the web docs' demo
 * frame: the Preview tab JIT-compiles the block's HTML against the registered native and
 * MasonKit elements plus helm, the Code tab shows the source. Rendered in place of every
 * `html live` block by `<analog-markdown>` (see provideMarkdownLiveCode in main.ts).
 *
 * The tabs are plain MasonKit elements, not MDTabs: the material Tabs ViewPager does not
 * render inside the markdown's MasonKit scroll container. Both panes stay mounted, so the
 * preview keeps its state when the user switches tabs (same as the web frame's two panels
 * staying in the DOM); the inactive one is collapsed, so the frame fits the active pane.
 *
 * A block tagged `html live mason` previews with MasonKit's form controls in place of the platform
 * widgets (provideMasonElements).
 *
 * A block tagged `html live web` demonstrates a web polyfill's own API (`<ns-tab>`, `<ns-page>`, a
 * `Drawer` with an `open` signal), which has no NativeScript view behind it. The app shows its code
 * and a note instead of compiling it.
 */
@Component({
  selector: 'ns-live-demo',
  imports: [NgComponentOutlet, CodeBlockComponent],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="live-demo">
      <div class="live-demo-tabs">
        <button class="live-demo-tab" [class.live-demo-tab-active]="tab() === 'preview'" (click)="tab.set('preview')">Preview</button>
        <button class="live-demo-tab" [class.live-demo-tab-active]="tab() === 'code'" (click)="tab.set('code')">Code</button>
      </div>
      <div class="live-demo-pane" [class.live-demo-pane-hidden]="tab() !== 'preview'">
        <div class="live-demo-preview">
          @if (webOnly()) {
            <p class="text-sm text-muted-foreground">
              This demo uses the web polyfill's markup. In the app, use the NativeScript view itself. See the Code tab.
            </p>
          } @else {
            <ng-container *ngComponentOutlet="demo(); injector: demoInjector()" />
          }
        </div>
      </div>
      <div class="live-demo-pane" [class.live-demo-pane-hidden]="tab() !== 'code'">
        <analog-code [code]="code()" lang="html" />
      </div>
    </div>
  `,
})
export class NsLiveDemo {
  readonly code = input.required<string>();
  /** The block's info string, `html live` and any words after it. */
  readonly info = input('');
  private readonly tasks = inject(PendingTasks);
  private readonly injector = inject(Injector);
  protected readonly tab = signal<'preview' | 'code'>('preview');
  protected readonly demo = signal<Type<unknown> | null>(null);
  private readonly mason = computed(() => this.info().split(/\s+/).includes('mason'));
  protected readonly webOnly = computed(() => this.info().split(/\s+/).includes('web'));
  protected readonly demoInjector = computed(() =>
    this.mason() ? Injector.create({ providers: provideMasonElements(), parent: this.injector }) : undefined,
  );

  constructor() {
    effect(() => {
      const code = this.code();
      if (this.webOnly()) return;
      void this.tasks.run(async () => {
        await loadCompiler();
        this.demo.set(demoComponent(code));
      });
    });
  }
}
