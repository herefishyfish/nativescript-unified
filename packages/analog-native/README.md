# @nativescript-unified/analog-native

AnalogJS-style file-based routing and Markdown content for NativeScript Angular apps built with [`@nativescript/vite`](https://docs.nativescript.org/configuration/vite).

- Put pages in `src/app/pages` and get routes, following [Analog's conventions](https://analogjs.org/docs/features/routing/overview).
- Put Markdown in `src/content` and list it by front matter, or render it as native views.
- Write templates in normal HTML markup (`<div>`, `<p>`, `<a href>`), rendered natively by [MasonKit](https://github.com/triniwiz/nativescript-mason).

Front matter parsing and Markdown lexing happen at build time in Vite. The device bundle never ships `marked` or a YAML parser.

## Install

```sh
npm install @nativescript-unified/analog-native @triniwiz/nativescript-masonkit@1.0.0-beta.113
```

Peer dependencies: `@angular/core`, `@angular/router` 22+, `@nativescript/angular` 22+, `@nativescript/core` 9+, `@triniwiz/nativescript-masonkit` 1.0.0-beta.113+, and `vite` 8+.

## Set up

Add the Vite plugin after `angularConfig`:

```ts
// vite.config.mts
import { defineConfig, mergeConfig } from 'vite';
import { angularConfig } from '@nativescript/vite/angular';
import { nativescriptAnalog } from '@nativescript-unified/analog-native/vite';

export default defineConfig(({ mode }) =>
  mergeConfig(angularConfig({ mode }), {
    plugins: [nativescriptAnalog()],
  }),
);
```

Install MasonKit and provide the file router:

```ts
// src/main.ts
import { bootstrapApplication, runNativeScriptAngularApp } from '@nativescript/angular';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideFileRouter } from '@nativescript-unified/analog-native';
import { installMasonKit } from '@triniwiz/nativescript-masonkit/angular';
import { AppComponent } from './app/app.component';

installMasonKit();

runNativeScriptAngularApp({
  appModuleBootstrap: () =>
    bootstrapApplication(AppComponent, {
      providers: [provideFileRouter(), provideZonelessChangeDetection()],
    }),
});
```

`AppComponent` renders `<page-router-outlet />`.

Load MasonKit before `app.css` is parsed, so its CSS shorthands apply. The generated entry imports `src/polyfills.ts` first:

```ts
// src/polyfills.ts
import '@nativescript/core/globals';
import '@nativescript/angular/polyfills';
import '@triniwiz/nativescript-masonkit';
```

Import the default Markdown styles in `app.css`:

```css
@import '@nativescript-unified/analog-native/markdown.css';
```

## File conventions

| File | Route |
| --- | --- |
| `pages/index.page.ts` | `/` |
| `pages/about.page.ts` | `/about` |
| `pages/blog/[slug].page.ts` | `/blog/:slug` |
| `pages/products.page.ts` with `pages/products/*.page.ts` | layout; render children with `<router-outlet />` |
| `pages/(auth)/login.page.ts` | `/login` (the group adds no segment) |
| `pages/[...notfound].page.ts` | `**` |
| `pages/docs.md` | `/docs`, rendered by `MarkdownRouteComponent` |

Static segments match before `:param`, and `:param` before `**`. A page file default-exports its component and can export `routeMeta` (any `Route` field except path, component and children):

```ts
export const routeMeta: RouteMeta = { title: 'About', canActivate: [authGuard] };

@Component({ selector: 'about-page', imports: [ActionBarComponent], schemas: [NO_ERRORS_SCHEMA], template: `...` })
export default class AboutPage {}
```

Routed pages that show an `<ActionBar>` must import `ActionBarComponent` from `@nativescript/angular`, or the bar keeps the app name.

## API

| Export | From | Purpose |
| --- | --- | --- |
| `nativescriptAnalog(options?)` | `@nativescript-unified/analog-native/vite` | Vite plugin. `pagesDirs` and `contentDirs` add root-relative directories. |
| `provideFileRouter(...features)` | `@nativescript-unified/analog-native` | `provideNativeScriptRouter` with the generated routes. |
| `createRoutes(files, options?)` | `@nativescript-unified/analog-native` | Pure route builder, for custom setups and tests. |
| `injectContentFiles(filter?)` | `@nativescript-unified/analog-native` | `{ filename, slug, attributes }[]` for every file under `src/content`. |
| `injectContent(options?)` | `@nativescript-unified/analog-native` | `Observable<ContentFile>`. Defaults to the `slug` param; `{ param, subdirectory }` or `{ customFilename }`. |
| `MarkdownComponent` | `@nativescript-unified/analog-native` | `<analog-markdown [content]="file" />` renders a `ContentFile` or token array. |
| `HrefDirective` | `@nativescript-unified/analog-native` | Import it where you write `<a href>`. App paths navigate with the router, URLs open the browser. |

```ts
@Component({
  imports: [ActionBarComponent, MarkdownComponent],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <ActionBar [title]="post()?.attributes?.title ?? ''" />
    <scroll>
      @if (post(); as post) {
        <analog-markdown [content]="post" />
      }
    </scroll>
  `,
})
export default class BlogPostPage {
  readonly post = toSignal(injectContent<PostAttributes>({ param: 'slug', subdirectory: 'blog' }));
}
```

## Styling

Markdown renders as plain elements inside a host with class `markdown`: `h1`-`h6`, `p`, `ul`, `ol`, `li`, `div.md-blockquote` (and `aside.md-callout` for `> [!NOTE]` alerts), `div.md-code > pre > code` (the `div` scrolls sideways), `code`, `strong`, `em`, `del`, `a`, `hr`, `img`, and a CSS grid `div.md-table` of `span.md-th` and `span.md-td` cells. `markdown.css` styles them with selectors such as `.markdown h1`. Override any of them in your own CSS after the import. Use unitless lengths: in NativeScript `px` means physical pixels.

## Limitations

- Raw HTML in Markdown is dropped. There is no DOM to put it in.
- Content lookup by slug matches the file name, not a `slug` front matter field.
- Optional catch-all routes (`[[...slug]]`) and Analog server-side features (`.server.ts`, `load`) are not supported.
- In your own templates, wrap loose text that sits next to elements inside `@for`/`@if` in a `<span>`. MasonKit appends dynamically inserted text nodes after their element siblings.
- Navigating between child routes of a layout does not add a back-stack entry. Android back leaves the layout page, as with any NativeScript page.
