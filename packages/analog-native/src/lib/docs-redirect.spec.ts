// @vitest-environment jsdom
import { Component, provideZonelessChangeDetection, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { provideRouter, Router, type ActivatedRouteSnapshot } from '@angular/router';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createRoutes } from './routes';
import type { ContentFile, RouteFiles, RouteMeta } from './types';

@Component({ selector: 'docs-index', template: '' })
class DocsIndex {}

@Component({ selector: 'doc-page', template: '' })
class DocPage {}

@Component({ selector: 'guide-index', template: '' })
class GuideIndex {}

@Component({ selector: 'not-found', template: '' })
class NotFound {}

/** Same redirect the native `/guide/:slug` page exports. */
const guideSlugRedirect: RouteMeta = {
  pathMatch: 'full',
  redirectTo: ({ params }) => `/docs/${params['slug']}`,
};

function page(type: Type<unknown>, routeMeta?: RouteMeta) {
  return () => Promise.resolve({ default: type, routeMeta });
}

function markdown(slug: string) {
  const file: ContentFile = {
    filename: `/src/app/pages/docs/${slug}.md`,
    slug,
    attributes: { title: 'Docs' },
    content: '# Docs',
    tokens: [],
  };
  return () => Promise.resolve({ default: file });
}

function setup(files: RouteFiles) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      provideRouter(createRoutes(files, { markdownComponent: DocsIndex })),
    ],
  });
  return TestBed.inject(Router);
}

describe('native docs urls', () => {
  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
  });

  afterEach(() => TestBed.resetTestingModule());

  it('serves /docs and /docs/:slug, and redirects /guide/:slug without dropping /guide', async () => {
    const router = setup({
      '/src/app/pages/docs/index.md': markdown('index'),
      '/src/app/pages/docs/[slug].page.ts': page(DocPage),
      '/src/app/pages/guide/index.page.ts': page(GuideIndex),
      '/src/app/pages/guide/[slug].page.ts': page(class GuideSlugRedirect {}, guideSlugRedirect),
    });

    await router.navigateByUrl('/guide/ui-button');
    expect(router.url).toBe('/docs/ui-button');
    expect(activatedComponent(router)).toBe(DocPage);
    expect(leaf(router).paramMap.get('slug')).toBe('ui-button');

    await router.navigateByUrl('/docs/components#native-status');
    expect(router.url).toBe('/docs/components#native-status');
    expect(activatedComponent(router)).toBe(DocPage);
    expect(leaf(router).paramMap.get('slug')).toBe('components');

    await router.navigateByUrl('/docs');
    expect(router.url).toBe('/docs');
    expect(activatedComponent(router)).toBe(DocsIndex);

    await router.navigateByUrl('/guide');
    expect(router.url).toBe('/guide');
    expect(activatedComponent(router)).toBe(GuideIndex);
  });

  it('cannot use a string redirectTo for :slug, because that param belongs to the parent route', async () => {
    const router = setup({
      '/src/app/pages/docs/[slug].page.ts': page(DocPage),
      '/src/app/pages/guide/[slug].page.ts': page(class GuideSlugRedirect {}, {
        pathMatch: 'full',
        redirectTo: '/docs/:slug',
      }),
      '/src/app/pages/[...notfound].page.ts': page(NotFound),
    });

    await expect(router.navigateByUrl('/guide/ui-button')).rejects.toThrow(/:slug/);
  });
});

function leaf(router: Router): ActivatedRouteSnapshot {
  let route = router.routerState.snapshot.root;
  while (route.firstChild) {
    route = route.firstChild;
  }
  return route;
}

function activatedComponent(router: Router): Type<unknown> | undefined {
  return leaf(router).component ?? undefined;
}
