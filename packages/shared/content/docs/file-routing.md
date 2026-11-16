---
title: File-based routing
section: Routing and content
order: 15
description: An optional pages/ convention for routes, on web and native.
---

# File-based routing

Routing is Angular's router on both platforms. File-based routing builds its route table from files, and it is optional. Both apps in this workspace use it, but an app can pass its own `Routes` array instead, or keep one it already has. See [Without file-based routing](#without-file-based-routing).

The conventions are [AnalogJS](https://analogjs.org/docs/features/routing/overview)'s. A page is a file in `src/app/pages` named `*.page.ts` whose default export is a component.

| File | Route |
| --- | --- |
| `pages/index.page.ts` | `/` |
| `pages/about.page.ts` | `/about` |
| `pages/blog/[slug].page.ts` | `/blog/:slug` |
| `pages/products.page.ts` plus `pages/products/*.page.ts` | a layout with children |
| `pages/(auth)/login.page.ts` | `/login` |
| `pages/[...notfound].page.ts` | `**` |

Static segments sort before `:param` segments, and `**` sorts last. A layout page renders its children through `<router-outlet>`. A `(group)` folder name adds no URL segment, and `index` is the empty path.

A page can also export `routeMeta` with any `Route` field except `path`, `component` and `children`, for example `title` or `canActivate`.

## On the web

`apps/web` uses the real AnalogJS packages. `provideFileRouter` comes from `@analogjs/router`, and the Vite plugin from `@analogjs/platform` finds the pages. This site is built that way:

```text
apps/web/src/app/pages/
  index.page.ts          /
  [...not-found].page.ts **
  docs.page.ts           layout for /docs (top bar, sidebar, outlet)
  docs/index.page.ts     /docs
  docs/[slug].page.ts    /docs/:slug, renders one Markdown file
```

The Markdown under `packages/shared/content/docs` is read at build time, and each page is prerendered to a static HTML file.

## On native

`apps/native` uses `analog-native`, a package that implements the same conventions for NativeScript. It exists because the AnalogJS router package calls plain `provideRouter` and misses the NativeScript location strategy and `RouterExtensions`, and because AnalogJS content renders to an HTML string that a native view cannot show.

The shared docs use the same URLs as the web app. `docs/[slug].page.ts` serves `/docs/:slug`, which is what the Markdown links to. `guide/index.page.ts` stays the `/guide` list, and `guide/[slug].page.ts` redirects to `/docs/:slug`.

Differences you should know about:

- `analog-native` also accepts `.md` files in `pages/` as Markdown routes.
- Optional catch-all routes (`[[...slug]]`) and Analog server features (`.server.ts`, `load`) are not supported on native.
- A routed page that shows an `<ActionBar>` imports `ActionBarComponent` from `@nativescript/angular`, or the bar keeps the app name.
- Navigating between child routes of a layout does not add a back-stack entry on native. See [Navigation](/docs/navigation).
- Front matter parsing and Markdown lexing happen at build time, so the device bundle contains neither `marked` nor a YAML parser.
- Links to app paths (`/about`) navigate with the router. Full URLs open in the browser.

Details are in `docs/design.md` at the repository root. To write Markdown routes and content, see [Markdown content on native](/docs/markdown-on-native).

## Without file-based routing

Pass a `Routes` array to the router provider instead of calling `provideFileRouter`. Pages are then ordinary components, and nothing reads `src/app/pages`.

On the web, use Angular's `provideRouter`:

```ts
import { provideRouter, withComponentInputBinding } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      [
        { path: '', component: HomePage },
        { path: 'products/:id', component: ProductPage },
      ],
      withComponentInputBinding(),
    ),
  ],
};
```

On native, use `provideNativeScriptRouter` from `@nativescript/angular`. It takes the same arguments and adds the NativeScript location strategy and `RouterExtensions`, which `page-router-outlet` needs:

```ts
import { provideNativeScriptRouter } from '@nativescript/angular';

runNativeScriptAngularApp({
  appModuleBootstrap: () =>
    bootstrapApplication(AppComponent, {
      providers: [provideNativeScriptRouter(routes)],
    }),
});
```

Both providers take Angular's `Routes`, so the two apps can share one route list from a shared package if their pages match. Markdown routes and the `.md` page files are a feature of `analog-native`'s `provideFileRouter`. Without it, render Markdown with the `analog-markdown` component from [Markdown content on native](/docs/markdown-on-native).
