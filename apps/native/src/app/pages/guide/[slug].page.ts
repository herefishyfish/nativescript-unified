import { ActionBarComponent } from '@nativescript/angular';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { MarkdownComponent, injectContent } from '@nativescript-unified/analog-native';

/**
 * One shared docs page. `<analog-markdown>` renders the Markdown as native elements; every
 * `html live` block becomes a Preview / Code tab pair with a live JIT-compiled demo.
 */
@Component({
  selector: 'guide-doc-page',
  imports: [ActionBarComponent, AsyncPipe, MarkdownComponent],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (doc$ | async; as doc) {
      <ActionBar [title]="$any(doc.attributes)['title'] ?? doc.slug" />
      <scroll class="markdown-route">
        <analog-markdown [content]="doc" />
      </scroll>
    }
  `,
})
export default class GuideDocPage {
  protected readonly doc$ = injectContent({ param: 'slug', subdirectory: 'docs' });
}
