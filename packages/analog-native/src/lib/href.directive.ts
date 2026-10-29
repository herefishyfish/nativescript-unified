import { Directive, ElementRef, HostListener, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { RouterExtensions } from '@nativescript/angular';
import { Utils } from '@nativescript/core';

const EXTERNAL_URL = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

/**
 * Makes `<a href>` on MasonKit route app paths through the Angular router and open external URLs.
 *
 * MasonKit's own `<a>` opens its `href` with `Utils.openUrl` on click, but an app may back `a` with
 * another element (spartan's native layer uses a block), so the directive opens external URLs
 * itself. For app paths it clears the element's `href`, so MasonKit has nothing to open, and
 * navigates with `RouterExtensions` instead.
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
    // Cleared for every URL: the click handler opens it, and MasonKit's `<a>` would open it a second time.
    this.element.href = '';
  }

  @HostListener('click')
  navigate(): void {
    const href = this.target;
    if (!href || href.startsWith('#')) {
      return;
    }
    if (EXTERNAL_URL.test(href)) {
      Utils.openUrl(href.startsWith('//') ? `https:${href}` : href);
      return;
    }
    const url = new URL(href, `app://local${this.router.url}`);
    void this.routerExtensions.navigateByUrl(`${url.pathname}${url.search}${url.hash}`);
  }
}
