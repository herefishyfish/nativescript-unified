import { NgComponentOutlet } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, Component, PendingTasks, Type, effect, inject, input, signal } from '@angular/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { NS_ELEMENTS } from '@nativescript-unified/web-polyfills';

const DEMO_IMPORTS = [...Object.values(NS_ELEMENTS), HlmButton];
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
 * Imports: every web-polyfill view plus the Spartan helm button. The code on the page is the code that runs.
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

