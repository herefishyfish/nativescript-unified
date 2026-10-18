import { NgComponentOutlet } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, Component, PendingTasks, Type, effect, inject, input, signal } from '@angular/core';
import { HlmAccordionImports } from '@spartan-ng/helm/accordion';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmProgressImports } from '@spartan-ng/helm/progress';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { NS_ELEMENTS } from '@nativescript-unified/web-polyfills';

/** Spartan helm pieces the Components pages demo. Every helm component here already exists in packages/ui/helm. */
const HELM_IMPORTS = [
  HlmButton,
  HlmBadge,
  ...HlmCardImports,
  HlmInput,
  HlmLabel,
  HlmTextarea,
  HlmCheckbox,
  ...HlmSwitchImports,
  ...HlmRadioGroupImports,
  ...HlmTabsImports,
  ...HlmAccordionImports,
  ...HlmDialogImports,
  ...HlmAlertImports,
  ...HlmProgressImports,
  HlmSkeleton,
  ...HlmAvatarImports,
  HlmSeparator,
];
const DEMO_IMPORTS = [...Object.values(NS_ELEMENTS), ...HELM_IMPORTS];
/**
 * The Angular JIT compiler is loaded on demand: a bare `import '@angular/compiler'` is dropped from the production client bundle,
 * and so is the facade registration inside it.
 * Server rendering waits for it through PendingTasks.
 */
let compilerReady: Promise<unknown> | undefined;
const loadCompiler = () =>
  (compilerReady ??= import('@angular/compiler').then((compiler) => {
    // The bundler drops the module's own publishFacade(globalThis) side effect, so call it here.
    compiler.publishFacade(globalThis);
  }));

const cache = new Map<string, Type<unknown>>();

/**
 * Compiles the template string in a docs code block into a standalone component (Angular JIT).
 * Imports: every web-polyfill view plus the Spartan helm components in HELM_IMPORTS. The code on the page is the code that runs.
 */
export function demoComponent(template: string): Type<unknown> {
  let cmp = cache.get(template);
  if (!cmp) {
    class Demo {}
    Component({
      selector: 'docs-demo-live',
      imports: DEMO_IMPORTS,
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      changeDetection: ChangeDetectionStrategy.OnPush,
      template,
    })(Demo);
    cmp = Demo;
    cache.set(template, cmp);
  }
  return cmp;
}

@Component({
  selector: 'docs-demo',
  imports: [NgComponentOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-container *ngComponentOutlet="component()" />`,
})
export class DocsDemo {
  readonly code = input.required<string>();
  private readonly tasks = inject(PendingTasks);
  protected readonly component = signal<Type<unknown> | null>(null);

  constructor() {
    effect(() => {
      const code = this.code();
      void this.tasks.run(async () => {
        await loadCompiler();
        this.component.set(demoComponent(code));
      });
    });
  }
}

