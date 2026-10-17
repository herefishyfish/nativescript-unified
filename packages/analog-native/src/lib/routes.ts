import type { Type } from '@angular/core';
import type { Route } from '@angular/router';
import type { ContentModule, RouteFiles, RouteModule } from './types';

/** Route `data` key that holds the `ContentFile` of a Markdown route. */
export const CONTENT_ROUTE_DATA = 'nsAnalogContent';

export interface CreateRoutesOptions {
  /** Renders `.md` routes. It reads the content from route data under `CONTENT_ROUTE_DATA`. */
  markdownComponent?: Type<unknown>;
}

interface RawRoute {
  filename: string | null;
  rawSegment: string;
  ancestorRawSegments: string[];
  segment: string;
  level: number;
  children: RawRoute[];
}

/**
 * Builds Angular routes from page files, following Analog's file conventions:
 * `index` is the empty path, `[id]` a param, `[...rest]` the wildcard, `(group)` adds no
 * segment, and `products.page.ts` next to `products/` is a layout for its children.
 */
export function createRoutes(files: RouteFiles, options: CreateRoutesOptions = {}): Route[] {
  const levels = new Map<number, Map<string, RawRoute>>();
  const atLevel = (level: number) => {
    let routes = levels.get(level);
    if (!routes) {
      routes = new Map();
      levels.set(level, routes);
    }
    return routes;
  };

  for (const filename of Object.keys(files)) {
    const rawSegments = toRawPath(filename).split('/');
    const level = rawSegments.length - 1;
    const rawSegment = rawSegments[level];
    atLevel(level).set(rawSegments.join('/'), {
      filename,
      rawSegment,
      ancestorRawSegments: rawSegments.slice(0, level),
      segment: toSegment(rawSegment),
      level,
      children: [],
    });
  }
  if (levels.size === 0) {
    return [];
  }

  for (let level = Math.max(...levels.keys()); level > 0; level--) {
    for (const rawRoute of atLevel(level).values()) {
      const parentRawPath = rawRoute.ancestorRawSegments.join('/');
      const parents = atLevel(level - 1);
      let parent = parents.get(parentRawPath);
      if (!parent) {
        const parentRawSegment = rawRoute.ancestorRawSegments[level - 1];
        parent = {
          filename: null,
          rawSegment: parentRawSegment,
          ancestorRawSegments: rawRoute.ancestorRawSegments.slice(0, level - 1),
          segment: toSegment(parentRawSegment),
          level: level - 1,
          children: [],
        };
        parents.set(parentRawPath, parent);
      }
      parent.children.push(rawRoute);
    }
  }

  const rawRoutes = [...atLevel(0).values()];
  sortRawRoutes(rawRoutes);
  return toRoutes(rawRoutes, files, options);
}

function toRawPath(filename: string): string {
  return filename
    .replace(/^(?:[a-zA-Z]:[\\/])?(.*?)[\\/](?:routes|pages)[\\/]|(\.page\.(js|ts)$)|(\.(ts|md)$)/g, '')
    .replace(/\[\.{3}.+\]/, '**')
    .replace(/\[([^\]]+)\]/g, ':$1');
}

function toSegment(rawSegment: string): string {
  return rawSegment
    .replace(/\bindex\b|\(.*?\)/g, '')
    .replace(/\.|\/+/g, '/')
    .replace(/^\/+|\/+$/g, '');
}

function toRoutes(rawRoutes: RawRoute[], files: RouteFiles, options: CreateRoutesOptions): Route[] {
  return rawRoutes.map((rawRoute) => {
    const children = rawRoute.children.length > 0 ? toRoutes(rawRoute.children, files, options) : undefined;
    const { filename } = rawRoute;
    if (!filename) {
      return { path: rawRoute.segment, children };
    }
    const load = files[filename];
    const toRoute = filename.endsWith('.md')
      ? (module: RouteModule | ContentModule) => markdownRoute(filename, module as ContentModule, options, children)
      : (module: RouteModule | ContentModule) => pageRoute(module as RouteModule, children);
    return {
      path: rawRoute.segment,
      loadChildren: () => load().then((module) => [toRoute(module)]),
    };
  });
}

function pageRoute(module: RouteModule, children: Route[] | undefined): Route {
  if (module.routeMeta?.redirectTo !== undefined) {
    return { path: '', ...module.routeMeta };
  }
  return { path: '', component: module.default, ...module.routeMeta, children };
}

function markdownRoute(
  filename: string,
  module: ContentModule,
  options: CreateRoutesOptions,
  children: Route[] | undefined,
): Route {
  if (!options.markdownComponent) {
    throw new Error(`[@nativescript-unified/analog-native] ${filename} is a Markdown route, but createRoutes() got no markdownComponent.`);
  }
  const content = module.default;
  const title = content.attributes['title'];
  return {
    path: '',
    component: options.markdownComponent,
    data: { [CONTENT_ROUTE_DATA]: content },
    ...(typeof title === 'string' ? { title } : {}),
    children,
  };
}

/** Static segments first, then `:param`, then `**`; recursively. */
function sortRawRoutes(rawRoutes: RawRoute[]): void {
  rawRoutes.sort((a, b) => {
    let segmentA = deprioritizeSegment(a.segment);
    let segmentB = deprioritizeSegment(b.segment);
    if (a.children.length > b.children.length) {
      segmentA = `~${segmentA}`;
    } else if (a.children.length < b.children.length) {
      segmentB = `~${segmentB}`;
    }
    return segmentA > segmentB ? 1 : -1;
  });
  for (const rawRoute of rawRoutes) {
    sortRawRoutes(rawRoute.children);
  }
}

function deprioritizeSegment(segment: string): string {
  return segment.replace(':', '~~').replace('**', '~~~~');
}
