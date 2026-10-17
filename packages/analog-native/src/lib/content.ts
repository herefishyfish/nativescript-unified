import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, from, map, Observable, switchMap } from 'rxjs';
import { contentAttributeFiles, contentFiles } from './files';
import type { ContentAttributes, ContentFile, ContentFileAttributes } from './types';

/** Front matter of every content file, loaded eagerly at build time. Bodies stay unloaded. */
export function injectContentFiles<A = ContentAttributes>(
  filterFn?: (file: ContentFileAttributes<A>) => boolean,
): ContentFileAttributes<A>[] {
  const files = Object.values(contentAttributeFiles()) as ContentFileAttributes<A>[];
  return filterFn ? files.filter(filterFn) : files;
}

export type InjectContentOptions =
  | string
  | { param: string; subdirectory?: string }
  | { customFilename: string };

/**
 * Loads one content file. By default it reads the `slug` route param and loads
 * `/src/content/<slug>.md`; `{ param, subdirectory }` looks in a subdirectory, and
 * `{ customFilename }` loads a fixed file.
 */
export function injectContent<A = ContentAttributes>(
  options: InjectContentOptions = 'slug',
  fallback = 'No Content Found',
): Observable<ContentFile<A>> {
  if (typeof options === 'object' && 'customFilename' in options) {
    return from(loadContent<A>(options.customFilename, fallback));
  }
  const { param, subdirectory } = typeof options === 'string' ? { param: options, subdirectory: undefined } : options;
  return inject(ActivatedRoute).paramMap.pipe(
    map((params) => params.get(param)),
    filter((slug): slug is string => slug !== null),
    switchMap((slug) => loadContent<A>(subdirectory ? `${subdirectory}/${slug}` : slug, fallback)),
  );
}

async function loadContent<A>(path: string, fallback: string): Promise<ContentFile<A>> {
  const files = contentFiles();
  const relative = `/${path}.md`;
  const key = Object.keys(files).find((filename) => filename === `/src/content${relative}`) ??
    Object.keys(files).find((filename) => filename.endsWith(relative));
  if (key) {
    return (await files[key]()).default as ContentFile<A>;
  }
  return {
    filename: '',
    slug: path.split('/').pop() ?? path,
    attributes: {} as A,
    content: fallback,
    tokens: [{ type: 'paragraph', raw: fallback, text: fallback, tokens: [{ type: 'text', raw: fallback, text: fallback, escaped: false }] }],
  };
}
