import type { RouteMeta } from '@nativescript-unified/analog-native';

/**
 * `/guide/:slug` used to be the docs page. Shared Markdown links `/docs/:slug`, so this redirects there.
 *
 * The file router mounts `routeMeta` on the empty-path child of `:slug`. A string `redirectTo` only
 * substitutes positional params of that empty path, which has none. The redirect function receives the
 * snapshot, and an empty path inherits the parent `:slug`.
 */
export const routeMeta: RouteMeta = {
  pathMatch: 'full',
  redirectTo: ({ params }) => `/docs/${params['slug']}`,
};

export default class GuideSlugRedirect {}
