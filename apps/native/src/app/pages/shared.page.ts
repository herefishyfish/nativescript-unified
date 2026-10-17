import { ActionBarComponent } from '@nativescript/angular';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { HomeFeature } from '@nativescript-unified/shared';

/** Native page that renders the same HTML-first component as apps/web. */
@Component({
  selector: 'shared-page',
  imports: [ActionBarComponent, HomeFeature],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <ActionBar title="Shared HTML" />
    <scroll>
      <app-home-feature />
    </scroll>
  `,
})
export default class SharedPage {}
