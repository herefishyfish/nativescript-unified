---
title: ScrollView
section: Views
order: 22
description: Vertical and horizontal scrolling.
---

# ScrollView

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