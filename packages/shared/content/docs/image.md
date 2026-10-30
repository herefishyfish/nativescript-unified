---
title: Image
section: Legacy NativeScript tags
order: 49
description: Image with src and alt.
---

# Image

> [!NOTE]
> **Legacy support.** This page documents a NativeScript tag that the web polyfills implement so existing NativeScript markup renders in a browser. For new code, use [the plain `img` element](/docs/html-first). See [Legacy NativeScript tags](/docs/legacy-tags).

`<Image>` renders an `<img>`. It takes `src` and `alt`, and the image is capped at the width of its container.

```html live
<Image src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAABQCAIAAAARP+ljAAAAlklEQVR42u3RMQ0AAAgEsXeDLGb8G8AEE2lyCq6paT0uFgAWYAEWYAEWYAEGLMACLMACLMACDFiABViABViABViAAQuwAAuwAAuwAAMWYAEWYAEWYAEGLMACLMACLMACLMCABViABViABViAAQuwAAuwAAuwAAN2AbAAC7AAC7AACzBgARZgARZgARZgwAIswAIswLpqAXHIsLPftyiDAAAAAElFTkSuQmCC" alt="Teal placeholder" class="rounded-lg"></Image>
```

Nothing is rendered when `src` is empty. On a device, a `data:` URI must be base64 (`data:image/png;base64,...`), and Android does not decode SVG.

## HTML-first equivalent

Use `<img>` with `src` and `alt`. Add `max-w-full` if you want the same width cap the polyfill applies.