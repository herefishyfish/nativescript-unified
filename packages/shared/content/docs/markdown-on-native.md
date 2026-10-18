---
title: Markdown content on native
section: Guides
order: 32
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

A `.md` file inside `pages/` is a route. `apps/native/src/app/pages/docs.md` becomes `/docs`, rendered by `MarkdownRouteComponent`, and its `title` front matter becomes the route title and the `ActionBar` title.

## What each element becomes

| Markdown | Element |
| --- | --- |
| Headings | `h1` to `h6` |
| Paragraph | `p` |
| Lists | `ul` or `ol`, with `li` |
| Quote | `blockquote` |
| Code block | `pre > code` |
| Rule | `hr` |
| Image | `img` |
| Table | A CSS grid of cells. MasonKit has no table elements. |
| Bold, italic, strike, code, link | `strong`, `em`, `del`, `code`, `a` |

Text elements nest, so a paragraph with bold and a link is one native text run. This is the same structure shown in a browser through `HtmlView`. It is only an approximation of the structure, not MasonKit output:

```html live
<HtmlView html="<h3>A heading</h3><p>Text with <strong>bold</strong>, <em>italic</em> and <code>code</code> in one paragraph.</p><ul><li>First</li><li>Second</li></ul>"></HtmlView>
```

## Limits

- Raw HTML inside Markdown is dropped.
- Links to app paths use the router. Full URLs open the browser.
- Styling comes from `markdown.css`, scoped under `.markdown`. Override it in your own CSS after the import.

## This site is separate

The pages you are reading are Markdown in `packages/shared/content/docs`. The web app parses them with its own build-time plugin in `apps/web/tools`, and renders `html live` blocks as demos. The native app does not read them yet. Showing this content on native is planned.