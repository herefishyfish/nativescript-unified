import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, afterNextRender, inject } from '@angular/core';
import {
  absoluteChildCss,
  absoluteHostCss,
  CssProps,
  dockChildCss,
  dockHostCss,
  flexChildCss,
  flexHostCss,
  gridChildCss,
  gridHostCss,
  readAttr,
  readBool,
  splitChildCss,
  splitHostCss,
  stackHostCss,
  wrapChildCss,
  wrapHostCss,
} from './layout-map';

/**
 * Layout fallbacks keep children in light DOM. The host is the grid or flex container.
 * A shadow slot would make every child one item, and `display: contents` is outside the MasonKit subset.
 */

const LAYOUT_ATTRS = [
  'rows', 'columns', 'orientation',
  'row', 'col', 'rowspan', 'row-span', 'colspan', 'col-span',
  'dock', 'left', 'top',
  'stretch-last-child', 'stretchlastchild',
  'item-width', 'itemwidth', 'item-height', 'itemheight',
  'flex-direction', 'flexdirection', 'flex-wrap', 'flexwrap',
  'justify-content', 'justifycontent', 'align-items', 'alignitems', 'align-content', 'aligncontent',
  'order', 'flex-grow', 'flexgrow', 'flex-shrink', 'flexshrink', 'align-self', 'alignself',
  'split-role', 'splitrole', 'preferred-primary-column-width-fraction', 'preferredprimarycolumnwidthfraction',
];

