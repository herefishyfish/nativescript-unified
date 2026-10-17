import { booleanAttribute, ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NsPlatform } from '../platform-variant';

/**
 * <ActionBar title="Inbox" platform="ios|material">.
 * NavigationButton is the back control. Other leading and trailing nodes use slot="leading" and slot="trailing".
 * iOS: centered title, optional large title. Material: start-aligned title. Layout is flex-only.
 */
@Component({
  selector: 'ActionBar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.platform]': 'platform()', '[attr.large]': 'large() ? "" : null' },
  template: `
    <header class="bar">
      <div class="row">
        <div class="side">
          <ng-content select="NavigationButton" />
          <ng-content select="[slot=leading]" />
        </div>
        <h1 class="title">{{ title() }}</h1>
        <div class="side trailing"><ng-content select="[slot=trailing]" /></div>
      </div>
      <h2 class="large-title">{{ title() }}</h2>
    </header>
  `,
  styles: `
    :host { display: block; }
    .bar { display: flex; flex-direction: column; background: var(--ns-card); color: var(--ns-card-foreground); border-bottom: 1px solid var(--ns-border); }
    .row { display: flex; flex-direction: row; align-items: center; height: 48px; padding: var(--ns-bar-pad, 0px 8px); }
    .side { display: flex; flex-direction: row; align-items: center; gap: 4px; min-width: 0px; }
    .trailing { justify-content: flex-end; }
    .title { flex: 1; margin: 0px; font-size: 15px; line-height: 20px; font-weight: 500; letter-spacing: -0.2px; text-align: left; }
    .large-title { display: none; margin: 0px; }

    /* iOS approximation: translucent bar, hairline, optional large title */
    :host([platform='ios']) .bar { background: rgba(249, 249, 249, 0.94); border-bottom: 1px solid rgba(60, 60, 67, 0.29); }
    :host([platform='ios']) .row { height: 44px; padding: 0px 8px; }
    :host([platform='ios']) .side { min-width: 56px; }
    :host([platform='ios']) .title { text-align: center; font-size: 17px; line-height: 24px; font-weight: 600; letter-spacing: 0px; }
    :host([platform='ios'][large]) .bar { border-bottom: 0px; }
    :host([platform='ios'][large]) .title { opacity: 0; }
    :host([platform='ios'][large]) .large-title { display: block; padding: 0px 16px 8px 16px; font-size: 34px; line-height: 41px; font-weight: 700; letter-spacing: 0.4px; }

    /* Material approximation: primary top app bar, start-aligned title, elevation */
    :host([platform='material']) .bar { background: var(--ns-primary); color: var(--ns-primary-foreground); border-bottom: 0px; box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.3); }
    :host([platform='material']) .row { height: 56px; padding: 0px 4px; }
    :host([platform='material']) .title { text-align: left; font-size: 20px; line-height: 28px; font-weight: 500; letter-spacing: 0px; padding-left: 8px; }
    :host([platform='material']) .side { min-width: 48px; }
    :host([platform='material']) .trailing { order: 3; }
  `,
})
export class NsActionBar {
  readonly title = input('');
  readonly platform = input<NsPlatform>('default');
  /** iOS large-title mode. */
  readonly large = input(false, { transform: booleanAttribute });
}

/** Back control for ActionBar. `(tap)` is the NativeScript event. */
@Component({
  selector: 'NavigationButton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button type="button" (click)="tap.emit()">{{ text() }}</button>`,
  styles: `
    :host { display: flex; }
    button { padding: 8px 12px; border: 0px; background: transparent; color: inherit; font: inherit; cursor: pointer; }
  `,
})
export class NsNavigationButton {
  readonly text = input('');
  readonly tap = output<void>();
}
