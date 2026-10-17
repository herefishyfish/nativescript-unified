import { NgComponentOutlet } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, Component, Type, computed, input } from '@angular/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { NS_ELEMENTS } from '@nativescript-unified/web-polyfills';

const DEMO_IMPORTS = [...Object.values(NS_ELEMENTS), HlmButton];
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
  protected readonly component = computed(() => demoComponent(this.code()));
}