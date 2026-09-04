import { Component, ElementRef, input, signal, viewChildren } from '@angular/core';

export interface TabLink {
  label: string;
  url: string;
}

export interface TabItem {
  label: string;
  links: TabLink[];
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css',
})
export class TabsComponent {
  readonly tabs = input.required<TabItem[]>();
  /** Prefix used to build unique tab and tabpanel ids, so several tab sets can share a page. */
  readonly idPrefix = input.required<string>();
  /** Id of the heading that names the tab list. */
  readonly labelledBy = input<string | null>(null);
  /** When true, each panel's list is given aria-labelledby pointing at its own tab. */
  readonly labelListByTab = input(false);

  readonly selectedIndex = signal(0);

  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');

  tabId(index: number): string {
    return `${this.idPrefix()}-tab-${index}`;
  }

  panelId(index: number): string {
    return `${this.idPrefix()}-panel-${index}`;
  }

  listLabelledBy(index: number): string | null {
    return this.labelListByTab() ? this.tabId(index) : null;
  }

  select(index: number): void {
    this.selectedIndex.set(index);
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    const total = this.tabs().length;
    let target: number | null = null;

    if (event.key === 'ArrowLeft') {
      target = (index - 1 + total) % total;
    } else if (event.key === 'ArrowRight') {
      target = (index + 1) % total;
    } else if (event.key === 'Home') {
      target = 0;
    } else if (event.key === 'End') {
      target = total - 1;
    }

    if (target === null) return;

    event.preventDefault();
    this.select(target);
    this.tabButtons()[target]?.nativeElement.focus();
  }
}
