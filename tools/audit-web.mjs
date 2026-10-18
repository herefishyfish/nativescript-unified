// Headless Edge audit of the prerendered docs. Usage: node tools/audit-web.mjs [baseUrl]
// Needs the prerendered site served: npx nx run web:preview (vite preview of dist/apps/web/analog/public). Screenshots go to .audit/screenshots.
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

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
  check('home: hero with h1, two CTAs and a live StackLayout demo', (await vp.locator('[data-testid=hero] h1').innerText()).includes('HTML first') && (await vp.locator('[data-testid=hero] a[hlmbtn], [data-testid=hero] a[data-slot=button]').count()) === 2 && (await vp.locator('[data-testid=home-stack]').count()) === 1);
  check('home: live StackLayout is a flex row', (await style(vp, '[data-testid=home-stack]', 'flex-direction')) === 'row');
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
}await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);


