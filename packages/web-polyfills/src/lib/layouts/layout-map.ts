/**
 * Map NativeScript layout attributes onto the MasonKit CSS subset.
 * Bare numbers become px. `*` and `2*` become `1fr` and `2fr`.
 * Attribute names accept the HTML form (`flex-direction`) and the lowercased core name (`flexdirection`).
 */

export type CssProps = { readonly [property: string]: string };

const FLEX_DIRECTION = ['row', 'row-reverse', 'column', 'column-reverse'];
const FLEX_WRAP = ['nowrap', 'wrap', 'wrap-reverse'];
const JUSTIFY = ['flex-start', 'flex-end', 'center', 'space-between', 'space-around'];
const ALIGN_ITEMS = ['flex-start', 'flex-end', 'center', 'baseline', 'stretch'];
const ALIGN_CONTENT = ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'stretch'];
const ALIGN_SELF = ['auto', 'flex-start', 'flex-end', 'center', 'baseline', 'stretch'];

export function readAttr(el: Element, names: readonly string[]): string | null {
  for (const name of names) {
    const value = el.getAttribute(name);
    if (value != null) return value;
  }
  return null;
}

/** Absent attribute keeps `fallback`. Present empty or `true` is true. `false` and `0` are false. */
export function readBool(el: Element, names: readonly string[], fallback: boolean): boolean {
  const value = readAttr(el, names);
  if (value == null) return fallback;
  if (value === '' || value === 'true') return true;
  return value !== 'false' && value !== '0';
}

export function gridTracks(spec: string): string {
  const parts = spec.split(',').map((part) => part.trim()).filter((part) => part.length > 0);
  return (parts.length > 0 ? parts : ['*']).map(trackToken).join(' ');
}

export function gridHostCss(rows: string | null, columns: string | null): CssProps {
  return {
    display: 'grid',
    'grid-template-rows': gridTracks(rows ?? ''),
    'grid-template-columns': gridTracks(columns ?? ''),
  };
}

/** `row` and `col` are 0-based, matching GridLayout. CSS grid lines are 1-based. */
export function gridCellCss(row: string | null, col: string | null, rowSpan: string | null, colSpan: string | null): CssProps {
  return {
    'grid-row': gridLine(row, rowSpan),
    'grid-column': gridLine(col, colSpan),
  };
}

export function gridChildCss(el: Element): CssProps {
  return gridCellCss(
    readAttr(el, ['row']),
    readAttr(el, ['col']),
    readAttr(el, ['rowspan', 'row-span']),
    readAttr(el, ['colspan', 'col-span']),
  );
}

export function stackHostCss(orientation: string | null): CssProps {
  return {
    display: 'flex',
    'flex-direction': orientation === 'horizontal' ? 'row' : 'column',
  };
}

export function wrapHostCss(orientation: string | null): CssProps {
  return {
    display: 'flex',
    'flex-direction': orientation === 'vertical' ? 'column' : 'row',
    'flex-wrap': 'wrap',
  };
}

export function wrapChildCss(itemWidth: string | null, itemHeight: string | null): CssProps {
  const props: { [property: string]: string } = {};
  if (itemWidth != null && itemWidth !== '') props['width'] = lengthPx(itemWidth, '');
  if (itemHeight != null && itemHeight !== '') props['height'] = lengthPx(itemHeight, '');
  return props;
}

export function absoluteHostCss(): CssProps {
  return { display: 'block', position: 'relative' };
}

/** AbsoluteLayout children are all absolutely positioned. Missing left/top is 0. */
export function absoluteChildCss(left: string | null, top: string | null): CssProps {
  return {
    position: 'absolute',
    left: lengthPx(left, '0px'),
    top: lengthPx(top, '0px'),
  };
}

export function dockHostCss(): CssProps {
  return {
    display: 'grid',
    'grid-template-columns': 'auto 1fr auto',
    'grid-template-rows': 'auto 1fr auto',
  };
}

/**
 * One child per edge (top, right, bottom, left). Extra children on the same edge share that cell.
 * `stretchLastChild` (default true) puts the last child in the center and ignores its dock.
 */
export function dockChildCss(dock: string | null, isLast: boolean, stretchLast: boolean): CssProps {
  if (isLast && stretchLast) return { 'grid-column': '2', 'grid-row': '2' };
  switch (dock) {
    case 'top':
      return { 'grid-column': '1 / -1', 'grid-row': '1' };
    case 'bottom':
      return { 'grid-column': '1 / -1', 'grid-row': '3' };
    case 'left':
      return { 'grid-column': '1', 'grid-row': '2' };
    case 'right':
      return { 'grid-column': '3', 'grid-row': '2' };
    default:
      return { 'grid-column': '2', 'grid-row': '2' };
  }
}

