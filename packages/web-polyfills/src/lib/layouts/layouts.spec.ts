import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  absoluteChildCss,
  dockChildCss,
  flexHostCss,
  gridCellCss,
  splitChildCss,
  splitHostCss,
  gridHostCss,
  gridTracks,
  stackHostCss,
  wrapChildCss,
  wrapHostCss,
} from './layout-map';
import {
  NsAbsoluteLayout,
  NsDockLayout,
  NsFlexboxLayout,
  NsGridLayout,
  NsSplitView,
  NsStackLayout,
  NsWrapLayout,
} from './layouts';

describe('layout attribute mapping', () => {
  it('maps grid tracks and 0-based cell placement', () => {
    expect(gridTracks('auto, *, 2*, 40')).toBe('auto 1fr 2fr 40px');
    expect(gridTracks('')).toBe('1fr');
    expect(gridHostCss('auto, *', '40, *')).toEqual({
      display: 'grid',
      'grid-template-rows': 'auto 1fr',
      'grid-template-columns': '40px 1fr',
    });
    expect(gridCellCss('1', '0', '2', null)).toEqual({ 'grid-row': '2 / span 2', 'grid-column': '1' });
    expect(gridCellCss(null, null, null, null)).toEqual({ 'grid-row': '1', 'grid-column': '1' });
  });

  it('maps stack and wrap orientation', () => {
    expect(stackHostCss(null)['flex-direction']).toBe('column');
    expect(stackHostCss('horizontal')['flex-direction']).toBe('row');
    expect(stackHostCss('vertical')['flex-direction']).toBe('column');
    expect(wrapHostCss(null)).toMatchObject({ 'flex-direction': 'row', 'flex-wrap': 'wrap' });
    expect(wrapHostCss('vertical')['flex-direction']).toBe('column');
    expect(wrapChildCss('80', '40')).toEqual({ width: '80px', height: '40px' });
  });

  it('maps absolute offsets and dock edges', () => {
    expect(absoluteChildCss('10', '20')).toEqual({ position: 'absolute', left: '10px', top: '20px' });
    expect(absoluteChildCss(null, null)).toEqual({ position: 'absolute', left: '0px', top: '0px' });
    expect(dockChildCss('left', false, true)).toEqual({ 'grid-column': '1', 'grid-row': '2' });
    expect(dockChildCss('top', false, true)).toEqual({ 'grid-column': '1 / -1', 'grid-row': '1' });
    expect(dockChildCss('left', true, true)).toEqual({ 'grid-column': '2', 'grid-row': '2' });
    expect(dockChildCss('right', true, false)).toEqual({ 'grid-column': '3', 'grid-row': '2' });
  });

  it('keeps flex values inside the subset and drops unknown ones', () => {
    expect(flexHostCss({
      flexDirection: 'column',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      alignContent: 'nope',
    })).toEqual({
      display: 'flex',
      'flex-direction': 'column',
      'flex-wrap': 'wrap',
      'justify-content': 'space-between',
      'align-items': 'center',
    });
    expect(flexHostCss({
      flexDirection: null,
      flexWrap: null,
      justifyContent: null,
      alignItems: null,
      alignContent: null,
    })['flex-direction']).toBe('row');
  });
});

@Component({
  selector: 'layout-spec-host',
  imports: [NsAbsoluteLayout, NsDockLayout, NsFlexboxLayout, NsGridLayout, NsSplitView, NsStackLayout, NsWrapLayout],
  template: `
    <GridLayout id="g1" rows="auto, *" columns="40, *"><div row="1" col="0" rowspan="2"></div></GridLayout>
    <StackLayout id="s1"><div>One</div><div>Two</div><div>Three</div></StackLayout>
    <GridLayout id="g2" rows="auto, auto" columns="*, *"><div row="0" col="0">0,0</div><div row="0" col="1">0,1</div><div row="1" col="0">1,0</div><div row="1" col="1">1,1</div></GridLayout>
    <StackLayout id="s2" orientation="horizontal"></StackLayout>
    <DockLayout id="dock"><div dock="top"></div><div dock="left"></div><div id="last"></div></DockLayout>
    <AbsoluteLayout id="abs"><div left="10" top="20"></div></AbsoluteLayout>
    <WrapLayout id="wrap" orientation="vertical" item-width="80" item-height="40"><span>A</span><span>B</span></WrapLayout>
    <FlexboxLayout id="flex" flex-direction="column" justify-content="space-between"><span flex-grow="1">C</span></FlexboxLayout>
    <SplitView id="split" preferred-primary-column-width-fraction="0.3"><div split-role="primary">P</div><div split-role="secondary">S</div></SplitView>
  `,
})
class LayoutSpecHost {}

