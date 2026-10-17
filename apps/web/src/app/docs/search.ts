export interface SearchEntry { slug: string; title: string; section: string; heading: string; id: string; text: string }
export interface SearchHit extends SearchEntry { snippet: string }

export function search(entries: readonly SearchEntry[], query: string, limit = 8): SearchHit[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return entries
    .map((entry) => {
      const title = entry.title.toLowerCase();
      const heading = entry.heading.toLowerCase();
      const text = entry.text.toLowerCase();
      let score = 0;
      for (const term of terms) {
        const s = (title.includes(term) ? 6 : 0) + (heading.includes(term) ? 4 : 0) + (text.includes(term) ? 1 : 0);
        if (!s) return { entry, score: 0 };
        score += s;
      }
      const at = text.indexOf(terms[0]);
      const snippet = at < 0 ? entry.text.slice(0, 90) : (at > 30 ? '…' : '') + entry.text.slice(Math.max(0, at - 30), at + 70);
      return { entry: { ...entry, snippet }, score };
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((hit) => hit.entry as SearchHit);
}