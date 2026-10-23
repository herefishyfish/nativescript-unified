---
title: Switch, Slider and pickers
section: Legacy NativeScript tags
order: 52
description: Switch, Slider, SearchBar, SegmentedBar, ListPicker, DatePicker and TimePicker.
---

# Switch, Slider and pickers

> [!NOTE]
> **Legacy support.** This page documents a NativeScript tag that the web polyfills implement so existing NativeScript markup renders in a browser. For new code, use [Spartan helm form controls](/docs/ui-form-controls). See [Legacy NativeScript tags](/docs/legacy-tags).

| View | Inputs | Output |
| --- | --- | --- |
| `Switch` | `checked` | `checkedChange` |
| `Slider` | `min`, `max`, `value` | `valueChange` |
| `SearchBar` | `hint` (placeholder), `text` | `search` (on submit), `textChange` |
| `SegmentedBar` | `selectedIndex`, with `ns-segmented-bar-item` children that have a `title` | `selectedIndexChange` |
| `ListPicker` | `items` (comma-separated), `selectedIndex` | `selectedIndexChange` |
| `DatePicker` | `year`, `month`, `day` (month and day start at 1), `minDate`, `maxDate` | `dateChange` (`YYYY-MM-DD`) |
| `TimePicker` | `hour`, `minute`, `minHour`, `maxHour`, `minMinute`, `maxMinute` | `timeChange` (`HH:MM`) |

## Switch

```html live
<Switch checked="true"></Switch>
```

## Slider

```html live
<Slider min="0" max="100" value="40"></Slider>
```

## SearchBar

```html live
<SearchBar hint="Search the docs"></SearchBar>
```

## SegmentedBar

```html live
<SegmentedBar selectedIndex="1">
  <ns-segmented-bar-item title="Day"></ns-segmented-bar-item>
  <ns-segmented-bar-item title="Week"></ns-segmented-bar-item>
  <ns-segmented-bar-item title="Month"></ns-segmented-bar-item>
</SegmentedBar>
```

## ListPicker

```html live
<ListPicker items="Small, Medium, Large" selectedIndex="1"></ListPicker>
```

## DatePicker and TimePicker

```html live
<StackLayout class="gap-2">
  <DatePicker year="2026" month="10" day="18"></DatePicker>
  <TimePicker hour="9" minute="30"></TimePicker>
</StackLayout>
```

## HTML-first equivalent

Each of these has a Spartan helm counterpart with a live example:

| Legacy view | HTML first |
| --- | --- |
| `Switch` | `hlm-switch` on [Form controls](/docs/ui-form-controls) |
| `Slider` | `hlm-slider` on [Slider](/docs/ui-slider) |
| `SearchBar` | `input hlmInput type="search"` on [Form controls](/docs/ui-form-controls) |
| `SegmentedBar` | `hlmToggleGroup` on [More components](/docs/ui-more) |
| `ListPicker` | `hlm-select` on [Select](/docs/ui-select) |
| `DatePicker` | `hlm-calendar` on [Calendar](/docs/ui-calendar) |

A `TimePicker` has no helm counterpart. The workspace also has a helm `date-picker` folder under `packages/ui/helm`, which has no page here yet. Check the [Native status](/docs/components#native-status) table before you rely on the slider, select or calendar in the native app.