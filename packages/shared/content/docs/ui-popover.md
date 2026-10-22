---
title: Popover
section: Components
order: 32
description: A floating panel anchored to a trigger button.
---

# Popover

`hlm-popover` wraps a `button[hlmPopoverTrigger]` and an `hlm-popover-content` declared with `*hlmPopoverPortal`. Click the trigger to open it. Escape or a click outside closes it.

```html live
<hlm-popover>
  <button hlmBtn hlmPopoverTrigger variant="outline">Open popover</button>
  <hlm-popover-content *hlmPopoverPortal="let ctx" class="w-72">
    <div hlmPopoverHeader>
      <div hlmPopoverTitle>Dimensions</div>
      <p hlmPopoverDescription>Set the dimensions for the layer.</p>
    </div>
    <div class="flex flex-col gap-1.5 pt-3">
      <label hlmLabel for="popover-width">Width</label>
      <input hlmInput id="popover-width" value="100%" />
    </div>
  </hlm-popover-content>
</hlm-popover>
```

`hlm-popover` takes `align`, `sideOffset`, `state` and `closeOnOutsidePointerEvents`, and emits `stateChanged` and `closed`.
The popover overlay gets ole="dialog" from the brain popover, and helm has no input for an accessible name on it. In your own app, check that against your accessibility requirements.

## Native

The popover opens in a native popover window from `@nativescript-community/ui-popover`, anchored to its trigger. `align` and `sideOffset` set where the window sits. Select, combobox, autocomplete and date picker use the same anchored window.

On the Android emulator (API 36), the popover opened below its trigger in light and dark, with its title, description and input. The Android back button closed it. The helm card draws without its shadow and ring there. iOS has not been run.
