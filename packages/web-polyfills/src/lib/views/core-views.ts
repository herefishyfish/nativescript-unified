import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, booleanAttribute, computed, inject, input, model, numberAttribute, output, signal } from '@angular/core';
import { observeChildren } from '../elements/util';

function asNumber(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function isChecked(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value !== 'false' && value !== '0';
  return false;
}

/** Web fallback for Label. On device the core view is Label or nLabel. */
@Component({
  selector: 'Label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (text()) { <span class="t">{{ text() }}</span> }<ng-content />`,
  styles: `
    :host { display: flex; flex-direction: row; align-items: center; color: var(--ns-foreground); font-size: 16px; }
    .t { display: flex; }
  `,
})
export class NsLabel {
  readonly text = input('');
}

/** Web fallback for Image. On device the core view is Image or nImage. */
@Component({
  selector: 'Image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (src()) { <img [src]="src()" [alt]="alt()" /> }`,
  styles: `
    :host { display: flex; }
    img { max-width: 100%; height: auto; }
  `,
})
export class NsImage {
  readonly src = input('');
  readonly alt = input('');
}

/** Web fallback for ScrollView. `orientation` is `vertical` (default) or `horizontal`. */
@Component({
  selector: 'ScrollView',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.orientation]': 'orientation() === "horizontal" ? "horizontal" : "vertical"' },
  template: `<div class="scroller"><ng-content /></div>`,
  styles: `
    :host { display: flex; flex-direction: column; min-height: 0px; }
    .scroller { display: flex; flex-direction: column; flex: 1; overflow-x: hidden; overflow-y: auto; }
    :host([orientation='horizontal']) .scroller { flex-direction: row; overflow-x: auto; overflow-y: hidden; }
  `,
})
export class NsScrollView {
  readonly orientation = input('vertical');
}

/** Web fallback for ActivityIndicator. Hidden until `busy` is set. */
@Component({
  selector: 'ActivityIndicator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.busy]': 'busy() ? "" : null' },
  template: `<div class="spin" role="status" aria-label="Busy"></div>`,
  styles: `
    :host { display: flex; }
    :host(:not([busy])) { display: none; }
    .spin { width: 24px; height: 24px; border: 2px solid var(--ns-border); border-top-color: var(--ns-primary); border-radius: 12px; animation: ns-spin 800ms linear infinite; }
    @keyframes ns-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `,
})
export class NsActivityIndicator {
  readonly busy = input(false, { transform: booleanAttribute });
}

/** Web fallback for Progress. `value` and `max` (default 100). */
@Component({
  selector: 'Progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="track" role="progressbar" [attr.aria-valuenow]="value()" [attr.aria-valuemin]="0" [attr.aria-valuemax]="max()">
      <div class="fill" [style.width.%]="pct()"></div>
    </div>
  `,
  styles: `
    :host { display: flex; }
    .track { display: flex; flex-direction: row; width: 100%; height: 4px; background: var(--ns-border); border-radius: 2px; overflow: hidden; }
    .fill { height: 4px; background: var(--ns-primary); }
  `,
})
export class NsProgress {
  readonly value = input(0, { transform: numberAttribute });
  readonly max = input(100, { transform: numberAttribute });
  protected readonly pct = computed(() => {
    const max = this.max();
    if (max <= 0) return 0;
    return Math.min(100, Math.max(0, (this.value() / max) * 100));
  });
}

/** Web fallback for Switch. Property `checked`; event `checkedChange`. */
@Component({
  selector: 'Switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.checked]': 'on() ? "" : null' },
  template: `
    <button type="button" class="sw" role="switch" [attr.aria-checked]="on()" (click)="toggle()">
      <span class="knob"></span>
    </button>
  `,
  styles: `
    :host { display: flex; }
    .sw { display: flex; flex-direction: row; align-items: center; width: 48px; height: 28px; padding: 2px; border: 0px; border-radius: 14px; background: var(--ns-border); cursor: pointer; }
    .knob { width: 24px; height: 24px; border-radius: 12px; background: var(--ns-card); }
    :host([checked]) .sw { background: var(--ns-primary); justify-content: flex-end; }
  `,
})
export class NsSwitch {
  readonly checked = model<boolean | string>(false);
  protected readonly on = computed(() => isChecked(this.checked()));

  toggle(): void {
    this.checked.set(!this.on());
  }
}

/** Web fallback for Slider. Property `value`; event `valueChange`. */
@Component({
  selector: 'Slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<input type="range" [min]="min()" [max]="max()" [value]="current()" (input)="onInput($event)" />`,
  styles: `
    :host { display: flex; }
    input { flex: 1; width: 100%; }
  `,
})
export class NsSlider {
  readonly min = input(0, { transform: numberAttribute });
  readonly max = input(100, { transform: numberAttribute });
  readonly value = model<number | string>(0);
  protected readonly current = computed(() => asNumber(this.value(), 0));

