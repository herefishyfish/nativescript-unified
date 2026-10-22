import { ChangeDetectionStrategy, Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { HrefDirective } from '@nativescript-unified/analog-native';
import { EXAMPLES } from '@nativescript-unified/shared';
import { FontIconModule } from 'nativescript-fonticon/angular';

type Tile = { readonly slug: string; readonly title: string; readonly blurb: string; readonly icon: string };

/** Native-only screens listed beside the shared examples; their pages live under pages/examples/. */
const NATIVE_TILES: readonly Tile[] = [
  { slug: 'overlays', title: 'Overlays', blurb: 'Dialogs, sheets, drawers and popovers in native windows.', icon: 'layers' },
];

/** The UI tab: a gallery of example screens. Each tile opens /examples/<slug>. */
@Component({
  selector: 'ui-demo',
  imports: [FontIconModule, HrefDirective],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <scroll>
      <div class="flex flex-col gap-4 p-4 bg-background text-foreground">
        <div class="flex flex-col gap-1">
          <h1 class="text-2xl font-bold">Examples</h1>
          <p class="text-sm text-muted-foreground">Full screens built from plain HTML, Tailwind and helm. Tap one to open it.</p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          @for (tile of tiles; track tile.slug) {
            <a [href]="'/examples/' + tile.slug" class="example-tile flex flex-col justify-between gap-6 p-4 rounded-2xl" [class]="'example-tile-' + tile.slug">
              <span class="lucide example-tile-icon text-2xl p-2 rounded-xl">{{ 'icon-' + tile.icon | fonticon }}</span>
              <div class="flex flex-col gap-1">
                <span class="example-tile-title text-lg font-bold">{{ tile.title }}</span>
                <span class="example-tile-blurb text-xs">{{ tile.blurb }}</span>
              </div>
            </a>
          }
        </div>
      </div>
    </scroll>
  `,
})
export class UiDemo {
  protected readonly tiles: readonly Tile[] = [...EXAMPLES, ...NATIVE_TILES];
}
