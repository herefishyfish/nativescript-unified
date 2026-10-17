import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { HrefDirective } from '@nativescript-unified/analog-native';
import { PRODUCTS } from '../../products';

@Component({
  selector: 'product-list',
  imports: [HrefDirective],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <div class="page">
      <h2>All products</h2>
      @for (product of products; track product.id) {
        <p><a [href]="'/products/' + product.id">{{ product.name }}</a><span> {{ product.price }}</span></p>
      }
    </div>
  `,
})
export default class ProductListPage {
  readonly products = Object.entries(PRODUCTS).map(([id, product]) => ({ id, ...product }));
}
