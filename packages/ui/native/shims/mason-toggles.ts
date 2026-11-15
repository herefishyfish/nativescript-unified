import { booleanAttribute, ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { HlmSwitch } from '@spartan-ng/helm/switch';

/**
 * Spartan's switch and checkbox under tags of their own. The helm-switch and helm-checkbox shims render these below
 * provideMasonElements(): a component can always use its own selector in its template, so `<hlm-switch>` inside the
 * shim would match both the shim and spartan's switch.
 */
@Component({
	selector: 'mason-switch',
	imports: [HlmSwitch],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { class: 'contents' },
	template: `
		<hlm-switch
			[checked]="checked()"
			[disabled]="disabled()"
			[aria-label]="ariaLabel()"
			(checkedChange)="checkedChange.emit($event)"
		/>
	`,
})
export class MasonSwitch {
	public readonly checked = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
	public readonly checkedChange = output<boolean>();
}

@Component({
	selector: 'mason-checkbox',
	imports: [HlmCheckbox],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { class: 'contents' },
	template: `
		<hlm-checkbox
			[checked]="checked()"
			[disabled]="disabled()"
			[aria-label]="ariaLabel()"
			(checkedChange)="checkedChange.emit($event)"
		/>
	`,
})
export class MasonCheckbox {
	public readonly checked = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
	public readonly checkedChange = output<boolean>();
}
