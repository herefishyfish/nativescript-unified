# @nativescript-unified/analog-native design

AnalogJS-style file-based routing and Markdown content for NativeScript Angular apps built with `@nativescript/vite`. Views are written as normal HTML markup (`<div>`, `<p>`, `<h1>`, `<ul>`, `<a href>`) rendered natively by [MasonKit](https://github.com/triniwiz/nativescript-mason) and laid out with CSS flex and grid.

## Why not reuse Analog packages directly

- `@nativescript/vite/angular` already compiles Angular with `@analogjs/vite-plugin-angular`. Adding `@analogjs/platform` would register the Angular compiler twice and pull in Nitro and SSR.
- `@analogjs/router` `provideFileRouter` calls plain `provideRouter`, so it misses the NativeScript location strategy, `RouterExtensions`, and route reuse providers. Its route chunk also imports `Meta` and `HttpClient` for server-load features that don't apply on device.
- `@analogjs/content` renders Markdown to an HTML string and binds it with `[innerHTML]`. NativeScript has no DOM, so a string of HTML renders nothing.

We keep Analog's file conventions so pages written for Analog map one to one. We own the implementation.

## MasonKit is the view layer

`@triniwiz/nativescript-masonkit` (peer dependency, `>=1.0.0-beta.113`) registers HTML-shaped native elements with `@nativescript/angular`. Apps call `installMasonKit()` from `@triniwiz/nativescript-masonkit/angular` in `main.ts` before bootstrap. After that, page templates, layouts and the Markdown renderer all use plain HTML element names, `NO_ERRORS_SCHEMA`, and unitless CSS lengths (`px` means physical pixels in NativeScript).

Two MasonKit facts shape this package:

- Text elements (`p`, `h1`-`h6`, `li`, `blockquote`, `pre`, `span`, `strong`, `em`, `code`, `a`, `del`) nest. `<p>text <strong>bold</strong> more</p>` becomes one native text run that wraps as a paragraph. The Markdown renderer relies on this instead of building `FormattedString`/`Span` trees.
- MasonKit's `<a href>` calls `Utils.openUrl(href)` on click. That is right for `https://` links and wrong for app paths such as `/about`. See [Links](#links).

MasonKit has no table elements, so Markdown tables render as a CSS grid of `div` cells.

## Package layout

One publishable package, `@nativescript-unified/analog-native`, built with ng-packagr:

| Entry point | Runs in | Contents |
| --- | --- | --- |
| `@nativescript-unified/analog-native` | device | `createRoutes`, `provideFileRouter`, `injectContentFiles`, `injectContent`, `MarkdownComponent`, `MarkdownRouteComponent`, `HrefDirective`, types |
| `@nativescript-unified/analog-native/vite` | Node (Vite) | `nativescriptAnalog(options)` Vite plugin |
| `@nativescript-unified/analog-native/markdown.css` | app stylesheet | default Markdown styles, scoped under `.markdown` |

## Data shapes

```ts
type RouteModule = { default?: Type<unknown>; routeMeta?: RouteMeta };
type ContentModule<A = ContentAttributes> = { default: ContentFile<A> };
type RouteFiles = Record<string, () => Promise<RouteModule | ContentModule>>;

interface ContentFile<A = Record<string, unknown>> {
  filename: string;   // '/src/content/blog/hello.md'
  slug: string;       // 'hello'
  attributes: A;      // parsed front matter
  content: string;    // Markdown body without front matter
  tokens: Token[];    // marked lexer output, produced at build time
}
```

The route tree is built by a pure function, `createRoutes(files: RouteFiles, options?): Route[]`, over an intermediate `RawRoute { filename, rawSegment, segment, level, children }` tree. This mirrors Analog's algorithm and is unit-tested without Angular bootstrapping. The optional `options.markdownComponent` is the component that renders `.md` routes. `provideFileRouter` passes `MarkdownRouteComponent`. Taking it as a parameter keeps `createRoutes` free of runtime Angular imports, so tests can run it on plain objects.

## Build-time responsibilities (Vite plugin)

1. **Glob injection.** The runtime declares placeholder string markers (`'__NS_ANALOG_PAGE_FILES__'` and so on). The plugin rewrites each marker into an `import.meta.glob(...)` call in a normal-order `transform`, after `@analogjs/vite-plugin-angular` and before Vite's `vite:import-glob`, which then turns the calls into lazy imports. It must not be `enforce: 'pre'`: the Angular plugin emits `.ts` output from its own compilation and discards earlier transforms. Vite tracks the globs, so adding or removing a page invalidates the module.
   - Pages: `/src/app/pages/**/*.page.ts`, plus `/src/app/pages/**/*.md` as Markdown routes.
   - Content: `/src/content/**/*.md`.
   - Extra directories come from `options.pagesDirs` and `options.contentDirs`, as root-relative paths such as `/src/more-pages`.
2. **Markdown loading.** `*.md?ns-analog-content` loads as a `ContentModule`. Front matter is parsed with `front-matter` and the body is lexed with `marked`, both in Node. The device never parses YAML or Markdown.
3. **Attribute list.** `*.md?ns-analog-attributes` loads as `{ filename, slug, attributes }` only. `injectContentFiles` imports this eagerly, so list views stay small.
4. **MasonKit define.** MasonKit's code reads a `__WINDOWS__` build-time constant that `@nativescript/vite` 8.0.18 does not define. The plugin defines it as `false` unless the config already sets it.

## Route file conventions (Analog-compatible)

| File | Path |
| --- | --- |
| `pages/index.page.ts` | `/` |
| `pages/about.page.ts` | `/about` |
| `pages/blog/[slug].page.ts` | `/blog/:slug` |
| `pages/products.page.ts` + `pages/products/*.page.ts` | layout with children |
| `pages/(auth)/login.page.ts` | `/login` |
| `pages/[...notfound].page.ts` | `**` |
| `pages/docs.md` | `/docs`, rendered with `MarkdownRouteComponent` |

Sort order is static, then `:param`, then `**`. A layout page renders its children through `<router-outlet>`.

## Rendering Markdown to native views

`MarkdownComponent` (`<analog-markdown [content]>`) takes a `ContentFile` or a token array and renders the token tree with the real HTML element each token means. A token-key to template table drives dispatch, not an if-chain:

| Token | Element |
| --- | --- |
| heading | `h1`-`h6` |
| paragraph | `p` (a paragraph holding only images renders the images as blocks) |
| list, list item | `ul` / `ol`, `li` |
| blockquote | `blockquote` |
| code | `div.md-code > pre > code`, the `div` scrolling sideways (a block tagged `html live` renders the live-code component instead, see below) |
| hr | `hr` |
| image | `img` |
| table | `div.md-table` CSS grid of `div.md-th` / `div.md-td` cells |
| strong, em, del, codespan, link, br | `strong`, `em`, `del`, `code`, `a`, `br` |

Inline tokens render inside their block element as nested text elements, so a paragraph wraps as one run of text. Plain text renders as a bare Angular text node, so it joins the parent's run: it takes the parent's font, and spaces beside inline elements survive (MasonKit trims whitespace at the start and end of a container, so a `<span>` per text token lost them). A heading's content and a tight list item's text sit in one `<p>`: the native app backs `h1`-`h6`, `li` and `a` with block elements for spartan (`packages/ui/native/spartan-native.ts`), where each inline child would stack as its own block. `markdown.css` makes `.markdown a` `inline-block` for the same reason. Recursion uses `ng-template` outlets inside one component, so no extra component host boxes land inside a text run. Raw HTML tokens are dropped.

The component's host has class `markdown`. `markdown.css` styles the elements with element selectors under `.markdown` (`.markdown h1`, `.markdown pre`), and apps override them with their own rules after importing it.

## Live code blocks (`html live`)

A fenced block whose info string starts with `html live` is a live demo, the same rule the web docs build on (`packages/shared/src/lib/docs/parse.ts`, `/^html\s+live\b/`). `MarkdownComponent` renders it through `NgComponentOutlet` instead of `pre > code`, passing the source to the component's `code` input. Which component that is stays an app decision:

- `MARKDOWN_LIVE_CODE_COMPONENT` is an `InjectionToken<Type<unknown>>`; `provideMarkdownLiveCode(component)` registers it app-level.
- Without a registration the block falls back to `pre > code`, so the package ships no JIT compiler dependency and apps without demos pay nothing.

`apps/native` registers a frame component with Preview / Code tabs (`apps/native/src/app/markdown/live-demo.ts`): the Preview tab JIT-compiles the block's HTML (`import('@angular/compiler')` on demand, cached per template) against the registered native/MasonKit elements plus the helm imports, mirroring `apps/web/src/app/docs/demo.ts`. The Code tab shows the source.

Live blocks mount at the Markdown component's root, not inside the token-recursion templates: `segmentMarkdown()` splits the top-level token list into runs and live blocks (the same block model the web build's `toBlocks` uses), and each block gets its own `NgComponentOutlet` in flow. Embedded views anchored several template-outlet levels deep lose their place in the MasonKit container. The native frame is plain MasonKit markup rather than the material `MDTabs` (its ViewPager does not render inside the markdown scroll container); both panes stay mounted, so the preview keeps its state across tab switches, and the inactive one gets `display: none`, so the frame fits the active pane.

