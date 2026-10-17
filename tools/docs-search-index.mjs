import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const id = 'virtual:docs-search';
const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const plain = (text) => text.replace(/<[^>]+>/g, ' ').replace(/[`*_#>|]|\[([^\]]*)\]\([^)]*\)/g, '$1 ').replace(/\s+/g, ' ').trim();

function entries(dir) {
  const out = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const raw = readFileSync(join(dir, file), 'utf8');
    const meta = Object.fromEntries([...(/^---\n([\s\S]*?)\n---/.exec(raw.replace(/\r\n/g, '\n'))?.[1] ?? '').matchAll(/^(\w+):\s*(.*)$/gm)].map((m) => [m[1], m[2]]));
    const slug = file.replace(/\.md$/, '');
    const base = { slug, title: meta.title ?? slug, section: meta.section ?? 'Docs' };
    let current = { ...base, heading: '', id: '', body: [meta.description ?? ''] };
    let fenced = false;
    const push = () => current.body.join(' ').trim() || current.heading ? out.push({ ...current, body: undefined, text: plain(current.body.join(' ')) }) : 0;
    for (const line of raw.replace(/\r\n/g, '\n').replace(/^---\n[\s\S]*?\n---\n/, '').split('\n')) {
      if (line.startsWith('```')) fenced = !fenced;
      const h = !fenced && /^(#{2,3})\s+(.*)$/.exec(line);
      if (h) {
        push();
        current = { ...base, heading: plain(h[2]), id: slugify(h[2]), body: [] };
      } else if (!fenced && !line.startsWith('# ')) current.body.push(line);
      else if (fenced) current.body.push(line);
    }
    push();
  }
  return out;
}

export function docsSearchIndex(dir) {
  return {
    name: 'docs-search-index',
    resolveId: (source) => (source === id ? '\0' + id : undefined),
    load(loaded) {
      if (loaded !== '\0' + id) return undefined;
      return `export default ${JSON.stringify(entries(dir))};`;
    },
    configureServer(server) {
      server.watcher.add(dir);
    },
  };
}