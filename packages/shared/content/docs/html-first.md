---
title: HTML first
section: HTML first
order: 10
description: Write pages with plain HTML, CSS flex and grid, Tailwind classes and Spartan helm components.
---

# HTML first

The forward way to build in this project is plain HTML. A page is a template made of ordinary elements. Layout is CSS flex and grid, styling is Tailwind classes that read the shared theme tokens, and richer pieces are Spartan helm components.

```html live
<section hlmCard class="max-w-md">
  <div hlmCardHeader>
    <div hlmCardTitle>One template</div>
    <p hlmCardDescription>Plain elements, Tailwind classes and a helm card.</p>
  </div>
  <div hlmCardContent class="flex flex-col gap-3">
    <div class="flex flex-row gap-2">
      <span hlmBadge>HTML</span>
      <span hlmBadge variant="secondary">Tailwind</span>
      <span hlmBadge variant="outline">Spartan</span>
    </div>
    <button hlmBtn>Read more</button>
  </div>
</section>
```

## The four layers

1. **Elements.** `div`, `p`, `h1` to `h6`, `ul`, `li`, `a`, `span`, `img`, `button`. On the web they are the browser's own. On a device, [MasonKit](https://github.com/triniwiz/nativescript-mason) registers HTML-shaped native elements with `@nativescript/angular`.
2. **Layout.** CSS flex and grid. See [Layout with flex and grid](/docs/html-layout).
3. **Styling.** Tailwind utility classes using token names such as `bg-background`, `text-foreground` and `bg-primary text-primary-foreground`. See [Theming](/docs/theming).
4. **Components.** Spartan helm, as attributes and small components. See [Components](/docs/components).

## Which tag for which job

If you are coming from NativeScript tags, this is the HTML-first replacement for each one. The links go to the legacy page, which shows the same mapping with a live example.

| NativeScript tag | HTML first |
| --- | --- |
| `StackLayout` | `div` with `flex flex-col` or `flex flex-row` |
| `GridLayout` | `div` with `grid` and `grid-cols-*` / `grid-rows-*` |
| `FlexboxLayout` | `div` with `flex` and the justify, items and order classes |
| `WrapLayout` | `div` with `flex flex-wrap` |
| `DockLayout` | a `grid` with an `auto 1fr auto` template |
| `AbsoluteLayout` | `relative` container with `absolute` children |
| `Label`, `FormattedString`, `Span` | `p`, `span`, `strong`, `em` |
| `Image` | `img` |
| `ScrollView` | `div` with `overflow-auto` on the web, `<scroll>` in the native example app |
| `ListView`, `Repeater` | `@for` over `ul` and `li` |
| `Button`, `TextField` | `button hlmBtn`, `input hlmInput` |

## Shared between web and native

Pages that use only plain elements and token classes can live in `packages/shared` and render in both apps. See [Writing shared HTML features](/docs/shared-features). Anything that needs a platform API stays in `apps/web` or `apps/native`. See [Web vs native](/docs/web-vs-native).

> [!NOTE]
> The Tailwind classes and helm components on this site are verified on the web. `apps/native` uses `@nativescript/tailwind` and the same tokens. On an Android emulator (API 36), the native app renders these docs pages and their live demos. Each component page ends with a Native note that says what works there. iOS has not been run. See [Web vs native](/docs/web-vs-native) for the known native limitations.