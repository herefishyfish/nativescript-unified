import { marked, type Tokens } from 'marked';
import { describe, expect, it } from 'vitest';
import { calloutOf } from './callout';

function blockquote(markdown: string): Tokens.Blockquote {
  const token = marked.lexer(markdown).find((t) => t.type === 'blockquote');
  if (!token) throw new Error('no blockquote lexed');
  return token as Tokens.Blockquote;
}

function inlineText(tokens: readonly unknown[]): string {
  return (tokens as Tokens.Generic[]).map((t) => (t.tokens ? inlineText(t.tokens) : (t.text ?? ''))).join('');
}

describe('calloutOf', () => {
  it('reads the docs note with the marker on its own line and keeps inline code', () => {
    const callout = calloutOf(blockquote('> [!NOTE]\n> Verified on the web. `apps/native` has `@nativescript/tailwind`.'));
    expect(callout?.kind).toBe('note');
    expect(callout?.title).toBe('Note');
    const paragraph = callout!.tokens[0] as Tokens.Paragraph;
    expect(paragraph.type).toBe('paragraph');
    expect(inlineText(paragraph.tokens)).toBe('Verified on the web. apps/native has @nativescript/tailwind.');
    expect(paragraph.tokens.filter((t) => t.type === 'codespan')).toHaveLength(2);
  });

  it('maps IMPORTANT and CAUTION to warning, case-insensitively', () => {
    expect(calloutOf(blockquote('> [!important] Back up first.'))?.kind).toBe('warning');
    expect(calloutOf(blockquote('> [!CAUTION]\n> Irreversible.'))?.kind).toBe('warning');
    expect(calloutOf(blockquote('> [!TIP] Try it.'))?.kind).toBe('tip');
  });

  it('keeps following paragraphs', () => {
    const callout = calloutOf(blockquote('> [!WARNING]\n> First.\n>\n> Second.'));
    const paragraphs = callout!.tokens.filter((t): t is Tokens.Paragraph => t.type === 'paragraph');
    expect(paragraphs.map((p) => inlineText(p.tokens))).toEqual(['First.', 'Second.']);
  });

  it('leaves plain quotes and the lexed tokens alone', () => {
    const quote = blockquote('> Just a quote with [!NOTE] inside.');
    expect(calloutOf(quote)).toBeNull();
    const note = blockquote('> [!NOTE]\n> Body.');
    calloutOf(note);
    expect(inlineText((note.tokens[0] as Tokens.Paragraph).tokens)).toContain('[!NOTE]');
  });
});
