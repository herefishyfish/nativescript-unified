import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { HomeFeature } from '@nativescript-unified/shared';
import { NsLabel, NsStackLayout } from '@nativescript-unified/web-polyfills';
import { ThemeToggle } from '../layout/theme-toggle';

@Component({
  selector: 'web-home-page',
  imports: [HomeFeature, HlmButton, RouterLink, NsStackLayout, NsLabel, ThemeToggle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <div class="flex justify-end"><web-theme-toggle /></div>
      <app-home-feature />
      <StackLayout orientation="horizontal" class="items-center gap-3">
        <a hlmBtn routerLink="/docs/introduction" data-testid="read-docs">Read the docs</a>
        <a hlmBtn variant="outline" routerLink="/docs/stack-layout">StackLayout demo</a>
        <Label text="This row is a &lt;StackLayout&gt;"></Label>
      </StackLayout>
    </div>
  `,
})
export default class HomePage {}