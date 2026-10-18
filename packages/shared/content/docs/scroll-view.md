---
title: ScrollView
section: Legacy NativeScript tags
order: 50
description: Vertical and horizontal scrolling.
---

# ScrollView

> [!NOTE]
> **Legacy support.** This page documents a NativeScript tag that the web polyfills implement so existing NativeScript markup renders in a browser. For new code, use [an overflow container](/docs/html-first). See [Legacy NativeScript tags](/docs/legacy-tags).

`<ScrollView>` scrolls its content. `orientation` is `vertical` (the default) or `horizontal`. Give the view a bounded size, or there is nothing to scroll.

```html live
<ScrollView class="rounded border" style="height: 120px">
  <StackLayout class="gap-2 p-2">
    <Label text="Row 1"></Label>
    <Label text="Row 2"></Label>
    <Label text="Row 3"></Label>
    <Label text="Row 4"></Label>
    <Label text="Row 5"></Label>
    <Label text="Row 6"></Label>
    <Label text="Row 7"></Label>
    <Label text="Row 8"></Label>
  </StackLayout>
</ScrollView>
```

```html live
<ScrollView orientation="horizontal" class="rounded border" style="height: 64px">
  <StackLayout orientation="horizontal" class="gap-2 p-2">
    <div class="p-2 rounded bg-primary text-primary-foreground" style="min-width: 140px">One</div>
    <div class="p-2 rounded bg-secondary text-secondary-foreground" style="min-width: 140px">Two</div>
    <div class="p-2 rounded bg-accent text-accent-foreground" style="min-width: 140px">Three</div>
    <div class="p-2 rounded bg-muted text-muted-foreground" style="min-width: 140px">Four</div>
    <div class="p-2 rounded bg-primary text-primary-foreground" style="min-width: 140px">Five</div>
  </StackLayout>
</ScrollView>
```

## HTML-first equivalent

A `div` with `overflow-y-auto` and a bounded height scrolls the same way. Use `overflow-x-auto` for the horizontal case:

```html live
<div class="overflow-y-auto rounded border" style="height: 120px" tabindex="0" role="region" aria-label="Scrollable rows">
  <div class="flex flex-col gap-2 p-2">
    <p>Row 1</p>
    <p>Row 2</p>
    <p>Row 3</p>
    <p>Row 4</p>
    <p>Row 5</p>
    <p>Row 6</p>
  </div>
</div>
```

The native example app wraps page content in `<scroll>` instead. See [Web vs native](/docs/web-vs-native).