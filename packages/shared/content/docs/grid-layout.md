---
title: GridLayout
section: Layouts
order: 11
description: Rows and columns with row, col and span.
---

# GridLayout

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