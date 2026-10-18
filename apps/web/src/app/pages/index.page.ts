import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { HomeFeature } from '@nativescript-unified/shared';
import { NsLabel, NsStackLayout } from '@nativescript-unified/web-polyfills';
import { Seo } from '../core/seo';
import { ThemeToggle } from '../layout/theme-toggle';

@Component({
  selector: 'web-home-page',
  imports: [HomeFeature, HlmButton, RouterLink, NsStackLayout, NsLabel, ThemeToggle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="main-content" tabindex="-1" class="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 outline-none">
      <div class="flex justify-end"><web-theme-toggle /></div>
      <app-home-feature />
      <StackLayout orientation="horizontal" class="items-center gap-3">
        <a hlmBtn routerLink="/docs/introduction" data-testid="read-docs">Read the docs</a>
        <a hlmBtn variant="outline" routerLink="/docs/stack-layout">StackLayout demo</a>
        <Label text="This row is a &lt;StackLayout&gt;"></Label>
      </StackLayout>
    </main>
  `,
})
export default class HomePage {
  constructor() {
    inject(Seo).set({
      description: 'HTML-first NativeScript docs: one set of pages for web and native, with Angular Elements that render legacy NativeScript layouts like StackLayout in the browser.',
      path: '/',
    });
  }
}