---
title: Button and TextField
section: Legacy NativeScript tags
order: 53
description: What is not polyfilled, and the HTML-first alternative.
---

# Button and TextField

> [!NOTE]
> **Legacy support.** This page documents a NativeScript tag that the web polyfills implement so existing NativeScript markup renders in a browser. For new code, use [helm buttons](/docs/ui-button) and [form controls](/docs/ui-form-controls). See [Legacy NativeScript tags](/docs/legacy-tags).

The `web-polyfills` package has **no** `<Button>` or `<TextField>` component. The full list of tags it implements is:

`ActionBar`, `NavigationButton`, `Tabs`, `Pager`, `Drawer`, `GridLayout`, `StackLayout`, `WrapLayout`, `AbsoluteLayout`, `DockLayout`, `FlexboxLayout`, `SplitView`, `ContentView`, `ScrollView`, `ActivityIndicator`, `Progress`, `Switch`, `Slider`, `SearchBar`, `SegmentedBar`, `ListPicker`, `Label`, `FormattedString`, `Span`, `Placeholder`, `Image`, `DatePicker`, `TimePicker`, `HtmlView`, `ListView`, `Repeater` and `WebView`.

In an HTML-first app you use the HTML elements for those two. On the web this site uses the Spartan `helm` button:

```html live
<StackLayout orientation="horizontal" class="gap-2">
  <button hlmBtn>Default</button>
  <button hlmBtn variant="secondary">Secondary</button>
  <button hlmBtn variant="outline">Outline</button>
  <button hlmBtn variant="ghost">Ghost</button>
</StackLayout>
```

On a device, MasonKit renders `<button>` and `<input>` as native views. On an Android emulator (API 36), `button hlmBtn` and `input hlmInput` render, taps fire `(click)`, and the input takes typed text. See [Button](/docs/ui-button) and [Form controls](/docs/ui-form-controls) for the gaps that remain. iOS has not been run.

## HtmlView and ContentView

`<HtmlView html="...">` renders an HTML string through `[innerHTML]`, and `selectable` allows text selection. `<ContentView>` projects its content into a column. `Page` and `Frame` are not registered; see [Polyfill limitations](/docs/polyfill-limitations).

```html live
<HtmlView html="<b>Bold</b> and <i>italic</i> from an HTML string"></HtmlView>
```

## HTML-first equivalent

This page already points the same way: there is no polyfill for these two tags because HTML and Spartan cover them. See [Button](/docs/ui-button) and [Form controls](/docs/ui-form-controls).