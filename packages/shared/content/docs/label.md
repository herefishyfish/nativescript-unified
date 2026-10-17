---
title: Label and text runs
section: Views
order: 20
description: Label, FormattedString and Span.
---

# Label and text runs

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
    <Span text="and teal " color="#3e8e84"></Span>
    <Span text="and plain."></Span>
  </FormattedString>
</Label>
```

In the HTML-first design you can also write ordinary text elements (`<p>`, `<strong>`, `<em>`). On a device MasonKit nests them into a single native text run. The polyfills exist for code that already uses the NativeScript tags.