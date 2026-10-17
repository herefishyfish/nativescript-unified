import { ActionBarComponent } from '@nativescript/angular';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';

@Component({
  selector: 'login-page',
  imports: [ActionBarComponent],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <ActionBar title="Login" />
    <div class="page">
      <h1>Login</h1>
      <p>This page lives in <code>pages/(auth)/login.page.ts</code>. The <code>(auth)</code> group adds no URL segment.</p>
    </div>
  `,
})
export default class LoginPage {}
