import { ChangeDetectionStrategy, Component, computed, input, NO_ERRORS_SCHEMA } from '@angular/core';
import { HrefDirective, injectContentFiles } from '@nativescript-unified/analog-native';
import { buildNav, sortDocs, type DocMeta } from '@nativescript-unified/shared';

const COMPONENTS_SECTION = 'Components';

/**
 * Index of the shared docs Markdown (packages/shared/content/docs), the same files the web docs render.
 * Tiles open `/docs/<slug>`, the path those files link to. `kind` picks the tab: the component
 * pages, or every other section.
 */
@Component({
  selector: 'guide-list',
  imports: [HrefDirective],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <scroll>
      <div class="flex flex-col gap-6 p-4 bg-background text-foreground">
        <h1 class="text-2xl font-bold">{{ kind() === 'components' ? 'Components' : 'Guide' }}</h1>
        @for (section of nav(); track section.title) {
          <div class="flex flex-col gap-2">
            @if (kind() === 'guide') {
              <h2 class="text-sm font-semibold text-muted-foreground">{{ section.title }}</h2>
            }
            @for (doc of section.pages; track doc.slug) {
              <a [href]="'/docs/' + doc.slug" class="flex flex-col gap-1 p-3 rounded-lg bg-card text-card-foreground">
                <span class="text-base font-medium">{{ doc.title }}</span>
                <span class="text-sm text-muted-foreground">{{ doc.description }}</span>
              </a>
            }
          </div>
        }
      </div>
    </scroll>
  `,
})
export class GuideList {
  readonly kind = input<'guide' | 'components'>('guide');

  private readonly docs = sortDocs(
    injectContentFiles<Partial<DocMeta>>((file) => file.filename.includes('/shared/content/docs/')).map((file) => ({
      slug: file.slug,
      title: file.attributes.title ?? file.slug,
      section: file.attributes.section ?? 'Docs',
      order: Number(file.attributes.order ?? 99),
      description: file.attributes.description ?? '',
    })),
  );

  protected readonly nav = computed(() => {
    const components = this.kind() === 'components';
    return buildNav(this.docs.filter((doc) => (doc.section === COMPONENTS_SECTION) === components));
  });
}
