import { ActionBarComponent } from '@nativescript/angular';
import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, NO_ERRORS_SCHEMA } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { findExample } from '@nativescript-unified/shared';
import { map } from 'rxjs';
import { DemoCodeTabs } from '../../tabs/demo-code-tabs';

/**
 * One shared example screen (packages/shared/src/lib/examples), opened from a UI tab tile: the styled screen on
 * the Preview tab, its component and stylesheet on the Code and Styles tabs.
 */
@Component({
  selector: 'example-page',
  imports: [ActionBarComponent, DemoCodeTabs, NgComponentOutlet],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ActionBar [title]="example()?.title ?? 'Example'" />
    @if (example(); as example) {
      <demo-code-tabs [code]="example.source.code" [styles]="example.source.styles">
        <scroll>
          <ng-container *ngComponentOutlet="example.component" />
        </scroll>
      </demo-code-tabs>
    } @else {
      <p class="p-4 text-muted-foreground">There is no example called {{ slug() }}.</p>
    }
  `,
})
export default class ExamplePage {
  protected readonly slug = toSignal(inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('slug') ?? '')), {
    initialValue: '',
  });
  protected readonly example = computed(() => findExample(this.slug()));
}
