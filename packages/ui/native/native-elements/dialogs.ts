import { action, alert, confirm, login, prompt } from '@nativescript-community/ui-dialogs';

/**
 * Makes the global `alert()`, `confirm()`, `prompt()`, `action()` and `login()` @nativescript-community/ui-dialogs:
 * Material dialogs on Android, UIAlertController on iOS. Core installs its own globals when it loads; call this after.
 *
 * Like the browser's, they take a message. Unlike the browser's, they return a Promise, so shared code that awaits
 * `alert()` or `confirm()` works on both: `if (await confirm('Delete?'))`.
 */
export function installNativeDialogs(): void {
	Object.assign(globalThis, { alert, confirm, prompt, action, login });
}
