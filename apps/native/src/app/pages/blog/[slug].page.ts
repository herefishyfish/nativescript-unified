import { ActionBarComponent } from '@nativescript/angular';
import { DatePipe } from '@angular/common';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AppMarkdown } from '../../markdown/app-markdown';
import { injectContent } from '@nativescript-unified/analog-native';
import type { PostAttributes } from '../../post';

@Component({
  selector: 'blog-post-page',
  imports: [ActionBarComponent, DatePipe, AppMarkdown],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <ActionBar [title]="post()?.attributes?.title ?? ''" />
    <ScrollView>
      <StackLayout class="md-pad">
        @if (post(); as post) {
          <Label class="muted" [text]="post.attributes.date | date: 'longDate'"></Label>
          <app-markdown [source]="post.content" />
        }
      </StackLayout>
    </ScrollView>
  `,
})
export default class BlogPostPage {
  readonly post = toSignal(injectContent<PostAttributes>({ param: 'slug', subdirectory: 'blog' }));
}


