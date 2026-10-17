import { afterNextRender } from '@angular/core';

/** Read the payload of a CustomEvent. Angular component outputs emit the value directly; this is for DOM events. */
export function nsDetail<T>(e: Event): T {
  return (e as CustomEvent<T>).detail;
}

/**
 * Watch descendants of `host` matching `selector`. Calls `cb` after the next render and on every change.
 * Tabs, pager, and segmented-bar children are plain elements projected with ng-content, not components.
 */
export function observeChildren(
  host: HTMLElement,
  selector: string,
  cb: (els: HTMLElement[]) => void,
  attributes: readonly string[] = ['label'],
): () => void {
  const read = () => {
    cb(Array.from(host.querySelectorAll(selector)).filter((node): node is HTMLElement => node instanceof HTMLElement));
  };
  afterNextRender(read);
  if (typeof MutationObserver === 'undefined') return () => undefined;
  const mo = new MutationObserver(read);
  mo.observe(host, { childList: true, attributes: true, attributeFilter: [...attributes], subtree: true });
  return () => mo.disconnect();
}
