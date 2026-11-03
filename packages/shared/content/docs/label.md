---
title: Label and text runs
section: NativeScript views
order: 48
description: Label, FormattedString and Span.
---

# Label and text runs

> [!NOTE]
> **A NativeScript view.** On a device this tag is NativeScript's own view, and in a browser the web polyfills draw it. For HTML-first pages, use [plain text elements](/docs/html-first). See [NativeScript views](/docs/nativescript-views).

## Label

`<Label>` shows text. The `text` input is the string to display. Child content is also projected.

```html live
<Label text="Hello from a NativeScript Label"></Label>
```

## FormattedString and Span

`<FormattedString>` holds `<NSpan>` children, each with its own `text`. Style a span with classes such as `font-bold` and `text-primary`, which work on both platforms. The web polyfill also reads `font-weight` and `color` attributes, but on a device those set nothing.

On a device MasonKit owns the `span` and `Span` tags, so NativeScript's own Span is `<NSpan>` (and its Button is `<NButton>`). The web polyfill answers to both `Span` and `NSpan`.

```html live
<Label>
  <FormattedString>
    <NSpan text="Bold " class="font-bold"></NSpan>
    <NSpan text="and teal " class="text-primary"></NSpan>
    <NSpan text="and plain."></NSpan>
  </FormattedString>
</Label>
```

## HTML-first equivalent

Write ordinary text elements. `<Label text="...">` is a `<p>` or `<span>`, and `<FormattedString>` with `<NSpan>` children is inline markup. On a device, MasonKit nests them into one native text run:

```html live
<p>
  <strong>Bold </strong>
  <span class="text-primary font-semibold">and teal </span>
  and plain.
</p>
```