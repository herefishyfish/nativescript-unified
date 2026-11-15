import { ChangeDetectionStrategy, Component, forwardRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { registerElement } from '@nativescript/angular';
import { Switch } from '@nativescript-community/ui-switch';
import { MasonSwitch } from './mason-toggles';
import { NativeToggle } from './native-toggle';

registerElement('ui-switch', () => Switch);

/**
 * Stands in for `@spartan-ng/helm/switch` for every file but these shims (vite.config.mts): `<hlm-switch>` draws
 * @nativescript-community/ui-switch, Material's switch on Android and UISwitch on iOS. Same selector, inputs and
 * output as helm's, so templates compile against the real package. Below provideMasonElements() it renders
 * spartan's MasonKit switch instead.
 */
@Component({
	selector: 'hlm-switch',
	imports: [MasonSwitch],
	schemas: [NO_ERRORS_SCHEMA],
	providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HlmSwitch), multi: true }],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { 'data-slot': 'switch' },
	template: `
		@if (_mason) {
			<mason-switch
				[checked]="checked()"
				[disabled]="_disabled()"
				[aria-label]="ariaLabel()"
				(checkedChange)="_setChecked($event)"
			/>
		} @else {
			<ui-switch
				[checked]="checked()"
				[isEnabled]="!_disabled()"
				[accessibilityLabel]="ariaLabel()"
				(checkedChange)="_onNativeChange($event)"
			/>
		}
	`,
})
export class HlmSwitch extends NativeToggle {}

export const HlmSwitchImports = [HlmSwitch] as const;
