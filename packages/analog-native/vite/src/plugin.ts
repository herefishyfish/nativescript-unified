import { readFileSync } from 'node:fs';
import { basename, extname, relative, resolve } from 'node:path';
import frontMatter from 'front-matter';
import { lexer } from 'marked';
import type { Plugin } from 'vite';

export interface NativescriptAnalogOptions {
  /** Extra page directories, root-relative (for example `/src/more-pages`). */
  pagesDirs?: string[];
  /** Extra content directories, root-relative (for example `/src/posts`). */
  contentDirs?: string[];
}

export const CONTENT_QUERY = 'ns-analog-content';
export const ATTRIBUTES_QUERY = 'ns-analog-attributes';

const DEFAULT_PAGES_DIR = '/src/app/pages';
const DEFAULT_CONTENT_DIR = '/src/content';

type Markers = Record<string, string>;

function globCalls(options: NativescriptAnalogOptions): Markers {
  const pagesDirs = [DEFAULT_PAGES_DIR, ...(options.pagesDirs ?? [])];
  const contentDirs = [DEFAULT_CONTENT_DIR, ...(options.contentDirs ?? [])];
  const glob = (patterns: string[], globOptions?: object) =>
    `import.meta.glob(${JSON.stringify(patterns)}${globOptions ? `, ${JSON.stringify(globOptions)}` : ''})`;
  return {
    __NS_ANALOG_PAGE_FILES__: glob(pagesDirs.map((dir) => `${dir}/**/*.page.ts`)),
    __NS_ANALOG_MARKDOWN_PAGE_FILES__: glob(
      pagesDirs.map((dir) => `${dir}/**/*.md`),
      { query: `?${CONTENT_QUERY}` },
    ),
    __NS_ANALOG_CONTENT_FILES__: glob(
      contentDirs.map((dir) => `${dir}/**/*.md`),
      { query: `?${CONTENT_QUERY}` },
    ),
    __NS_ANALOG_CONTENT_ATTRIBUTE_FILES__: glob(
      contentDirs.map((dir) => `${dir}/**/*.md`),
      { query: `?${ATTRIBUTES_QUERY}`, import: 'default', eager: true },
    ),
  };
}

const MARKER_PATTERN = /(['"])(__NS_ANALOG_[A-Z_]+__)\1/g;

/** Vite plugin that feeds `@nativescript-unified/analog-native` its pages and content at build time. */
export function nativescriptAnalog(options: NativescriptAnalogOptions = {}): Plugin {
  const markers = globCalls(options);
  let root = process.cwd();

  return {
    name: 'nativescript-analog',
    // No enforce: @analogjs/vite-plugin-angular emits .ts output from its own compilation and
    // drops earlier transforms, so the markers are rewritten after it and before vite:import-glob.
    config(config) {
      // MasonKit reads __WINDOWS__, which @nativescript/vite does not define for android/ios.
      if (config.define?.['__WINDOWS__'] === undefined) {
        return { define: { __WINDOWS__: 'false' } };
      }
      return undefined;
    },
    configResolved(config) {
      root = config.root;
    },
    transform(code) {
      if (!code.includes('__NS_ANALOG_')) {
        return undefined;
      }
      let replaced = false;
      const result = code.replace(MARKER_PATTERN, (match, _quote: string, marker: string) => {
        const call = markers[marker];
        if (!call) {
          return match;
        }
        replaced = true;
        return call;
      });
      return replaced ? { code: result, map: null } : undefined;
    },
    load(id) {
      const [file, query] = id.split('?', 2);
      if (!file.endsWith('.md') || !query) {
        return undefined;
      }
      const params = new URLSearchParams(query);
      const wantsContent = params.has(CONTENT_QUERY);
      if (!wantsContent && !params.has(ATTRIBUTES_QUERY)) {
        return undefined;
      }
      const source = readFileSync(file, 'utf8');
      const { attributes, body } = frontMatter<Record<string, unknown>>(source);
      const filename = `/${relative(root, resolve(file)).replace(/\\/g, '/')}`;
      const slug = basename(file, extname(file));
      const module = wantsContent
        ? { filename, slug, attributes, content: body, tokens: lexer(body) }
        : { filename, slug, attributes };
      return `export default ${JSON.stringify(module)};`;
    },
  };
}
