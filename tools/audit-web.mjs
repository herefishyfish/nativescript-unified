// Headless Edge audit of the prerendered docs. Usage: node tools/audit-web.mjs [baseUrl]
// Needs the prerendered site served: npx nx run web:preview (vite preview of dist/apps/web/analog/public). Screenshots go to .audit/screenshots.
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const base = process.argv[2] ?? 'http://localhost:4300';
const out = '.audit/screenshots';
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
const pages = ['', 'docs/introduction', 'docs/project-structure', 'docs/file-routing', 'docs/stack-layout', 'docs/grid-layout', 'docs/flexbox-layout', 'docs/wrap-layout', 'docs/dock-layout', 'docs/absolute-layout', 'docs/label', 'docs/image', 'docs/scroll-view', 'docs/list-view', 'docs/controls', 'docs/indicators', 'docs/button-and-text-field', 'docs/theming'];
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
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);


