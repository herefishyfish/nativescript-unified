import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Home } from '@nativescript-unified/shared';
import { ThemeToggle } from '../layout/theme-toggle';

@Component({
  selector: 'web-home-page',
  imports: [Home, ThemeToggle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-xl">
      <header class="flex items-center justify-end p-4"><web-theme-toggle /></header>
      <main id="main-content" tabindex="-1" class="outline-none"><app-home /></main>
    </div>
  `,
})
export default class HomePage {}
