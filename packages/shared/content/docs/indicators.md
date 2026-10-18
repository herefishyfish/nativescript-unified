---
title: ActivityIndicator and Progress
section: Legacy NativeScript tags
order: 54
description: Busy and progress indicators.
---

# ActivityIndicator and Progress

> [!NOTE]
> **Legacy support.** This page documents a NativeScript tag that the web polyfills implement so existing NativeScript markup renders in a browser. For new code, use [helm progress and skeleton](/docs/ui-feedback). See [Legacy NativeScript tags](/docs/legacy-tags).

## ActivityIndicator

Hidden until `busy` is set.

```html live
<ActivityIndicator busy="true"></ActivityIndicator>
```

## Progress

`value` out of `max` (default 100), shown as a bar.

```html live
<Progress value="65"></Progress>
```

## HTML-first equivalent

Spartan helm has a progress bar, a skeleton and a spinner. See [Progress, skeleton, avatar and separator](/docs/ui-feedback) for live progress and skeleton examples.