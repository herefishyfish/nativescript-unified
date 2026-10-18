// Headless Edge audit of the prerendered docs. Usage: node tools/audit-web.mjs [baseUrl]
// Needs the prerendered site served: npx nx run web:preview (vite preview of dist/apps/web/analog/public). Screenshots go to .audit/screenshots.
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

import { createRequire } from 'node:module';
const axeSource = createRequire(import.meta.url).resolve('axe-core/axe.min.js');
/** Runs axe-core on the current page and returns short "rule (n nodes: selector)" strings. */
async function axe(page) {
  if (!(await page.evaluate(() => !!window.axe))) await page.addScriptTag({ path: axeSource });
  const res = await page.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } });
    // Live demos render arbitrary author colours on purpose, so contrast is judged on the site chrome and prose, not on demo previews.
    return r.violations.map((v) => ({ ...v, nodes: v.nodes.filter((n) => !(v.id === 'color-contrast' && document.querySelector(n.target[0])?.closest('.docs-demo-preview'))) })).filter((v) => v.nodes.length);
  });
  return res.map((v) => `${v.id} (${v.nodes.length}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(', ')}) ${v.nodes[0]?.any?.[0]?.message ?? ''}`);
}
const base = process.argv[2] ?? 'http://localhost:4300';
const out = process.env.AUDIT_OUT ?? '.audit/screenshots';
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`);
};

async function open(page, path, scheme = 'light') {
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.emulateMedia({ colorScheme: scheme });
  await page.goto(base + path, { waitUntil: 'networkidle' });
  return errors;
}
const style = (page, sel, prop) => page.locator(sel).first().evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

// 1. Prerendered HTML contains content before any JS runs.
for (const slug of ['introduction', 'stack-layout', 'theming']) {
  const html = await (await fetch(`${base}/docs/${slug}/`)).text();
  check(`prerendered /docs/${slug} has article + demo markup without JS`, html.includes('data-testid="doc"') && html.includes('docs-demo'));
}

const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

// 2. Pages: render, no console errors, screenshot.
const pages = ['', 'docs/introduction', 'docs/project-structure', 'docs/file-routing', 'docs/stack-layout', 'docs/grid-layout', 'docs/flexbox-layout', 'docs/wrap-layout', 'docs/dock-layout', 'docs/absolute-layout', 'docs/label', 'docs/image', 'docs/scroll-view', 'docs/list-view', 'docs/controls', 'docs/indicators', 'docs/button-and-text-field', 'docs/theming', 'docs/installation', 'docs/web-vs-native', 'docs/shared-features', 'docs/markdown-on-native', 'docs/polyfill-limitations', 'docs/faq', 'docs/navigation-views', 'docs/split-view', 'docs/html-first', 'docs/html-layout', 'docs/legacy-tags', 'docs/components', 'docs/ui-button', 'docs/ui-badge', 'docs/ui-card', 'docs/ui-form-controls', 'docs/ui-tabs', 'docs/ui-accordion', 'docs/ui-dialog', 'docs/ui-alert', 'docs/ui-feedback'];
for (const p of pages) {
  const errors = await open(page, '/' + p);
  const h1 = await page.locator('h1').first().innerText();
  const demos = await page.locator('[data-testid=demo]').count();
  check(`/${p}: renders h1 "${h1}", ${demos} demo(s), no console errors`, h1.length > 0 && errors.length === 0, errors.join(' | '));
  const name = (p || 'home').replace(/\//g, '-');
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  page.removeAllListeners('console');
  page.removeAllListeners('pageerror');
}

// 3. Polyfill behaviour in the live demos.
await open(page, '/docs/stack-layout');
check('StackLayout vertical => flex column', (await style(page, 'docs-demo-live stacklayout', 'flex-direction')) === 'column');
check('StackLayout horizontal => flex row', (await page.locator('docs-demo-live stacklayout').nth(1).evaluate((e) => getComputedStyle(e).flexDirection)) === 'row');
await open(page, '/docs/grid-layout');
check('GridLayout => display grid with 2 columns', (await style(page, 'docs-demo-live gridlayout', 'display')) === 'grid' && (await style(page, 'docs-demo-live gridlayout', 'grid-template-columns')).split(' ').length === 2);
check('GridLayout child colspan 2', (await page.locator('docs-demo-live gridlayout > div').first().evaluate((e) => e.style.gridColumn)).includes('span 2'));
await open(page, '/docs/flexbox-layout');
check('FlexboxLayout justify-content space-between', (await style(page, 'docs-demo-live flexboxlayout', 'justify-content')) === 'space-between');
await open(page, '/docs/wrap-layout');
check('WrapLayout wraps, item width 90px', (await style(page, 'docs-demo-live wraplayout', 'flex-wrap')) === 'wrap' && (await page.locator('docs-demo-live wraplayout > div').first().evaluate((e) => e.style.width)) === '90px');
await open(page, '/docs/dock-layout');
check('DockLayout => grid, last child centred', (await style(page, 'docs-demo-live docklayout', 'display')) === 'grid' && (await page.locator('docs-demo-live docklayout > div').last().evaluate((e) => e.style.gridColumn)) === '2');
await open(page, '/docs/absolute-layout');
check('AbsoluteLayout children absolute', (await page.locator('docs-demo-live absolutelayout > div').first().evaluate((e) => getComputedStyle(e).position)) === 'absolute');

// 3b. Geometry: the demos really lay out as the docs say.
const box = (loc) => loc.evaluate((e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
await open(page, '/docs/grid-layout');
const g = page.locator('docs-demo-live gridlayout > div');
const [gh, gs, gc] = [await box(g.nth(0)), await box(g.nth(1)), await box(g.nth(2))];
check('GridLayout: header spans both columns, side column is 80px, content is right of side', gh.w > gc.w + 70 && Math.abs(gs.w - 80) < 2 && gc.x > gs.x && gs.y > gh.y);
await open(page, '/docs/dock-layout');
const dk = page.locator('docs-demo-live docklayout > div');
const [top, bottom, left, right, centre] = [await box(dk.nth(0)), await box(dk.nth(1)), await box(dk.nth(2)), await box(dk.nth(3)), await box(dk.nth(4))];
check('DockLayout: top above centre above bottom; left < centre < right', top.y < centre.y && centre.y < bottom.y && left.x < centre.x && centre.x < right.x);
await open(page, '/docs/absolute-layout');
const ab = page.locator('docs-demo-live absolutelayout');
const abBox = await box(ab);
const a2 = await box(page.locator('docs-demo-live absolutelayout > div').nth(1));
check('AbsoluteLayout: second child offset 120,50', Math.abs(a2.x - abBox.x - 121) < 3 && Math.abs(a2.y - abBox.y - 51) < 3);
await open(page, '/docs/wrap-layout');
const wr = page.locator('docs-demo-live wraplayout > div');
const [w0, w7] = [await box(wr.nth(0)), await box(wr.nth(7))];
check('WrapLayout: 8 items of 90px wrap onto a second row on a 1280px viewport or stay on one row only if they fit', w0.w === 90 && w0.h === 48 && (w7.y > w0.y || w7.x > w0.x));
await open(page, '/docs/flexbox-layout');
const fl = page.locator('docs-demo-live flexboxlayout > div');
const [fa, fb, fc] = [await box(fl.nth(0)), await box(fl.nth(1)), await box(fl.nth(2))];
check('FlexboxLayout: order -1 puts C first; B grows wider than A', fc.x < fa.x && fb.w > fa.w * 2);
await open(page, '/docs/label');
check('Label renders text', (await page.locator('docs-demo-live label').first().innerText()).includes('Hello from a NativeScript Label'));
check('Span bold + colour applied', (await page.locator('docs-demo-live formattedstring span').first().evaluate((e) => getComputedStyle(e).fontWeight)) === '700');
await open(page, '/docs/controls');
check('SegmentedBar shows 3 segments', (await page.locator('docs-demo-live segmentedbar button[role=tab]').count()) === 3);
check('Switch + Slider + SearchBar present', (await page.locator('docs-demo-live switch, docs-demo-live slider, docs-demo-live searchbar').count()) === 3);
await page.locator('docs-demo-live switch button').click();
await page.waitForTimeout(200);
check('Switch toggles on click', (await page.locator('docs-demo-live switch button').getAttribute('aria-checked')) === 'false');
await open(page, '/docs/button-and-text-field');
check('Spartan helm button renders in demo', (await page.locator('docs-demo-live button[hlmBtn], docs-demo-live button[data-slot=button]').count()) === 4);

// 4. Navigation without reload, dark mode toggle, persistence.
await open(page, '/docs/introduction');
await page.evaluate(() => (window.__marker = 1));
await page.locator('[data-testid=sidebar] a', { hasText: 'GridLayout' }).click();
await page.waitForURL('**/docs/grid-layout');
check('sidebar nav is client-side (no reload)', (await page.evaluate(() => window.__marker)) === 1);
await page.locator('article a', { hasText: 'Label and text runs' }).first().click().catch(() => {});
const lightBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
await page.locator('[data-testid=theme-toggle]').click();
const darkBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
check(`dark toggle changes theme (${lightBg} -> ${darkBg})`, (await page.evaluate(() => document.documentElement.classList.contains('dark'))) && lightBg !== darkBg);
await page.screenshot({ path: `${out}/docs-grid-layout-dark.png`, fullPage: true });
await page.reload({ waitUntil: 'networkidle' });
check('dark mode persists after reload', await page.evaluate(() => document.documentElement.classList.contains('dark')));
await open(page, '/docs/theming');
await page.locator('[data-testid=theme-toggle]').click();
await page.screenshot({ path: `${out}/docs-theming-dark.png`, fullPage: true });
await page.evaluate(() => localStorage.setItem('ns-unified-theme', 'dark'));
await open(page, '/docs/label');
check('Polyfill CSS vars follow dark theme (Label colour is cream)', (await style(page, 'docs-demo-live label', 'color')) === 'rgb(242, 235, 221)');


for (const p of ['introduction', 'flexbox-layout', 'controls', 'theming']) {
  await open(page, '/docs/' + p);
  await page.screenshot({ path: `${out}/dark-docs-${p}.png`, fullPage: true });
}
// 5. In-content link routing + mobile.
await open(page, '/docs/introduction');
await page.evaluate(() => (window.__marker = 2));
await page.locator('article a', { hasText: 'Project structure' }).first().click();
await page.waitForURL('**/docs/project-structure');
check('Markdown link navigates client-side', (await page.evaluate(() => window.__marker)) === 2);
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const mp = await mobile.newPage();
await open(mp, '/docs/grid-layout');
check('mobile: no horizontal overflow', await mp.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
check('mobile: sidebar hidden until menu opened', !(await mp.locator('[data-testid=sidebar]').isVisible()));
await mp.screenshot({ path: `${out}/mobile-docs-grid-layout.png`, fullPage: true });
await mp.locator('[data-testid=nav-toggle]').click();
await mp.waitForTimeout(200);
check('mobile: menu opens sidebar', await mp.locator('[data-testid=sidebar]').isVisible());
await mp.screenshot({ path: `${out}/mobile-nav-open.png` });


// Sidebar fills the viewport below the header at 1280x800, also after scrolling.
{
  const tall = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const sp = await tall.newPage();
  await open(sp, '/docs/project-structure');
  const measure = async () => sp.evaluate(() => {
    const s = document.querySelector('[data-testid=sidebar]').getBoundingClientRect();
    const h = document.querySelector('header').getBoundingClientRect();
    return { top: Math.round(s.top), bottom: Math.round(s.bottom), headerBottom: Math.round(h.bottom), vh: innerHeight };
  });
  const at0 = await measure();
  check('sidebar spans header bottom to viewport bottom (top of page)', at0.top === at0.headerBottom && at0.bottom === at0.vh, JSON.stringify(at0));
  await sp.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }));
  await sp.waitForTimeout(300);
  const at1 = await measure();
  check('sidebar still spans header bottom to viewport bottom after scrolling', at1.top === at1.headerBottom && at1.bottom === at1.vh, JSON.stringify(at1));
  await sp.screenshot({ path: `${out}/sidebar-scrolled.png` });
  await sp.setViewportSize({ width: 1920, height: 1080 });
  await sp.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
  await sp.waitForTimeout(300);
  const wide = await measure();
  check('sidebar spans header bottom to viewport bottom at 1920x1080 scrolled', wide.top === wide.headerBottom && wide.bottom === wide.vh, JSON.stringify(wide));
  await tall.close();
}
// 6. Prerendered 404 page, themed, and the client carries no Markdown parser.
{
  const res = await fetch(`${base}/404.html`);
  const html = await res.text();
  check('404.html is emitted and prerendered with content', res.ok && html.includes('data-testid="not-found-page"'));
  const errors = await open(page, '/404.html');
  check('404 page renders heading, no console errors', (await page.locator('h1').first().innerText()) === 'Page not found' && errors.length === 0, errors.join(' | '));
  const spartan = await page.locator('a[data-slot=button], a[hlmbtn]').count();
  check('404 page uses Spartan buttons', spartan >= 2);
  await page.evaluate(() => document.documentElement.classList.remove('dark'));
  const lightBg = await style(page, 'body', 'background-color');
  await open(page, '/404.html', 'dark');
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  const darkBg = await style(page, 'body', 'background-color');
  check('404 page is themed (background differs in dark mode)', lightBg !== darkBg, `${lightBg} vs ${darkBg}`);
  await page.screenshot({ path: `${out}/404-dark.png`, fullPage: true });
  await open(page, '/404.html');
  await page.screenshot({ path: `${out}/404.png`, fullPage: true });
  const loaded = [];
  page.on('response', (r) => r.url().endsWith('.js') && loaded.push(r.url()));
  await open(page, '/docs/stack-layout');
  const bodies = await Promise.all(loaded.map((u) => fetch(u).then((r) => r.text())));
  check('client JS contains no marked/front-matter/prism', !bodies.some((b) => /Prism\.languages|gray-matter|front-matter|marked\.js|new Marked\(/.test(b)));
  page.removeAllListeners('response');
}
// 7. Search (Ctrl+K) and table of contents.
await open(page, '/docs/introduction');
await page.keyboard.press('Control+k');
await page.locator('[data-testid=search-input]').waitFor();
check('Ctrl+K opens the search dialog', await page.locator('[data-testid=search-dialog]').isVisible());
await page.locator('[data-testid=search-input]').fill('wrap');
await page.locator('[data-testid=search-hit]').first().waitFor();
check('search "wrap" lists WrapLayout first', (await page.locator('[data-testid=search-hit]').first().innerText()).includes('WrapLayout'));
await page.screenshot({ path: `${out}/search-open.png` });
await page.keyboard.press('Enter');
await page.waitForURL('**/docs/wrap-layout**');
await page.waitForTimeout(400);
check('Enter on a hit navigates to its page', !(await page.locator('[data-testid=search-dialog]').isVisible()));
await page.keyboard.press('Control+k');
await page.locator('[data-testid=search-input]').fill('zzzqqq');
check('search with no match shows the empty state', await page.locator('[data-testid=search-empty]').isVisible());
await page.keyboard.press('Escape');
await page.waitForTimeout(200);
check('Escape closes the search dialog', !(await page.locator('[data-testid=search-dialog]').isVisible()));
await page.locator('[data-testid=search-open]').click();
await page.locator('[data-testid=search-input]').fill('ListPicker');
await page.locator('[data-testid=search-hit]').first().click();
await page.waitForURL('**/docs/controls#listpicker');
check('heading hit links to its section anchor', page.url().endsWith('/docs/controls#listpicker'));

await open(page, '/docs/project-structure');
const heads = await page.locator('article h2[id], article h3[id]').count();
check(`TOC lists every h2/h3 (${heads})`, heads > 0 && (await page.locator('[data-testid=toc] a').count()) === heads);
const lastId = await page.locator('[data-testid=toc] a').nth(4).evaluate((a) => a.getAttribute('href').slice(1));
await page.evaluate((id) => window.scrollTo({ top: document.getElementById(id).getBoundingClientRect().top + scrollY - 160, behavior: 'instant' }), lastId);
await page.waitForTimeout(800);
check('TOC scroll-spy highlights the heading being read', (await page.locator('[data-testid=toc] a[aria-current=location]').getAttribute('href')) === '#' + lastId);
await page.screenshot({ path: `${out}/toc-scrolled.png` });
await open(mp, '/docs/project-structure');
check('mobile: TOC hidden', !(await mp.locator('[data-testid=toc]').isVisible()));
// 8. Visual polish: home page, code copy, demo tabs, callouts, wide screens, tablet and mobile.
{
  const vctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const vp = await vctx.newPage();
  await open(vp, '/');
  check('home: hero with h1, two CTAs and a live HTML and helm demo', (await vp.locator('[data-testid=hero] h1').innerText()).includes('HTML first') && (await vp.locator('[data-testid=hero] a[hlmbtn], [data-testid=hero] a[data-slot=button]').count()) === 2 && (await vp.locator('[data-testid=home-flex]').count()) === 1);
  check('home: live demo is plain HTML in a flex row', (await style(vp, '[data-testid=home-flex]', 'flex-direction')) === 'row');
  check('home: three what/why cards and six quick links', (await vp.locator('[data-testid=feature-card]').count()) === 3 && (await vp.locator('[data-testid=quick-link]').count()) === 6);
  const hrefs = await vp.locator('[data-testid=quick-link]').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
  const statuses = await Promise.all(hrefs.map((h) => fetch(base + h + '/').then((r) => r.status)));
  check('home: every quick link resolves to a prerendered page', statuses.every((s) => s === 200), hrefs.join(','));
  check('home: no horizontal overflow at 1280', await vp.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await vp.screenshot({ path: `${out}/home-visual.png`, fullPage: true });
  await open(vp, '/', 'dark');
  await vp.evaluate(() => localStorage.setItem('ns-unified-theme', 'dark'));
  await vp.reload({ waitUntil: 'networkidle' });
  await vp.screenshot({ path: `${out}/home-visual-dark.png`, fullPage: true });
  await vp.evaluate(() => localStorage.removeItem('ns-unified-theme'));

  // Demo frame tabs and the copy button.
  await open(vp, '/docs/stack-layout');
  const frame = vp.locator('[data-testid=demo]').first();
  check('demo frame: Preview tab selected, preview visible, code hidden', (await frame.locator('[role=tab][aria-selected=true]').innerText()) === 'Preview' && (await frame.locator('.docs-demo-preview').isVisible()) && !(await frame.locator('.docs-demo-code').isVisible()));
  await frame.locator('[data-testid=demo-tab-code]').click();
  await vp.waitForTimeout(250);
  check('demo frame: Code tab shows the code and hides the preview', (await frame.locator('.docs-demo-code').isVisible()) && !(await frame.locator('.docs-demo-preview').isVisible()));
  await frame.locator('.docs-demo-code').hover();
  await frame.locator('[data-copy]').click();
  await vp.waitForTimeout(150);
  const clip = (await vp.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n');
  const shown = await frame.locator('.docs-demo-code pre').innerText();
  check('copy button puts the code on the clipboard and says Copied', clip.trim() === shown.trim() && clip.includes('StackLayout') && (await frame.locator('[data-copy]').innerText()) === 'Copied');
  await frame.screenshot({ path: `${out}/demo-code-tab.png` });
  await frame.locator('[data-testid=demo-tab-preview]').click();
  await frame.screenshot({ path: `${out}/demo-preview-tab.png` });

  // Callouts: no docs page uses one yet, so inject the markup the Markdown renderer emits and check the styling.
  await vp.evaluate(() => {
    const art = document.querySelector('article.docs-prose');
    for (const kind of ['note', 'tip', 'warning']) {
      const el = document.createElement('aside');
      el.className = `docs-callout docs-callout-${kind}`;
      el.setAttribute('data-audit-callout', kind);
      el.innerHTML = `<p class="docs-callout-title">${kind}</p><p>Callout body text.</p>`;
      art.insertBefore(el, art.children[2]);
    }
  });
  const borders = await vp.locator('[data-audit-callout]').evaluateAll((els) => els.map((e) => getComputedStyle(e).borderLeftColor + '|' + getComputedStyle(e).backgroundColor));
  check('callouts: note, tip and warning have distinct colours', new Set(borders).size === 3, borders.join(' ; '));
  await vp.locator('[data-audit-callout=note]').screenshot({ path: `${out}/callout-note.png` });

  // Wide screens: sidebar background reaches the left window edge.
  const edges = [];
  for (const [w, h] of [[1280, 800], [1920, 1080], [2560, 1300]]) {
    await vp.setViewportSize({ width: w, height: h });
    await open(vp, '/docs/project-structure');
    const r = await vp.evaluate(() => { const s = document.querySelector('[data-testid=sidebar]').getBoundingClientRect(); const m = document.querySelector('main').getBoundingClientRect(); return { left: Math.round(s.left), right: Math.round(s.right), mainLeft: Math.round(m.left), overflow: document.documentElement.scrollWidth > innerWidth }; });
    edges.push(`${w}:${JSON.stringify(r)}`);
    check(`wide: sidebar starts at x=0 and abuts main at ${w}px, no overflow`, r.left === 0 && r.right === r.mainLeft && !r.overflow, JSON.stringify(r));
    if (w === 2560) await vp.screenshot({ path: `${out}/wide-2560.png` });
  }
  await vctx.close();

  // Tablet (768 and 820 are above the md breakpoint) and a small phone.
  for (const [name, w, h, sidebarVisible] of [['tablet-portrait', 820, 1180, true], ['tablet-768', 768, 1024, true], ['tablet-small', 600, 900, false], ['phone-small', 360, 740, false]]) {
    const c = await browser.newContext({ viewport: { width: w, height: h } });
    const tp = await c.newPage();
    for (const path of ['/', '/docs/grid-layout', '/docs/controls']) {
      await open(tp, path);
      const ok = await tp.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
      check(`${name} ${w}px ${path}: no horizontal overflow`, ok, ok ? '' : String(await tp.evaluate(() => document.documentElement.scrollWidth)));
    }
    await open(tp, '/docs/grid-layout');
    check(`${name}: sidebar ${sidebarVisible ? 'visible' : 'hidden until menu'}`, (await tp.locator('[data-testid=sidebar]').isVisible()) === sidebarVisible);
    await tp.screenshot({ path: `${out}/${name}-docs.png`, fullPage: true });
    await open(tp, '/');
    await tp.screenshot({ path: `${out}/${name}-home.png`, fullPage: true });
    await c.close();
  }
}
// 8. SEO: per-page head tags in the prerendered HTML, sitemap and robots.
const slugs = pages.filter((p) => p.startsWith('docs/')).map((p) => p.slice(5));
{
  const titles = new Set();
  const bad = [];
  for (const route of ['', ...slugs.map((s) => 'docs/' + s)]) {
    const html = await (await fetch(`${base}/${route}${route ? '/' : ''}`)).text();
    const get = (re) => html.match(re)?.[1];
    const title = get(/<title>([^<]*)<\/title>/);
    const desc = get(/<meta name="description" content="([^"]*)"/);
    const canon = get(/<link rel="canonical" href="([^"]*)"/);
    const ogTitle = get(/<meta property="og:title" content="([^"]*)"/);
    const ogUrl = get(/<meta property="og:url" content="([^"]*)"/);
    const ogDesc = get(/<meta property="og:description" content="([^"]*)"/);
    const expectPath = route ? '/' + route : '/';
    const ok = title && desc && desc.length > 20 && canon && canon.endsWith(expectPath) && ogTitle === title && ogUrl === canon && ogDesc === desc && !titles.has(title) && (html.match(/<link rel="canonical"/g) ?? []).length === 1 && (html.match(/<meta name="description"/g) ?? []).length === 1;
    titles.add(title);
    if (!ok) bad.push(`${route || '/'} ${JSON.stringify({ title, desc: desc?.length, canon })}`);
  }
  check(`SEO: all ${slugs.length + 1} prerendered pages have a unique title, one description, one canonical, matching Open Graph tags`, bad.length === 0, bad.join(' | '));
  const h404 = await (await fetch(`${base}/404.html`)).text();
  check('SEO: 404 page is noindex and not in the sitemap', h404.includes('content="noindex, follow"'));
  const sm = await (await fetch(`${base}/sitemap.xml`)).text();
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  check(`sitemap.xml lists home + every docs page (${locs.length})`, locs.length === slugs.length + 1 && slugs.every((s) => locs.some((l) => l.endsWith('/docs/' + s))) && !locs.some((l) => l.includes('404')));
  const robots = await (await fetch(`${base}/robots.txt`)).text();
  check('robots.txt allows crawling and points at the sitemap', /Allow: \//.test(robots) && /Sitemap: https?:\/\/\S+\/sitemap\.xml/.test(robots));
  const noHash = await (await fetch(`${base}/docs/introduction/`)).text();
  check('html lang is set', /<html[^>]*lang="en"/.test(noHash));
}

// 9. Landmarks, skip link, aria-current, focus order.
{
  for (const route of ['/', '/docs/introduction', '/404.html']) {
    await open(page, route);
    const lm = await page.evaluate(() => ({ main: document.querySelectorAll('main, [role=main]').length, banner: document.querySelectorAll('header').length, h1: document.querySelectorAll('h1').length, navs: [...document.querySelectorAll('nav')].map((n) => n.getAttribute('aria-label')) }));
    check(`landmarks ${route}: exactly one <main>, one <h1>, every <nav> labelled`, lm.main === 1 && lm.h1 === 1 && lm.navs.every(Boolean), JSON.stringify(lm));
  }
  await open(page, '/docs/introduction');
  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => ({ testid: document.activeElement?.getAttribute('data-testid'), visible: (() => { const r = document.activeElement.getBoundingClientRect(); return r.width > 1 && r.height > 1 && r.top >= 0; })() }));
  check('skip link is the first Tab stop and becomes visible on focus', first.testid === 'skip-link' && first.visible, JSON.stringify(first));
  await page.keyboard.press('Enter');
  check('activating the skip link focuses <main> without leaving the page', (await page.evaluate(() => document.activeElement?.id)) === 'main-content' && page.url().endsWith('/docs/introduction'));
  const cur = page.locator('[data-testid=sidebar] a[aria-current=page]');
  check('sidebar marks exactly the current page with aria-current=page', (await cur.count()) === 1 && (await cur.innerText()).trim() === 'Introduction');
  await page.locator('[data-testid=sidebar] a', { hasText: 'GridLayout' }).click();
  await page.waitForURL('**/docs/grid-layout');
  check('aria-current follows client-side navigation', (await page.locator('[data-testid=sidebar] a[aria-current=page]').innerText()).trim() === 'GridLayout' && (await page.locator('[data-testid=sidebar] a[aria-current=page]').count()) === 1);
  // Focus ring on keyboard focus.
  await page.locator('[data-testid=sidebar] a', { hasText: 'Label' }).first().focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  const ring = await page.evaluate(() => { const s = getComputedStyle(document.activeElement); return { outline: s.outlineStyle + ' ' + s.outlineWidth, shadow: s.boxShadow }; });
  check('keyboard-focused sidebar link shows a visible focus indicator', ring.outline.startsWith('solid') && !ring.outline.endsWith(' 0px'), JSON.stringify(ring));
}

// 10. Keyboard operation: theme toggle, search, mobile menu.
{
  await open(page, '/docs/introduction');
  await page.evaluate(() => { localStorage.setItem('ns-unified-theme', 'light'); document.documentElement.classList.remove('dark'); });
  await page.reload({ waitUntil: 'networkidle' });
  const toggle = page.locator('[data-testid=theme-toggle]');
  check('theme toggle exposes aria-pressed state', (await toggle.getAttribute('aria-pressed')) === 'false');
  await toggle.focus();
  await page.keyboard.press('Space');
  await page.waitForTimeout(150);
  check('theme toggle works with Space and updates aria-pressed', (await toggle.getAttribute('aria-pressed')) === 'true' && (await page.evaluate(() => document.documentElement.classList.contains('dark'))));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  check('theme toggle works with Enter', (await toggle.getAttribute('aria-pressed')) === 'false');
  const sBtn = page.locator('[data-testid=search-open]');
  await sBtn.focus();
  await page.keyboard.press('Enter');
  const input = page.locator('[data-testid=search-input]');
  await input.waitFor();
  check('search opens from the keyboard and focus moves into the input', await input.evaluate((el) => el === document.activeElement));
  await input.fill('layout');
  await page.locator('[data-testid=search-hit]').first().waitFor();
  const roles = await page.evaluate(() => ({ combobox: document.querySelector('[data-testid=search-input]').getAttribute('role'), listbox: !!document.querySelector('[role=listbox] [role=option]'), activedesc: document.querySelector('[data-testid=search-input]').getAttribute('aria-activedescendant') }));
  check('search is an ARIA combobox/listbox with aria-activedescendant', roles.combobox === 'combobox' && roles.listbox && roles.activedesc === 'search-hit-0', JSON.stringify(roles));
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(150);
  check('ArrowDown moves the active option', (await input.getAttribute('aria-activedescendant')) === 'search-hit-1' && (await page.locator('#search-hit-1').getAttribute('aria-selected')) === 'true');
  const axeDlg = await axe(page);
  check('axe: search dialog open has no violations', axeDlg.length === 0, axeDlg.join(' | '));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  check('Escape closes search and focus returns to the trigger', (await page.evaluate(() => document.activeElement?.getAttribute('data-testid'))) === 'search-open');
  await page.keyboard.press('Control+k');
  await input.waitFor();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  // Mobile menu.
  await open(mp, '/docs/grid-layout');
  const nt = mp.locator('[data-testid=nav-toggle]');
  check('mobile menu button has aria-expanded=false and aria-controls the sidebar', (await nt.getAttribute('aria-expanded')) === 'false' && (await nt.getAttribute('aria-controls')) === 'docs-sidebar');
  await nt.focus();
  await mp.keyboard.press('Enter');
  await mp.waitForTimeout(150);
  check('mobile menu opens from the keyboard (aria-expanded=true)', (await nt.getAttribute('aria-expanded')) === 'true' && (await mp.locator('[data-testid=sidebar]').isVisible()));
  await mp.keyboard.press('Escape');
  await mp.waitForTimeout(150);
  check('Escape closes the mobile menu and refocuses its button', !(await mp.locator('[data-testid=sidebar]').isVisible()) && (await mp.evaluate(() => document.activeElement?.getAttribute('data-testid'))) === 'nav-toggle');
}

// 11. Reduced motion.
{
  const rm = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const rp = await rm.newPage();
  await open(rp, '/docs/project-structure');
  const m = await rp.evaluate(() => ({ html: getComputedStyle(document.documentElement).scrollBehavior, btn: getComputedStyle(document.querySelector('[data-testid=theme-toggle]')).transitionDuration }));
  check('prefers-reduced-motion: no smooth scrolling, transitions ~0', m.html === 'auto' && parseFloat(m.btn) < 0.001, JSON.stringify(m));
  const before = await rp.evaluate(() => scrollY);
  await rp.locator('[data-testid=toc] a').nth(3).click();
  await rp.waitForTimeout(60);
  check('prefers-reduced-motion: TOC jump is instant', (await rp.evaluate(() => scrollY)) > before + 50);
  await rm.close();
  const nm = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const np = await nm.newPage();
  await open(np, '/docs/introduction');
  check('default motion keeps smooth scrolling', (await np.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)) === 'smooth');
  await nm.close();
}

// 11b. Forward-first structure: sidebar groups, legacy banners, live helm components.
{
  const legacySlugs = ['stack-layout', 'grid-layout', 'flexbox-layout', 'wrap-layout', 'dock-layout', 'absolute-layout', 'split-view', 'label', 'image', 'scroll-view', 'list-view', 'controls', 'button-and-text-field', 'indicators', 'navigation-views', 'polyfill-limitations'];
  await open(page, '/docs/introduction');
  const groups = await page.locator('[data-testid=sidebar] h2').allInnerTexts();
  check('sidebar groups lead with HTML first and Components, then Legacy NativeScript tags', JSON.stringify(groups.map((g) => g.toLowerCase())) === JSON.stringify(['getting started', 'html first', 'components', 'legacy nativescript tags', 'guides']), groups.join(' | '));
  const legacyLinks = await page.locator('[data-testid=sidebar] h2:has-text("Legacy") + ul a').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
  check('Legacy group lists the overview plus all 16 legacy pages', legacyLinks.length === 17 && legacySlugs.every((s) => legacyLinks.includes('/docs/' + s)) && legacyLinks.includes('/docs/legacy-tags'), legacyLinks.join(','));
  const noBanner = [];
  for (const slug of legacySlugs) {
    await open(page, '/docs/' + slug);
    const text = await page.locator('[data-testid=doc] .docs-callout').first().innerText().catch(() => '');
    if (!/legacy support/i.test(text)) noBanner.push(slug);
  }
  check('every legacy page opens with a legacy-support callout', noBanner.length === 0, noBanner.join(','));
  const noHint = [];
  for (const slug of legacySlugs.filter((s) => s !== 'polyfill-limitations')) {
    await open(page, '/docs/' + slug);
    if (!(await page.locator('[data-testid=doc] h2', { hasText: 'HTML-first equivalent' }).count())) noHint.push(slug);
  }
  check('every legacy page except polyfill-limitations has an HTML-first equivalent section', noHint.length === 0, noHint.join(','));

  await open(page, '/docs/introduction');
  check('introduction leads with a live helm card and buttons, not a polyfill demo', (await page.locator('[data-testid=doc] .docs-demo-preview [hlmcard] button[hlmbtn]').count()) === 2 && (await page.locator('[data-testid=doc] .docs-demo-preview stacklayout').count()) === 0);

  const preview = '[data-testid=doc] .docs-demo-preview';
  await open(page, '/docs/ui-button');
  check('Button page: variants, sizes and disabled render as styled buttons', (await page.locator(`${preview} button[hlmbtn]`).count()) === 11 && (await page.locator(`${preview} a[hlmbtn]`).count()) === 1);
  await open(page, '/docs/ui-badge');
  check('Badge page: 6 variants', (await page.locator(`${preview} [hlmbadge]`).count()) === 6);
  await open(page, '/docs/ui-card');
  check('Card page: card with header, title, content and footer', (await page.locator(`${preview} [hlmcard] [hlmcardtitle]`).count()) === 1 && (await page.locator(`${preview} [hlmcardfooter] button`).count()) === 2);
  await open(page, '/docs/ui-tabs');
  const tabs = page.locator(`${preview} [hlmtabs]`).first();
  check('Tabs page: first tab active, second panel hidden', (await tabs.getByText('Make changes to your account here.').isVisible()) && !(await tabs.getByText('Change your password here.').isVisible()));
  await tabs.getByRole('tab', { name: 'Password' }).click();
  check('Tabs page: clicking Password shows its panel', (await tabs.getByText('Change your password here.').isVisible()) && !(await tabs.getByText('Make changes to your account here.').isVisible()));
  await open(page, '/docs/ui-accordion');
  const acc = page.locator(`${preview} hlm-accordion`).first();
  await acc.getByRole('button', { name: 'Is it HTML first?' }).click();
  await page.waitForTimeout(400);
  check('Accordion page: trigger sets aria-expanded and shows content', (await acc.getByRole('button', { name: 'Is it HTML first?' }).getAttribute('aria-expanded')) === 'true' && (await acc.getByText('Yes. Pages are plain HTML').isVisible()));
  await open(page, '/docs/ui-form-controls');
  check('Form controls page: input, textarea, checkbox, switch and 3 radios render', (await page.locator(`${preview} input[hlminput]`).count()) === 1 && (await page.locator(`${preview} textarea[hlmtextarea]`).count()) === 1 && (await page.locator(`${preview} hlm-checkbox`).count()) === 1 && (await page.locator(`${preview} hlm-switch`).count()) === 1 && (await page.locator(`${preview} hlm-radio`).count()) === 3);
  const sw = page.locator(`${preview} hlm-switch button[role=switch], ${preview} hlm-switch [role=switch]`).first();
  check('Switch starts off', (await page.locator(preview).getByText('Notifications are off').count()) === 1);
  await sw.click();
  check('Switch click flips the demo text to on', (await page.locator(preview).getByText('Notifications are on').count()) === 1);
  await page.locator(`${preview} hlm-checkbox button, ${preview} hlm-checkbox [role=checkbox]`).first().click();
  check('Checkbox click flips the demo text', (await page.locator(preview).getByText('Terms accepted').count()) === 1);
  await open(page, '/docs/ui-dialog');
  await page.locator(`${preview} button[hlmdialogtrigger]`).click();
  await page.waitForSelector('hlm-dialog-content', { timeout: 3000 }).catch(() => {});
  check('Dialog page: trigger opens a dialog with its title and description', (await page.locator('hlm-dialog-content').getByText('Edit profile').isVisible().catch(() => false)) && (await page.locator('hlm-dialog-content').getByText('Make changes to your profile').isVisible().catch(() => false)));
  await page.screenshot({ path: `${out}/ui-dialog-open.png` });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  check('Dialog closes on Escape', (await page.locator('hlm-dialog-content').count()) === 0);
  await open(page, '/docs/ui-alert');
  check('Alert page: two role=alert elements', (await page.locator(`${preview} [role=alert]`).count()) === 2);
  await open(page, '/docs/ui-feedback');
  check('Feedback page: progress, skeletons, avatar and separator render', (await page.locator(`${preview} hlm-progress`).count()) === 1 && (await page.locator(`${preview} [hlmskeleton]`).count()) === 3 && (await page.locator(`${preview} hlm-avatar`).count()) === 1 && (await page.locator(`${preview} hlm-separator`).count()) === 1);
  await open(page, '/docs/html-layout');
  check('html-layout: demos are plain HTML (no polyfill tags)', (await page.locator('[data-testid=doc] .docs-demo-preview stacklayout, [data-testid=doc] .docs-demo-preview gridlayout').count()) === 0 && (await style(page, `${preview} .grid`, 'display')) === 'grid');
  await open(page, '/docs/grid-layout');
  const gridEq = page.locator('[data-testid=doc] .docs-demo-preview .grid').first();
  check('grid-layout migration demo is a CSS grid with 2 columns', (await gridEq.evaluate((e) => getComputedStyle(e).gridTemplateColumns.split(' ').length)) === 2);
  await open(page, '/');
  check('home: no polyfill tags in the hero demo, quick links lead with HTML first, legacy last', (await page.locator('[data-testid=hero] stacklayout').count()) === 0 && (await page.locator('[data-testid=quick-link]').first().getAttribute('href')) === '/docs/introduction' && (await page.locator('[data-testid=quick-link]').last().getAttribute('href')) === '/docs/legacy-tags');
}
// 12. axe-core (WCAG 2.0/2.1 A+AA and best practices) on every page, light and dark.
{
  for (const scheme of ['light', 'dark']) {
    const bad = [];
    for (const p of ['', ...pages.slice(1), '404.html']) {
      await open(page, '/' + p, scheme);
      await page.evaluate((dark) => document.documentElement.classList.toggle('dark', dark), scheme === 'dark');
      await page.waitForTimeout(150);
      const v = await axe(page);
      if (v.length) bad.push(`/${p}: ${v.join('; ')}`);
    }
    check(`axe ${scheme}: 0 violations across ${pages.length + 1} pages`, bad.length === 0, bad.join(' | '));
  }
}await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);


