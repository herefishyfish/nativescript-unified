import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NsPlatform } from '../platform-variant';

export type NsButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost';

@Component({
  selector: 'button[nsButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': '"ns-btn ns-btn-" + variant()', '[attr.platform]': 'platform()' },
  template: `<ng-content />`,
  styles: `
    :host { display: flex; flex-direction: row; align-items: center; justify-content: center; padding: 8px 16px;
      border: 1px solid transparent; border-radius: var(--ns-radius); font-size: 14px; font-weight: 500; cursor: pointer; }
    :host(.ns-btn-default) { background: var(--ns-primary); color: var(--ns-primary-foreground); }
    :host(.ns-btn-secondary) { background: var(--ns-secondary); color: var(--ns-secondary-foreground); }
    :host(.ns-btn-outline) { background: transparent; color: var(--ns-foreground); border: 1px solid var(--ns-border); }
    :host(.ns-btn-ghost) { background: transparent; color: var(--ns-foreground); }

    /* iOS: plain tinted text / filled capsule, no elevation */
    :host([platform='ios']) { border-radius: 980px; font-weight: 600; padding: 8px 20px; }
    :host([platform='ios'].ns-btn-default) { background: #007aff; color: #ffffff; }
    :host([platform='ios'].ns-btn-secondary) { background: rgba(0, 122, 255, 0.12); color: #007aff; }
    :host([platform='ios'].ns-btn-outline), :host([platform='ios'].ns-btn-ghost) { border: 0px; background: transparent; color: #007aff; }

    /* Material 3: filled pill with elevation, tonal and outlined variants */
    :host([platform='material']) { border-radius: 20px; padding: 10px 24px; font-weight: 500; letter-spacing: 0.1px; }
    :host([platform='material'].ns-btn-default) { background: var(--ns-primary); color: var(--ns-primary-foreground); box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.3); }
    :host([platform='material'].ns-btn-secondary) { background: var(--ns-accent); color: var(--ns-primary); }
  `,
})
export class NsButton {
  readonly variant = input<NsButtonVariant>('default');
  readonly platform = input<NsPlatform>('default');
}

@Component({
  selector: 'ns-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="b"><ng-content /></span>`,
  styles: `
    :host { display: flex; flex-direction: row; }
    .b { padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; background: var(--ns-accent); color: var(--ns-primary); }
  `,
})
export class NsBadge {}

@Component({
  selector: 'ns-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card">
      <header class="head"><ng-content select="[nsCardTitle]" /></header>
      <div class="body"><ng-content /></div>
    </section>
  `,
  styles: `
    :host { display: block; }
    .card { display: flex; flex-direction: column; gap: 8px; padding: 16px; border: 1px solid var(--ns-border);
      border-radius: 12px; background: var(--ns-card); color: var(--ns-card-foreground); }
    .head { display: flex; flex-direction: column; font-weight: 600; }
    .body { display: flex; flex-direction: column; gap: 8px; color: var(--ns-muted-foreground); font-size: 14px; }
  `,
})
export class NsCard {}
