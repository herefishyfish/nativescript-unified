import { CUSTOM_ELEMENTS_SCHEMA, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NsActionBar, NsNavigationButton } from '../action-bar/action-bar';
import { NsDrawer } from '../drawer/drawer';
import { NsPager } from '../pager/pager';
import { NsTabs } from '../tabs/tabs';
import { NS_ELEMENTS, defineNsElements } from './define';

@Component({
  selector: 'spec-action-bar',
  imports: [NsActionBar, NsNavigationButton],
  template: `<ActionBar title="Inbox"><NavigationButton text="Back"></NavigationButton></ActionBar>`,
})
class BarHost {}

@Component({
  selector: 'spec-tabs',
  imports: [NsTabs],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<Tabs><ns-tab label="One">first</ns-tab><ns-tab label="Two">second</ns-tab></Tabs>`,
})
class TabsHost {}

@Component({
  selector: 'spec-pager',
  imports: [NsPager],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<Pager><ns-page>a</ns-page><ns-page>b</ns-page></Pager>`,
})
class PagerHost {}

@Component({
  selector: 'spec-drawer',
  imports: [NsDrawer],
  template: `<Drawer [open]="open()" (openChange)="open.set($event)"><p>page</p><nav slot="drawer">menu</nav></Drawer>`,
})
class DrawerHost {
  readonly open = signal(false);
}

describe('NativeScript view components', () => {
  it('does not register custom elements', () => {
    defineNsElements(undefined as never);
    for (const name of Object.keys(NS_ELEMENTS)) expect(customElements.get(name)).toBeUndefined();
    expect(customElements.get('ns-label')).toBeUndefined();
    expect(customElements.get('ActionBar')).toBeUndefined();
    expect(customElements.get('Label')).toBeUndefined();
  });

  it('action bar renders the title and a NavigationButton', async () => {
    const fixture = TestBed.createComponent(BarHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const bar = el.querySelector('ActionBar') as HTMLElement;
    expect(bar.querySelector('h1')?.textContent).toBe('Inbox');
    expect(bar.querySelector('NavigationButton')?.textContent).toContain('Back');
  });

  it('tabs show labels, hide inactive children, and update selectedIndex', async () => {
    const fixture = TestBed.createComponent(TabsHost);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 20));
    const el = fixture.nativeElement as HTMLElement;
    const tabs = el.querySelector('Tabs') as HTMLElement;
    const panels = el.querySelectorAll('ns-tab');
    const buttons = tabs.querySelectorAll('.tabbtn') as NodeListOf<HTMLButtonElement>;
    expect(Array.from(buttons).map((b) => b.textContent)).toEqual(['One', 'Two']);
    expect((panels[0] as HTMLElement).hidden).toBe(false);
    expect((panels[1] as HTMLElement).hidden).toBe(true);
    buttons[1].click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect((panels[0] as HTMLElement).hidden).toBe(true);
    expect((panels[1] as HTMLElement).hidden).toBe(false);
  });

  it('pager moves with next and disables at end', async () => {
    const fixture = TestBed.createComponent(PagerHost);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 20));
    const el = fixture.nativeElement as HTMLElement;
    const pager = el.querySelector('Pager') as HTMLElement;
    const next = pager.querySelector('[part=next]') as HTMLButtonElement;
    next.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect((el.querySelectorAll('ns-page')[1] as HTMLElement).hidden).toBe(false);
    expect(next.disabled).toBe(true);
  });

  it('drawer opens from the model and closes from the scrim', async () => {
    const fixture = TestBed.createComponent(DrawerHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const aside = () => el.querySelector('aside') as HTMLElement;
    expect(aside().hasAttribute('hidden')).toBe(true);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(aside().hasAttribute('hidden')).toBe(false);
    (el.querySelector('.scrim') as HTMLElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.open()).toBe(false);
    expect(aside().hasAttribute('hidden')).toBe(true);
  });
});
