---
title: Button
section: Components
order: 21
description: The hlmBtn directive for button and a elements, with variants and sizes.
---

# Button

`hlmBtn` styles a `<button>` or `<a>` element. It does not replace the element, so native button behaviour, `type`, `disabled` and links all keep working.

## Variants

```html live
<div class="flex flex-wrap gap-2">
  <button hlmBtn>Default</button>
  <button hlmBtn variant="secondary">Secondary</button>
  <button hlmBtn variant="outline">Outline</button>
  <button hlmBtn variant="ghost">Ghost</button>
  <button hlmBtn variant="destructive">Destructive</button>
  <button hlmBtn variant="link">Link</button>
</div>
```

`variant` is one of `default`, `outline`, `secondary`, `ghost`, `destructive` or `link`.

## Sizes

```html live
<div class="flex flex-wrap items-center gap-2">
  <button hlmBtn size="xs">Extra small</button>
  <button hlmBtn size="sm">Small</button>
  <button hlmBtn>Default</button>
  <button hlmBtn size="lg">Large</button>
</div>
```

`size` is `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm` or `icon-lg`.

## As a link and disabled

```html live
<div class="flex flex-wrap gap-2">
  <a hlmBtn variant="outline" href="/docs/components">A link styled as a button</a>
  <button hlmBtn disabled>Disabled</button>
</div>
```

## Native

`button hlmBtn` works on native. On the Android emulator (API 36), every variant and size renders in light and dark, taps fire `(click)`, and the disabled button is dimmed. These results have not been checked on iOS yet.

Two gaps remain:

- On `a hlmBtn`, the text sits at the top of the button and is underlined. A tap on the demo link does nothing. See [Links between docs pages](/docs/web-vs-native#known-native-limitations).
- Size and shape utilities such as `h-12` or `rounded-full` on `hlmBtn` have no effect, because helm's own rules win. See [Known native limitations](/docs/web-vs-native#known-native-limitations).