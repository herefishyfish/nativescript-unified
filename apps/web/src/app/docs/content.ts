import { buildNav, sortDocs } from '@nativescript-unified/shared';
import { DOCS as BUILT, type BuiltDoc } from '~docs';

/** Markdown is parsed at build time by tools/docs-plugin.ts. This module only reads the result. */
export type { BuiltDoc };
export const DOCS: BuiltDoc[] = sortDocs(BUILT);
export const NAV = buildNav(DOCS);

export function findDoc(slug: string): BuiltDoc | undefined {
  return DOCS.find((doc) => doc.slug === slug);
}

/** Previous and next page in nav order. */
export function neighbours(slug: string): { prev?: BuiltDoc; next?: BuiltDoc } {
  const flat = NAV.flatMap((section) => section.pages.map((page) => page.slug));
  const at = flat.indexOf(slug);
  return { prev: at > 0 ? findDoc(flat[at - 1]) : undefined, next: at >= 0 ? findDoc(flat[at + 1] ?? '') : undefined };
}
