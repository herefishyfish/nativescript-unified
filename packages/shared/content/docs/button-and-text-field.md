---
title: Button and TextField
section: Views
order: 26
description: What is not polyfilled, and the HTML-first alternative.
---

# Button and TextField

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

Whether MasonKit on a device renders `<button>` and `<input>` has not been checked in this workspace yet, so treat native form controls as open work.

## HtmlView and ContentView

`<HtmlView html="...">` renders an HTML string, and `selectable` allows text selection. `<ContentView>` holds a single child.

```html live
<HtmlView html="<b>Bold</b> and <i>italic</i> from an HTML string"></HtmlView>
```