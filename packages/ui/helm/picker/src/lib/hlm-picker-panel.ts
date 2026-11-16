import {
	booleanAttribute,
	ChangeDetectionStrategy,
	Component,
	computed,
	ElementRef,
	inject,
	input,
	signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucidePlus } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { hlm } from '@spartan-ng/helm/utils';
import type { ClassValue } from 'clsx';
import { HlmPickerPanelRef } from './hlm-picker-panel-ref';
import type { HlmPickerOption, HlmPickerRequest } from './hlm-picker.types';

let panelSequence = 0;

/**
 * The list `hlm-picker` opens: a search field, the matching options, and an optional row that adds one. HlmPickerHost
 * shows it and gives it its request through HlmPickerPanelRef.
 *
 * As a dropdown (the web), it is a select's list with a search line: the arrow keys move the highlight, Enter
 * chooses, and a multiple choice applies as it is toggled. Otherwise it has a title row, a single choice closes on a
 * tap, and several are toggled, then saved with Done. With `fullscreen`, it fills its window and the list takes the
 * space left.
 */
@Component({
	selector: 'hlm-picker-panel',
	imports: [NgIcon, HlmButton, HlmInput, HlmLabel],
	providers: [provideIcons({ lucideCheck, lucidePlus })],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'data-slot': 'picker-panel',
		'[class]': '_computedClass()',
		'[style.width.px]': 'dropdown?.width',
	},
	template: `
		@if (!dropdown || adding()) {
			<div class="flex flex-row items-center gap-2">
				<div class="spartan-dialog-title flex-1" role="heading" aria-level="2">{{ adding() ? 'Add new ' + request.title.toLowerCase() : request.title }}</div>
				@if (!adding()) {
					<button hlmBtn variant="ghost" size="sm" (click)="cancel()">Cancel</button>
					@if (request.multiple) {
						<button hlmBtn size="sm" (click)="save()">Done</button>
					}
				}
			</div>
		}

		@if (adding()) {
			<div class="flex flex-col gap-1.5">
				<label hlmLabel [for]="_id + '-new'">{{ request.title }} name</label>
				<input
					hlmInput
					[id]="_id + '-new'"
					[value]="newName()"
					(input)="newName.set($any($event.target).value)"
				/>
			</div>
			<div class="flex flex-row justify-end gap-2">
				<button hlmBtn variant="outline" size="sm" (click)="adding.set(false)">Back</button>
				<button hlmBtn size="sm" [disabled]="!newName().trim()" (click)="add()">Save</button>
			</div>
		} @else {
			@if (dropdown) {
				<input
					class="placeholder:text-muted-foreground h-8 w-full bg-transparent px-2 text-sm outline-none"
					type="search"
					placeholder="Search"
					role="combobox"
					aria-autocomplete="list"
					aria-expanded="true"
					[attr.aria-label]="request.title"
					[attr.aria-controls]="_id + '-list'"
					[attr.aria-activedescendant]="_activeId()"
					[value]="search()"
					(input)="_search($any($event.target).value)"
					(keydown)="_keydown($event)"
				/>
				<div class="bg-border -mx-1 my-1 h-px" role="separator"></div>
			} @else {
				<input
					hlmInput
					type="search"
					placeholder="Search"
					aria-label="Search"
					[value]="search()"
					(input)="_search($any($event.target).value)"
				/>
			}
			<div
				[id]="_id + '-list'"
				[class]="_listClass()"
				role="listbox"
				[attr.aria-label]="request.title"
				[attr.aria-multiselectable]="request.multiple"
			>
				@for (option of visible(); track option.value; let index = $index) {
					<button
						type="button"
						role="option"
						[id]="_id + '-option-' + index"
						[tabindex]="dropdown ? -1 : 0"
						class="spartan-select-item relative flex w-full items-center justify-start text-left"
						[class.bg-accent]="!dropdown && isSelected(option)"
						[attr.data-highlighted]="dropdown && index === _active() ? '' : null"
						[attr.aria-selected]="isSelected(option)"
						(pointermove)="_active.set(index)"
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
				@if (dropdown) {
					<div class="bg-border -mx-1 my-1 h-px" role="separator"></div>
					<button type="button" class="spartan-select-item flex w-full items-center justify-start text-left hover:bg-accent" (click)="startAdding()">
						<ng-icon name="lucidePlus" class="text-muted-foreground" />
						Add new {{ request.title.toLowerCase() }}
					</button>
				} @else {
					<button hlmBtn variant="outline" class="justify-start" (click)="startAdding()">
						<ng-icon name="lucidePlus" />
						Add new {{ request.title.toLowerCase() }}
					</button>
				}
			}
		}
	`,
})
export class HlmPickerPanel {
	private readonly _ref = inject(HlmPickerPanelRef);
	private readonly _element = inject(ElementRef);
	protected readonly request: HlmPickerRequest = this._ref.request;
	protected readonly dropdown = this._ref.dropdown;
	protected readonly _id = `hlm-picker-${++panelSequence}`;

	public readonly fullscreen = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected readonly _computedClass = computed(() =>
		hlm(
			'flex flex-col text-left',
			this.dropdown
				? [
						'bg-popover text-popover-foreground ring-foreground/10 min-w-36 max-w-[calc(100vw-2rem)] rounded-md shadow-md ring-1',
						this.adding() ? 'gap-3 p-3' : 'p-1',
					]
				: this.fullscreen()
					? 'size-full gap-3'
					: 'w-72 max-w-full gap-3',
			this.userClass(),
		),
	);
	protected readonly _listClass = computed(() =>
		hlm('flex flex-col overflow-y-auto', this.dropdown ? '' : '-mx-1', this.fullscreen() ? 'min-h-0 flex-1' : 'max-h-72'),
	);

	protected readonly search = signal('');
	protected readonly adding = signal(false);
	protected readonly newName = signal('');
	/** The highlighted option in a dropdown, as an index into `visible`. */
	protected readonly _active = signal(0);
	private readonly _selected = signal<ReadonlySet<string>>(new Set(this.request.selected));
	/** Options selected on open move to the top once, so toggling does not reshuffle the list. */
	private readonly _initiallySelected = new Set(this.request.selected);

	protected readonly visible = computed(() => filterOptions(this.request, this.search(), this._initiallySelected));
	protected readonly _activeId = computed(() =>
		this._active() < this.visible().length ? `${this._id}-option-${this._active()}` : null,
	);

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
		this.dropdown?.change([...next]);
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

	protected _search(value: string): void {
		this.search.set(value);
		this._active.set(0);
	}

	protected _keydown(event: KeyboardEvent): void {
		const count = this.visible().length;
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			if (!count) return;
			const step = event.key === 'ArrowDown' ? 1 : -1;
			this._active.set((this._active() + step + count) % count);
			this._element.nativeElement.querySelector(`#${this._activeId()}`)?.scrollIntoView({ block: 'nearest' });
		} else if (event.key === 'Enter') {
			event.preventDefault();
			const option = this.visible()[this._active()];
			if (option) this.choose(option);
		}
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
