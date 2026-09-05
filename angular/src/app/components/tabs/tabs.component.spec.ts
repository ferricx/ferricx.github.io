import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabItem, TabsComponent } from './tabs.component';

const TABS: TabItem[] = Array.from({ length: 5 }, (_, i) => ({
  label: `Tab ${i}`,
  links: Array.from({ length: 5 }, (_, j) => ({ label: `Link ${j}`, url: `#l${i}-${j}` })),
}));

describe('TabsComponent manual activation', () => {
  let fixture: ComponentFixture<TabsComponent>;
  let host: HTMLElement;

  const tabs = () => Array.from(host.querySelectorAll<HTMLButtonElement>('[role=tab]'));
  const panel = () => host.querySelector('[role=tabpanel]');
  const selected = () => tabs().findIndex((t) => t.getAttribute('aria-selected') === 'true');
  const roving = () => tabs().findIndex((t) => t.getAttribute('tabindex') === '0');

  const press = async (index: number, key: string) => {
    tabs()[index].dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TabsComponent] }).compileComponents();
    fixture = TestBed.createComponent(TabsComponent);
    fixture.componentRef.setInput('tabs', TABS);
    fixture.componentRef.setInput('idPrefix', 'test');
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    tabs()[0].focus();
    await fixture.whenStable();
  });

  it('renders five tabs and one panel', () => {
    expect(tabs().length).toBe(5);
    expect(host.querySelectorAll('[role=tabpanel]').length).toBe(1);
    expect(selected()).toBe(0);
  });

  it('ArrowRight moves focus without changing selection', async () => {
    await press(0, 'ArrowRight');
    expect(document.activeElement).toBe(tabs()[1]);
    expect(selected()).toBe(0);
    expect(panel()!.id).toBe('test-panel-0');
  });

  it('roving tabindex follows focus, not selection', async () => {
    await press(0, 'ArrowRight');
    expect(roving()).toBe(1);
    expect(tabs()[0].getAttribute('tabindex')).toBe('-1');
    expect(selected()).toBe(0);
  });

  it('Enter on the focused tab activates it', async () => {
    await press(0, 'ArrowRight');
    tabs()[1].click(); // Enter on a native button dispatches click
    await fixture.whenStable();
    expect(selected()).toBe(1);
    expect(panel()!.id).toBe('test-panel-1');
    expect(panel()!.getAttribute('aria-labelledby')).toBe('test-tab-1');
  });

  it('arrow keys wrap in both directions without selecting', async () => {
    await press(0, 'ArrowLeft');
    expect(document.activeElement).toBe(tabs()[4]);
    expect(selected()).toBe(0);

    await press(4, 'ArrowRight');
    expect(document.activeElement).toBe(tabs()[0]);
    expect(selected()).toBe(0);
  });

  it('Home and End move focus only', async () => {
    await press(0, 'End');
    expect(document.activeElement).toBe(tabs()[4]);
    expect(selected()).toBe(0);

    await press(4, 'Home');
    expect(document.activeElement).toBe(tabs()[0]);
    expect(selected()).toBe(0);
  });

  it('keeps aria wiring intact for every tab', () => {
    tabs().forEach((tab, i) => {
      expect(tab.id).toBe(`test-tab-${i}`);
      expect(tab.getAttribute('aria-controls')).toBe(`test-panel-${i}`);
      expect(tab.getAttribute('aria-selected')).toBe(String(i === 0));
    });
  });

  it('names the panel by its tab by default', () => {
    expect(panel()!.getAttribute('aria-labelledby')).toBe('test-tab-0');
  });

  it('omits the panel name when namePanel is false, keeping the list named', async () => {
    fixture.componentRef.setInput('namePanel', false);
    fixture.componentRef.setInput('listNaming', 'labelledby');
    await fixture.whenStable();
    expect(panel()!.getAttribute('aria-labelledby')).toBeNull();
    expect(panel()!.querySelector('ul')!.getAttribute('aria-labelledby')).toBe('test-tab-0');
  });

  it('leaves the list unnamed by default', () => {
    const ul = panel()!.querySelector('ul')!;
    expect(ul.getAttribute('aria-labelledby')).toBeNull();
    expect(ul.getAttribute('aria-label')).toBeNull();
  });

  it('names the list with aria-labelledby pointing at its tab', async () => {
    fixture.componentRef.setInput('listNaming', 'labelledby');
    await fixture.whenStable();
    const ul = panel()!.querySelector('ul')!;
    expect(ul.getAttribute('aria-labelledby')).toBe('test-tab-0');
    expect(ul.getAttribute('aria-label')).toBeNull();
  });

  it('names the list with aria-label built from the tab label', async () => {
    fixture.componentRef.setInput('listNaming', 'label');
    await fixture.whenStable();
    const ul = panel()!.querySelector('ul')!;
    expect(ul.getAttribute('aria-label')).toBe('Links for Tab 0');
    expect(ul.getAttribute('aria-labelledby')).toBeNull();
  });

  it('tracks the selected tab when naming the list with aria-label', async () => {
    fixture.componentRef.setInput('listNaming', 'label');
    await fixture.whenStable();
    tabs()[3].click();
    await fixture.whenStable();
    expect(panel()!.querySelector('ul')!.getAttribute('aria-label')).toBe('Links for Tab 3');
  });
});
