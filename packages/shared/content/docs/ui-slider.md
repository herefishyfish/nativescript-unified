---
title: Slider
section: Components
order: 31
description: A slider with a track, range and thumbs, driven by the keyboard or the pointer.
---

# Slider

`hlm-slider` takes `value` as an array of numbers, one per thumb, plus `min`, `max` and `step`. It emits `valueChange`. Focus the thumb and use the arrow keys.

```html live
<div class="flex max-w-sm flex-col gap-3">
  <hlm-slider [value]="[40]" [min]="0" [max]="100" [step]="5" aria-label="Volume" (valueChange)="level.textContent = '' + $event[0]" />
  <p class="text-sm">Value: <span #level data-testid="slider-value">40</span></p>
</div>
```

## Range

Two values make two thumbs.

```html live
<div class="max-w-sm">
  <hlm-slider [value]="[20, 70]" aria-label="Price range" />
</div>
```

The inputs also include `orientation`, `disabled`, `inverted` and `showTicks`.
