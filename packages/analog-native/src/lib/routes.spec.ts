import type { Type } from '@angular/core';
import type { Route } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { CONTENT_ROUTE_DATA, createRoutes } from './routes';
import type { ContentFile, RouteFiles, RouteMeta } from './types';

const components = new Map<string, Type<unknown>>();
function component(name: string): Type<unknown> {
  let type = components.get(name);
  if (!type) {
    type = { [name]: class {} }[name];
    components.set(name, type);
  }
  return type;
}

function page(name: string, routeMeta?: RouteMeta) {
  return () => Promise.resolve({ default: component(name), routeMeta });
}

function markdown(slug: string, attributes: Record<string, unknown>) {
  const file: ContentFile = { filename: `/src/app/pages/${slug}.md`, slug, attributes, content: '# Hi', tokens: [] };
  return () => Promise.resolve({ default: file });
}

interface ResolvedRoute {
  path: string | undefined;
  component?: string;
  children?: ResolvedRoute[];
}

/** Loads every lazy route and flattens Analog's `loadChildren -> [{ path: '' }]` wrapper. */
async function resolve(routes: Route[]): Promise<ResolvedRoute[]> {
  return Promise.all(
    routes.map(async (route) => {
      if (!route.loadChildren) {
        return { path: route.path, children: route.children && (await resolve(route.children)) };
      }
      const [loaded] = (await route.loadChildren()) as Route[];
      expect(loaded.path).toBe('');
      return {
        path: route.path,
        component: loaded.component?.name,
        ...(loaded.children ? { children: await resolve(loaded.children) } : {}),
      };
    }),
  );
}

const MarkdownPage = component('MarkdownPage');

describe('createRoutes', () => {
  it('maps each file convention to its Angular path', async () => {
    const files: RouteFiles = {
      '/src/app/pages/index.page.ts': page('Home'),
      '/src/app/pages/about.page.ts': page('About'),
      '/src/app/pages/blog/[slug].page.ts': page('Post'),
      '/src/app/pages/(auth)/login.page.ts': page('Login'),
      '/src/app/pages/[...notfound].page.ts': page('NotFound'),
      '/src/app/pages/docs.md': markdown('docs', { title: 'Docs' }),
    };

    const routes = await resolve(createRoutes(files, { markdownComponent: MarkdownPage }));

    const expected = [
      { path: '', children: [{ path: 'login', component: 'Login' }] },
      { path: '', component: 'Home' },
      { path: 'about', component: 'About' },
      { path: 'docs', component: 'MarkdownPage' },
      { path: 'blog', children: [{ path: ':slug', component: 'Post' }] },
      { path: '**', component: 'NotFound' },
    ];
    expect(routes).toHaveLength(expected.length);
    expect(routes).toEqual(expect.arrayContaining(expected));
  });

  it('nests pages under a same-named layout page', async () => {
    const files: RouteFiles = {
      '/src/app/pages/products.page.ts': page('ProductsLayout'),
      '/src/app/pages/products/index.page.ts': page('ProductList'),
      '/src/app/pages/products/[id].page.ts': page('ProductDetail'),
    };

    expect(await resolve(createRoutes(files))).toEqual([
      {
        path: 'products',
        component: 'ProductsLayout',
        children: [
          { path: '', component: 'ProductList' },
          { path: ':id', component: 'ProductDetail' },
        ],
      },
    ]);
  });

  it('orders static segments before params before the wildcard, whatever the input order', async () => {
    const files: RouteFiles = {
      '/src/app/pages/[...rest].page.ts': page('Rest'),
      '/src/app/pages/[id].page.ts': page('Id'),
      '/src/app/pages/zebra.page.ts': page('Zebra'),
      '/src/app/pages/blog/[...rest].page.ts': page('BlogRest'),
      '/src/app/pages/blog/[slug].page.ts': page('BlogPost'),
      '/src/app/pages/blog/archive.page.ts': page('BlogArchive'),
    };

    const routes = await resolve(createRoutes(files));

    expect(routes.map((route) => route.path)).toEqual(['zebra', 'blog', ':id', '**']);
    expect(routes.find((route) => route.path === 'blog')?.children?.map((route) => route.path)).toEqual([
      'archive',
      ':slug',
      '**',
    ]);
  });

  it('renders Markdown routes with the given component and passes the content file as route data', async () => {
    const routes = createRoutes(
      { '/src/app/pages/docs.md': markdown('docs', { title: 'Docs' }) },
      { markdownComponent: MarkdownPage },
    );

    const [loaded] = (await routes[0].loadChildren?.()) as Route[];

    expect(loaded.component).toBe(MarkdownPage);
    expect(loaded.title).toBe('Docs');
    expect((loaded.data?.[CONTENT_ROUTE_DATA] as ContentFile).slug).toBe('docs');
  });

  it('fails loudly when a Markdown route has no component to render it', async () => {
    const routes = createRoutes({ '/src/app/pages/docs.md': markdown('docs', {}) });

    await expect(routes[0].loadChildren?.() as Promise<unknown>).rejects.toThrow(/docs\.md is a Markdown route/);
  });

  it('merges routeMeta into the page route', async () => {
    const routes = createRoutes({
      '/src/app/pages/about.page.ts': page('About', { title: 'About us', data: { section: 'info' } }),
      '/src/app/pages/old.page.ts': page('Old', { redirectTo: '/about', pathMatch: 'full' }),
    });

    const [about] = (await routes[0].loadChildren?.()) as Route[];
    const [old] = (await routes[1].loadChildren?.()) as Route[];

    expect(about).toMatchObject({ component: component('About'), title: 'About us', data: { section: 'info' } });
    expect(old).toEqual({ path: '', redirectTo: '/about', pathMatch: 'full' });
  });

  it('returns no routes for no files', () => {
    expect(createRoutes({})).toEqual([]);
  });

  it('serves a markdown index and a param page as siblings under a componentless parent', async () => {
    const routes = await resolve(
      createRoutes(
        {
          '/src/app/pages/docs/index.md': markdown('index', { title: 'Docs' }),
          '/src/app/pages/docs/[slug].page.ts': page('Doc'),
        },
        { markdownComponent: MarkdownPage },
      ),
    );

    expect(routes).toEqual([
      {
        path: 'docs',
        children: [
          { path: '', component: 'MarkdownPage' },
          { path: ':slug', component: 'Doc' },
        ],
      },
    ]);
  });

  it('nests a param page under a same-named markdown file, which makes that file a layout', async () => {
    const routes = await resolve(
      createRoutes(
        {
          '/src/app/pages/docs.md': markdown('docs', { title: 'Docs' }),
          '/src/app/pages/docs/[slug].page.ts': page('Doc'),
        },
        { markdownComponent: MarkdownPage },
      ),
    );

    expect(routes).toEqual([
      {
        path: 'docs',
        component: 'MarkdownPage',
        children: [{ path: ':slug', component: 'Doc' }],
      },
    ]);
  });
});
