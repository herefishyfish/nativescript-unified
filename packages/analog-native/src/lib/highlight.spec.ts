import { describe, expect, it } from 'vitest';
import { highlightRuns, type CodeRun } from './highlight';

const joined = (runs: CodeRun[]) => runs.map((run) => run.text).join('');
const classesOf = (runs: CodeRun[], text: string) => runs.filter((run) => run.text === text).map((run) => run.classes);

describe('highlightRuns', () => {
  it('round-trips every language exactly, whitespace included', () => {
    const samples: Array<[string, string]> = [
      ['html', '<div class="a">\n  @if (open()) {\n    <p (click)="x()">{{ title }}</p>\n  }\n</div>\n'],
      ['ts', '  const a: number = 1; // one\n\tfunction f() {}\n'],
      ['css', '.a {\n  color: red;\n}\n'],
      ['scss', '$x: 1;\n.a { .b { width: $x; } }'],
      ['json', '{\n  "a": [1, true, null]\n}'],
      ['bash', 'npm install  prismjs # note\n'],
      ['md', '# Title\n\n  - item `code`\n'],
      ['cobol', '   MOVE A TO B.  '],
    ];
    for (const [lang, code] of samples) expect(joined(highlightRuns(code, lang)), lang).toBe(code);
  });

  it('tags HTML with the web docs token types, outer types first', () => {
    const runs = highlightRuns('<a href="/x">hi</a>', 'html');
    expect(classesOf(runs, 'a')).toEqual(['token tag', 'token tag']);
    expect(classesOf(runs, '<')).toEqual(['token tag punctuation']);
    expect(classesOf(runs, 'href')).toEqual(['token tag attr-name']);
    expect(classesOf(runs, '/x')).toEqual(['token tag attr-value']);
    expect(classesOf(runs, 'hi')).toEqual(['']);
  });

  it('highlights Angular control flow, bindings and interpolation', () => {
    const runs = highlightRuns('@if (a) {<b [x]="y" (click)="go()">{{ name }}</b>}', 'html');
    expect(classesOf(runs, '@if')).toEqual(['token control-flow keyword']);
    expect(classesOf(runs, '[x]')).toEqual(['token tag attr-name']);
    expect(classesOf(runs, '(click)')).toEqual(['token tag attr-name']);
    expect(classesOf(runs, '{{')).toEqual(['token interpolation delimiter punctuation']);
    expect(classesOf(runs, '}}')).toEqual(['token interpolation delimiter punctuation']);
  });

  it('marks keywords, strings and comments in TypeScript', () => {
    const runs = highlightRuns("const s = 'x'; // c", 'typescript');
    expect(classesOf(runs, 'const')).toEqual(['token keyword']);
    expect(classesOf(runs, "'x'")).toEqual(['token string']);
    expect(classesOf(runs, '// c')).toEqual(['token comment']);
  });

  it('keeps indentation as its own plain run', () => {
    const runs = highlightRuns('a {\n    color: red;\n}', 'css');
    expect(runs.some((run) => run.text.endsWith('\n    ') && run.classes === '')).toBe(true);
  });

  it('reads only the first word of the info string and ignores case', () => {
    expect(highlightRuns('<p></p>', 'HTML live')[0].classes).toBe('token tag punctuation');
  });

  it('renders unknown and missing languages as one plain run', () => {
    expect(highlightRuns('x  = 1', 'cobol')).toEqual([{ text: 'x  = 1', classes: '' }]);
    expect(highlightRuns('x', undefined)).toEqual([{ text: 'x', classes: '' }]);
    expect(highlightRuns('', 'ts')).toEqual([]);
  });
});
