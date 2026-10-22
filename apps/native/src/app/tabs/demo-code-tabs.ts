import { ChangeDetectionStrategy, Component, NO_ERRORS_SCHEMA, input } from '@angular/core';
import { CodeBlockComponent } from '@nativescript-unified/analog-native';

/**
 * Preview / Code / Styles tabs (native top tabs). Project the rendered example as content; the other two tabs
 * show `code` and `styles` syntax-highlighted, scrolling in both directions.
 */
@Component({
  selector: 'demo-code-tabs',
  imports: [CodeBlockComponent],
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
          <div class="source-code"><analog-code [code]="code()" lang="ts" /></div>
        </scroll>
      </TabContentItem>
      <TabContentItem>
        <scroll class="bg-card">
          <div class="source-code"><analog-code [code]="styles()" lang="css" /></div>
        </scroll>
      </TabContentItem>
    </Tabs>
  `,
})
export class DemoCodeTabs {
  readonly code = input.required<string>();
  readonly styles = input.required<string>();
}
