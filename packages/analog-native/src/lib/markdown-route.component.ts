import { ActionBarComponent } from '@nativescript/angular';
import { ChangeDetectionStrategy, Component, inject, NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MarkdownComponent } from './markdown.component';
import { CONTENT_ROUTE_DATA } from './routes';
import type { ContentFile } from './types';

/** Page for `.md` files under `pages/`. Its title comes from the `title` front matter. */
@Component({
  selector: 'analog-markdown-route',
  imports: [ActionBarComponent, MarkdownComponent],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ActionBar [title]="title" />
    <scroll class="markdown-route">
      <analog-markdown [content]="content" />
    </scroll>
  `,
})
export class MarkdownRouteComponent {
  protected readonly content = inject(ActivatedRoute).snapshot.data[CONTENT_ROUTE_DATA] as ContentFile;
  protected readonly title = String(this.content.attributes['title'] ?? '');
}
