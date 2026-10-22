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

`<FormattedString>` holds `<NSpan>` children, each with its own `text`. A span can set `font-weight` and `color`.

On a device MasonKit owns the `span` and `Span` tags, so NativeScript's own Span is `<NSpan>` (and its Button is `<NButton>`). The web polyfill answers to both `Span` and `NSpan`.

```html live
<Label>
  <FormattedString>
    <NSpan text="Bold " font-weight="700"></NSpan>
    <NSpan text="and teal " color="var(--primary)"></NSpan>
    <NSpan text="and plain."></NSpan>
  </FormattedString>
</Label>
```

In the HTML-first design you can also write ordinary text elements (`<p>`, `<strong>`, `<em>`). On a device MasonKit nests them into a single native text run. The polyfills exist for code that already uses the NativeScript tags.

## HTML-first equivalent

Write ordinary text elements. `<Label text="...">` is a `<p>` or `<span>`, and `<FormattedString>` with `<NSpan>` children is inline markup:

```html live
<p>
  <strong>Bold </strong>
  <span class="text-primary font-semibold">and teal </span>
  and plain.
</p>
```