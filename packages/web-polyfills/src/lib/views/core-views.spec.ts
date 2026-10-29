import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  NsActivityIndicator,
  NsImage,
  NsLabel,
  NsListPicker,
  NsProgress,
  NsScrollView,
  NsSegmentedBar,
  NsSwitch,
} from './core-views';
import { NsContentView, NsDatePicker, NsHtmlView, NsListView, NsRepeater, NsTimePicker, NsWebView } from './extra-views';
import { NsPlaceholder } from './placeholder-view';
import { NsFormattedString, NsSpan } from './text-runs';

const viewImports = [
  NsActivityIndicator, NsContentView, NsDatePicker, NsFormattedString, NsHtmlView, NsImage, NsLabel, NsListPicker,
  NsListView, NsPlaceholder, NsProgress, NsRepeater, NsScrollView, NsSegmentedBar, NsSpan, NsSwitch, NsTimePicker, NsWebView,
];

@Component({
  selector: 'spec-runs',
  imports: viewImports,
  template: `
    <Label><FormattedString><Span text="Bold " font-weight="bold"></Span><Span text="accent" color="#6750a4"></Span></FormattedString></Label>
    <Placeholder></Placeholder>
  `,
})
class RunsHost {}

@Component({
  selector: 'spec-meters',
  imports: viewImports,
  template: `<Label text="Hello"></Label><Progress value="40" max="80"></Progress><ActivityIndicator busy></ActivityIndicator>`,
})
class MetersHost {}

@Component({
  selector: 'spec-switch',
  imports: viewImports,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<Switch (checkedChange)="checked = $event"></Switch><SegmentedBar (selectedIndexChange)="index = $event"><ns-segmented-bar-item title="Day"></ns-segmented-bar-item><ns-segmented-bar-item title="Week"></ns-segmented-bar-item></SegmentedBar>`,
})
class SwitchHost {
  checked: boolean | string = false;
  index: number | string = 0;
}

@Component({
  selector: 'spec-picker',
  imports: viewImports,
  template: `<ListPicker items="Red, Green" selectedIndex="1"></ListPicker><ScrollView orientation="horizontal"></ScrollView>`,
})
class PickerHost {}

@Component({
  selector: 'spec-content',
  imports: viewImports,
  template: `<ContentView><p>Body</p></ContentView><HtmlView html="<b>Bold</b>"></HtmlView><Repeater items="Red, Green"></Repeater>`,
})
class ContentHost {}

@Component({
  selector: 'spec-date',
  imports: viewImports,
  template: `<DatePicker year="2026" month="10" day="15"></DatePicker><TimePicker hour="9" minute="5"></TimePicker><ListView items="Red, Green" (itemTap)="picked = $event"></ListView>`,
})
class DateHost {
  picked: number | null = null;
}

@Component({
  selector: 'spec-frame',
  imports: viewImports,
  template: `<Image src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="Dot"></Image><WebView src="<p>Hi</p>"></WebView>`,
})
class FrameHost {}

async function show<T>(cmp: new (...args: never[]) => T) {
  const fixture = TestBed.createComponent(cmp);
  fixture.detectChanges();
  await fixture.whenStable();
  await new Promise((r) => setTimeout(r, 20));
  fixture.detectChanges();
  return fixture;
}

describe('core view components', () => {
  it('renders formatted spans inside a label and shows an empty placeholder fallback', async () => {
    const fixture = await show(RunsHost);
    const el = fixture.nativeElement as HTMLElement;
    const formatted = el.querySelector('FormattedString') as HTMLElement;
    const spans = Array.from(formatted.children) as HTMLElement[];
    expect(spans.length).toBe(2);
    expect(spans[0].querySelector('.t')?.textContent).toBe('Bold ');
    expect(spans[0].style.fontWeight).toBe('bold');
    expect(spans[1].querySelector('.t')?.textContent).toBe('accent');
    expect(spans[1].style.color).toBe('rgb(103, 80, 164)');
    expect(el.querySelector('Placeholder')?.querySelector('.fallback')?.textContent).toBe('No native view yet');
  });

  it('shows label text, progress width, and a busy indicator', async () => {
    const fixture = await show(MetersHost);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('Label')?.querySelector('.t')?.textContent).toBe('Hello');
    const progress = el.querySelector('Progress') as HTMLProgressElement;
    expect(progress.getAttribute('value')).toBe('40');
    expect(progress.getAttribute('max')).toBe('80');
    expect((el.querySelector('ActivityIndicator') as HTMLElement).hasAttribute('busy')).toBe(true);
  });

  it('toggles the switch and selects a segmented item', async () => {
    const fixture = await show(SwitchHost);
    const el = fixture.nativeElement as HTMLElement;
    const sw = el.querySelector('Switch') as HTMLElement;
    (sw.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.checked).toBe(true);
    expect(sw.hasAttribute('checked')).toBe(true);

    const bar = el.querySelector('SegmentedBar') as HTMLElement;
    const buttons = bar.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    expect(Array.from(buttons).map((b) => b.textContent)).toEqual(['Day', 'Week']);
    buttons[1].click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.index).toBe(1);
  });

  it('lists picker items and scrolls horizontally when asked', async () => {
    const fixture = await show(PickerHost);
    const el = fixture.nativeElement as HTMLElement;
    const picker = el.querySelector('ListPicker') as HTMLElement;
    const options = picker.querySelectorAll('option') as NodeListOf<HTMLOptionElement>;
    expect(Array.from(options).map((o) => o.textContent)).toEqual(['Red', 'Green']);
    expect((picker.querySelector('select') as HTMLSelectElement).value).toBe('1');
    expect((el.querySelector('ScrollView') as HTMLElement).getAttribute('orientation')).toBe('horizontal');
  });

  it('keeps a content child, paints html, and repeats items', async () => {
    const fixture = await show(ContentHost);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('ContentView')?.querySelector('p')?.textContent).toBe('Body');
    expect(el.querySelector('HtmlView')?.querySelector('b')?.textContent).toBe('Bold');
    const rows = el.querySelector('Repeater')?.querySelectorAll('.row');
    expect(Array.from(rows ?? []).map((row) => row.textContent)).toEqual(['Red', 'Green']);
  });

  it('sets a date, a time, and a tapped list index', async () => {
    const fixture = await show(DateHost);
    const el = fixture.nativeElement as HTMLElement;
    expect((el.querySelector('DatePicker')?.querySelector('input') as HTMLInputElement).value).toBe('2026-10-15');
    expect((el.querySelector('TimePicker')?.querySelector('input') as HTMLInputElement).value).toBe('09:05');
    const buttons = el.querySelector('ListView')?.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    expect(Array.from(buttons).map((b) => b.textContent)).toEqual(['Red', 'Green']);
    buttons[1].click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.picked).toBe(1);
  });

  it('loads an image and puts html into the web view frame', async () => {
    const fixture = await show(FrameHost);
    const el = fixture.nativeElement as HTMLElement;
    const img = el.querySelector('Image')?.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('data:image/gif;base64,R0lGODlhAQABAAAAACw=');
    expect(img.getAttribute('alt')).toBe('Dot');
    const frame = el.querySelector('WebView')?.querySelector('iframe') as HTMLIFrameElement;
    expect(frame.getAttribute('srcdoc')).toBe('<p>Hi</p>');
    expect(frame.getAttribute('src')).toBeNull();
  });
});
