import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Route } from '@angular/router';
import { build, type Plugin } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { ContentFile, ContentFileAttributes, ContentModule, RouteFiles } from '../../src/lib/types';
import { nativescriptAnalog } from './plugin';

const fixtureRoot = resolve(__dirname, '__fixtures__/app').replace(/\\/g, '/');
const helloMd = `${fixtureRoot}/src/content/blog/hello.md`;

type Hook = (this: unknown, ...args: unknown[]) => unknown;
function hook(plugin: Plugin, name: 'load' | 'transform' | 'configResolved' | 'config'): Hook {
  const value = plugin[name] as Hook | { handler: Hook };
  return typeof value === 'function' ? value : value.handler;
}

function pluginForFixture(): Plugin {
  const plugin = nativescriptAnalog();
  hook(plugin, 'configResolved').call(undefined, { root: fixtureRoot });
  return plugin;
}

describe('nativescriptAnalog load hook', () => {
  it('loads ?ns-analog-content as a ContentFile with front matter split off and tokens lexed', () => {
    const code = hook(pluginForFixture(), 'load').call(undefined, `${helloMd}?ns-analog-content`) as string;
    const file = JSON.parse(code.replace(/^export default /, '').replace(/;$/, '')) as ContentFile;

    expect(file.filename).toBe('/src/content/blog/hello.md');
    expect(file.slug).toBe('hello');
    expect(file.attributes).toEqual({ title: 'Hello World', date: '2026-10-01T00:00:00.000Z', tags: ['intro'] });
    expect(file.content).not.toContain('title:');
    // marked emits a space token only for CRLF line endings, so ignore it to keep the test line-ending neutral.
    expect(file.tokens.map((token) => token.type).filter((type) => type !== 'space')).toEqual(['heading', 'paragraph']);
    const paragraph = file.tokens.find((token) => token.type === 'paragraph') as { tokens: { type: string; href?: string }[] };
    expect(paragraph.tokens.map((token) => token.type)).toEqual(['text', 'strong', 'text', 'link', 'text']);
    expect(paragraph.tokens[3].href).toBe('/about');
  });

  it('loads ?ns-analog-attributes without the body or tokens', () => {
    const code = hook(pluginForFixture(), 'load').call(undefined, `${helloMd}?ns-analog-attributes`) as string;

    expect(JSON.parse(code.replace(/^export default /, '').replace(/;$/, ''))).toEqual({
      filename: '/src/content/blog/hello.md',
      slug: 'hello',
      attributes: { title: 'Hello World', date: '2026-10-01T00:00:00.000Z', tags: ['intro'] },
    });
  });

  it('leaves plain .md imports and other files to Vite', () => {
    const load = hook(pluginForFixture(), 'load');

    expect(load.call(undefined, helloMd)).toBeUndefined();
    expect(load.call(undefined, `${helloMd}?raw`)).toBeUndefined();
    expect(load.call(undefined, `${fixtureRoot}/entry.ts?ns-analog-content`)).toBeUndefined();
  });
});

describe('nativescriptAnalog transform hook', () => {
  it('replaces every marker in the runtime source with an import.meta.glob call', () => {
    const runtime = readFileSync(resolve(__dirname, '../../src/lib/files.ts'), 'utf8');

    const result = hook(nativescriptAnalog({ pagesDirs: ['/src/extra'] }), 'transform').call(undefined, runtime) as {
      code: string;
    };

    expect(result.code).not.toMatch(/['"]__NS_ANALOG_[A-Z_]+__['"]/);
    expect(result.code).toContain('import.meta.glob(["/src/app/pages/**/*.page.ts","/src/extra/**/*.page.ts"])');
    expect(result.code).toContain(
      'import.meta.glob(["/src/content/**/*.md"], {"query":"?ns-analog-attributes","import":"default","eager":true})',
    );
  });

  it('skips code without markers', () => {
    expect(hook(nativescriptAnalog(), 'transform').call(undefined, 'export const x = 1;')).toBeUndefined();
  });
});

describe('nativescriptAnalog in a real Vite build', () => {
  const outDir = mkdtempSync(join(tmpdir(), 'ns-analog-'));
  let bundle: {
    pageFiles(): RouteFiles;
    contentFiles(): Record<string, () => Promise<ContentModule>>;
    contentAttributeFiles(): Record<string, ContentFileAttributes>;
    createRoutes(files: RouteFiles, options?: { markdownComponent?: unknown }): Route[];
  };

  beforeAll(async () => {
    await build({
      root: fixtureRoot,
      configFile: false,
      logLevel: 'silent',
      plugins: [nativescriptAnalog()],
      build: {
        outDir,
        emptyOutDir: true,
        minify: false,
        lib: { entry: `${fixtureRoot}/entry.ts`, formats: ['es'], fileName: () => 'entry.mjs' },
      },
    });
    bundle = await import(pathToFileURL(join(outDir, 'entry.mjs')).href);
  }, 60_000);

  afterAll(() => rmSync(outDir, { recursive: true, force: true }));

  it('globs pages and Markdown pages into lazy route files', async () => {
    const files = bundle.pageFiles();

    expect(Object.keys(files).sort()).toEqual([
      '/src/app/pages/about.page.ts',
      '/src/app/pages/blog/[slug].page.ts',
      '/src/app/pages/docs.md',
      '/src/app/pages/index.page.ts',
    ]);
    const routes = bundle.createRoutes(files, { markdownComponent: class MarkdownPage {} });
    const docs = routes.find((route) => route.path === 'docs');
    const [loaded] = (await docs?.loadChildren?.()) as Route[];
    expect(loaded.title).toBe('Docs');
  });

  it('globs content attributes eagerly and content bodies lazily', async () => {
    expect(Object.values(bundle.contentAttributeFiles())).toEqual([
      expect.objectContaining({ slug: 'hello', attributes: expect.objectContaining({ title: 'Hello World' }) }),
    ]);
    const hello = await bundle.contentFiles()['/src/content/blog/hello.md']();
    expect(hello.default.tokens[0]).toMatchObject({ type: 'heading', depth: 1, text: 'Hello' });
  });
});