## Links

`HrefDirective` (selector `a[href]`) takes ownership of `href` on MasonKit anchors:

- External URLs (any `scheme:` or `//host`) stay on the element, so MasonKit's own click handler opens them with `Utils.openUrl`.
- App paths (`/about`, `../post`) are cleared from the element so MasonKit has nothing to open, and the directive navigates with `RouterExtensions.navigateByUrl`, resolving relative paths against the current URL.

The Markdown renderer uses the same directive, and pages import it to make plain `<a href="/about">` work.

## Deviations from the first draft

These changed while building the POC, each for a reason observed on device or in a build.

- **MasonKit replaced `StackLayout`/`Label`/`FormattedString`.** A scope change made MasonKit the view layer. The renderer now emits real HTML element names, and styling moved from `md-*` classes to element selectors under `.markdown`.
- **`MarkdownComponent` takes a `ContentFile` or a token array, not a Markdown string.** Lexing a string on device would mean shipping `marked` in the device bundle, which the build/runtime split forbids.
- **`createRoutes` takes an optional `{ markdownComponent }`.** This keeps the function free of runtime Angular imports so it stays a pure, unit-testable function.
- **The glob plugin runs in normal order, not `enforce: 'pre'`.** See step 1 above. A `pre` transform was silently discarded by the Angular plugin, and the runtime threw its "plugin missing" error at bootstrap.
- **The plugin also defines `__WINDOWS__`.** MasonKit's code reads it and `@nativescript/vite` 8.0.18 does not define it, so the app crashed at launch with `ReferenceError: __WINDOWS__ is not defined`.
- **Text renders as `<span>`.** See the rendering section above.
- **`.md` route titles come from the `title` front matter** and land on both the Angular route `title` and the `ActionBar`.
