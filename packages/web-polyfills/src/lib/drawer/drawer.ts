import { booleanAttribute, ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { NsPlatform } from '../platform-variant';

/**
 * <Drawer>. Default content is the page. `slot="drawer"` is the panel.
 * `open` is a model; `(openChange)` emits the boolean. Layout is flex-only.
 */
@Component({
  selector: 'Drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.platform]': 'platform()', '[attr.fill]': 'fill() ? "" : null' },
  template: `
    <aside class="panel" [attr.hidden]="open() ? null : ''" [style.width.px]="width()" role="dialog" aria-label="Navigation drawer">
      <ng-content select="[slot=drawer]" />
    </aside>
    <div class="content"><ng-content /></div>
    @if (open()) {
      <div class="scrim" (click)="open.set(false)" aria-hidden="true"></div>
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; position: relative; }
    .content { display: flex; flex-direction: column; flex: 1; }
    /* Fill a definite-height parent and scroll the page slot instead of growing the document. */
    :host([fill]) { min-height: 0; overflow: hidden; }
    :host([fill]) .content { min-height: 0; overflow: hidden; }
    .scrim { position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; background: var(--ns-overlay); z-index: 10; }
    .panel { position: absolute; top: 0px; left: 0px; bottom: 0px; z-index: 11; display: flex; flex-direction: column;
      background: var(--ns-card); color: var(--ns-card-foreground); border-right: 1px solid var(--ns-border); overflow: auto; scrollbar-width: thin; }
    .panel[hidden] { display: none; }

    /* iOS: inset sheet-style side menu with soft shadow */
    :host([platform='ios']) .scrim { background: rgba(0, 0, 0, 0.3); }
    :host([platform='ios']) .panel { top: 8px; bottom: 8px; left: 8px; border: 0px; border-radius: 14px; background: rgba(242, 242, 247, 0.96); color: #000000; box-shadow: 0px 8px 30px rgba(0, 0, 0, 0.25); }

    /* Material 3 navigation drawer: full height, rounded end corners, scrim */
    :host([platform='material']) .panel { border: 0px; border-radius: 0px 16px 16px 0px; box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.3); }
  `,
})
export class NsDrawer {
  readonly open = model(false);
  /** Stretch to the parent and keep the default slot from growing the page. */
  readonly fill = input(false, { transform: booleanAttribute });
  readonly platform = input<NsPlatform>('default');
  readonly width = input(280);
}
