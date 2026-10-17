import { Component } from '@angular/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HomeFeature } from '@nativescript-unified/shared';
import { NsLabel, NsStackLayout } from '@nativescript-unified/web-polyfills';

@Component({
  selector: 'web-home-page',
  imports: [HomeFeature, HlmButton, NsStackLayout, NsLabel],
  template: `
    <app-home-feature />
    <div class="p-4">
      <StackLayout orientation="horizontal" class="gap-3 items-center">
        <Label text="Rendered by the web &lt;StackLayout&gt; polyfill" />
        <button hlmBtn>Spartan helm button</button>
        <button hlmBtn variant="secondary">Secondary</button>
      </StackLayout>
    </div>
  `,
})
export default class HomePage {}
