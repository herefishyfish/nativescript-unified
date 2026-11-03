---
title: ActivityIndicator and Progress
section: NativeScript views
order: 54
description: Busy and progress indicators.
---

# ActivityIndicator and Progress

> [!NOTE]
> **A NativeScript view.** On a device this tag is NativeScript's own view, and in a browser the web polyfills draw it. For HTML-first pages, use [helm progress and skeleton](/docs/ui-feedback). See [NativeScript views](/docs/nativescript-views).

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

Spartan helm has a progress bar, a skeleton and a spinner. `<Progress>` becomes `hlm-progress`, and `<ActivityIndicator>` becomes `hlm-spinner`. See [Progress, skeleton, avatar and separator](/docs/ui-feedback) for progress and skeleton, and [Kbd and spinner](/docs/ui-more#kbd-and-spinner) for the spinner.