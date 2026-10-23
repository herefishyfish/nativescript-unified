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
