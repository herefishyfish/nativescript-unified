import {
	booleanAttribute,
	ChangeDetectionStrategy,
	Component,
	computed,
	forwardRef,
	inject,
	input,
	linkedSignal,
	output,
	signal,
	ViewContainerRef,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import { hlm } from '@spartan-ng/helm/utils';
import type { ClassValue } from 'clsx';
import { HlmPickerHost } from './hlm-picker-host';
import type { HlmPickerOption, HlmPickerRequest } from './hlm-picker.types';

/** A single value, or every value when `multiple`. */
export type HlmPickerValue = string | readonly string[] | null;

/**
 * A form field that opens a searchable list of options, styled as helm's select trigger. One option, or several with
 * `multiple`. With `allowAdd`, the list ends in a row that asks for a new option's name and emits it as `added`, for
 * the owner to create. Works with `ngModel` and reactive forms.
 */
@Component({
	selector: 'hlm-picker',
	imports: [NgIcon],
	providers: [
		provideIcons({ lucideChevronDown }),
		{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HlmPicker), multi: true },
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { 'data-slot': 'picker', class: 'flex' },
	template: `
		<button
			type="button"
			[class]="_computedClass()"
			[disabled]="_disabled()"
			[attr.data-placeholder]="_label() ? null : ''"
			[attr.aria-label]="title()"
			aria-haspopup="listbox"
			[attr.aria-expanded]="_open()"
			(click)="open()"
			(keydown)="_openOnArrow($event)"
		>
			<span class="line-clamp-1 flex-1 text-left">{{ _label() || placeholder() }}</span>
			<ng-icon name="lucideChevronDown" class="spartan-select-trigger-icon" aria-hidden="true" />
		</button>
	`,
})
export class HlmPicker implements ControlValueAccessor {
	private readonly _host = inject(HlmPickerHost);
	private readonly _viewContainerRef = inject(ViewContainerRef);

	/** Names the list, its "Add new" row and the field for assistive tech. */
	public readonly title = input.required<string>();
	public readonly options = input<readonly HlmPickerOption[]>([]);
	public readonly placeholder = input('Select');
	public readonly multiple = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly allowAdd = input<boolean, unknown>(false, { transform: booleanAttribute });
	/** Keep the given order instead of moving the selected options to the top of the list. */
	public readonly preserveOrder = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly valueInput = input<HlmPickerValue>(null, { alias: 'value' });
	public readonly userClass = input<ClassValue>('', { alias: 'class' });

	public readonly valueChange = output<HlmPickerValue>();
	/** The name the user entered in the "Add new" row. */
	public readonly added = output<string>();

	/** The current value, as `#picker.value()` reads it. */
	public readonly value = linkedSignal(this.valueInput);
	protected readonly _disabled = linkedSignal(this.disabled);
	protected readonly _open = signal(false);
	private _onChange?: (value: HlmPickerValue) => void;
	private _onTouched?: () => void;

	private readonly _selected = computed(() => toValues(this.value()));
	protected readonly _label = computed(() => {
		const labels = new Map(this.options().map((option) => [option.value, option.label]));
		return this._selected()
			.map((value) => labels.get(value))
			.filter((label) => label !== undefined)
			.join(', ');
	});
	protected readonly _computedClass = computed(() =>
		hlm(
			'spartan-select-trigger flex w-full items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-muted-foreground h-9',
			this.userClass(),
		),
	);

	public open(): void {
		if (this._disabled() || this._open()) return;
		this._open.set(true);
		const request: HlmPickerRequest = {
			title: this.title(),
			options: this.options(),
			selected: this._selected(),
			multiple: this.multiple(),
			allowAdd: this.allowAdd(),
			preserveOrder: this.preserveOrder(),
		};
		void this._host.open(request, this._viewContainerRef, (values) => this._select(values)).then((result) => {
			this._open.set(false);
			this._onTouched?.();
			if (result?.kind === 'added') this.added.emit(result.name);
			if (result?.kind === 'selected') this._select(result.values);
		});
	}

	protected _openOnArrow(event: KeyboardEvent): void {
		if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
		event.preventDefault();
		this.open();
	}

	private _select(values: readonly string[]): void {
		const next: HlmPickerValue = this.multiple() ? values : (values[0] ?? null);
		if (sameValues(toValues(next), this._selected())) return;
		this.value.set(next);
		this._onChange?.(next);
		this.valueChange.emit(next);
	}

	writeValue(value: HlmPickerValue): void {
		this.value.set(value);
	}

	registerOnChange(fn: (value: HlmPickerValue) => void): void {
		this._onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this._onTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this._disabled.set(isDisabled);
	}
}

function toValues(value: HlmPickerValue): readonly string[] {
	if (value === null || value === '') return [];
	return typeof value === 'string' ? [value] : value;
}

function sameValues(a: readonly string[], b: readonly string[]): boolean {
	return a.length === b.length && a.every((value, index) => value === b[index]);
}
