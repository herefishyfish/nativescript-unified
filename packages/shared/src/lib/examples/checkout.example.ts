import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircleCheck, lucideLock, lucideMinus, lucidePlus, lucideRotateCcw, lucideTag, lucideTrash2, lucideTruck, lucideX } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSeparator } from '@spartan-ng/helm/separator';

type Tone = 'violet' | 'mint' | 'ocean';

type CartLine = {
  readonly id: string;
  readonly name: string;
  readonly detail: string;
  readonly price: number;
  readonly glyph: string;
  readonly tone: Tone;
  readonly qty: number;
};

type PromoStatus = { readonly ok: boolean; readonly text: string };

const CART: readonly CartLine[] = [
  { id: 'runners', name: 'Trail Runners', detail: 'Size 42 · Slate', price: 129, glyph: 'TR', tone: 'violet', qty: 1 },
  { id: 'socks', name: 'Wool Socks, 3 pack', detail: 'Merino · Charcoal', price: 24, glyph: 'WS', tone: 'mint', qty: 2 },
  { id: 'bottle', name: 'Insulated Bottle', detail: '750 ml · Glacier', price: 34.5, glyph: 'IB', tone: 'ocean', qty: 1 },
];

/** Percent off per promo code. */
const PROMOS: Readonly<Record<string, number>> = { MASON10: 10, SPARTAN20: 20 };

const FREE_SHIPPING_AT = 150;
const SHIPPING = 6.95;

/** A cart with quantity steppers, a free-shipping meter, promo codes and an order summary. */
@Component({
  selector: 'example-checkout',
  imports: [NgIcon, HlmBadge, HlmButton, HlmCardImports, HlmInput, HlmSeparator],
  providers: [provideIcons({ lucideCircleCheck, lucideLock, lucideMinus, lucidePlus, lucideRotateCcw, lucideTag, lucideTrash2, lucideTruck, lucideX })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'example-checkout' },
  template: `
    <div class="example-checkout flex flex-col gap-5 p-4 pb-10 bg-background text-foreground">
      <div class="hero flex flex-col gap-4 p-6 rounded-3xl">
        <div class="flex flex-row items-end justify-between">
          <div class="flex flex-col gap-1">
            <span class="on-hero text-xs font-bold uppercase">Your cart</span>
            <span class="on-hero text-5xl font-extrabold">{{ money(total()) }}</span>
          </div>
          <span class="hero-count text-sm font-semibold px-3 py-1 rounded-full">{{ itemCount() }} {{ itemCount() === 1 ? 'item' : 'items' }}</span>
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex flex-row items-center gap-2">
            <ng-icon name="lucideTruck" size="16" class="on-hero" />
            <span class="on-hero text-sm font-semibold">
              {{ toFreeShipping() > 0 ? money(toFreeShipping()) + ' away from free shipping' : 'Free shipping unlocked' }}
            </span>
          </div>
          <div class="meter-track flex flex-row h-2 rounded-full overflow-hidden">
            <div class="meter-fill basis-0 rounded-full" [style.flexGrow]="shippingProgress()"></div>
            <div class="basis-0" [style.flexGrow]="100 - shippingProgress()"></div>
          </div>
        </div>
      </div>

      @if (placed()) {
        <div hlmCard class="flex flex-col items-center gap-3 p-6 rounded-3xl border-2 border-primary ring-0">
          <ng-icon name="lucideCircleCheck" size="48" class="text-primary" />
          <h3 hlmCardTitle class="text-2xl font-extrabold">Order placed</h3>
          <p hlmCardDescription class="text-center">Order #MK-20418 is on its way. We emailed your receipt.</p>
          <button hlmBtn variant="secondary" class="rounded-full px-4" (click)="restart()">
            <ng-icon name="lucideRotateCcw" size="16" />
            <span>Shop again</span>
          </button>
        </div>
      } @else {
        <div class="flex flex-col gap-3">
          @for (line of lines(); track line.id) {
            <div hlmCard class="flex flex-row gap-3 p-3 rounded-2xl border border-border ring-0">
              <div class="flex items-center justify-center w-16 h-16 rounded-xl" [class]="'tone-' + line.tone">
                <span class="thumb-glyph text-lg font-extrabold">{{ line.glyph }}</span>
              </div>
              <div class="flex flex-col flex-1 gap-2">
                <div class="flex flex-row justify-between gap-2">
                  <div class="flex flex-col flex-1">
                    <span class="text-base font-bold">{{ line.name }}</span>
                    <span class="text-xs text-muted-foreground">{{ line.detail }} · {{ money(line.price) }}</span>
                  </div>
                  <button hlmBtn variant="ghost" size="icon-sm" class="rounded-full text-muted-foreground" aria-label="Remove" (click)="bump(line.id, -line.qty)">
                    <ng-icon name="lucideTrash2" size="16" />
                  </button>
                </div>
                <div class="flex flex-row items-center justify-between">
                  <div class="flex flex-row items-center gap-1 p-1 rounded-full bg-secondary">
                    <button hlmBtn variant="ghost" size="icon-sm" class="rounded-full bg-card text-primary" aria-label="Fewer" (click)="bump(line.id, -1)">
                      <ng-icon name="lucideMinus" size="14" />
                    </button>
                    <span class="text-base font-bold w-8 text-center">{{ line.qty }}</span>
                    <button hlmBtn variant="ghost" size="icon-sm" class="rounded-full bg-card text-primary" aria-label="More" (click)="bump(line.id, 1)">
                      <ng-icon name="lucidePlus" size="14" />
                    </button>
                  </div>
                  <span class="text-lg font-extrabold">{{ money(line.price * line.qty) }}</span>
                </div>
              </div>
            </div>
          } @empty {
            <div hlmCard class="flex flex-col items-center gap-3 p-8 rounded-2xl border border-border ring-0">
              <span class="text-lg font-bold">Your cart is empty</span>
              <button hlmBtn variant="secondary" class="rounded-full px-4" (click)="restart()">
                <ng-icon name="lucideRotateCcw" size="16" />
                <span>Restore cart</span>
              </button>
            </div>
          }
        </div>

        <div hlmCard class="flex flex-col gap-3 p-4 rounded-2xl border border-border ring-0">
          <div class="flex flex-row items-center gap-2">
            <ng-icon name="lucideTag" size="16" class="text-primary" />
            <span class="text-sm font-bold">Promo code</span>
          </div>
          @if (promo(); as code) {
            <div class="flex flex-row items-center justify-between px-3 py-2 rounded-xl bg-accent text-accent-foreground">
              <span class="text-sm font-bold">{{ code }} · {{ promoPercent() }}% off</span>
              <button hlmBtn variant="ghost" size="icon-xs" aria-label="Remove code" (click)="removePromo()">
                <ng-icon name="lucideX" size="16" />
              </button>
            </div>
          } @else {
            <div class="flex flex-row gap-2">
              <input hlmInput #promoInput class="flex-1 h-11 px-3 rounded-xl" placeholder="Try MASON10" (input)="promoDraft.set(promoInput.value)" />
              <button hlmBtn class="h-11 px-5 rounded-xl font-bold" (click)="applyPromo()">Apply</button>
            </div>
          }
          @if (promoStatus(); as status) {
            <span class="text-xs font-semibold" [class.success]="status.ok" [class.text-destructive]="!status.ok">{{ status.text }}</span>
          }
        </div>

        <div hlmCard class="flex flex-col gap-3 p-4 rounded-2xl border border-border ring-0">
          <div class="flex flex-row justify-between">
            <span class="text-sm text-muted-foreground">Subtotal</span>
            <span class="text-sm font-semibold">{{ money(subtotal()) }}</span>
          </div>
          @if (discount() > 0) {
            <div class="flex flex-row justify-between">
              <span class="success text-sm">Discount ({{ promo() }})</span>
              <span class="success text-sm font-semibold">-{{ money(discount()) }}</span>
            </div>
          }
          <div class="flex flex-row justify-between">
            <span class="text-sm text-muted-foreground">Shipping</span>
            @if (shipping() === 0) {
              <span hlmBadge>Free</span>
            } @else {
              <span class="text-sm font-semibold">{{ money(shipping()) }}</span>
            }
          </div>
          <div hlmSeparator class="h-px w-full"></div>
          <div class="flex flex-row items-end justify-between">
            <span class="text-base font-bold">Total</span>
            <span class="text-3xl font-extrabold text-primary">{{ money(total()) }}</span>
          </div>
        </div>

        @if (lines().length > 0) {
          <button hlmBtn size="lg" class="pay h-14 rounded-2xl text-base font-bold" (click)="placed.set(true)">
            <ng-icon name="lucideLock" size="18" />
            <span>Pay {{ money(total()) }}</span>
          </button>
        }
      }
    </div>
  `,
})
export class CheckoutExample {
  protected readonly lines = signal<readonly CartLine[]>(CART);
  protected readonly promoDraft = signal('');
  protected readonly promo = signal<string | null>(null);
  protected readonly promoStatus = signal<PromoStatus | null>(null);
  protected readonly placed = signal(false);

