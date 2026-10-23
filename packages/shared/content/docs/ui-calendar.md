---
title: Calendar
section: Components
order: 37
description: A month calendar with single, multiple and range selection.
---

# Calendar

`hlm-calendar` selects one date. It takes `date`, `min`, `max`, `disabled`, `dateDisabled` and `weekStartsOn`, and emits `dateChange`. Dates are plain `Date` objects through the brain's native date adapter.

```html live
<div class="flex flex-col gap-2">
  <hlm-calendar (dateChange)="chosen.textContent = $event.toDateString()" />
  <p class="text-sm">Selected: <span #chosen data-testid="calendar-selected">none</span></p>
</div>
```

`hlm-calendar-multi` selects several dates and `hlm-calendar-range` selects a range. All three take `captionLayout` (`label`, `dropdown`, `dropdown-months` or `dropdown-years`). `hlm-month-year-calendar` is a month and year picker.
