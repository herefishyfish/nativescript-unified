---
title: File-based routing
section: Getting started
order: 3
description: One pages/ convention on web and native.
---

# File-based routing

Both apps use the [AnalogJS](https://analogjs.org/docs/features/routing/overview) file conventions. A page is a file in `src/app/pages` named `*.page.ts` whose default export is a component.

| File | Route |
| --- | --- |
| `pages/index.page.ts` | `/` |
| `pages/about.page.ts` | `/about` |
| `pages/blog/[slug].page.ts` | `/blog/:slug` |
| `pages/products.page.ts` plus `pages/products/*.page.ts` | a layout with children |
| `pages/(auth)/login.page.ts` | `/login` |
| `pages/[...notfound].page.ts` | `**` |

Static segments sort before `:param` segments, and `**` sorts last. A layout page renders its children through `<router-outlet>`.

## On the web

`apps/web` uses the real AnalogJS packages. `provideFileRouter` comes from `@analogjs/router`, and the Vite plugin from `@analogjs/platform` finds the pages. This site is built that way:

```text
apps/web/src/app/pages/
  index.page.ts          /
  docs.page.ts           layout for /docs (top bar, sidebar, outlet)
  docs/[slug].page.ts    /docs/:slug, renders one Markdown file
```

The Markdown under `packages/shared/content/docs` is read at build time, and each page is prerendered to a static HTML file.

## On native

`apps/native` uses `analog-native`, a package that implements the same conventions for NativeScript. It exists because the AnalogJS router package calls plain `provideRouter` and misses the NativeScript location strategy and `RouterExtensions`, and because AnalogJS content renders to an HTML string that a native view cannot show.

Differences you should know about:

- `analog-native` also accepts `.md` files in `pages/` as Markdown routes.
- Optional catch-all routes (`[[...slug]]`) and Analog server features (`.server.ts`, `load`) are not supported on native.
- Front matter parsing and Markdown lexing happen at build time, so the device bundle contains neither `marked` nor a YAML parser.
- Links to app paths (`/about`) navigate with the router. Full URLs open in the browser.

Details are in `docs/design.md` at the repository root.