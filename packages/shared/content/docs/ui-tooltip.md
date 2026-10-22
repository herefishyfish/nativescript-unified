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
## Native

The tooltip is broken on native. On the Android emulator (API 36), in light and dark, the buttons render, but a tap or a long press shows no tooltip. The brain tooltip listens for `scroll` on `document.defaultView`, which does not exist on NativeScript, so it throws. A touch screen also has no hover. See [Known native limitations](/docs/web-vs-native). iOS has not been run.
