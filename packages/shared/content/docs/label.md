---
title: Label and text runs
section: Legacy NativeScript tags
order: 48
description: Label, FormattedString and Span.
---

# Label and text runs

> [!NOTE]
> **Legacy support.** This page documents a NativeScript tag that the web polyfills implement so existing NativeScript markup renders in a browser. For new code, use [plain text elements](/docs/html-first). See [Legacy NativeScript tags](/docs/legacy-tags).

## Label

`<Label>` shows text. The `text` input is the string to display. Child content is also projected.

```html live
<Label text="Hello from a NativeScript Label"></Label>
```

## FormattedString and Span

`<FormattedString>` holds `<Span>` children, each with its own `text`. A span can set `font-weight` and `color`.

```html live
<Label>
  <FormattedString>
    <Span text="Bold " font-weight="700"></Span>
    <Span text="and teal " color="var(--primary)"></Span>
    <Span text="and plain."></Span>
  </FormattedString>
</Label>
```

In the HTML-first design you can also write ordinary text elements (`<p>`, `<strong>`, `<em>`). On a device MasonKit nests them into a single native text run. The polyfills exist for code that already uses the NativeScript tags.

## HTML-first equivalent

Write ordinary text elements. `<Label text="...">` is a `<p>` or `<span>`, and `<FormattedString>` with `<Span>` children is inline markup:

```html live
<p>
  <strong>Bold </strong>
  <span class="text-primary font-semibold">and teal </span>
  and plain.
</p>
```