  onInput(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    this.value.set(asNumber(target.value, 0));
  }
}

/** Web fallback for SearchBar. `hint` is the placeholder. Event `search` carries the text. */
@Component({
  selector: 'SearchBar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="bar" (submit)="onSubmit($event)">
      <input [value]="text()" [placeholder]="hint()" (input)="onInput($event)" />
    </form>
  `,
  styles: `
    :host { display: flex; }
    .bar { display: flex; flex-direction: row; flex: 1; }
    input { flex: 1; width: 100%; padding: 8px 12px; border: 1px solid var(--ns-border); border-radius: var(--ns-radius); background: var(--ns-card); color: var(--ns-foreground); font-size: 16px; }
  `,
})
export class NsSearchBar {
  readonly hint = input('');
  readonly text = model('');
  readonly search = output<string>();

  onInput(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    this.text.set(target.value);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.search.emit(this.text());
  }
}

/**
 * Web fallback for SegmentedBar.
 * Children are `<ns-segmented-bar-item title="Day">`. Property `selectedIndex`; event `selectedIndexChange`.
 */
@Component({
  selector: 'SegmentedBar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bar" role="tablist">
      @for (label of labels(); track $index) {
        <button type="button" class="seg" role="tab" [class.on]="$index === index()" [attr.aria-selected]="$index === index()" (click)="selectedIndex.set($index)">{{ label }}</button>
      }
    </div>
    <div class="source"><ng-content /></div>
  `,
  styles: `
    :host { display: flex; flex-direction: column; }
    .source { display: none; }
    .bar { display: flex; flex-direction: row; padding: 2px; border-radius: 9px; background: var(--ns-accent); }
    .seg { flex: 1; padding: 6px 8px; border: 0px; border-radius: 7px; background: transparent; color: var(--ns-foreground); font-size: 13px; font-weight: 500; cursor: pointer; }
    .seg.on { background: var(--ns-card); color: var(--ns-foreground); }
  `,
})
export class NsSegmentedBar implements OnDestroy {
  readonly selectedIndex = model<number | string>(0);
  protected readonly index = computed(() => asNumber(this.selectedIndex(), 0));
  protected readonly labels = signal<string[]>([]);
  private readonly stop = observeChildren(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, 'ns-segmented-bar-item', (els) => {
    this.labels.set(els.map((el) => el.getAttribute('title') ?? ''));
    for (const el of els) el.hidden = true;
  }, ['title']);

  ngOnDestroy(): void {
    this.stop();
  }
}

/** Web fallback for ListPicker. `items` is a comma-separated list. Property `selectedIndex`. */
@Component({
  selector: 'ListPicker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <select [value]="index()" (change)="onChange($event)">
      @for (item of options(); track $index) {
        <option [value]="$index" [selected]="$index === index()">{{ item }}</option>
      }
    </select>
  `,
  styles: `
    :host { display: flex; }
    select { flex: 1; width: 100%; padding: 8px; border: 1px solid var(--ns-border); border-radius: var(--ns-radius); background: var(--ns-card); color: var(--ns-foreground); font-size: 16px; }
  `,
})
export class NsListPicker {
  readonly items = input('');
  readonly selectedIndex = model<number | string>(0);
  protected readonly options = computed(() => this.items().split(',').map((item) => item.trim()).filter((item) => item.length > 0));
  protected readonly index = computed(() => asNumber(this.selectedIndex(), 0));

  onChange(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    this.selectedIndex.set(asNumber(target.value, 0));
  }
}
