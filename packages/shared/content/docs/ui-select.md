---
title: Select
section: Components
order: 30
description: A select with a trigger, a portalled list of items, groups and a separator.
---

# Select

`hlm-select` holds an `hlm-select-trigger` and an `hlm-select-content`. The content is declared with `*hlmSelectPortal`, so the list is only created when the select opens. `value` and `valueChange` come from the brain select.

```html live
<div class="flex flex-col gap-2">
  <label hlmLabel for="fruit-select">Fruit</label>
  <hlm-select (valueChange)="picked.textContent = $event">
    <hlm-select-trigger buttonId="fruit-select" class="w-56">
      <hlm-select-value placeholder="Pick a fruit" />
    </hlm-select-trigger>
    <hlm-select-content *hlmSelectPortal>
      <hlm-select-group>
        <hlm-select-label>Fruits</hlm-select-label>
        <hlm-select-item value="apple">Apple</hlm-select-item>
        <hlm-select-item value="banana">Banana</hlm-select-item>
        <hlm-select-item value="cherry">Cherry</hlm-select-item>
      </hlm-select-group>
    </hlm-select-content>
  </hlm-select>
  <p class="text-sm">Picked: <span #picked data-testid="select-picked">nothing</span></p>
</div>
```

`hlm-select-trigger` renders a `role="combobox"` button, so give it a name: `buttonId` sets its id, and a `<label for>` with the same id labels it. It also takes `size` (`default` or `sm`). The list can be grouped with `hlm-select-group`, `hlm-select-label` and `hlm-select-separator`.

For a browser-native `<select>` styled with helm, see `hlm-native-select` on [More components](/docs/ui-more).

## Native

The select is broken on native. On the Android emulator (API 36), in light and dark:

- The trigger renders without its placeholder text.
- A tap opens the list in an anchored popover window, with the group label and the items.
- A tap on an item does nothing, and the demo still shows `Picked: nothing`. The Android back button closes the list.

The brain trigger measures itself with `getBoundingClientRect()`, which MasonKit elements do not have, so it throws. See [Known native limitations](/docs/web-vs-native#known-native-limitations). These results have not been checked on iOS yet.
