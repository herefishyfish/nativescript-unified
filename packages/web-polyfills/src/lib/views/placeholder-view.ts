import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, afterNextRender, inject, signal } from '@angular/core';

/** Placeholder. Shows a fallback box until a child is projected. On device use Placeholder or nPlaceholder. */
@Component({
  selector: 'Placeholder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="slot"><ng-content /></div>
    @if (empty()) {
      <div class="fallback" part="fallback">No native view yet</div>
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; min-height: 48px; min-width: 120px; }
    .slot:empty { display: none; }
    .fallback {
      display: flex; flex: 1; align-items: center; justify-content: center; padding: 16px;
      border: 2px dashed var(--ns-border); border-radius: var(--ns-radius);
      background: var(--ns-muted); color: var(--ns-muted-foreground); font-size: 14px; text-align: center;
    }
  `,
})
export class NsPlaceholder implements OnDestroy {
  protected readonly empty = signal(true);
  private readonly mo: MutationObserver | undefined;

  constructor() {
    const host = inject(ElementRef<HTMLElement>).nativeElement;
    const read = () => {
      const slot = host.querySelector('.slot');
      this.empty.set(!slot || slot.childElementCount === 0);
    };
    afterNextRender(read);
    if (typeof MutationObserver === 'undefined') return;
    this.mo = new MutationObserver(read);
    this.mo.observe(host, { childList: true, subtree: true });
  }

  ngOnDestroy(): void {
    this.mo?.disconnect();
  }
}
