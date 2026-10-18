import { Component, NO_ERRORS_SCHEMA, input } from '@angular/core';

/**
 * Demo / Code tabs (top Material tabs). Project the rendered content with `<div demo>`; the Code tab shows `code`
 * as selectable monospace text in its own scroll view.
 */
@Component({
  selector: 'demo-code-tabs',
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <MDTabs tabsPosition="top" selectedIndex="0" class="demo-code-tabs">
      <MDTabStrip class="demo-code-strip">
        <MDTabStripItem><Label text="Demo"></Label></MDTabStripItem>
        <MDTabStripItem><Label text="Code"></Label></MDTabStripItem>
      </MDTabStrip>
      <MDTabContentItem>
        <ng-content />
      </MDTabContentItem>
      <MDTabContentItem>
        <ScrollView class="code-scroll">
          <Label class="code-block" textWrap="true" [text]="code()"></Label>
        </ScrollView>
      </MDTabContentItem>
    </MDTabs>
  `,
})
export class DemoCodeTabs {
  readonly code = input.required<string>();
}
