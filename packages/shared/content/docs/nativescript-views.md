---
title: NativeScript views overview
section: NativeScript views
order: 40
description: Why NativeScript layouts and views render on the web, and when to use them.
---

# NativeScript views

> [!NOTE]
> These are NativeScript's own view tags, such as `<StackLayout>` and `<Label>`. On a device they are real views, and in a browser the web polyfills draw them. New pages are HTML first. See [HTML first](/docs/html-first) and [Components](/docs/components).

## Why they exist

NativeScript apps are often written with tags such as `<StackLayout>`, `<GridLayout>` and `<Label>`. The `web-polyfills` package implements those tags as Angular components whose selector is the tag name. If you import them, an existing tree renders on the web without being rewritten:

```html live
<StackLayout class="gap-2 p-4 rounded-lg bg-card text-card-foreground border">
  <Label text="This is a NativeScript StackLayout"></Label>
  <Label text="rendered in the browser by web-polyfills"></Label>
</StackLayout>
```

The code shown with every demo is the code that runs, compiled in your browser against the real polyfill components.

## When to use them

- You are moving an existing NativeScript app to the web and want it to render before you rewrite it.
- You are keeping a shared template that uses NativeScript tags.

Otherwise, use plain HTML. Each page in this section ends with an HTML-first equivalent, and the table on [HTML first](/docs/html-first) lists them all.

## What is in this section

- **Layouts:** [StackLayout](/docs/stack-layout), [GridLayout](/docs/grid-layout), [FlexboxLayout](/docs/flexbox-layout), [WrapLayout](/docs/wrap-layout), [DockLayout](/docs/dock-layout) and [AbsoluteLayout](/docs/absolute-layout).
- **Views:** [Label](/docs/label), [Image](/docs/image), [ScrollView](/docs/scroll-view), [ListView and Repeater](/docs/list-view), [Switch, Slider and pickers](/docs/controls), [Button and TextField](/docs/button-and-text-field) and [ActivityIndicator and Progress](/docs/indicators).
- **Limits:** [Polyfill limitations](/docs/polyfill-limitations).

[SplitView](/docs/split-view) and [Navigation views](/docs/navigation-views) have polyfills too. Their pages are under App structure, because apps build their screens around them.

## Not custom elements

The polyfills are Angular components that you import where you use them. They are not registered as DOM custom elements, because a custom element name must contain a hyphen and `StackLayout` does not.

## Web only

Native never imports `web-polyfills`. On a device those tags are real NativeScript views.