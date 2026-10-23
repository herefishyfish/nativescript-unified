---
title: Tooltip
section: Components
order: 38
description: A small label shown when you hover or focus an element.
---

# Tooltip

`hlmTooltip` is an attribute on any element. Its value is the tooltip text. `position` sets the side and `showDelay` and `hideDelay` are in milliseconds.

```html live
<div class="flex gap-3">
  <button hlmBtn variant="outline" hlmTooltip="Add to library" position="top" [showDelay]="0">Hover me</button>
  <button hlmBtn variant="outline" hlmTooltip="Shown below" position="bottom" [showDelay]="0">Bottom</button>
</div>
```

`tooltipDisabled` turns the tooltip off.
