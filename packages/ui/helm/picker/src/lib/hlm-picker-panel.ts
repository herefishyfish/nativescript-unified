import { booleanAttribute, ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucidePlus } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { hlm } from '@spartan-ng/helm/utils';
import type { ClassValue } from 'clsx';
import { HlmPickerPanelRef } from './hlm-picker-panel-ref';
import type { HlmPickerOption, HlmPickerRequest } from './hlm-picker.types';

/**
 * The list `hlm-picker` opens: a search field, the matching options, and an optional row that adds one. A single
 * choice closes on a tap; several are toggled, then saved with Done. HlmPickerHost shows it and gives it its
 * request through HlmPickerPanelRef. With `fullscreen`, it fills its window and the list takes the space left.
 */
@Component({
	selector: 'hlm-picker-panel',
	imports: [NgIcon, HlmButton, HlmInput, HlmLabel],
	providers: [provideIcons({ lucideCheck, lucidePlus })],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { 'data-slot': 'picker-panel', '[class]': '_computedClass()' },
	template: `
		<div class="flex flex-row items-center gap-2">
			<div class="spartan-dialog-title flex-1" role="heading" aria-level="2">{{ adding() ? 'Add new ' + request.title.toLowerCase() : request.title }}</div>
			@if (!adding()) {
				<button hlmBtn variant="ghost" size="sm" (click)="cancel()">Cancel</button>
				@if (request.multiple) {
					<button hlmBtn size="sm" (click)="save()">Done</button>
				}
			}
		</div>

		@if (adding()) {
			<div class="flex flex-col gap-1.5">
				<label hlmLabel for="hlm-picker-new">{{ request.title }} name</label>
				<input
					hlmInput
					id="hlm-picker-new"
					[value]="newName()"
					(input)="newName.set($any($event.target).value)"
				/>
			</div>
			<div class="flex flex-row justify-end gap-2">
				<button hlmBtn variant="outline" size="sm" (click)="adding.set(false)">Back</button>
				<button hlmBtn size="sm" [disabled]="!newName().trim()" (click)="add()">Save</button>
			</div>
		} @else {
			<input
				hlmInput
				type="search"
				placeholder="Search"
				aria-label="Search"
				[value]="search()"
				(input)="search.set($any($event.target).value)"
			/>
			<div [class]="_listClass()" role="listbox" [attr.aria-multiselectable]="request.multiple">
				@for (option of visible(); track option.value) {
					<button
						type="button"
						role="option"
						class="spartan-select-item relative flex w-full items-center justify-start text-left"
						[class.bg-accent]="isSelected(option)"
						[attr.aria-selected]="isSelected(option)"
						(click)="choose(option)"
					>
						<span>{{ option.label }}</span>
						@if (isSelected(option)) {
							<ng-icon name="lucideCheck" class="spartan-select-item-indicator" aria-hidden="true" />
						}
					</button>
				} @empty {
					<p class="text-muted-foreground py-6 text-center text-sm">No matches</p>
				}
			</div>
			@if (request.allowAdd) {
				<button hlmBtn variant="outline" class="justify-start" (click)="startAdding()">
					<ng-icon name="lucidePlus" />
					Add new {{ request.title.toLowerCase() }}
				</button>
			}
		}
	`,
})
export class HlmPickerPanel {
	private readonly _ref = inject(HlmPickerPanelRef);
	protected readonly request: HlmPickerRequest = this._ref.request;

	public readonly fullscreen = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected readonly _computedClass = computed(() =>
		hlm('flex flex-col gap-3 text-left', this.fullscreen() ? 'size-full' : 'w-72 max-w-full', this.userClass()),
	);
	protected readonly _listClass = computed(() =>
		hlm('-mx-1 flex flex-col overflow-y-auto', this.fullscreen() ? 'min-h-0 flex-1' : 'max-h-72'),
	);

	protected readonly search = signal('');
	protected readonly adding = signal(false);
	protected readonly newName = signal('');
	private readonly _selected = signal<ReadonlySet<string>>(new Set(this.request.selected));
	/** Options selected on open move to the top once, so toggling does not reshuffle the list. */
	private readonly _initiallySelected = new Set(this.request.selected);

	protected readonly visible = computed(() => filterOptions(this.request, this.search(), this._initiallySelected));

	protected isSelected(option: HlmPickerOption): boolean {
		return this._selected().has(option.value);
	}

	protected choose(option: HlmPickerOption): void {
		if (!this.request.multiple) {
			this._ref.close({ kind: 'selected', values: [option.value] });
			return;
		}
		const next = new Set(this._selected());
		if (next.has(option.value)) next.delete(option.value);
		else next.add(option.value);
		this._selected.set(next);
	}

	protected save(): void {
		this._ref.close({ kind: 'selected', values: [...this._selected()] });
	}

	protected cancel(): void {
		this._ref.close(undefined);
	}

	protected startAdding(): void {
		this.newName.set(this.search().trim());
		this.adding.set(true);
	}

	protected add(): void {
		const name = this.newName().trim();
		if (name) this._ref.close({ kind: 'added', name });
	}
}

/** The options whose label contains `search`, ignoring case; unless `preserveOrder`, the `pinned` ones first. */
export function filterOptions(
	request: Pick<HlmPickerRequest, 'options' | 'preserveOrder'>,
	search: string,
	pinned: ReadonlySet<string>,
): HlmPickerOption[] {
	const term = search.trim().toLowerCase();
	const matches = request.options.filter((option) => option.label.toLowerCase().includes(term));
	if (request.preserveOrder) return matches;
	return [...matches.filter((option) => pinned.has(option.value)), ...matches.filter((option) => !pinned.has(option.value))];
}
