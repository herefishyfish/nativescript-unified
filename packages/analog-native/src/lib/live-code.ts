import { InjectionToken, type Type } from '@angular/core';
import type { Tokens } from 'marked';
import type { MarkdownToken } from './types';

/**
 * Standalone component rendered in place of a fenced code block tagged `html live`.
 * The component must have a `code` string input and an `info` string input, the block's
 * info string (`html live` and any words after it, such as `html live native`); it
 * typically pairs the live view with the source, for example Preview / Code tabs (see the
 * web docs' demo frame).
 * When no component is provided, a live block falls back to `pre > code` like any block.
 */
export const MARKDOWN_LIVE_CODE_COMPONENT = new InjectionToken<Type<unknown>>(
  '@nativescript-unified/analog-native markdown live-code component',
);

/** App-level registration for the component that renders `html live` blocks in `<analog-markdown>`. */
export function provideMarkdownLiveCode(component: Type<unknown>): { provide: InjectionToken<Type<unknown>>; useValue: Type<unknown> } {
  return { provide: MARKDOWN_LIVE_CODE_COMPONENT, useValue: component };
}

/**
 * A fenced code block whose info string starts with `html live`, the same rule the web
 * docs' build-time parser uses (`/^html\s+live\b/`). Mirrors `isDemoToken` in
 * packages/shared so web and native agree on which blocks are demos.
 */
export function isLiveCodeBlock(token: MarkdownToken): token is Tokens.Code {
  return token.type === 'code' && /^html\s+live\b/.test((token as { lang?: string }).lang ?? '');
}

/**
 * A top-level run of tokens, or one live block. `MarkdownComponent` renders segments in
 * order, mounting live demos at its own root (one anchor per block, in flow) instead of
 * inside the token-recursion templates, where deeply nested embedded-view anchors lose
 * their place in the MasonKit container.
 */
export type MarkdownSegment =
  | { kind: 'tokens'; tokens: MarkdownToken[] }
  | { kind: 'live'; code: string; info: string };

/**
 * Splits top-level tokens at `html live` code blocks, the same block model the web docs
 * build on (`toBlocks` in packages/shared). With `live` false (no live-code component
 * registered) live blocks stay in the runs and render as `pre > code`.
 */
export function segmentMarkdown(tokens: MarkdownToken[], live: boolean): MarkdownSegment[] {
  const segments: MarkdownSegment[] = [];
  let run: MarkdownToken[] = [];
  const flush = () => {
    if (run.length > 0) segments.push({ kind: 'tokens', tokens: run });
    run = [];
  };
  for (const token of tokens) {
    if (live && isLiveCodeBlock(token)) {
      flush();
      segments.push({ kind: 'live', code: token.text, info: token.lang ?? '' });
    } else {
      run.push(token);
    }
  }
  flush();
  return segments;
}