  protected readonly itemCount = computed(() => this.lines().reduce((sum, line) => sum + line.qty, 0));
  protected readonly subtotal = computed(() => this.lines().reduce((sum, line) => sum + line.price * line.qty, 0));
  protected readonly promoPercent = computed(() => {
    const code = this.promo();
    return code ? PROMOS[code] : 0;
  });
  protected readonly discount = computed(() => (this.subtotal() * this.promoPercent()) / 100);
  protected readonly afterDiscount = computed(() => this.subtotal() - this.discount());
  protected readonly shipping = computed(() => (this.afterDiscount() >= FREE_SHIPPING_AT || this.lines().length === 0 ? 0 : SHIPPING));
  protected readonly total = computed(() => this.afterDiscount() + this.shipping());
  protected readonly toFreeShipping = computed(() => Math.max(0, FREE_SHIPPING_AT - this.afterDiscount()));
  protected readonly shippingProgress = computed(() => Math.min(100, Math.round((this.afterDiscount() / FREE_SHIPPING_AT) * 100)));

  protected money(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  protected bump(id: string, delta: number): void {
    this.lines.update((lines) =>
      lines.map((line) => (line.id === id ? { ...line, qty: line.qty + delta } : line)).filter((line) => line.qty > 0),
    );
  }

  protected applyPromo(): void {
    const code = this.promoDraft().trim().toUpperCase();
    if (!code) {
      this.promoStatus.set({ ok: false, text: 'Enter a promo code first.' });
    } else if (code in PROMOS) {
      this.promo.set(code);
      this.promoStatus.set({ ok: true, text: `Nice! ${PROMOS[code]}% off your order.` });
    } else {
      this.promoStatus.set({ ok: false, text: `${code} is not a valid code. Try MASON10 or SPARTAN20.` });
    }
  }

  protected removePromo(): void {
    this.promo.set(null);
    this.promoDraft.set('');
    this.promoStatus.set(null);
  }

  protected restart(): void {
    this.lines.set(CART);
    this.placed.set(false);
  }
}
