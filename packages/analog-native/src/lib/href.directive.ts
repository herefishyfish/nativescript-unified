import { Directive, ElementRef, HostListener, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { RouterExtensions } from '@nativescript/angular';

const EXTERNAL_URL = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

/**
 * Makes `<a href>` on MasonKit route app paths through the Angular router.
 *
 * MasonKit's `<a>` opens its `href` with `Utils.openUrl` on click. External URLs keep that
 * behaviour. For app paths the directive clears the element's `href`, so MasonKit has
 * nothing to open, and navigates with `RouterExtensions` instead.
 */
@Directive({ selector: 'a[href]' })
export class HrefDirective {
  private readonly element = inject<ElementRef<{ href: string }>>(ElementRef).nativeElement;
  private readonly router = inject(Router);
  private readonly routerExtensions = inject(RouterExtensions);
  private target = '';

  // A setter rather than a signal input plus effect: the element must be updated as soon
  // as Angular writes the value, before MasonKit can act on a tap.
  @Input({ required: true })
  set href(value: string | null | undefined) {
    this.target = value ?? '';
    this.element.href = EXTERNAL_URL.test(this.target) ? this.target : '';
  }

  @HostListener('click')
  navigate(): void {
    const href = this.target;
    if (!href || href.startsWith('#') || EXTERNAL_URL.test(href)) {
      return;
    }
    const url = new URL(href, `app://local${this.router.url}`);
    void this.routerExtensions.navigateByUrl(`${url.pathname}${url.search}${url.hash}`);
  }
}
