import { ChangeDetectionStrategy, Component, forwardRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { registerElement } from '@nativescript/angular';
import { CheckBox } from '@nativescript-community/ui-checkbox';
import { NativeToggle } from './native-toggle';

registerElement('ui-checkbox', () => CheckBox);

/**
 * Stands in for `@spartan-ng/helm/checkbox` where vite.config.mts resolves it here: `<hlm-checkbox>` draws
 * @nativescript-community/ui-checkbox, Material's checkbox on Android and an SF Symbols toggle on iOS. Same selector,
 * inputs and output as helm's, so templates compile against the real package.
 */
@Component({
	selector: 'hlm-checkbox',
	schemas: [NO_ERRORS_SCHEMA],
	providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HlmCheckbox), multi: true }],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { 'data-slot': 'checkbox' },
	template: `
		<ui-checkbox
			[checked]="checked()"
			[isEnabled]="!_disabled()"
			[accessibilityLabel]="ariaLabel()"
			(checkedChange)="_onNativeChange($event)"
		/>
	`,
})
export class HlmCheckbox extends NativeToggle {}

export const HlmCheckboxImports = [HlmCheckbox] as const;
