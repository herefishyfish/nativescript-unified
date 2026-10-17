import { ActionBarComponent } from '@nativescript/angular';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { HrefDirective } from '@nativescript/analog';

@Component({
  selector: 'about-page',
  imports: [ActionBarComponent, HrefDirective],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <ActionBar title="About" />
    <div class="page">
      <h1>About</h1>
      <p>This page is <code>src/app/pages/about.page.ts</code>, routed at <strong>/about</strong>.</p>
      <p>Built with <a href="https://analogjs.org">AnalogJS</a> conventions on NativeScript.</p>
    </div>
  `,
})
export default class AboutPage {}