const GRID_HOST = ['display', 'grid-template-rows', 'grid-template-columns'];
const GRID_CHILD = ['grid-row', 'grid-column'];
const STACK_HOST = ['display', 'flex-direction'];
const WRAP_HOST = ['display', 'flex-direction', 'flex-wrap'];
const WRAP_CHILD = ['width', 'height'];
const ABSOLUTE_HOST = ['display', 'position'];
const ABSOLUTE_CHILD = ['position', 'left', 'top'];
const DOCK_HOST = ['display', 'grid-template-columns', 'grid-template-rows'];
const DOCK_CHILD = ['grid-column', 'grid-row'];
const FLEX_HOST = ['display', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-content'];
const FLEX_CHILD = ['order', 'flex-grow', 'flex-shrink', 'align-self'];
const SPLIT_HOST = ['display', 'grid-template-columns'];
const SPLIT_CHILD = ['grid-column'];

function childRoles(host: HTMLElement): (string | null)[] {
  return Array.from(host.children)
    .filter((node): node is HTMLElement => node instanceof HTMLElement)
    .map((kid) => readAttr(kid, ['split-role', 'splitrole']));
}

const written = new WeakMap<HTMLElement, Set<string>>();

function writeStyle(el: HTMLElement, props: CssProps, owned: readonly string[]): void {
  const previous = written.get(el) ?? new Set<string>();
  const next = new Set<string>();
  for (const key of owned) {
    const value = props[key];
    if (value) {
      el.style.setProperty(key, value);
      next.add(key);
    } else if (previous.has(key)) {
      el.style.removeProperty(key);
    }
  }
  written.set(el, next);
}

function bindLayout(
  hostOwned: readonly string[],
  childOwned: readonly string[],
  hostProps: (host: HTMLElement) => CssProps,
  childProps: (host: HTMLElement, child: HTMLElement, index: number, all: readonly HTMLElement[]) => CssProps,
): () => void {
  const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  const apply = () => {
    writeStyle(host, hostProps(host), hostOwned);
    const kids = Array.from(host.children).filter((node): node is HTMLElement => node instanceof HTMLElement);
    kids.forEach((kid, index) => writeStyle(kid, childProps(host, kid, index, kids), childOwned));
  };
  apply();
  afterNextRender(apply);
  if (typeof MutationObserver === 'undefined') return () => undefined;
  const observer = new MutationObserver(apply);
  observer.observe(host, { attributes: true, childList: true, subtree: true, attributeFilter: LAYOUT_ATTRS });
  return () => observer.disconnect();
}

/** Web fallback for GridLayout. On device the core view is GridLayout or nGridLayout. */
@Component({
  selector: 'GridLayout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styles: `:host { display: block; }`,
})
export class NsGridLayout implements OnDestroy {
  private readonly stop = bindLayout(
    GRID_HOST,
    GRID_CHILD,
    (host) => gridHostCss(readAttr(host, ['rows']), readAttr(host, ['columns'])),
    (_host, child) => gridChildCss(child),
  );

  ngOnDestroy(): void {
    this.stop();
  }
}

/** Web fallback for StackLayout. `orientation` is `vertical` (default) or `horizontal`. */
@Component({
  selector: 'StackLayout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styles: `:host { display: block; }`,
})
export class NsStackLayout implements OnDestroy {
  private readonly stop = bindLayout(
    STACK_HOST,
    [],
    (host) => stackHostCss(readAttr(host, ['orientation'])),
    () => ({}),
  );

  ngOnDestroy(): void {
    this.stop();
  }
}

/** Web fallback for WrapLayout. `itemWidth` and `itemHeight` size each direct child. */
@Component({
  selector: 'WrapLayout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styles: `:host { display: block; }`,
})
export class NsWrapLayout implements OnDestroy {
  private readonly stop = bindLayout(
    WRAP_HOST,
    WRAP_CHILD,
    (host) => wrapHostCss(readAttr(host, ['orientation'])),
    (host) => wrapChildCss(readAttr(host, ['item-width', 'itemwidth']), readAttr(host, ['item-height', 'itemheight'])),
  );

  ngOnDestroy(): void {
    this.stop();
  }
}

/** Web fallback for AbsoluteLayout. Children use `left` and `top`. */
@Component({
  selector: 'AbsoluteLayout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styles: `:host { display: block; }`,
})
export class NsAbsoluteLayout implements OnDestroy {
  private readonly stop = bindLayout(
    ABSOLUTE_HOST,
    ABSOLUTE_CHILD,
    () => absoluteHostCss(),
    (_host, child) => absoluteChildCss(readAttr(child, ['left']), readAttr(child, ['top'])),
  );

  ngOnDestroy(): void {
    this.stop();
  }
}

/** Web fallback for DockLayout. Children use `dock`. `stretchLastChild` defaults to true. */
@Component({
  selector: 'DockLayout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styles: `:host { display: block; }`,
})
export class NsDockLayout implements OnDestroy {
  private readonly stop = bindLayout(
    DOCK_HOST,
    DOCK_CHILD,
    () => dockHostCss(),
    (host, child, index, all) => dockChildCss(
      readAttr(child, ['dock']),
      index === all.length - 1,
      readBool(host, ['stretch-last-child', 'stretchlastchild'], true),
    ),
  );

  ngOnDestroy(): void {
    this.stop();
  }
}

/**
 * Web fallback for FlexboxLayout.
 * Host attributes: flexDirection, flexWrap, justifyContent, alignItems, alignContent.
 * Child attributes: order, flexGrow, flexShrink, alignSelf.
 */
@Component({
  selector: 'FlexboxLayout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styles: `:host { display: block; }`,
})
export class NsFlexboxLayout implements OnDestroy {
  private readonly stop = bindLayout(
    FLEX_HOST,
    FLEX_CHILD,
    (host) => flexHostCss({
      flexDirection: readAttr(host, ['flex-direction', 'flexdirection']),
      flexWrap: readAttr(host, ['flex-wrap', 'flexwrap']),
      justifyContent: readAttr(host, ['justify-content', 'justifycontent']),
      alignItems: readAttr(host, ['align-items', 'alignitems']),
      alignContent: readAttr(host, ['align-content', 'aligncontent']),
    }),
    (_host, child) => flexChildCss(child),
  );

  ngOnDestroy(): void {
    this.stop();
  }
}

/** Web fallback for SplitView. Children set `splitRole`. `preferredPrimaryColumnWidthFraction` is 0 to 1. */
@Component({
  selector: 'SplitView',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styles: `:host { display: block; }`,
})
export class NsSplitView implements OnDestroy {
  private readonly stop = bindLayout(
    SPLIT_HOST,
    SPLIT_CHILD,
    (host) => splitHostCss(readAttr(host, ['preferred-primary-column-width-fraction', 'preferredprimarycolumnwidthfraction']), childRoles(host)),
    (host, child, index) => splitChildCss(readAttr(child, ['split-role', 'splitrole']), childRoles(host), index),
  );

  ngOnDestroy(): void {
    this.stop();
  }
}
