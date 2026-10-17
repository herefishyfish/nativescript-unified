import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, computed, effect, inject, input, model, signal } from '@angular/core';
import { observeChildren } from '../elements/util';
import { NsPlatform } from '../platform-variant';

/**
 * <Pager> custom element. Children are plain `<ns-page>` elements; one is visible at a time
 * (no scroll-snap, which MasonKit lacks). Property `index`; event `indexChange` (detail = index).
 */
@Component({
  selector: 'Pager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.platform]': 'platform()' },
  template: `
    <div class="page"><ng-content /></div>
    <div class="controls">
      <button type="button" class="nav" part="prev" [disabled]="!hasPrev()" (click)="go(-1)" aria-label="Previous page">Prev</button>
      <div class="dots">
        @for (p of pages(); track $index) {
          <button type="button" class="dot" [class.on]="$index === index()" (click)="index.set($index)" [attr.aria-label]="'Page ' + ($index + 1)"></button>
        }
      </div>
      <button type="button" class="nav" part="next" [disabled]="!hasNext()" (click)="go(1)" aria-label="Next page">Next</button>
    </div>
  `,
  styles: `
    :host { display: flex; flex-direction: column; }
    .page { display: flex; flex-direction: column; flex: 1; padding: 12px; }
    .controls { display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 8px; }
    .dots { display: flex; flex-direction: row; gap: 6px; }
    .dot { width: 8px; height: 8px; padding: 0px; border: 0px; border-radius: 4px; background: var(--ns-border); cursor: pointer; }
    .dot.on { background: var(--ns-primary); }
    .nav { padding: 6px 12px; border: 1px solid var(--ns-border); border-radius: var(--ns-radius); background: var(--ns-card); color: var(--ns-foreground); cursor: pointer; }
    .nav:disabled { opacity: 0.4; cursor: default; }

    /* iOS: UIPageControl dots only, centered over the content */
    :host([platform='ios']) .nav { display: none; }
    :host([platform='ios']) .controls { justify-content: center; }
    :host([platform='ios']) .dots { padding: 6px 10px; border-radius: 12px; background: rgba(60, 60, 67, 0.18); }
    :host([platform='ios']) .dot { background: rgba(255, 255, 255, 0.55); }
    :host([platform='ios']) .dot.on { background: #ffffff; }

    /* Material: arrow buttons plus indicator dots */
    :host([platform='material']) .nav { border: 0px; border-radius: 20px; background: var(--ns-accent); color: var(--ns-primary); font-weight: 500; }
    :host([platform='material']) .dot { width: 10px; height: 10px; border-radius: 5px; }
  `,
})
export class NsPager implements OnDestroy {
  readonly index = model(0);
  readonly platform = input<NsPlatform>('default');
  protected readonly pages = signal<HTMLElement[]>([]);
  protected readonly hasPrev = computed(() => this.index() > 0);
  protected readonly hasNext = computed(() => this.index() < this.pages().length - 1);
  private readonly stop = observeChildren(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, 'ns-page', (els) => this.pages.set(els));

  constructor() {
    effect(() => {
      const idx = this.index();
      this.pages().forEach((el, i) => (el.hidden = i !== idx));
    });
  }

  protected go(delta: number): void {
    const next = this.index() + delta;
    if (next >= 0 && next < this.pages().length) this.index.set(next);
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
