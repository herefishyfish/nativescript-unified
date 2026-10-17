import { buildNav, parseDoc, sortDocs, type DocPage } from '@nativescript-unified/shared';

/** Markdown lives in packages/shared so native can reuse the same files. */
const files = import.meta.glob('../../../../../packages/shared/content/docs/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const DOCS: DocPage[] = sortDocs(Object.entries(files).map(([filename, raw]) => parseDoc(filename, raw)));
export const NAV = buildNav(DOCS);

export function findDoc(slug: string): DocPage | undefined {
  return DOCS.find((doc) => doc.slug === slug);
}

/** Previous and next page in nav order. */
export function neighbours(slug: string): { prev?: DocPage; next?: DocPage } {
  const flat = NAV.flatMap((section) => section.pages.map((page) => page.slug));
  const at = flat.indexOf(slug);
  return { prev: at > 0 ? findDoc(flat[at - 1]) : undefined, next: at >= 0 ? findDoc(flat[at + 1] ?? '') : undefined };
}