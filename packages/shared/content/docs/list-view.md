---
title: ListView and Repeater
section: Views
order: 23
description: Lists of items from a comma-separated string or an array.
---

# ListView and Repeater

Both take `items` as a comma-separated string or an array, and show each item as text.

## ListView

Each row is a button. The `itemTap` output emits the row index.

```html live
<ListView items="Apples, Bananas, Cherries" class="rounded border"></ListView>
```

## Repeater

`<Repeater>` stacks the items vertically and has no tap behaviour.

```html live
<Repeater items="One, Two, Three"></Repeater>
```

These fallbacks render items as plain text. Custom item templates are not implemented.