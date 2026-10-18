import { ActionBarComponent } from '@nativescript/angular';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { UiDemo } from '../tabs/ui-demo';

@Component({
  selector: 'ui-page',
  imports: [ActionBarComponent, UiDemo],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <ActionBar title="Spartan UI" />
    <ui-demo />
  `,
})
export default class UiPage {}
