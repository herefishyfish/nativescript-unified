---
title: Badge
section: Components
order: 22
description: The hlmBadge directive for small status labels.
---

# Badge

`hlmBadge` styles a `<span>` or any inline element as a small label.

```html live
<div class="flex flex-wrap items-center gap-2">
  <span hlmBadge>Default</span>
  <span hlmBadge variant="secondary">Secondary</span>
  <span hlmBadge variant="outline">Outline</span>
  <span hlmBadge variant="destructive">Destructive</span>
  <span hlmBadge variant="ghost">Ghost</span>
  <span hlmBadge variant="link">Link</span>
</div>
```

`variant` is one of `default`, `secondary`, `destructive`, `outline`, `ghost` or `link`. The selector is `[hlmBadge],hlm-badge`, so both the attribute and the element form work.

## Native

The badge works on native. On the Android emulator (API 36), all six variants render in light and dark. iOS has not been run.