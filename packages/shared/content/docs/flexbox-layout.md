---
title: FlexboxLayout
section: Layouts
order: 12
description: CSS flexbox through NativeScript attribute names.
---

# FlexboxLayout

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