import { ActionBarComponent } from '@nativescript/angular';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { FontIconModule } from 'nativescript-fonticon/angular';
import { GuideList } from '../tabs/guide-list';
import { UiDemo } from '../tabs/ui-demo';

/** Top-level navigation: native Material bottom tabs (Guide, Components, UI). Detail pages push over this shell. */
@Component({
  selector: 'home-page',
  imports: [FontIconModule, ActionBarComponent, GuideList, UiDemo],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <ActionBar title="NativeScript Unified" />
    <MDTabs tabsPosition="bottom" selectedIndex="0" class="main-tabs">
      <MDTabStrip class="main-strip">
        <MDTabStripItem><Label text="Guide"></Label><Image class="lucide tab-icon" [src]="'font://' + ('icon-book-open' | fonticon)"></Image></MDTabStripItem>
        <MDTabStripItem><Label text="Components"></Label><Image class="lucide tab-icon" [src]="'font://' + ('icon-component' | fonticon)"></Image></MDTabStripItem>
        <MDTabStripItem><Label text="UI"></Label><Image class="lucide tab-icon" [src]="'font://' + ('icon-layout-dashboard' | fonticon)"></Image></MDTabStripItem>
      </MDTabStrip>
      <MDTabContentItem><guide-list kind="guide" /></MDTabContentItem>
      <MDTabContentItem><guide-list kind="components" /></MDTabContentItem>
      <MDTabContentItem><ui-demo /></MDTabContentItem>
    </MDTabs>
  `,
})
export default class HomePage {}

