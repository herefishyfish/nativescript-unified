// NativeScript defines `window` without its listener API, which @angular/cdk calls when its modules load
// (passive-listener detection). Imported first from main.ts so it runs before any CDK module evaluates.
if (typeof window !== 'undefined' && typeof window.addEventListener !== 'function') {
	Object.assign(window, { addEventListener: () => undefined, removeEventListener: () => undefined });
}

export {};
