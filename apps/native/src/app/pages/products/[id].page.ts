import { Component, computed, inject, NO_ERRORS_SCHEMA } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { PRODUCTS } from '../../products';

@Component({
  selector: 'product-detail',
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <div class="page">
      <h2>{{ product()?.name ?? 'Unknown product' }}</h2>
      <p>Route param <code>:id</code> is <strong>{{ id() }}</strong></p>
      <p class="muted">Price {{ product()?.price ?? 'n/a' }}</p>
    </div>
  `,
})
export default class ProductDetailPage {
  readonly id = toSignal(inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('id') ?? '')), {
    initialValue: '',
  });
  readonly product = computed(() => PRODUCTS[this.id()]);
}
