---
title: Getting started with Analog on NativeScript
description: Every Markdown feature the native renderer supports, in one post.
date: 2026-10-01
---

# Getting started

Markdown here becomes **native views**. Inline styles mix freely: *italic*, **bold**, ***both***, ~~struck~~, and `inline code`, all wrapping inside one paragraph as the line gets long enough to need a second or third line.

Links work both ways: the [about page](/about) navigates inside the app, and [analogjs.org](https://analogjs.org) opens the browser.

## Lists

1. Create a page in `src/app/pages`
2. Add Markdown under `src/content`
   - nested bullet one
   - nested bullet **two**
3. Run the app

- Unordered item
- Another item with a [link to products](/products/2)

## Quote and code

> File-based routing keeps the URL and the file tree in step.
> It reads like a sitemap.

```ts
export default class HomePage {
  readonly posts = injectContentFiles();
}
```

---

## Image and table

![A mountain lake](https://picsum.photos/id/1015/800/400)

| Convention | Path |
| --- | --- |
| `index.page.ts` | `/` |
| `[slug].page.ts` | `/:slug` |
| `[...notfound].page.ts` | `**` |
