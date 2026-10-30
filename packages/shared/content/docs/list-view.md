---
title: ListView and Repeater
section: Legacy NativeScript tags
order: 51
description: Lists of items from a comma-separated string or an array.
---

# ListView and Repeater

> [!NOTE]
> **Legacy support.** This page documents a NativeScript tag that the web polyfills implement so existing NativeScript markup renders in a browser. For new code, use [a `@for` loop over a list](/docs/html-first). See [Legacy NativeScript tags](/docs/legacy-tags).

Both take `items` as a comma-separated string or an array, and show each item as text.

## ListView

Each row is a button. The `itemTap` output emits the row index. On a device a ListView scrolls its rows, so give it a height.

```html live
<ListView items="Apples, Bananas, Cherries" class="h-40 rounded border"></ListView>
```

## Repeater

`<Repeater>` stacks the items vertically and has no tap behaviour.

```html live
<Repeater items="One, Two, Three"></Repeater>
```

These fallbacks render items as plain text. Custom item templates are not implemented.

## HTML-first equivalent

Loop over your data with `@for` and write the row markup yourself, which also gives you the item templates the polyfill lacks:

```html live
<ul class="flex flex-col divide-y rounded border">
  @for (fruit of ['Apples', 'Bananas', 'Cherries']; track fruit) {
    <li class="p-3">{{ fruit }}</li>
  }
</ul>
```