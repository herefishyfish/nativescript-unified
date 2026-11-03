---
title: FlexboxLayout
section: NativeScript views
order: 43
description: CSS flexbox through NativeScript attribute names.
---

# FlexboxLayout

> [!NOTE]
> **A NativeScript view.** On a device this tag is NativeScript's own view, and in a browser the web polyfills draw it. For HTML-first pages, use [flex classes](/docs/html-layout). See [NativeScript views](/docs/nativescript-views).

`<FlexboxLayout>` is a flex container.

| Attribute | On | Values |
| --- | --- | --- |
| `flexDirection` | FlexboxLayout | `row` (default), `row-reverse`, `column`, `column-reverse` |
| `flexWrap` | FlexboxLayout | `nowrap` (default), `wrap`, `wrap-reverse` |
| `justifyContent` | FlexboxLayout | `flex-start`, `flex-end`, `center`, `space-between`, `space-around` |
| `alignItems` | FlexboxLayout | `flex-start`, `flex-end`, `center`, `baseline`, `stretch` |
| `alignContent` | FlexboxLayout | `flex-start`, `flex-end`, `center`, `space-between`, `space-around`, `stretch` |
| `order` | child | integer |
| `flexGrow`, `flexShrink` | child | number |
| `alignSelf` | child | `auto`, `flex-start`, `flex-end`, `center`, `baseline`, `stretch` |

The hyphenated forms (`flex-direction`) are accepted too. Values outside these lists are ignored.

```html live
<FlexboxLayout justifyContent="space-between" alignItems="center" class="gap-2 p-2 rounded border" style="height: 120px">
  <div class="p-3 rounded bg-primary text-primary-foreground">A</div>
  <div flexGrow="1" class="p-3 rounded bg-secondary text-secondary-foreground">B grows</div>
  <div order="-1" class="p-3 rounded bg-accent text-accent-foreground">C (order -1)</div>
</FlexboxLayout>
```

## HTML-first equivalent

The attributes are the CSS flex properties, so they become Tailwind classes: `justifyContent="space-between"` is `justify-between`, `alignItems="center"` is `items-center`, `flexGrow="1"` on a child is `grow`, and `order="-1"` is `-order-1`.

```html live
<div class="flex justify-between items-center gap-2 p-2 rounded border" style="height: 120px">
  <div class="p-3 rounded bg-primary text-primary-foreground">A</div>
  <div class="grow p-3 rounded bg-secondary text-secondary-foreground">B grows</div>
  <div class="-order-1 p-3 rounded bg-accent text-accent-foreground">C (order -1)</div>
</div>
```