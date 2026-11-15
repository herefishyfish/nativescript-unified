import type { HlmPickerRequest, HlmPickerResult } from './hlm-picker.types';

/** What the panel's host gives it: the request it opened with, and how to close it. `close()` alone is a cancel. */
export abstract class HlmPickerPanelRef {
	public abstract readonly request: HlmPickerRequest;
	public abstract close(result?: HlmPickerResult): void;
}
