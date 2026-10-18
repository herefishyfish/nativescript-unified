import { ActionBarComponent } from '@nativescript/angular';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { FontIconModule } from 'nativescript-fonticon/angular';
import { GuideList } from '../tabs/guide-list';
import { HomeTab } from '../tabs/home-tab';
import { UiDemo } from '../tabs/ui-demo';

/** Top-level navigation: native Material bottom tabs (Home, Guide, UI). Detail pages push over this shell. */
@Component({
  selector: 'home-page',
  imports: [FontIconModule, ActionBarComponent, GuideList, HomeTab, UiDemo],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <ActionBar title="NativeScript Unified" />
    <MDTabs tabsPosition="bottom" selectedIndex="0" class="main-tabs">
      <MDTabStrip class="main-strip">
        <MDTabStripItem><Label text="Home"></Label><Image class="lucide tab-icon" [src]="'font://' + ('icon-house' | fonticon)"></Image></MDTabStripItem>
        <MDTabStripItem><Label text="Guide"></Label><Image class="lucide tab-icon" [src]="'font://' + ('icon-book-open' | fonticon)"></Image></MDTabStripItem>
        <MDTabStripItem><Label text="UI"></Label><Image class="lucide tab-icon" [src]="'font://' + ('icon-layout-dashboard' | fonticon)"></Image></MDTabStripItem>
      </MDTabStrip>
      <MDTabContentItem><home-tab /></MDTabContentItem>
      <MDTabContentItem><guide-list /></MDTabContentItem>
      <MDTabContentItem><ui-demo /></MDTabContentItem>
    </MDTabs>
  `,
})
export default class HomePage {}

