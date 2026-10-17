/** Client safe docs types and helpers. No runtime dependencies. */
export interface DocMeta {
  slug: string;
  title: string;
  section: string;
  order: number;
  description: string;
}

export interface NavSection {
  title: string;
  pages: DocMeta[];
}
export function sortDocs<T extends DocMeta>(pages: readonly T[]): T[] {
  return [...pages].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

/** Sections ordered by their first page. */
export function buildNav(pages: readonly DocMeta[]): NavSection[] {
  const sections = new Map<string, DocMeta[]>();
  for (const page of sortDocs(pages)) {
    const list = sections.get(page.section) ?? [];
    list.push(page);
    sections.set(page.section, list);
  }
  return [...sections].map(([title, list]) => ({ title, pages: list }));
}