export interface FlexHostInput {
  flexDirection: string | null;
  flexWrap: string | null;
  justifyContent: string | null;
  alignItems: string | null;
  alignContent: string | null;
}

export function flexHostCss(input: FlexHostInput): CssProps {
  const props: { [property: string]: string } = {
    display: 'flex',
    'flex-direction': oneOf(input.flexDirection, FLEX_DIRECTION, 'row'),
    'flex-wrap': oneOf(input.flexWrap, FLEX_WRAP, 'nowrap'),
  };
  const justify = oneOf(input.justifyContent, JUSTIFY, '');
  const align = oneOf(input.alignItems, ALIGN_ITEMS, '');
  const content = oneOf(input.alignContent, ALIGN_CONTENT, '');
  if (justify) props['justify-content'] = justify;
  if (align) props['align-items'] = align;
  if (content) props['align-content'] = content;
  return props;
}

const SPLIT_ROLES = ['primary', 'supplementary', 'secondary', 'inspector'] as const;

/** Columns follow the roles that are actually present. No role means primary beside secondary. */
export function splitColumns(roles: readonly (string | null)[]): readonly string[] {
  const named = roles.filter((role): role is string => role != null && (SPLIT_ROLES as readonly string[]).includes(role));
  const present = SPLIT_ROLES.filter((role) => named.includes(role));
  return present.length > 0 ? present : ['primary', 'secondary'];
}

/** `preferredPrimaryColumnWidthFraction` is 0..1. Other columns share what remains. */
export function splitHostCss(primaryFraction: string | null, roles: readonly (string | null)[]): CssProps {
  const columns = splitColumns(roles);
  const primary = fractionInRange(primaryFraction);
  const others = Math.max(1, columns.length - (columns.includes('primary') ? 1 : 0));
  const rest = primary == null ? null : (1 - primary) / others;
  const tracks = columns.map((role) => {
    if (primary == null) return '1fr';
    if (role === 'primary') return fractionTrack(primary);
    return fractionTrack(rest ?? 1);
  });
  return { display: 'grid', 'grid-template-columns': tracks.join(' ') };
}

export function splitChildCss(role: string | null, roles: readonly (string | null)[], index: number): CssProps {
  const columns = splitColumns(roles);
  const named = role != null && (SPLIT_ROLES as readonly string[]).includes(role) ? role : columns[Math.min(index, columns.length - 1)];
  const at = columns.indexOf(named);
  return { 'grid-column': String((at >= 0 ? at : 0) + 1) };
}

function fractionInRange(value: string | null): number | null {
  if (value == null || value.trim() === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 1) return null;
  return n;
}

function fractionTrack(n: number): string {
  const rounded = Math.round(n * 1000) / 1000;
  return `${rounded}fr`;
}

export function flexChildCss(el: Element): CssProps {
  const props: { [property: string]: string } = {};
  const order = readAttr(el, ['order']);
  const grow = readAttr(el, ['flex-grow', 'flexgrow']);
  const shrink = readAttr(el, ['flex-shrink', 'flexshrink']);
  const align = readAttr(el, ['align-self', 'alignself']);
  if (order != null && /^-?\d+$/.test(order)) props['order'] = order;
  if (grow != null && /^\d*\.?\d+$/.test(grow)) props['flex-grow'] = grow;
  if (shrink != null && /^\d*\.?\d+$/.test(shrink)) props['flex-shrink'] = shrink;
  if (align != null && ALIGN_SELF.includes(align)) props['align-self'] = align;
  return props;
}

export function lengthPx(value: string | null, fallback: string): string {
  if (value == null) return fallback;
  const token = value.trim();
  if (token === '') return fallback;
  if (/^-?\d*\.?\d+$/.test(token)) return `${token}px`;
  if (/^-?\d*\.?\d+(px|%|dip)$/.test(token)) return token;
  return fallback;
}

function trackToken(token: string): string {
  if (token === 'auto') return 'auto';
  if (token === '*') return '1fr';
  const star = /^(\d+)\*$/.exec(token);
  if (star) return `${star[1]}fr`;
  if (/^\d*\.?\d+$/.test(token)) return `${token}px`;
  if (/^\d*\.?\d+(px|%|dip|fr)$/.test(token)) return token;
  return 'auto';
}

function gridLine(index: string | null, span: string | null): string {
  const start = toIndex(index) + 1;
  const count = toSpan(span);
  return count === 1 ? String(start) : `${start} / span ${count}`;
}

function toIndex(value: string | null): number {
  if (value == null || value.trim() === '') return 0;
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : 0;
}

function toSpan(value: string | null): number {
  if (value == null || value.trim() === '') return 1;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

function oneOf(value: string | null, allowed: readonly string[], fallback: string): string {
  if (value != null && allowed.includes(value)) return value;
  return fallback;
}
