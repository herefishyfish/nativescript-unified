import { Component, NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { DemoCodeTabs } from './demo-code-tabs';

/** The markup shown on the Code tab; keep in sync with the template below. */
const UI_CODE = `<section hlmCard>
  <div hlmCardHeader>
    <h3 hlmCardTitle>Vintage teal</h3>
    <p hlmCardDescription>Helm card, button and badge on NativeScript.</p>
  </div>
  <div hlmCardContent class="flex flex-col gap-3">
    <div class="flex flex-row flex-wrap gap-2">
      <button hlmBtn (click)="taps.set(taps() + 1)">Default</button>
      <button hlmBtn variant="secondary">Secondary</button>
      <button hlmBtn variant="outline">Outline</button>
      <button hlmBtn variant="destructive">Destructive</button>
    </div>
    <div class="flex flex-row gap-2">
      <span hlmBadge>Badge</span>
      <span hlmBadge variant="secondary">Secondary</span>
    </div>
    <p class="text-sm text-muted-foreground">Tapped {{ taps() }} times</p>
  </div>
</section>`;


@Component({
  selector: 'ui-demo-body',
  imports: [HlmBadge, HlmButton, HlmCardImports],
  schemas: [NO_ERRORS_SCHEMA],
  template: `<scroll>
        <div class="flex flex-col gap-4 p-4 bg-background text-foreground">
          <section hlmCard>
            <div hlmCardHeader>
              <h3 hlmCardTitle>Vintage teal</h3>
              <p hlmCardDescription>Helm card, button and badge on NativeScript.</p>
            </div>
            <div hlmCardContent class="flex flex-col gap-3">
              <div class="flex flex-row flex-wrap gap-2">
                <button hlmBtn (click)="taps.set(taps() + 1)">Default</button>
                <button hlmBtn variant="secondary">Secondary</button>
                <button hlmBtn variant="outline">Outline</button>
                <button hlmBtn variant="destructive">Destructive</button>
              </div>
              <div class="flex flex-row gap-2">
                <span hlmBadge>Badge</span>
                <span hlmBadge variant="secondary">Secondary</span>
              </div>
              <p class="text-sm text-muted-foreground">Tapped {{ taps() }} times</p>
            </div>
          </section>
        </div>
      </scroll>`,
})
export class UiDemoBody {
  protected readonly taps = signal(0);
}

/** Spartan helm on native: the same components and Tailwind classes as the web docs, themed by tokens.css. */
@Component({
  selector: 'ui-demo',
  imports: [DemoCodeTabs, UiDemoBody],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <demo-code-tabs [code]="code">
      <ui-demo-body></ui-demo-body>
    </demo-code-tabs>
  `,
})
export class UiDemo {
  protected readonly code = UI_CODE;
}
