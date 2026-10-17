import type { Type } from '@angular/core';
import type { Route } from '@angular/router';
import type { Token } from 'marked';

/** Route config a page module exports as `routeMeta`, merged into its generated route. */
export type RouteMeta = Omit<Route, 'path' | 'matcher' | 'component' | 'loadComponent' | 'children' | 'loadChildren'>;

export interface RouteModule {
  default?: Type<unknown>;
  routeMeta?: RouteMeta;
}

export type ContentAttributes = Record<string, unknown>;

export type MarkdownToken = Token;

export interface ContentFile<A = ContentAttributes> {
  /** Root-relative path, for example `/src/content/blog/hello.md`. */
  filename: string;
  /** File name without directory and extension, for example `hello`. */
  slug: string;
  /** Parsed front matter. */
  attributes: A;
  /** Markdown body without front matter. */
  content: string;
  /** `marked` lexer output, produced at build time. */
  tokens: MarkdownToken[];
}

export type ContentFileAttributes<A = ContentAttributes> = Pick<ContentFile<A>, 'filename' | 'slug' | 'attributes'>;

export interface ContentModule<A = ContentAttributes> {
  default: ContentFile<A>;
}

/** Filename to lazy loader, as produced by `import.meta.glob`. `.md` files load as `ContentModule`. */
export type RouteFiles = Record<string, () => Promise<RouteModule | ContentModule>>;
