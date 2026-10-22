import { ActionBarComponent } from '@nativescript/angular';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { FontIconModule } from 'nativescript-fonticon/angular';
import { GuideList } from '../tabs/guide-list';
import { UiDemo } from '../tabs/ui-demo';

/** Top-level navigation: native bottom tabs (Guide, Components, UI). Detail pages push over this shell. */
@Component({
  selector: 'home-page',
  imports: [FontIconModule, ActionBarComponent, GuideList, UiDemo],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <ActionBar title="NativeScript Unified" />
    <BottomNavigation selectedIndex="0" class="main-tabs">
      <TabStrip>
        <TabStripItem><Label text="Guide"></Label><Image class="lucide tab-icon" [src]="'font://' + ('icon-book-open' | fonticon)"></Image></TabStripItem>
        <TabStripItem><Label text="Components"></Label><Image class="lucide tab-icon" [src]="'font://' + ('icon-component' | fonticon)"></Image></TabStripItem>
        <TabStripItem><Label text="UI"></Label><Image class="lucide tab-icon" [src]="'font://' + ('icon-layout-dashboard' | fonticon)"></Image></TabStripItem>
      </TabStrip>
      <TabContentItem><guide-list kind="guide" /></TabContentItem>
      <TabContentItem><guide-list kind="components" /></TabContentItem>
      <TabContentItem><ui-demo /></TabContentItem>
    </BottomNavigation>
  `,
})
export default class HomePage {}

