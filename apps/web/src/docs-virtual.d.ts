/** A source file and its build-time Prism markup (tools/docs-plugin.ts `highlightPlugin`). */
declare module '*?highlight' {
  const source: { code: string; html: string };
  export default source;
}

declare module '~docs' {
  import type { DocMeta } from '@nativescript-unified/shared';
  export type BuiltBlock = { kind: 'demo'; code: string; html: string } | { kind: 'html'; html: string };
  export interface BuiltDoc extends DocMeta {
    headings: { id: string; text: string; depth: 2 | 3 }[];
    blocks: BuiltBlock[];
  }
  export const DOCS: BuiltDoc[];
}
