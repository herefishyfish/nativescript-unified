import { ChangeDetectionStrategy, Component, NO_ERRORS_SCHEMA, input } from '@angular/core';

/**
 * Preview / Code / Styles tabs (top Material tabs). Project the rendered example as content; the other two tabs
 * show `code` and `styles` as monospace text that scrolls in both directions.
 */
@Component({
  selector: 'demo-code-tabs',
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <MDTabs tabsPosition="top" selectedIndex="0" class="demo-code-tabs">
      <MDTabStrip class="demo-code-strip">
        <MDTabStripItem><Label text="Preview"></Label></MDTabStripItem>
        <MDTabStripItem><Label text="Code"></Label></MDTabStripItem>
        <MDTabStripItem><Label text="Styles"></Label></MDTabStripItem>
      </MDTabStrip>
      <MDTabContentItem>
        <ng-content />
      </MDTabContentItem>
      <MDTabContentItem>
        <scroll class="bg-card">
          <div class="source-code"><pre><code>{{ code() }}</code></pre></div>
        </scroll>
      </MDTabContentItem>
      <MDTabContentItem>
        <scroll class="bg-card">
          <div class="source-code"><pre><code>{{ styles() }}</code></pre></div>
        </scroll>
      </MDTabContentItem>
    </MDTabs>
  `,
})
export class DemoCodeTabs {
  readonly code = input.required<string>();
  readonly styles = input.required<string>();
}
