---
title: Native elements
section: HTML first
order: 14
description: Form controls and dialogs draw platform widgets by default. Opt parts of an app back in to MasonKit.
---

# Native elements

By default, the app draws form controls and dialogs with platform widgets from `@nativescript-community`. `<input>` and `<textarea>` are the platform's text fields, `hlm-switch`, `hlm-checkbox` and `hlm-slider` are its switch, checkbox and slider, and `hlm-dialog` and `hlm-alert-dialog` open as its dialog. That is UIKit on iOS and Material 3 on Android. [Packages](#packages) lists the widget on each platform. MasonKit draws everything else, buttons included. The template stays the same, and the web still renders HTML.

The text fields keep helm's look, because helm's classes draw them as on the web. On Android, they start without Material's box and floating label for that.

`provideMasonElements()` switches a part of the app back to MasonKit's versions, for screens that need MasonKit's own drawing, such as a switch styled with helm classes.

## Native and MasonKit

The same markup twice. In the app, the first demo draws platform widgets and the second draws MasonKit. On the web, both draw HTML.

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

```html live mason
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

A docs block tagged `html live mason` previews with MasonKit in the app. The web ignores the extra word. A block tagged `html live web` uses markup only the web polyfills understand, so the app shows its code and no preview.

## Core views

NativeScript core has its own controls, which need no package: `Switch`, `Slider`, `SearchBar`, `Progress` and the rest of [Switch, Slider and pickers](/docs/controls). They draw the platform's default widget, not the theme, and they take NativeScript's properties and events instead of helm's, so a helm template does not carry over to them. On the web, the polyfills draw them.

```html live
<div class="flex max-w-sm flex-col gap-3">
  <SearchBar hint="Search the docs"></SearchBar>
  <div class="flex items-center gap-2">
    <Switch checked="true"></Switch>
    <span class="text-sm">Sync</span>
  </div>
  <Slider value="40"></Slider>
  <Progress value="65"></Progress>
</div>
```

## Packages

Install the package for each widget you use. The last column is the core view for the same control. A core view needs no package, but on Android it draws the older platform widget, such as a SeekBar where the package draws a Material slider, and it takes core's API instead of helm's.

| Widget | Package | Android | iOS | Core view |
| --- | --- | --- | --- | --- |
| `input` | `@nativescript-community/ui-textfield` | Material TextInputLayout | UITextField | `TextField` |
| `textarea` | `@nativescript-community/ui-textview` | Material TextInputLayout | UITextView | `TextView` |
| `hlm-switch` | `@nativescript-community/ui-switch` | Material switch | UISwitch | `Switch` |
| `hlm-checkbox` | `@nativescript-community/ui-checkbox` | Material checkbox | SF Symbols toggle | None |
| `hlm-slider` | `@nativescript-community/ui-slider` | Material slider | UISlider | `Slider` |
| Dialogs | `@nativescript-community/ui-dialogs` | Material dialogs | UIAlertController | `Dialogs` |
| `button` | None, it is core's `Button` | Button | UIButton | `NButton` |

```bash
npm install @nativescript-community/ui-textfield @nativescript-community/ui-textview @nativescript-community/ui-switch @nativescript-community/ui-checkbox @nativescript-community/ui-slider @nativescript-community/ui-dialogs -w apps/native
```

The Android widgets use Material 3. This app's theme already extends `Theme.Material3.DayNight.NoActionBar`.

## HTML tags

`registerNativeElements()` makes tags create platform views across the app. Each key is a tag, and each value is the view that tag creates. Call it in `main.ts`, after `installMasonKit()`:

```ts
import { registerNativeElements } from '../../../packages/ui/native/native-elements';
import { NativeTextField } from '../../../packages/ui/native/native-elements/text-field';
import { NativeTextView } from '../../../packages/ui/native/native-elements/text-view';

registerNativeElements({ input: NativeTextField, textarea: NativeTextView });
```

The adapters keep what the shared templates use:

- `value`, `[value]`, `placeholder` and `disabled` work as on the web.
- `(input)` fires for each edit the user makes, with `$event.target.value`, so Angular forms and `#ref.value` read the text. Code that sets `value` does not fire it.
- `(focus)` and `(blur)` come from the platform field.
- `type="email"`, `"password"`, `"number"`, `"tel"`, `"url"` and `"search"` choose the keyboard, hide the text for a password, and turn off autocorrect where it gets in the way.

On Android, for Material's look, set `variant="outline"` (or `"filled"`) and `floating="true"` on the element.

### Native buttons

`NativeButton` puts core's `Button` behind `<button>`, with `(click)` and `disabled` as on the web:

```ts
import { NativeButton } from '../../../packages/ui/native/native-elements/button';

registerNativeElements({ input: NativeTextField, textarea: NativeTextView, button: NativeButton });
```

