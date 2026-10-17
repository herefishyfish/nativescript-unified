import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

const KEY = 'ns-unified-theme';

/**
 * Web core: dark mode is the `dark` class on <html>, set before first paint by the inline script in index.html.
 * Native uses `ns-dark` on its root view instead.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  readonly dark = signal(this.doc.documentElement.classList.contains('dark'));

  toggle(): void {
    const next = !this.dark();
    this.dark.set(next);
    this.doc.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem(KEY, next ? 'dark' : 'light');
    } catch {
      /* storage unavailable */
    }
  }
}