describe('layout elements apply attributes as styles', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [LayoutSpecHost] }));

  async function render(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(LayoutSpecHost);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 20));
    return fixture.nativeElement as HTMLElement;
  }

  it('writes grid tracks and child placement, then updates when rows change', async () => {
    const host = await render();
    const el = host.querySelector('#g1') as HTMLElement;
    const child = el.querySelector('div') as HTMLElement;
    expect(el.style.gridTemplateRows).toBe('auto 1fr');
    expect(el.style.gridTemplateColumns).toBe('40px 1fr');
    expect(child.style.gridRow).toBe('2 / span 2');
    expect(child.style.gridColumn).toBe('1');
    el.setAttribute('rows', '100, *');
    await new Promise((r) => setTimeout(r, 20));
    expect(el.style.gridTemplateRows).toBe('100px 1fr');
  });

  it('places stack children down a column and grid children across two columns', async () => {
    const host = await render();
    const stackEl = host.querySelector('#s1') as HTMLElement;
    expect(stackEl.style.display).toBe('flex');
    expect(stackEl.style.flexDirection).toBe('column');
    expect(Array.from(stackEl.children).map((node) => node.textContent)).toEqual(['One', 'Two', 'Three']);

    const gridEl = host.querySelector('#g2') as HTMLElement;
    expect(gridEl.style.display).toBe('grid');
    expect(gridEl.style.gridTemplateColumns).toBe('1fr 1fr');
    const cells = Array.from(gridEl.children) as HTMLElement[];
    expect(cells.map((cell) => `${cell.style.gridRow} ${cell.style.gridColumn}`)).toEqual(['1 1', '1 2', '2 1', '2 2']);
  });

  it('writes stack orientation, dock edges, and absolute offsets', async () => {
    const host = await render();
    expect((host.querySelector('#s2') as HTMLElement).style.flexDirection).toBe('row');

    const dockEl = host.querySelector('#dock') as HTMLElement;
    expect(dockEl.style.gridTemplateColumns).toBe('auto 1fr auto');
    expect((dockEl.querySelector('[dock=top]') as HTMLElement).style.gridRow).toBe('1');
    expect((dockEl.querySelector('[dock=left]') as HTMLElement).style.gridColumn).toBe('1');
    expect((dockEl.querySelector('#last') as HTMLElement).style.gridColumn).toBe('2');

    const absEl = host.querySelector('#abs') as HTMLElement;
    const box = absEl.querySelector('div') as HTMLElement;
    expect(absEl.style.position).toBe('relative');
    expect(box.style.position).toBe('absolute');
    expect(box.style.left).toBe('10px');
    expect(box.style.top).toBe('20px');
  });

  it('sizes wrap children and places a flex child', async () => {
    const host = await render();
    const wrapEl = host.querySelector('#wrap') as HTMLElement;
    const wrapChild = wrapEl.querySelector('span') as HTMLElement;
    expect(wrapChild.parentElement).toBe(wrapEl);
    expect(wrapEl.style.flexDirection).toBe('column');
    expect(wrapEl.style.flexWrap).toBe('wrap');
    expect(wrapChild.style.width).toBe('80px');
    expect(wrapChild.style.height).toBe('40px');

    const flexEl = host.querySelector('#flex') as HTMLElement;
    const flexChild = flexEl.querySelector('span') as HTMLElement;
    expect(flexChild.parentElement).toBe(flexEl);
    expect(flexEl.style.flexDirection).toBe('column');
    expect(flexEl.style.justifyContent).toBe('space-between');
    expect(flexChild.style.flexGrow).toBe('1');
  });

  it('places split children in columns sized by the primary fraction', async () => {
    expect(splitHostCss('0.3', ['primary', 'secondary'])['grid-template-columns']).toBe('0.3fr 0.7fr');
    expect(splitChildCss('secondary', ['primary', 'secondary'], 1)['grid-column']).toBe('2');
    const host = await render();
    const el = host.querySelector('#split') as HTMLElement;
    const primary = el.querySelector('[split-role=primary]') as HTMLElement;
    const secondary = el.querySelector('[split-role=secondary]') as HTMLElement;
    expect(primary.parentElement).toBe(el);
    expect(secondary.parentElement).toBe(el);
    expect(el.style.gridTemplateColumns).toBe('0.3fr 0.7fr');
    expect(primary.style.gridColumn).toBe('1');
    expect(secondary.style.gridColumn).toBe('2');
  });
});
