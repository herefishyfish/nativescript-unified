---
title: Picker
section: Components
order: 31
description: A form field that opens a searchable list of options, for one value or several.
---

# Picker

`hlm-picker` is a form field styled like the select trigger. It opens a list with a search field, so it suits long lists that a select or a dropdown would make the user scroll through. Give it a `title`, which heads the list, and `options`, each a `value` and a `label`.

```html live
<div class="flex max-w-sm flex-col gap-2">
  <hlm-picker
    #fruit
    title="Fruit"
    placeholder="Choose a fruit"
    [options]="[
      { value: 'apple', label: 'Apple' },
      { value: 'apricot', label: 'Apricot' },
      { value: 'avocado', label: 'Avocado' },
      { value: 'banana', label: 'Banana' },
      { value: 'blackberry', label: 'Blackberry' },
      { value: 'blueberry', label: 'Blueberry' },
      { value: 'cherry', label: 'Cherry' },
      { value: 'coconut', label: 'Coconut' },
      { value: 'fig', label: 'Fig' },
      { value: 'grape', label: 'Grape' },
      { value: 'grapefruit', label: 'Grapefruit' },
      { value: 'guava', label: 'Guava' },
      { value: 'kiwi', label: 'Kiwi' },
      { value: 'lemon', label: 'Lemon' },
      { value: 'lime', label: 'Lime' },
      { value: 'lychee', label: 'Lychee' },
      { value: 'mango', label: 'Mango' },
      { value: 'melon', label: 'Melon' },
      { value: 'nectarine', label: 'Nectarine' },
      { value: 'orange', label: 'Orange' },
      { value: 'papaya', label: 'Papaya' },
      { value: 'peach', label: 'Peach' },
      { value: 'pear', label: 'Pear' },
      { value: 'pineapple', label: 'Pineapple' },
      { value: 'plum', label: 'Plum' },
      { value: 'raspberry', label: 'Raspberry' },
      { value: 'strawberry', label: 'Strawberry' },
      { value: 'watermelon', label: 'Watermelon' }
    ]"
  />
  <p class="text-sm">Value: {{ fruit.value() ?? 'none' }}</p>
</div>
```

One choice closes the list. The list moves the selected options to the top when it opens. Set `preserveOrder` to keep the order you gave.

## Several values

With `multiple`, choosing an option toggles it. On the web each toggle applies at once, as in a select; in the native app, Done saves the choice. The value is an array, and the field lists the labels.

```html live
<div class="flex max-w-sm flex-col gap-2">
  <hlm-picker
    #toppings
    title="Toppings"
    multiple
    [value]="['cheese']"
    [options]="[
      { value: 'cheese', label: 'Cheese' },
      { value: 'mushroom', label: 'Mushroom' },
      { value: 'olive', label: 'Olive' },
      { value: 'onion', label: 'Onion' },
      { value: 'pepper', label: 'Pepper' }
    ]"
  />
  <p class="text-sm">Value: {{ toppings.value() }}</p>
</div>
```

## Add an option

With `allowAdd`, the list ends in an "Add new" button. It asks for a name, starting from the search text, and emits it as `added`. The picker does not add the option itself. Its owner creates it and adds it to `options`.

```html live
<div class="flex max-w-sm flex-col gap-2">
  <hlm-picker
    title="Field"
    allowAdd
    [options]="[
      { value: 'north', label: 'North paddock' },
      { value: 'river', label: 'River flats' }
    ]"
    (added)="added.textContent = 'Added: ' + $event"
  />
  <p class="text-sm" #added>Added: nothing yet</p>
</div>
```

## Forms

`hlm-picker` implements Angular's `ControlValueAccessor`, so it works with `ngModel` and reactive forms. A single picker's value is a string, or `null` when nothing is chosen. A `multiple` picker's value is an array of strings. `disabled` and a form control's disabled state both turn the field off.

| Input | Type | Default |
| --- | --- | --- |
| `title` | `string` | Required |
| `options` | `{ value: string; label: string }[]` | `[]` |
| `value` | `string \| string[] \| null` | `null` |
| `placeholder` | `string` | `'Select'` |
| `multiple` | `boolean` | `false` |
| `allowAdd` | `boolean` | `false` |
| `preserveOrder` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |

`valueChange` emits the new value, and `added` emits the name typed into the "Add new" form.

On the web, the list drops down from the field like a select. Focus moves to the search line, the arrow keys move the highlight, Enter chooses, and Escape or a click outside closes the list. ArrowDown on the field opens it. In the native app, the list opens full screen with `ModalDialogService`, with a title row and Cancel, and the Android back button cancels it.

`HlmPickerHost` decides how the list opens. Its web default, `HlmPickerDropdownHost`, anchors the list to the field with `BrnOverlayService`. `provideSpartanNativeScript()` replaces it with `NativeScriptPickerHost` (`packages/ui/native/ui/picker-host.ts`). To open the list another way, provide your own `HlmPickerHost` at the root.
