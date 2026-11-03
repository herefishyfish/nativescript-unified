---
title: Markdown content on native
section: Routing and content
order: 16
description: Content files, front matter and the Markdown renderer in analog-native.
---

# Markdown content on native

A device has no DOM, so a string of HTML renders nothing. `analog-native` parses Markdown at build time and renders the token tree as real elements that MasonKit shows natively.

## Content files

Put Markdown in `src/content`. Front matter is parsed by the Vite plugin in Node:

```md
---
title: Getting started with Analog on NativeScript
description: Every Markdown feature the native renderer supports, in one post.
date: 2026-10-01
---

# Getting started
```

The device bundle contains neither `marked` nor a YAML parser. It receives a `ContentFile` with `filename`, `slug`, `attributes`, `content` and pre-lexed `tokens`.

## List and read

| API | Use |
| --- | --- |
| `injectContentFiles(filter?)` | Front matter of every file under `src/content`, loaded eagerly. Bodies stay unloaded. |
| `injectContent(options?)` | One file as an `Observable<ContentFile>`. It reads the `slug` route param by default. |
| `MarkdownComponent` | `<analog-markdown [content]="file" />`. Takes a `ContentFile` or a token array, not a Markdown string. |
| `HrefDirective` | Makes `<a href="/about">` navigate with the router. |

```ts
export default class BlogPostPage {
  readonly post = toSignal(injectContent<PostAttributes>({ param: 'slug', subdirectory: 'blog' }));
}
```

The slug matches the file name, not a `slug` field in front matter.

## Markdown as a route

A `.md` file inside `pages/` is a route. `apps/native/src/app/pages/docs/index.md` becomes `/docs`, rendered by `MarkdownRouteComponent`, and its `title` front matter becomes the route title and the `ActionBar` title. It is an `index.md` so `docs/[slug].page.ts` can serve `/docs/:slug` next to it. A `docs.md` beside that directory would be a layout for the slug pages.

## What each element becomes

| Markdown | Element |
| --- | --- |
| Headings | `h1` to `h6` |
| Paragraph | `p` |
| Lists | `ul` or `ol`, with `li` |
| Quote | A `div`. A quote starting with `[!NOTE]`, `[!TIP]` or `[!WARNING]` becomes a titled callout, as on the web |
| Code block | `pre > code`, in a `div` that scrolls sideways |
| Rule | `hr` |
| Image | `img` |
| Table | A CSS grid of cells. MasonKit has no table elements. |
| Bold, italic, strike, code, link | `strong`, `em`, `del`, `code`, `a` |

Text elements nest, so a paragraph with bold text and a link is one native text run. The demo shows that structure in a browser through `HtmlView`. It approximates the structure and is not MasonKit's output:

```html live
<HtmlView html="<h3>A heading</h3><p>Text with <strong>bold</strong>, <em>italic</em> and <code>code</code> in one paragraph.</p><ul><li>First</li><li>Second</li></ul>"></HtmlView>
```

## Limits

- Raw HTML inside Markdown is dropped.
- Links to app paths use the router. Full URLs open the browser.
- Styling comes from `markdown.css`, scoped under `.markdown`. Override it in your own CSS after the import.

## How this site renders these pages

The pages you are reading are Markdown in `packages/shared/content/docs`. The web app parses them with its own build-time plugin in `apps/web/tools` and renders each `html live` block as a demo. The native app reads the same files and renders them with `<analog-markdown>`. Each `html live` block gets Preview and Code tabs, and the Preview tab compiles the block's HTML on the device against the registered native elements and helm.