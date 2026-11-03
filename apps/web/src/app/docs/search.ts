export interface SearchEntry { slug: string; title: string; section: string; heading: string; id: string; text: string; code: string }
/** A run of text, marked when it matches the query. */
export interface TextPart { text: string; match: boolean }
export interface SearchHit extends SearchEntry { titleParts: TextPart[]; headingParts: TextPart[]; snippet: TextPart[] }

/** The pages listed before the reader types. */
const START_SLUGS = ['introduction', 'installation', 'html-first', 'components', 'theming', 'native-elements'];
/** One page's sections stop crowding out other pages after this many hits. */
const MAX_PER_PAGE = 3;
const SNIPPET_LENGTH = 140;

const isWordChar = (c: string | undefined) => !!c && /[a-z0-9]/i.test(c);

/**
 * How well a lowercase term matches a lowercase field: 3 for a whole word or its plural, 2 for the start of a word,
 * 1 inside a word. A term shorter than three letters counts only at the start of a word, so "ui" skips "build".
 */
function quality(field: string, term: string): number {
  let best = 0;
  for (let at = field.indexOf(term); at >= 0 && best < 3; at = field.indexOf(term, at + 1)) {
    if (isWordChar(field[at - 1])) {
      if (term.length >= 3) best = Math.max(best, 1);
      continue;
    }
    const next = field[at + term.length];
    const whole = !isWordChar(next) || (next === 's' && !isWordChar(field[at + term.length + 1]));
    best = Math.max(best, whole ? 3 : 2);
  }
  return best;
}

/**
 * Every term has to match the page title, the heading, the text or the code. A page's title counts fully only on the
 * page's own entry, so its sections do not all rank as high as the page. Code counts least: it is there to find names
 * such as `hlmBtn`.
 */
function score(entry: SearchEntry, terms: string[], phrase: string): number {
  const title = entry.title.toLowerCase();
  const heading = entry.heading.toLowerCase();
  const text = entry.text.toLowerCase();
  const code = entry.code.toLowerCase();
  const page = !entry.heading;
  // A page's entry opens with its description, so a match there says what the page is about.
  const lead = page ? text.slice(0, 160) : '';
  let total = 0;
  for (const term of terms) {
    const points = quality(title, term) * (page ? 8 : 1.5) + quality(heading, term) * 5 + quality(lead, term) * 2 + quality(text, term) + quality(code, term) * 0.5;
    if (!points) return 0;
    total += points;
  }
  // A page's own entry wins a tie with one of its sections or another page's section.
  if (page) total += title === phrase ? 13 : 1;
  if (heading === phrase) total += 8;
  if (terms.length > 1) total += title.includes(phrase) || heading.includes(phrase) ? 10 : text.includes(phrase) ? 3 : 0;
  return total;
}

export function search(entries: readonly SearchEntry[], query: string, limit = 10): SearchHit[] {
  const phrase = query.toLowerCase().trim().replace(/\s+/g, ' ');
  const terms = phrase.split(' ').filter(Boolean);
  if (!terms.length) return [];
  const ranked = entries
    .map((entry, index) => ({ entry, index, score: score(entry, terms, phrase) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const perPage = new Map<string, number>();
  const hits: SearchHit[] = [];
  for (const { entry } of ranked) {
    const count = perPage.get(entry.slug) ?? 0;
    if (count === MAX_PER_PAGE) continue;
    perPage.set(entry.slug, count + 1);
    hits.push(toHit(entry, terms));
    if (hits.length === limit) break;
  }
  return hits;
}

/** The pages to start from, listed before the reader types. */
export function suggestions(entries: readonly SearchEntry[]): SearchHit[] {
  return START_SLUGS.map((slug) => entries.find((entry) => entry.slug === slug && !entry.heading))
    .filter((entry): entry is SearchEntry => !!entry)
    .map((entry) => toHit(entry, []));
}

function toHit(entry: SearchEntry, terms: string[]): SearchHit {
  return { ...entry, titleParts: mark(entry.title, terms), headingParts: mark(entry.heading, terms), snippet: mark(excerpt(entry.text, terms), terms) };
}

/** Up to SNIPPET_LENGTH characters around the first match, cut at spaces. */
function excerpt(text: string, terms: string[]): string {
  if (text.length <= SNIPPET_LENGTH) return text;
  const lower = text.toLowerCase();
  const first = terms.map((term) => lower.indexOf(term)).filter((at) => at >= 0).reduce((a, b) => Math.min(a, b), Infinity);
  // Start about 40 characters before the match, but early enough that a match near the end still fills the window.
  const start = Number.isFinite(first) && first > SNIPPET_LENGTH / 3 ? text.lastIndexOf(' ', Math.min(first - 40, text.length - SNIPPET_LENGTH)) + 1 : 0;
  let end = Math.min(text.length, start + SNIPPET_LENGTH);
  const cut = end < text.length ? text.lastIndexOf(' ', end) : -1;
  if (cut > start) end = cut;
  return (start > 0 ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '');
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Splits text into parts, marking each place where a term starts a word. */
function mark(text: string, terms: string[]): TextPart[] {
  if (!text) return [];
  if (!terms.length) return [{ text, match: false }];
  const alternatives = [...terms].sort((a, b) => b.length - a.length).map(escapeRegExp).join('|');
  const parts: TextPart[] = [];
  let last = 0;
  for (const match of text.matchAll(new RegExp(`(?<![a-z0-9])(?:${alternatives})`, 'gi'))) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index), match: false });
    parts.push({ text: match[0], match: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), match: false });
  return parts;
}