It draws text only, so an `ng-icon` or other element inside the button does not show. In a test on the docs' drawer demo, the drawer's button did not render at all. This app does not map `button`.

### Your own views

Any NativeScript view class works. To keep the web contract, have your class take `value`, `disabled` and the events your templates bind, as the adapters in `packages/ui/native/native-elements` do.

```ts
registerNativeElements({ select: MyPicker });
```

## Opt in to MasonKit

Put `provideMasonElements()` in the `providers` of the component that hosts the MasonKit part. It applies to the components Angular creates below that component through `ngComponentOutlet` or `createComponent`, and to everything inside them. The host's own template keeps the platform widgets.

```ts
import { provideMasonElements } from '../../../../packages/ui/native/native-elements';

@Component({
  selector: 'mason-screen',
  providers: [provideMasonElements()],
  template: `<ng-container *ngComponentOutlet="screen" />`,
})
export class MasonScreen {}
```

Below it:

- The tags `registerNativeElements()` mapped create MasonKit's views again.
- `hlm-switch` and `hlm-checkbox` render spartan's components, and `hlm-slider` renders MasonKit's range input.
- `hlm-dialog` and `hlm-alert-dialog` open in a modal window that shows the helm markup, card and all.

## Helm components

The switch, checkbox and slider are shims in `packages/ui/native/shims/helm-<name>.ts`. Each keeps helm's selector, inputs and outputs, so a template written for helm works with it unchanged. The `native-helm` plugin in `apps/native/vite.config.mts` resolves `@spartan-ng/helm/<name>` to the shim in every file except the shims themselves, which import spartan's components for the MasonKit side:

```ts
const NATIVE_HELM: Record<string, string> = {
  switch: 'helm-switch',
  checkbox: 'helm-checkbox',
  slider: 'helm-slider',
  sonner: 'helm-sonner',
};
```

- `hlm-switch` and `hlm-checkbox` keep `checked`, `(checkedChange)`, `disabled`, `aria-label`, `#ref.checked()` and `ngModel`.
- `hlm-slider` keeps `value`, `min`, `max`, `step`, `disabled` and `(valueChange)`. A platform slider has one thumb, so a range (`[value]="[20, 70]"`) draws helm's track and thumbs and moves them by touch.
- The toaster is a shim everywhere, because spartan's measures elements and follows pointer events.

## Dialogs

`hlm-dialog` and `hlm-alert-dialog` open as the platform's dialog: `UIAlertController` on iOS and Material's dialog on Android. The helm content renders first, and the platform dialog takes its parts:

- The title from `hlmDialogTitle` or `hlmAlertDialogTitle`, and the message from the matching description.
- The buttons. For `hlm-dialog`, these are the buttons in `hlm-dialog-footer`: the last is the main button, and the first is the cancel button when there are two or three. For `hlm-alert-dialog`, they are `hlmAlertDialogCancel` and up to two `hlmAlertDialogAction` buttons.
- Anything between the header and the footer, such as a form field. The dialog shows it below the message, without helm's card.

Choosing a button clicks the helm button, so its `(click)` and `hlmDialogClose` run as on the web. On Android, the back button chooses the cancel button. The Android dialog takes helm's card colour, corner radius and text colours from the app theme (`AppAlertDialog` in `App_Resources/Android/src/main/res/values/styles.xml`).

```html live
<hlm-alert-dialog>
  <button hlmBtn hlmAlertDialogTrigger variant="outline">Delete account</button>
  <hlm-alert-dialog-content *hlmAlertDialogPortal="let ctx">
    <hlm-alert-dialog-header>
      <h3 hlmAlertDialogTitle>Are you sure?</h3>
      <p hlmAlertDialogDescription>This cannot be undone.</p>
    </hlm-alert-dialog-header>
    <hlm-alert-dialog-footer>
      <button hlmBtn hlmAlertDialogCancel variant="outline">Cancel</button>
      <button hlmBtn hlmAlertDialogAction (click)="ctx.close()">Continue</button>
    </hlm-alert-dialog-footer>
  </hlm-alert-dialog-content>
</hlm-alert-dialog>
```

Content with no title, no button, or more buttons than the platform dialog holds opens in a modal window with the helm markup instead.

## Browser dialogs

`installNativeDialogs()` makes the global `alert()`, `confirm()`, `prompt()`, `action()` and `login()` the platform's dialogs: `UIAlertController` on iOS and Material dialogs on Android. They are globals, so this applies to the whole app, below `provideMasonElements()` too. Call it in `main.ts`:

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

- Angular creates the view from the tag before it sets `type`, so `<input type="checkbox">` or `"radio"` is a text field too. That field takes no touches or focus, so spartan's radio still selects from its indicator. For a visible checkbox, use `hlm-checkbox`.
- While the platform dialog is open, closing it from code, such as `ctx.close()` from a timer, does not close it. It closes when the user chooses a button.
