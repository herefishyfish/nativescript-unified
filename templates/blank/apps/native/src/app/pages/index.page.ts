import { ActionBarComponent } from '@nativescript/angular';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { Home } from '@nativescript-unified/shared';

@Component({
  selector: 'home-page',
  imports: [ActionBarComponent, Home],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <ActionBar title="Blank app" />
    <scroll>
      <app-home />
    </scroll>
  `,
})
export default class HomePage {}
