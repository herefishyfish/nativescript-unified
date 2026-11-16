import type { HlmPickerRequest, HlmPickerResult } from './hlm-picker.types';

/** What the panel's host gives it: the request it opened with, and how to close it. `close()` alone is a cancel. */
export abstract class HlmPickerPanelRef {
	public abstract readonly request: HlmPickerRequest;
	/** Set when the panel drops down from the field, as a select's list does on the web. */
	public abstract readonly dropdown?: HlmPickerDropdown;
	public abstract close(result?: HlmPickerResult): void;
}

export interface HlmPickerDropdown {
	/** The field's width, which the list matches. */
	readonly width: number;
	/** Applies a multiple choice as it changes, since the dropdown has no Done button. */
	change(values: readonly string[]): void;
}
