import type { Tokens } from 'marked';
import type { MarkdownToken } from './types';

export type CalloutKind = 'note' | 'tip' | 'warning';

/** A GitHub-style alert (`> [!NOTE]`): its kind, title and the blockquote's tokens without the marker. */
export type Callout = { readonly kind: CalloutKind; readonly title: string; readonly tokens: MarkdownToken[] };

/** The same mapping the web docs use (apps/web/tools/markdown.ts), so both platforms show the same three styles. */
const KINDS: Record<string, CalloutKind> = { NOTE: 'note', TIP: 'tip', WARNING: 'warning', IMPORTANT: 'warning', CAUTION: 'warning' };
const MARKER = /^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\][ \t]*(?:\r?\n)?/i;

const cache = new WeakMap<Tokens.Blockquote, Callout | null>();

/**
 * Reads a blockquote as a callout when its first paragraph starts with `[!NOTE]`, `[!TIP]`, `[!WARNING]`,
 * `[!IMPORTANT]` or `[!CAUTION]`, else null. The marker is removed from copies; the lexed tokens are not mutated.
 * Results are cached per token, so a template can call this on every change detection pass.
 */
export function calloutOf(blockquote: Tokens.Blockquote): Callout | null {
  let callout = cache.get(blockquote);
  if (callout === undefined) {
    callout = parseCallout(blockquote);
    cache.set(blockquote, callout);
  }
  return callout;
}

function parseCallout(blockquote: Tokens.Blockquote): Callout | null {
  const [first, ...rest] = blockquote.tokens;
  if (first?.type !== 'paragraph') return null;
  const paragraph = first as Tokens.Paragraph;
  const [lead, ...inline] = paragraph.tokens;
  if (lead?.type !== 'text') return null;
  const match = MARKER.exec((lead as Tokens.Text).text);
  if (!match) return null;

  const kind = KINDS[match[1].toUpperCase()];
  const leadText = (lead as Tokens.Text).text.slice(match[0].length);
  const body: MarkdownToken[] = leadText ? [{ ...lead, raw: leadText, text: leadText } as MarkdownToken, ...inline] : inline;
  const tokens = body.length ? [{ ...paragraph, tokens: body } as MarkdownToken, ...rest] : rest;
  return { kind, title: kind[0].toUpperCase() + kind.slice(1), tokens };
}
