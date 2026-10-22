---
title: Progress, skeleton, avatar and separator
section: Components
order: 29
description: Small display components for progress, loading placeholders, avatars and dividers.
---

# Progress, skeleton, avatar and separator

## Progress

`hlm-progress` takes `value` and `max`. Put an `hlm-progress-indicator` inside it.

```html live
<hlm-progress [value]="65" aria-label="Upload progress" class="max-w-sm">
  <hlm-progress-indicator />
</hlm-progress>
```

## Skeleton

`hlmSkeleton` is a placeholder block. Size it with classes.

```html live
<div class="flex items-center gap-3">
  <div hlmSkeleton class="size-12 rounded-full"></div>
  <div class="flex flex-col gap-2">
    <div hlmSkeleton class="h-4 w-48"></div>
    <div hlmSkeleton class="h-4 w-32"></div>
  </div>
</div>
```

## Avatar

`hlm-avatar` shows an `hlmAvatarImage` when it loads and an `hlmAvatarFallback` otherwise. This example has only a fallback.

```html live
<hlm-avatar>
  <span hlmAvatarFallback>DL</span>
</hlm-avatar>
```

## Separator

`hlmSeparator` takes `orientation` and `decorative`.

```html live
<div class="flex max-w-xs flex-col gap-3">
  <p class="text-sm">Above</p>
  <hlm-separator />
  <p class="text-sm">Below</p>
</div>
```

## Native

Results on the Android emulator (API 36), in light and dark. iOS has not been run.

- **Progress:** the track renders, but the indicator is not drawn, so the bar looks empty at any value.
- **Skeleton:** the blocks are not visible. No error is logged.
- **Avatar:** the fallback circle renders, but the initials sit in the top left instead of the center. See [Known native limitations](/docs/web-vs-native).
- **Separator:** works.

`apps/native/src/app.css` adds a `motion-safe` variant override because NativeScript drops media queries. Without it, the spinner and skeleton animations would never run.