import { ChangeDetectionStrategy, Component, forwardRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { registerElement } from '@nativescript/angular';
import { Switch } from '@nativescript-community/ui-switch';
import { NativeToggle } from './native-toggle';

registerElement('ui-switch', () => Switch);

/**
 * Stands in for `@spartan-ng/helm/switch` where vite.config.mts resolves it here: `<hlm-switch>` draws
 * @nativescript-community/ui-switch, Material's switch on Android and UISwitch on iOS. Same selector, inputs and
 * output as helm's, so templates compile against the real package.
 */
@Component({
	selector: 'hlm-switch',
	schemas: [NO_ERRORS_SCHEMA],
	providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HlmSwitch), multi: true }],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { 'data-slot': 'switch' },
	template: `
		<ui-switch
			[checked]="checked()"
			[isEnabled]="!_disabled()"
			[accessibilityLabel]="ariaLabel()"
			(checkedChange)="_onNativeChange($event)"
		/>
	`,
})
export class HlmSwitch extends NativeToggle {}

export const HlmSwitchImports = [HlmSwitch] as const;
