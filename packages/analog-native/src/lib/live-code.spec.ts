import { Component, input } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { isLiveCodeBlock, MARKDOWN_LIVE_CODE_COMPONENT, provideMarkdownLiveCode, segmentMarkdown } from './live-code';
import type { MarkdownToken } from './types';

function codeToken(lang: string | undefined, text = '<p>hi</p>'): MarkdownToken {
  return { type: 'code', raw: '', lang, text } as MarkdownToken;
}

describe('isLiveCodeBlock', () => {
  it('matches `html live` and leading-word variants', () => {
    expect(isLiveCodeBlock(codeToken('html live'))).toBe(true);
    expect(isLiveCodeBlock(codeToken('html live preview'))).toBe(true);
  });

  it('does not match plain html or other languages', () => {
    expect(isLiveCodeBlock(codeToken('html'))).toBe(false);
    expect(isLiveCodeBlock(codeToken('ts'))).toBe(false);
    expect(isLiveCodeBlock(codeToken(undefined))).toBe(false);
    expect(isLiveCodeBlock(codeToken('html-live'))).toBe(false);
  });

  it('ignores non-code tokens', () => {
    expect(isLiveCodeBlock({ type: 'paragraph', raw: '', text: 'html live' } as MarkdownToken)).toBe(false);
  });
});

describe('provideMarkdownLiveCode', () => {
  @Component({ template: '' })
  class FakeLiveCode {
    readonly code = input.required<string>();
  }

  it('registers the component under the token', () => {
    const provider = provideMarkdownLiveCode(FakeLiveCode);
    expect(provider.provide).toBe(MARKDOWN_LIVE_CODE_COMPONENT);
    expect(provider.useValue).toBe(FakeLiveCode);
  });
});

describe('segmentMarkdown', () => {
  const para = { type: 'paragraph', raw: '', text: 'a' } as MarkdownToken;
  const live = codeToken('html live', '<button>x</button>');
  const tsBlock = codeToken('ts', 'const a = 1;');

  it('splits top-level tokens at live blocks and carries the code', () => {
    const segments = segmentMarkdown([para, live, para, live], true);
    expect(segments.map((s) => s.kind)).toEqual(['tokens', 'live', 'tokens', 'live']);
    expect(segments[1]).toEqual({ kind: 'live', code: '<button>x</button>' });
    expect((segments[2] as { tokens: MarkdownToken[] }).tokens).toEqual([para]);
  });

  it('keeps live blocks in the runs when no live component is registered', () => {
    const segments = segmentMarkdown([para, live], false);
    expect(segments.map((s) => s.kind)).toEqual(['tokens']);
    expect((segments[0] as { tokens: MarkdownToken[] }).tokens).toEqual([para, live]);
  });

  it('does not split on non-live code blocks and collapses empty runs', () => {
    const segments = segmentMarkdown([live, tsBlock], true);
    expect(segments.map((s) => s.kind)).toEqual(['live', 'tokens']);
    expect((segments[1] as { tokens: MarkdownToken[] }).tokens).toEqual([tsBlock]);
  });
});
