---
title: GridLayout
section: NativeScript views
order: 42
description: Rows and columns with row, col and span.
---

# GridLayout

> [!NOTE]
> **A NativeScript view.** On a device this tag is NativeScript's own view, and in a browser the web polyfills draw it. For HTML-first pages, use [CSS grid](/docs/html-layout). See [NativeScript views](/docs/nativescript-views).

`<GridLayout>` places children into a grid of rows and columns, and maps to CSS grid on the web.

| Attribute | On | Meaning |
| --- | --- | --- |
| `rows` | GridLayout | Comma-separated row tracks. Default is one `*` row. |
| `columns` | GridLayout | Comma-separated column tracks. Default is one `*` column. |
| `row`, `col` | child | Zero-based cell. Default `0`. |
| `rowspan`, `colspan` | child | Cells to span. `row-span` and `col-span` also work. |

Track values: `auto`, `*` (one `1fr`), `2*` (`2fr`), a bare number (pixels), or a number with `px`, `%`, `dip` or `fr`.

```html live
<GridLayout rows="auto, *, auto" columns="80, *" class="gap-2" style="height: 220px">
  <div row="0" col="0" colspan="2" class="p-2 rounded bg-primary text-primary-foreground">Header (row 0, spans 2)</div>
  <div row="1" col="0" class="p-2 rounded bg-secondary text-secondary-foreground">Side</div>
  <div row="1" col="1" class="p-2 rounded bg-accent text-accent-foreground">Content</div>
  <div row="2" col="0" colspan="2" class="p-2 rounded bg-muted text-muted-foreground">Footer</div>
</GridLayout>
```

## HTML-first equivalent

The polyfill maps to CSS grid, so write the grid yourself. `rows="auto, *, auto"` becomes `grid-rows-[auto_1fr_auto]`, `columns="80, *"` becomes `grid-cols-[80px_1fr]`, and `colspan="2"` becomes `col-span-2`. Children flow into cells in order, so `row` and `col` are rarely needed:

```html live
<div class="grid grid-cols-[80px_1fr] grid-rows-[auto_1fr_auto] gap-2" style="height: 220px">
  <div class="col-span-2 p-2 rounded bg-primary text-primary-foreground">Header</div>
  <div class="p-2 rounded bg-secondary text-secondary-foreground">Side</div>
  <div class="p-2 rounded bg-accent text-accent-foreground">Content</div>
  <div class="col-span-2 p-2 rounded bg-muted text-muted-foreground">Footer</div>
</div>
```