---
title: Form controls
section: Components
order: 24
description: Input, label, textarea, checkbox, switch and radio group.
---

# Form controls

## Input, label and textarea

`hlmInput` and `hlmTextarea` are attributes on the native `<input>` and `<textarea>` elements. `hlmLabel` goes on a `<label>`.

```html live
<div class="flex max-w-sm flex-col gap-3">
  <div class="flex flex-col gap-1.5">
    <label hlmLabel for="demo-email">Email</label>
    <input hlmInput id="demo-email" type="email" placeholder="you@example.com" />
  </div>
  <div class="flex flex-col gap-1.5">
    <label hlmLabel for="demo-notes">Notes</label>
    <textarea hlmTextarea id="demo-notes" placeholder="Write something"></textarea>
  </div>
</div>
```

## Checkbox

`<hlm-checkbox>` is a form control. Give it a template reference and read `checked()` to react to it.

```html live
<div class="flex items-center gap-2">
  <hlm-checkbox #terms aria-label="Accept terms" />
  <span class="text-sm">{{ terms.checked() ? 'Terms accepted' : 'Terms not accepted' }}</span>
</div>
```

## Switch

`<hlm-switch>` exposes `checked`, `checkedChange`, `disabled` and `size`.

```html live
<div class="flex items-center gap-2">
  <hlm-switch #notify aria-label="Notifications" />
  <span class="text-sm">Notifications are {{ notify.checked() ? 'on' : 'off' }}</span>
</div>
```

## Radio group

`<hlm-radio-group>` holds `<hlm-radio>` items. `value` on the group is the selected item, and each item has its own `value`.

```html live
<hlm-radio-group value="comfortable" class="flex flex-col gap-2">
  <hlm-radio value="compact" aria-label="Compact"><hlm-radio-indicator indicator /> Compact</hlm-radio>
  <hlm-radio value="comfortable" aria-label="Comfortable"><hlm-radio-indicator indicator /> Comfortable</hlm-radio>
  <hlm-radio value="spacious" aria-label="Spacious"><hlm-radio-indicator indicator /> Spacious</hlm-radio>
</hlm-radio-group>
```

`hlm-checkbox` and `hlm-switch` implement Angular's `ControlValueAccessor`, so they also work with `ngModel` and reactive forms in an app.

## Native

These controls work on native. On the Android emulator (API 36), in light and dark:

- The input and the textarea take typed text and show their placeholders. The textarea has no inner padding, so its text touches the border.
- The checkbox and the switch toggle, and the demo text follows `checked()`.
- The radio group selects an item when you tap its circle. A tap on the item's text does not select it.

These results have not been checked on iOS yet.