declare module '~docs' {
  import type { DocMeta } from '@nativescript-unified/shared';
  export type BuiltBlock = { kind: 'demo'; code: string; html: string } | { kind: 'html'; html: string };
  export interface BuiltDoc extends DocMeta {
    headings: { id: string; text: string; depth: 2 | 3 }[];
    blocks: BuiltBlock[];
  }
  export const DOCS: BuiltDoc[];
}
