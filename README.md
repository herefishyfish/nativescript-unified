# nativescript-unified

One Nx monorepo (Angular 22, Vite 8, Nx 23) for an **HTML-first** NativeScript Angular design that runs on web and native.
Web and native stay separate at the top; shared HTML/features sit underneath.

```
apps/
  web/               AnalogJS app (@analogjs/platform, Vite). File routes in src/app/pages, web core in src/app/app.config.ts
  native/            NativeScript Angular app (@nativescript/vite). File routes in src/app/pages via analog-native
packages/
  shared/            HTML-first components + content used by BOTH apps (plain HTML templates, no platform imports)
  ui/                Spartan: brain (headless) + helm (styled), ported to Angular 22, plus styles/ (tailwind preset, style-vega, tokens.css)
  web-polyfills/     Angular components so a legacy <StackLayout>/<GridLayout>/<Label> tree renders on the web
  analog-native/     File-based router + Markdown for NativeScript Angular (from nativescript-analog packages/analog)
docs/design.md       analog-native design notes
```

## Commands

```
npm install                       # also patches @nativescript/vite (tools/patch-nativescript-vite.mjs)
npx nx show projects              # analog-native native shared ui web web-polyfills
npx nx serve web                  # dev server (AnalogJS)
npx nx build web                  # -> dist/apps/web/client
npx nx test web-polyfills         # 21 tests
npx nx test analog-native         # 14 tests
npx nx run-many -t typecheck      # tsc for ui, shared, web-polyfills, web, native, analog-native
npx nx run native:android         # needs the NativeScript CLI + Android SDK (not verified in the scaffolding pass)
```

## Theme

`packages/ui/styles/tokens.css` is the single source of colour tokens (shadcn-style names, plain hex), inspired by
New Balance Numeric Jamie Foy 306 "Sea Salt / Vintage Teal": background `#F2EBDD`, foreground `#10302F`,
primary `#3E8E84`, muted sand `#E3D9C4`. Dark mode (`.dark` on web, `.ns-dark` on native) flips to deep teal.
Hex values are estimates, not sampled from the shoe.
- web: `apps/web/src/styles.css` imports `packages/ui/styles/index.css` (tailwind + Spartan preset + style-vega + tokens).
- native: `apps/native/src/app.css` imports `tokens.css` only (NativeScript CSS, no Tailwind yet).

## Where things came from

- `analog-native`, `apps/native`: `D:\Code\playgrounds\nativescript-analog` (`packages/analog`, `apps/demo`).
  The import name is `@nativescript-unified/analog-native` (path-mapped in `tsconfig.base.json`).
- `web-polyfills`: `angular-docs` `origin/main` `packages/libraries/ui` only (layouts, views, text runs, Placeholder,
  ActionBar/Tabs/Pager/Drawer). Dropped: docs content, PLAN/RESEARCH/CONTENT-GAPS, playground, showcase catalog, brand, WebGPU hero, theme service.
- `ui`: `spartan` working tree on `feat/nativescript` (libs/brain, libs/helm, registry `style-vega.css`).
  `packages/ui/native/` holds Spartan's native-demo glue (shims, icon, overlays, overrides) as **reference only**, not compiled or wired in.

## Known gaps / decisions

- `apps/web` is prerendered (`ssr: true` + `static: true` in `vite.config.mts`); `nx build web` writes static HTML for `/` and every `/docs/:slug` to `dist/apps/web/analog/public`. Routes come from the files in `packages/shared/content/docs`.
- Docs content is Markdown in `packages/shared/content/docs` (front matter: title, section, order, description). A fenced block tagged `html live` is both shown and rendered as a live demo (Angular JIT, see `apps/web/src/app/docs/demo.ts`).
- Verify the built site: `npm run serve:static` then `npm run audit:web` (headless Edge via playwright-core; screenshots in `.audit/screenshots`).
- Spartan brain/helm are consumed from source via tsconfig paths (`@spartan-ng/brain/*`, `@spartan-ng/helm/*`), not built packages. Their specs were copied but have no test target yet.
- `embla-carousel-angular@21` and `ngx-scrollbar@19` have Angular 21-era peers; they installed but are unproven on 22.
- Native does not yet use Spartan helm or Tailwind; `packages/shared` templates use Tailwind classes that only take effect on web until native gets `@nativescript/tailwind`.
- Native verified by `tsc` only (no device/emulator build). Node 24.14 is slightly below Angular 22.2's engine range (24.15), warnings only.

