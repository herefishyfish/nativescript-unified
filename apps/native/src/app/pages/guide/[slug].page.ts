import { ActionBarComponent } from '@nativescript/angular';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { injectContent, MarkdownComponent } from '@nativescript-unified/analog-native';

/** One shared docs page, rendered from Markdown by analog-native's <analog-markdown> (MasonKit elements). */
@Component({
  selector: 'guide-doc-page',
  imports: [ActionBarComponent, AsyncPipe, MarkdownComponent],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (doc$ | async; as doc) {
      <ActionBar [title]="$any(doc.attributes)['title'] ?? doc.slug" />
      <scroll class="markdown-route bg-background">
        <analog-markdown [content]="doc" />
      </scroll>
    }
  `,
})
export default class GuideDocPage {
  protected readonly doc$ = injectContent({ param: 'slug', subdirectory: 'docs' });
}