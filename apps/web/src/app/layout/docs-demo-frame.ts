import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { DocsDemo } from '../docs/demo';

/** A live demo with Preview / Code tabs. Both panels stay in the DOM so the prerendered HTML carries the code. */
@Component({
  selector: 'web-demo-frame',
  imports: [DocsDemo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <figure class="docs-demo" data-testid="demo">
      <div class="docs-demo-tabs" role="tablist" aria-label="Demo">
        <button type="button" role="tab" data-testid="demo-tab-preview" [attr.aria-selected]="tab() === 'preview'" (click)="tab.set('preview')">Preview</button>
        <button type="button" role="tab" data-testid="demo-tab-code" [attr.aria-selected]="tab() === 'code'" (click)="tab.set('code')">Code</button>
      </div>
      <div class="docs-demo-preview" role="tabpanel" [hidden]="tab() !== 'preview'"><docs-demo [code]="code()" /></div>
      <div class="docs-demo-code" role="tabpanel" [hidden]="tab() !== 'code'" [innerHTML]="html()"></div>
    </figure>
  `,
})
export class DocsDemoFrame {
  readonly code = input.required<string>();
  readonly html = input.required<SafeHtml>();
  protected readonly tab = signal<'preview' | 'code'>('preview');
}