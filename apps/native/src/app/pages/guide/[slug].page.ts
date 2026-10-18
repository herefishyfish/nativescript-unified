import { ActionBarComponent } from '@nativescript/angular';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { AppMarkdown } from '../../markdown/app-markdown';
import { injectContent } from '@nativescript-unified/analog-native';
import { DemoCodeTabs } from '../../tabs/demo-code-tabs';

/** One shared docs page: Demo tab renders the Markdown (MasonKit elements), Code tab shows the Markdown source. */
@Component({
  selector: 'guide-doc-page',
  imports: [ActionBarComponent, AsyncPipe, AppMarkdown, DemoCodeTabs],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (doc$ | async; as doc) {
      <ActionBar [title]="$any(doc.attributes)['title'] ?? doc.slug" />
      <demo-code-tabs [code]="doc.content">
        <ScrollView class="bg-background"><StackLayout class="md-pad">
          <app-markdown [source]="doc.content" />
        </StackLayout></ScrollView>
      </demo-code-tabs>
    }
  `,
})
export default class GuideDocPage {
  protected readonly doc$ = injectContent({ param: 'slug', subdirectory: 'docs' });
}


