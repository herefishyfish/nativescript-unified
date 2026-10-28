---
title: Native elements
section: HTML first
order: 14
description: Draw form controls, helm components and dialogs with platform widgets in the parts of an app you choose.
---

# Native elements

By default, MasonKit draws every HTML element on the device, including the form controls. `<input>` and `<textarea>` are MasonKit views, and helm's switch, checkbox and slider are built from MasonKit boxes. You can have chosen parts of an app draw platform widgets from `@nativescript-community` instead. The template stays the same, and the web still renders HTML.

This app keeps MasonKit everywhere except the example screens on the UI tab and the second demo below.

## MasonKit and native

The same markup twice. In the app, the first demo is MasonKit and the second draws Material widgets on Android. On the web, both draw HTML.

```html live
<div class="flex max-w-sm flex-col gap-3">
  <input hlmInput type="email" placeholder="you@example.com" aria-label="Email" />
  <textarea hlmTextarea placeholder="Write something" aria-label="Notes"></textarea>
  <div class="flex items-center gap-2">
    <hlm-switch #sync aria-label="Sync" />
    <span class="text-sm">Sync is {{ sync.checked() ? 'on' : 'off' }}</span>
  </div>
  <div class="flex items-center gap-2">
    <hlm-checkbox #terms aria-label="Accept terms" />
    <span class="text-sm">{{ terms.checked() ? 'Terms accepted' : 'Terms not accepted' }}</span>
  </div>
  <hlm-slider [value]="[40]" [step]="5" aria-label="Volume" />
</div>
```

```html live native
<div class="flex max-w-sm flex-col gap-3">
  <input hlmInput type="email" placeholder="you@example.com" aria-label="Email" />
  <textarea hlmTextarea placeholder="Write something" aria-label="Notes"></textarea>
  <div class="flex items-center gap-2">
    <hlm-switch #sync aria-label="Sync" />
    <span class="text-sm">Sync is {{ sync.checked() ? 'on' : 'off' }}</span>
  </div>
  <div class="flex items-center gap-2">
    <hlm-checkbox #terms aria-label="Accept terms" />
    <span class="text-sm">{{ terms.checked() ? 'Terms accepted' : 'Terms not accepted' }}</span>
  </div>
  <hlm-slider [value]="[40]" [step]="5" aria-label="Volume" />
</div>
```

A docs block tagged `html live native` previews the native way in the app. The web ignores the extra word.

## Packages

Install the package for each widget you use:

| Widget | Package | Android | iOS |
| --- | --- | --- | --- |
| `input` | `@nativescript-community/ui-textfield` | Material TextInputLayout | UITextField |
| `textarea` | `@nativescript-community/ui-textview` | Material TextInputLayout | UITextView |
| `hlm-switch` | `@nativescript-community/ui-switch` | Material switch | UISwitch |
| `hlm-checkbox` | `@nativescript-community/ui-checkbox` | Material checkbox | SF Symbols toggle |
| `hlm-slider` | `@nativescript-community/ui-slider` | Material slider | UISlider |
| Dialogs | `@nativescript-community/ui-dialogs` | Material dialogs | UIAlertController |
| `button` | None, it is core's `Button` | Button | UIButton |

```bash
npm install @nativescript-community/ui-textfield @nativescript-community/ui-textview @nativescript-community/ui-switch @nativescript-community/ui-checkbox @nativescript-community/ui-slider @nativescript-community/ui-dialogs -w apps/native
```

The Android widgets use Material 3. This app's theme already extends `Theme.Material3.DayNight.NoActionBar`.

## HTML tags

`provideNativeElements()` maps tags to platform views. Each key is a tag, and each value is the view that tag creates. This app defines the mapping once, in `apps/native/src/app/native-elements.ts`:

```ts
import { provideNativeElements } from '../../../../packages/ui/native/native-elements';
import { NativeTextField } from '../../../../packages/ui/native/native-elements/text-field';
import { NativeTextView } from '../../../../packages/ui/native/native-elements/text-view';

export const NATIVE_ELEMENTS = provideNativeElements({ input: NativeTextField, textarea: NativeTextView });
```

