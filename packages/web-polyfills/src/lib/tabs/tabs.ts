import { booleanAttribute, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, effect, inject, input, model, signal } from '@angular/core';
import { observeChildren } from '../elements/util';
import { NsPlatform } from '../platform-variant';

/**
 * <Tabs> custom element. Children are plain `<ns-tab label="One">content</ns-tab>` elements.
 * Property `selectedIndex`; event `selectedIndexChange` (detail = index).
 */
@Component({
  selector: 'Tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.platform]': 'platform()', '[attr.segmented]': 'segmented() ? "" : null' },
  template: `
    <div class="strip" role="tablist">
      @for (label of labels(); track $index) {
        <button class="tabbtn" role="tab" type="button" [class.active]="$index === selectedIndex()"
          [attr.aria-selected]="$index === selectedIndex()" (click)="selectedIndex.set($index)">{{ label }}</button>
      }
    </div>
    <div class="panel" role="tabpanel"><ng-content /></div>
  `,
  styles: `
    :host { display: flex; flex-direction: column; }
    .strip { display: flex; flex-direction: row; border-bottom: 1px solid var(--ns-border); }
    .tabbtn { flex: 1; padding: 10px 12px; background: transparent; color: var(--ns-muted-foreground);
      border: 0px; border-bottom: 2px solid transparent; font-size: 14px; font-weight: 500; cursor: pointer; }
    .tabbtn.active { color: var(--ns-primary); border-bottom: 2px solid var(--ns-primary); }
    .panel { display: flex; flex-direction: column; flex: 1; padding: 12px; }

    /* iOS: bottom tab bar (UITabBar), or a segmented control with the segmented attribute */
    :host([platform='ios']) { flex-direction: column-reverse; }
    :host([platform='ios']) .strip { border-bottom: 0px; border-top: 1px solid rgba(60, 60, 67, 0.29); background: rgba(249, 249, 249, 0.94); padding: 6px 0px; }
    :host([platform='ios']) .tabbtn { border-bottom: 0px; font-size: 10px; line-height: 14px; font-weight: 500; padding: 4px 0px; }
    :host([platform='ios']) .tabbtn.active { color: #007aff; border-bottom: 0px; }
    :host([platform='ios'][segmented]) { flex-direction: column; }
    :host([platform='ios'][segmented]) .strip { margin: 8px 12px; padding: 2px; border-top: 0px; border-radius: 9px; background: rgba(118, 118, 128, 0.12); }
    :host([platform='ios'][segmented]) .tabbtn { border-radius: 7px; font-size: 13px; line-height: 20px; color: var(--ns-foreground); padding: 4px 0px; }
    :host([platform='ios'][segmented]) .tabbtn.active { background: #ffffff; color: #000000; box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2); }

    /* Material: top tabs with a primary indicator */
    :host([platform='material']) .strip { background: var(--ns-card); border-bottom: 1px solid var(--ns-border); }
    :host([platform='material']) .tabbtn { padding: 14px 12px; font-size: 14px; line-height: 20px; font-weight: 500; letter-spacing: 0.1px; }
    :host([platform='material']) .tabbtn.active { border-bottom: 3px solid var(--ns-primary); }
  `,
})
export class NsTabs implements OnDestroy {
  readonly selectedIndex = model(0);
  readonly platform = input<NsPlatform>('default');
  /** iOS only: render as a segmented control instead of a bottom tab bar. */
  readonly segmented = input(false, { transform: booleanAttribute });
  protected readonly labels = signal<string[]>([]);
  private readonly children = signal<HTMLElement[]>([]);
  private readonly stop = observeChildren(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, 'ns-tab', (els) => {
    this.children.set(els);
    this.labels.set(els.map((e) => e.getAttribute('label') ?? ''));
  });

  constructor() {
    effect(() => {
      const idx = this.selectedIndex();
      this.children().forEach((el, i) => (el.hidden = i !== idx));
    });
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
