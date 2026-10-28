import { provideNativeElements } from '../../../../packages/ui/native/native-elements';
import { NativeTextField } from '../../../../packages/ui/native/native-elements/text-field';
import { NativeTextView } from '../../../../packages/ui/native/native-elements/text-view';

/**
 * Platform text fields for the parts of this app that show native elements: the example screens and the docs demos
 * marked `html live native`. Everywhere else MasonKit draws `<input>` and `<textarea>`.
 */
export const NATIVE_ELEMENTS = provideNativeElements({ input: NativeTextField, textarea: NativeTextView });
