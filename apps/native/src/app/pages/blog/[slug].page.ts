import { ActionBarComponent } from '@nativescript/angular';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MarkdownComponent, injectContent } from '@nativescript-unified/analog-native';
import type { PostAttributes } from '../../post';

@Component({
  selector: 'blog-post-page',
  imports: [ActionBarComponent, DatePipe, MarkdownComponent],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ActionBar [title]="post()?.attributes?.title ?? ''" />
    <scroll class="markdown-route">
      @if (post(); as post) {
        <p class="muted">{{ post.attributes.date | date: 'longDate' }}</p>
        <analog-markdown [content]="post" />
      }
    </scroll>
  `,
})
export default class BlogPostPage {
  readonly post = toSignal(injectContent<PostAttributes>({ param: 'slug', subdirectory: 'blog' }));
}
