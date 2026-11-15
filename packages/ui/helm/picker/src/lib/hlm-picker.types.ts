export interface HlmPickerOption {
	readonly value: string;
	readonly label: string;
}

/** What the picker panel opens with, passed as its dialog context. */
export interface HlmPickerRequest {
	readonly title: string;
	readonly options: readonly HlmPickerOption[];
	readonly selected: readonly string[];
	readonly multiple: boolean;
	readonly allowAdd: boolean;
	readonly preserveOrder: boolean;
}

/** How the panel closed: with a selection, or with the name of an option to add. Cancel closes with no result. */
export type HlmPickerResult =
	| { readonly kind: 'selected'; readonly values: readonly string[] }
	| { readonly kind: 'added'; readonly name: string };
