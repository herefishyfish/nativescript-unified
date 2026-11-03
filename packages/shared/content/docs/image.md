---
title: Image
section: NativeScript views
order: 49
description: Image with src and alt.
---

# Image

> [!NOTE]
> **A NativeScript view.** On a device this tag is NativeScript's own view, and in a browser the web polyfills draw it. For HTML-first pages, use [the plain `img` element](/docs/html-first). See [NativeScript views](/docs/nativescript-views).

`<Image>` renders an `<img>`. It takes `src` and `alt`, and the image is capped at the width of its container.

```html live
<Image src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAABQCAIAAAARP+ljAAAAlklEQVR42u3RMQ0AAAgEsXeDLGb8G8AEE2lyCq6paT0uFgAWYAEWYAEWYAEGLMACLMACLMACDFiABViABViABViAAQuwAAuwAAuwAAMWYAEWYAEWYAEGLMACLMACLMACLMCABViABViABViAAQuwAAuwAAuwAAN2AbAAC7AAC7AACzBgARZgARZgARZgwAIswAIswLpqAXHIsLPftyiDAAAAAElFTkSuQmCC" alt="Teal placeholder" class="rounded-lg"></Image>
```

Nothing is rendered when `src` is empty. On a device, a `data:` URI must be base64 (`data:image/png;base64,...`), and Android does not decode SVG.

## HTML-first equivalent

Use `<img>` with `src` and `alt`. Add `max-w-full` if you want the same width cap the polyfill applies.