import { ChangeDetectionStrategy, Component, ElementRef, afterEveryRender, booleanAttribute, computed, inject, input, model, output } from '@angular/core';

function optNum(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function pad2(n: number): string {
  return String(Math.trunc(n)).padStart(2, '0');
}

function itemList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (typeof value !== 'string' || value.trim() === '') return [];
  return value.split(',').map((item) => item.trim()).filter((item) => item.length > 0);
}

function dateBound(value: string | Date): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`;
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  return null;
}

function clockText(hour: unknown, minute: unknown): string {
  const h = optNum(hour);
  const m = optNum(minute);
  if (h == null || m == null || h < 0 || h > 23 || m < 0 || m > 59) return '';
  return `${pad2(h)}:${pad2(m)}`;
}

function clockBound(hour: unknown, minute: unknown, fallbackMinute: number): string | null {
  const h = optNum(hour);
  if (h == null) return null;
  const m = optNum(minute) ?? fallbackMinute;
  return `${pad2(h)}:${pad2(m)}`;
}

/** Web fallback for ContentView. The single child stays in the element. */
@Component({
  selector: 'ContentView',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styles: `:host { display: flex; flex-direction: column; }`,
})
export class NsContentView {}

/** Web fallback for DatePicker. `month` and `day` start at 1. Event `dateChange` carries `YYYY-MM-DD`. */
@Component({
  selector: 'DatePicker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<input type="date" [attr.min]="minBound()" [attr.max]="maxBound()" [value]="iso()" (input)="onInput($event)" />`,
  styles: `
    :host { display: flex; }
    input { flex: 1; width: 100%; padding: 8px 12px; border: 1px solid var(--ns-border); border-radius: var(--ns-radius); background: var(--ns-card); color: var(--ns-foreground); font-size: 16px; }
  `,
})
export class NsDatePicker {
  readonly year = model<number | string | null>(null);
  readonly month = model<number | string | null>(null);
  readonly day = model<number | string | null>(null);
  readonly minDate = input<string | Date>('');
  readonly maxDate = input<string | Date>('');
  readonly dateChange = output<string>();
  protected readonly iso = computed(() => {
    const y = optNum(this.year());
    const m = optNum(this.month());
    const d = optNum(this.day());
    if (y == null || m == null || d == null || m < 1 || m > 12 || d < 1 || d > 31) return '';
    return `${pad2(y)}-${pad2(m)}-${pad2(d)}`;
  });
  protected readonly minBound = computed(() => dateBound(this.minDate()));
  protected readonly maxBound = computed(() => dateBound(this.maxDate()));

  onInput(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(target.value);
    if (!match) return;
    this.year.set(Number(match[1]));
    this.month.set(Number(match[2]));
    this.day.set(Number(match[3]));
    this.dateChange.emit(target.value);
  }
}

/** Web fallback for TimePicker. Event `timeChange` carries `HH:MM`. */
@Component({
  selector: 'TimePicker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<input type="time" [attr.min]="minClock()" [attr.max]="maxClock()" [value]="clock()" (input)="onInput($event)" />`,
  styles: `
    :host { display: flex; }
    input { flex: 1; width: 100%; padding: 8px 12px; border: 1px solid var(--ns-border); border-radius: var(--ns-radius); background: var(--ns-card); color: var(--ns-foreground); font-size: 16px; }
  `,
})
export class NsTimePicker {
  readonly hour = model<number | string | null>(null);
  readonly minute = model<number | string | null>(null);
  readonly minHour = input<number | string | null>(null);
  readonly maxHour = input<number | string | null>(null);
  readonly minMinute = input<number | string | null>(null);
  readonly maxMinute = input<number | string | null>(null);
  readonly timeChange = output<string>();
  protected readonly clock = computed(() => clockText(this.hour(), this.minute()));
  protected readonly minClock = computed(() => clockBound(this.minHour(), this.minMinute(), 0));
  protected readonly maxClock = computed(() => clockBound(this.maxHour(), this.maxMinute(), 59));

  onInput(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const match = /^(\d{2}):(\d{2})/.exec(target.value);
    if (!match) return;
    this.hour.set(Number(match[1]));
    this.minute.set(Number(match[2]));
    this.timeChange.emit(`${match[1]}:${match[2]}`);
  }
}

/** Web fallback for HtmlView. `html` is the markup. `selectable` allows text selection. */
@Component({
  selector: 'HtmlView',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.selectable]': 'selectable() ? "" : null' },
  template: `<div class="html" [innerHTML]="html()"></div>`,
  styles: `
    :host { display: flex; flex-direction: column; color: var(--ns-foreground); user-select: none; }
    :host([selectable]) { user-select: text; }
    .html { display: flex; flex-direction: column; }
  `,
})
export class NsHtmlView {
  readonly html = input('');
  readonly selectable = input(false, { transform: booleanAttribute });
}

/** Web fallback for ListView. `items` is a comma-separated list or an array. Event `itemTap` carries the index. */
@Component({
  selector: 'ListView',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="list" role="list">
      @for (item of rows(); track $index) {
        <button type="button" class="row" role="listitem" (click)="pick($index)">{{ item }}</button>
      }
    </div>
  `,
  styles: `
    :host { display: flex; flex-direction: column; width: 100%; }
    .list { display: flex; flex-direction: column; width: 100%; }
    .row { display: flex; padding: 10px 14px; border: 0px; border-bottom: 1px solid var(--ns-border); background: transparent; color: var(--ns-foreground); font-size: 16px; text-align: left; cursor: pointer; }
  `,
})
export class NsListView {
  readonly items = input<string | readonly string[]>('');
  readonly itemTap = output<number>();
  protected readonly rows = computed(() => itemList(this.items()));

  pick(index: number): void {
    this.itemTap.emit(index);
  }
}

/** Web fallback for Repeater. `items` is a comma-separated list or an array, stacked vertically. */
@Component({
  selector: 'Repeater',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stack">
      @for (item of rows(); track $index) {
        <div class="row">{{ item }}</div>
      }
    </div>
  `,
  styles: `
    :host { display: flex; flex-direction: column; }
    .stack { display: flex; flex-direction: column; }
    .row { display: flex; padding: 8px 0px; color: var(--ns-foreground); }
  `,
})
export class NsRepeater {
  readonly items = input<string | readonly string[]>('');
  protected readonly rows = computed(() => itemList(this.items()));
}

/**
 * Web fallback for WebView.
 * `src` is a URL, or an HTML string when it contains a tag.
 * The frame document is assigned directly. Angular would reject the HTML string as a resource URL.
 */
@Component({
  selector: 'WebView',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<iframe title="WebView"></iframe>`,
  styles: `
    :host { display: flex; }
    iframe { flex: 1; width: 100%; min-height: 120px; border: 1px solid var(--ns-border); border-radius: var(--ns-radius); background: var(--ns-card); }
  `,
})
export class NsWebView {
  readonly src = input('');

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef);
    afterEveryRender(() => {
      const frame = host.nativeElement.querySelector('iframe');
      if (!(frame instanceof HTMLIFrameElement)) return;
      const value = this.src().trim();
      if (value.includes('<')) {
        frame.removeAttribute('src');
        if (frame.srcdoc !== value) frame.srcdoc = value;
      } else if (value) {
        frame.srcdoc = '';
        if (frame.getAttribute('src') !== value) frame.setAttribute('src', value);
      }
    });
  }
}
