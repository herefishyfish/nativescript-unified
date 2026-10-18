---
title: Polyfill limitations
section: Legacy NativeScript tags
order: 56
description: What web-polyfills does not do, taken from its source.
---

# Polyfill limitations

> [!NOTE]
> **Legacy support.** These are the limits of the web polyfills for NativeScript tags. They do not apply to HTML-first code. See [Legacy NativeScript tags](/docs/legacy-tags).

`packages/web-polyfills` exists so a legacy NativeScript tree renders in a browser. It is a fallback, not a port of NativeScript. These limits come from reading its source.

## Not custom elements

The components are Angular components whose selector is the NativeScript tag. A custom element name must contain a hyphen, so `customElements.define('StackLayout')` would throw and is never called. `provideNsElements()` and `defineNsElements()` are no-ops kept for compatibility.

You must import the component where you use the tag. `NS_ELEMENTS` is a map from tag name to component, and this site passes all of its values to every demo.

## Tags that do not exist

- `Button` and `TextField`. See [Button and TextField](/docs/button-and-text-field).
- `Page` and `Frame`. The source says they are not registered.
- Anything not in the `NS_ELEMENTS` map.

`ns-tab`, `ns-page` and `ns-segmented-bar-item` are plain child elements that their parent reads. They are not components.

## Reduced behaviour

| View | Limit |
| --- | --- |
| `Label` | Takes `text` and projected content only. |
| `Span` | Styles only `font-weight` and `color`. |
| `ListView`, `Repeater` | Show items as plain text. No item templates. |
| `Pager` | One page visible at a time, with Prev, Next and dots. No scroll snapping. |
| `Image` | Renders nothing when `src` is empty. |
| `WebView` | An `iframe`. A `src` containing `<` is treated as an HTML string and set as the frame document. |
| `HtmlView` | Binds the string through `[innerHTML]`, so Angular's sanitizer applies. |

## Events

Angular outputs and model inputs carry plain values, for example `checkedChange` emits a boolean. They are not DOM `CustomEvent` objects. The tap-like outputs are `NavigationButton` `tap` and `ListView` `itemTap`.

## Platform looks are approximations

`ActionBar`, `Tabs`, `Pager` and `Drawer` take `platform="ios"` or `platform="material"`. The web cannot run UIKit or Material components, so these are CSS approximations of how the native views look. See [Navigation views](/docs/navigation-views).

## Layout attributes

- A bare number is pixels.
- Values outside the documented lists are ignored.
- The polyfill writes styles onto the host and its children and re-applies them with a `MutationObserver`. Because those are inline styles, they win over a class that sets the same property.

## Placeholder

`<Placeholder>` shows a dashed box saying "No native view yet" until a child is projected. It marks the spots where a real native view has no web equivalent:

```html live
<StackLayout class="gap-2">
  <Placeholder></Placeholder>
  <Placeholder>
    <Label text="A child replaces the fallback"></Label>
  </Placeholder>
</StackLayout>
```

## Scope

The polyfills are legacy support for existing NativeScript markup. New UI belongs in [Components](/docs/components).