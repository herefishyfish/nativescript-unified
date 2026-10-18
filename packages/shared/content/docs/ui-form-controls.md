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

Nothing on native uses these yet, so treat them as planned. The text-input elements need MasonKit support that has not been checked in this workspace. See [Polyfill limitations](/docs/polyfill-limitations) and [Web vs native](/docs/web-vs-native).