Put it in the `providers` of the component that hosts the native part. It applies to the components Angular creates below that component through `ngComponentOutlet` or `createComponent`, and to everything inside them. The host's own template keeps MasonKit. The example page renders each screen through `ngComponentOutlet`, so it takes the provider:

```ts
@Component({
  selector: 'example-page',
  providers: [NATIVE_ELEMENTS],
  template: `<ng-container *ngComponentOutlet="example.component" />`,
})
export default class ExamplePage {}
```

The adapters keep what the shared templates use:

- `value`, `[value]`, `placeholder` and `disabled` work as on the web.
- `(input)` fires for each edit the user makes, with `$event.target.value`, so Angular forms and `#ref.value` read the text. Code that sets `value` does not fire it.
- `(focus)` and `(blur)` come from the platform field.
- `type="email"`, `"password"`, `"number"`, `"tel"`, `"url"` and `"search"` choose the keyboard, hide the text for a password, and turn off autocorrect where it gets in the way.

The text fields start without the Material box and floating label, so helm's classes draw them as on the web. For the Material look, set `variant="outline"` (or `"filled"`) and `floating="true"` on the element.

### Native buttons

`NativeButton` puts core's `Button` behind `<button>`, with `(click)` and `disabled` as on the web:

```ts
import { NativeButton } from '../../../../packages/ui/native/native-elements/button';

provideNativeElements({ input: NativeTextField, textarea: NativeTextView, button: NativeButton });
```

It draws text only, so an `ng-icon` or other element inside the button does not show. In a test on the docs' drawer demo, the drawer's button did not render at all. This app does not map `button`.

### Your own views

Any NativeScript view class works. To keep the web contract, have your class take `value`, `disabled` and the events your templates bind, as the adapters in `packages/ui/native/native-elements` do.

```ts
provideNativeElements({ select: MyPicker });
```

## Helm components

The native switch, checkbox and slider are shims in `packages/ui/native/shims/helm-<name>.ts`. Each keeps helm's selector, inputs and outputs, so a template written for helm works with it unchanged. Which one a component gets depends on where it imports from:

- Native-only code imports the shim, as the native docs demo does: `import { HlmSwitchImports } from '.../packages/ui/native/shims/helm-switch'`.
- Shared code imports `@spartan-ng/helm/<name>` as usual. The `native-helm` plugin in `apps/native/vite.config.mts` resolves that import to the shim for the files that `NATIVE_HELM_IMPORTERS` matches. In this app that is `packages/shared/src/lib/examples`. Every other file gets spartan's MasonKit component.

```ts
const NATIVE_HELM = ['switch', 'checkbox', 'slider'];
const NATIVE_HELM_IMPORTERS = /\/packages\/shared\/src\/lib\/examples\//;
```

- `hlm-switch` and `hlm-checkbox` keep `checked`, `(checkedChange)`, `disabled`, `aria-label`, `#ref.checked()` and `ngModel`.
- `hlm-slider` keeps `value`, `min`, `max`, `step`, `disabled` and `(valueChange)`. The platform slider has one thumb, so a range (`[value]="[20, 70]"`) stays spartan's slider.

## Browser dialogs

`installNativeDialogs()` makes the global `alert()`, `confirm()`, `prompt()`, `action()` and `login()` Material dialogs on Android. They are globals, so this applies to the whole app. Call it in `main.ts`:

```ts
import { installNativeDialogs } from '../../../packages/ui/native/native-elements/dialogs';

installNativeDialogs();
```

They return a Promise, where the browser's block and return the answer. Code that awaits the answer works on both:

```ts
if (await confirm('Discard your changes?')) {
  this.reset();
}
```

`prompt()` differs in what it returns. The browser returns the text or `null`. NativeScript returns `{ result, text }`.

## Limits

- Angular creates the view from the tag before it sets `type`, so a mapped `<input type="checkbox">` or `"radio"` is a text field too. That field takes no touches or focus, so spartan's radio still selects from its indicator. For a visible checkbox, use `hlm-checkbox`.
- Results are from an Android emulator (API 36). They have not been checked on iOS yet.
