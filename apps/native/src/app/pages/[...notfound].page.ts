import { ActionBarComponent } from '@nativescript/angular';
import { Component, inject, NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { HrefDirective } from '@nativescript/analog';

@Component({
  selector: 'not-found-page',
  imports: [ActionBarComponent, HrefDirective],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <ActionBar title="Not found" />
    <div class="page">
      <h1>404</h1>
      <p>Nothing matches <code>{{ url }}</code>.</p>
      <p><a href="/">Go home</a></p>
    </div>
  `,
})
export default class NotFoundPage {
  readonly url = inject(Router).url;
}
