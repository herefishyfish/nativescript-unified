---
title: Switch, Slider and pickers
section: Views
order: 24
description: Switch, Slider, SearchBar, SegmentedBar, ListPicker, DatePicker and TimePicker.
---

# Switch, Slider and pickers

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