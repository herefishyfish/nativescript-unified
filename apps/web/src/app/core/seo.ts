import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SITE_NAME, SITE_URL } from './site';

export interface PageSeo {
  /** Page title without the site suffix. Omit for the home page. */
  title?: string;
  description: string;
  /** Absolute path such as /docs/introduction. */
  path: string;
  /** Keep the page out of search indexes (404). */
  noindex?: boolean;
}

/** Per-page head handling. Runs during prerender, so the static HTML carries title, description, canonical and Open Graph tags. */
@Injectable({ providedIn: 'root' })
export class Seo {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  set(page: PageSeo): void {
    const title = page.title ? `${page.title} | ${SITE_NAME}` : `${SITE_NAME}: HTML-first NativeScript`;
    const url = SITE_URL + (page.path === '/' ? '/' : page.path.replace(/\/+$/, ''));
    this.title.setTitle(title);
    const tags: Record<string, string> = {
      description: page.description,
      robots: page.noindex ? 'noindex, follow' : 'index, follow',
      'og:title': title,
      'og:description': page.description,
      'og:url': url,
      'og:type': 'website',
      'og:site_name': SITE_NAME,
      'twitter:card': 'summary',
      'twitter:title': title,
      'twitter:description': page.description,
    };
    for (const [name, content] of Object.entries(tags)) {
      const attr = name.startsWith('og:') ? 'property' : 'name';
      this.meta.updateTag({ [attr]: name, content }, `${attr}="${name}"`);
    }
    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}