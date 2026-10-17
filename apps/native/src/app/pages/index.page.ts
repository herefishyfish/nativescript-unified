import { ActionBarComponent } from '@nativescript/angular';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { HrefDirective, injectContentFiles } from '@nativescript/analog';
import type { PostAttributes } from '../post';

@Component({
  selector: 'home-page',
  imports: [ActionBarComponent, HrefDirective],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <ActionBar title="Analog on NativeScript" />
    <scroll>
      <div class="page">
        <nav>
          <a href="/shared">Shared HTML</a>
          <a href="/about">About</a>
          <a href="/products">Products</a>
          <a href="/docs">Docs</a>
          <a href="/login">Login</a>
          <a href="/no/such/page">Broken link</a>
        </nav>
        <h1>Blog</h1>
        @for (post of posts; track post.slug) {
          <div class="card">
            <h2><a [href]="'/blog/' + post.slug">{{ post.attributes.title }}</a></h2>
            <p class="muted">{{ post.attributes.description }}</p>
          </div>
        }
      </div>
    </scroll>
  `,
})
export default class HomePage {
  readonly posts = injectContentFiles<PostAttributes>((file) => file.filename.startsWith('/src/content/blog/'));
}
