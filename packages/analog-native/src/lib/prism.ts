/// <reference path="./prism-core.d.ts" />
// Prism's core alone, not the `prismjs` bundle: the bundle adds the file-highlight plugin. With no
// `window` (NativeScript, Node) the core skips its auto-highlight and never touches `document`.
import Prism from 'prismjs/components/prism-core';

// The language files read a global `Prism`. A production build wraps the CommonJS core in a function
// it calls from the importing module's body, which runs after that module's other imports, so the
// core is set up here, in a module of its own that highlight.ts imports before the languages.
(globalThis as { Prism?: typeof Prism }).Prism = Prism;

export default Prism;
