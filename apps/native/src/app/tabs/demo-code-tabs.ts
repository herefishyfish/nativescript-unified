import { ChangeDetectionStrategy, Component, NO_ERRORS_SCHEMA, input } from '@angular/core';

/**
 * Preview / Code / Styles tabs (native top tabs). Project the rendered example as content; the other two tabs
 * show `code` and `styles` as monospace text that scrolls in both directions.
 */
@Component({
  selector: 'demo-code-tabs',
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Tap to switch: a sideways swipe scrolls long code lines instead of paging the tabs. -->
    <Tabs selectedIndex="0" swipeEnabled="false" class="demo-code-tabs">
      <TabStrip>
        <TabStripItem><Label text="Preview"></Label></TabStripItem>
        <TabStripItem><Label text="Code"></Label></TabStripItem>
        <TabStripItem><Label text="Styles"></Label></TabStripItem>
      </TabStrip>
      <TabContentItem>
        <ng-content />
      </TabContentItem>
      <TabContentItem>
        <scroll class="bg-card">
          <div class="source-code"><pre><code>{{ code() }}</code></pre></div>
        </scroll>
      </TabContentItem>
      <TabContentItem>
        <scroll class="bg-card">
          <div class="source-code"><pre><code>{{ styles() }}</code></pre></div>
        </scroll>
      </TabContentItem>
    </Tabs>
  `,
})
export class DemoCodeTabs {
  readonly code = input.required<string>();
  readonly styles = input.required<string>();
}
