import { ActionBarComponent } from '@nativescript/angular';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { GuideList } from '../../tabs/guide-list';

@Component({
  selector: 'guide-index-page',
  imports: [ActionBarComponent, GuideList],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <ActionBar title="Guide" />
    <guide-list />
  `,
})
export default class GuideIndexPage {}
