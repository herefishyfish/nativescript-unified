---
title: Button and TextField
section: NativeScript views
order: 53
description: What is not polyfilled, and the HTML-first alternative.
---

# Button and TextField

> [!NOTE]
> **NativeScript views.** On a device these tags are NativeScript's own views, and in a browser there is no polyfill for them. For HTML-first pages, use [helm buttons](/docs/ui-button) and [form controls](/docs/ui-form-controls). See [NativeScript views](/docs/nativescript-views).

The `web-polyfills` package has **no** `<Button>` or `<TextField>` component. The full list of tags it implements is:

`ActionBar`, `NavigationButton`, `Tabs`, `Pager`, `Drawer`, `GridLayout`, `StackLayout`, `WrapLayout`, `AbsoluteLayout`, `DockLayout`, `FlexboxLayout`, `SplitView`, `ContentView`, `ScrollView`, `ActivityIndicator`, `Progress`, `Switch`, `Slider`, `SearchBar`, `SegmentedBar`, `ListPicker`, `Label`, `FormattedString`, `Span` (also as `NSpan`), `Placeholder`, `Image`, `DatePicker`, `TimePicker`, `HtmlView`, `ListView`, `Repeater` and `WebView`.

In an HTML-first app you use the HTML elements for those two, styled with Spartan helm. See the HTML-first equivalent below.

On a device, MasonKit renders `<button>` and `<input>` as native views. Taps fire `(click)`, and the input takes typed text. [Native status](/docs/components#native-status) lists the remaining gaps.

## HtmlView and ContentView

`<HtmlView html="...">` renders an HTML string through `[innerHTML]`, and `selectable` allows text selection. `<ContentView>` projects its content into a column. `Page` and `Frame` are not registered. See [Polyfill limitations](/docs/polyfill-limitations).

```html live
<HtmlView html="<b>Bold</b> and <i>italic</i> from an HTML string"></HtmlView>
```

## HTML-first equivalent

`<Button text="Save">` is `<button hlmBtn>Save</button>`, and `<TextField hint="Email">` is `<input hlmInput placeholder="Email" />`:

```html live
<div class="flex max-w-sm flex-col gap-3">
  <input hlmInput type="email" placeholder="Email" aria-label="Email" />
  <div class="flex flex-row flex-wrap gap-2">
    <button hlmBtn>Save</button>
    <button hlmBtn variant="outline">Cancel</button>
  </div>
</div>
```

See [Button](/docs/ui-button) and [Form controls](/docs/ui-form-controls) for every variant.