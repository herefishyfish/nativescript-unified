import { computed, ElementRef, signal } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import {
	BrowserDynamicTestingModule,
	platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { BrnAccordionItemToken, BrnAccordionToken } from './brn-accordion-token';
import { BrnAccordionTrigger } from './brn-accordion-trigger';

const testBed = getTestBed();
if (!testBed.platform) {
	testBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
}

// The directive's host `(click)` calls this. Tests press it directly.
class PressableTrigger extends BrnAccordionTrigger {
	public press(): void {
		this.toggle(new MouseEvent('click'));
	}
}

interface TriggerHost {
	tagName: string;
	getAttribute(name: string): string | null;
	parentElement?: object | null;
	addEventListener(): void;
	removeEventListener(): void;
}

/** A NativeScript view: lower-case tagName, the menu getAttribute shim, and no parentElement. */
function nativeView(tagName: string, attributes: Record<string, string> = {}): TriggerHost {
	return {
		tagName,
		getAttribute: (name) => attributes[name] ?? null,
		addEventListener() {},
		removeEventListener() {},
	};
}

function createTrigger(element: object) {
	const open = signal(false);
	const item = {
		id: 1,
		state: computed(() => (open() ? 'open' : 'closed') as 'open' | 'closed'),
		disabled: signal(false),
		open: () => open.set(true),
		close: () => open.set(false),
	};
	const accordion = {
		orientation: signal('vertical' as const),
		registerTrigger() {},
		unregisterTrigger() {},
		setActiveItem() {},
	};

	TestBed.resetTestingModule();
	TestBed.configureTestingModule({
		providers: [
			{ provide: ElementRef, useValue: new ElementRef(element) },
			{ provide: BrnAccordionToken, useValue: accordion },
			{ provide: BrnAccordionItemToken, useValue: item },
		],
	});

	const trigger = TestBed.runInInjectionContext(() => new PressableTrigger());
	return { trigger, state: item.state };
}

describe('BrnAccordionTrigger aria structure', () => {
	it('does not throw for a NativeScript view with a lower-case tagName and no parentElement, and toggles', () => {
		const { trigger, state } = createTrigger(nativeView('button'));

		expect(state()).toBe('closed');
		trigger.press();
		expect(state()).toBe('open');
		trigger.press();
		expect(state()).toBe('closed');
	});

	it('accepts a lower-case button inside a lower-case heading', () => {
		const parent = nativeView('h3');
		const { trigger, state } = createTrigger({ ...nativeView('button'), parentElement: parent });

		trigger.press();
		expect(state()).toBe('open');
	});

	it('still rejects a lower-case trigger that is not a button and has no button role', () => {
		const parent = nativeView('h3');
		expect(() => createTrigger({ ...nativeView('div'), parentElement: parent })).toThrow(/must be a <button>/);
	});

	it('accepts role=button when the heading role carries aria-level and hasAttribute is missing', () => {
		const parent = nativeView('div', { role: 'heading', 'aria-level': '3' });
		const trigger = nativeView('div', { role: 'button' });

		expect(() => createTrigger({ ...trigger, parentElement: parent })).not.toThrow();
	});

	it('rejects role=heading without aria-level when only getAttribute exists', () => {
		const parent = nativeView('div', { role: 'heading' });
		const trigger = nativeView('button');

		expect(() => createTrigger({ ...trigger, parentElement: parent })).toThrow(/aria-level/);
	});

	it('rejects a DOM button that is not wrapped in a heading', () => {
		const div = document.createElement('div');
		const button = document.createElement('button');
		div.appendChild(button);

		expect(() => createTrigger(button)).toThrow(/Found parent: <div>/);
	});

	it('rejects a detached DOM button', () => {
		expect(() => createTrigger(document.createElement('button'))).toThrow(/wrapped in a heading/);
	});

	it('toggles a DOM button wrapped in a heading', () => {
		const heading = document.createElement('h3');
		const button = document.createElement('button');
		heading.appendChild(button);

		const { trigger, state } = createTrigger(button);
		expect(state()).toBe('closed');
		trigger.press();
		expect(state()).toBe('open');
		trigger.press();
		expect(state()).toBe('closed');
	});

	it('rejects a DOM heading role that has no aria-level', () => {
		const heading = document.createElement('div');
		heading.setAttribute('role', 'heading');
		const button = document.createElement('button');
		heading.appendChild(button);

		expect(() => createTrigger(button)).toThrow(/aria-level/);
	});
});
