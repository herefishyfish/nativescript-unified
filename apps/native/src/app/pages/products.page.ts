import { ActionBarComponent } from '@nativescript/angular';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HrefDirective } from '@nativescript-unified/analog-native';

@Component({
  selector: 'products-page',
  imports: [ActionBarComponent, RouterOutlet, HrefDirective],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <ActionBar title="Products" />
    <div>
      <nav class="tabs">
        <a href="/products">All</a>
        <a href="/products/1">Widget</a>
        <a href="/products/2">Gadget</a>
      </nav>
      <router-outlet />
    </div>
  `,
})
export default class ProductsLayoutPage {}
