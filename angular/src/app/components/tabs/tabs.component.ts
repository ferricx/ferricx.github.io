import { Component, ElementRef, input, signal, viewChildren } from '@angular/core';

export interface TabLink {
  label: string;
  url: string;
}

export interface TabItem {
  label: string;
  links: TabLink[];
}

export type ListNaming = 'none' | 'labelledby' | 'label';

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
  /**
   * How each panel's list gets its accessible name.
   * 'none' leaves it unnamed, 'labelledby' points at the owning tab, and 'label' uses an
   * aria-label of "Links for" followed by the tab's name.
   */
  readonly listNaming = input<ListNaming>('none');
  /**
   * Whether each panel is named by its tab. The APG convention is to name it, but doing so is
   * what gives NVDA a second string to announce when the list is named after the same tab.
   */
  readonly namePanel = input(true);

  readonly selectedIndex = signal(0);
  /** Tab that holds tabindex="0". Manual activation lets focus move away from the selected tab. */
  readonly focusedIndex = signal(0);

  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');

  tabId(index: number): string {
    return `${this.idPrefix()}-tab-${index}`;
  }

  panelId(index: number): string {
    return `${this.idPrefix()}-panel-${index}`;
  }

  panelLabelledBy(index: number): string | null {
    return this.namePanel() ? this.tabId(index) : null;
  }

  listLabelledBy(index: number): string | null {
    return this.listNaming() === 'labelledby' ? this.tabId(index) : null;
  }

  listLabel(index: number): string | null {
    return this.listNaming() === 'label' ? `Links for ${this.tabs()[index].label}` : null;
  }

  select(index: number): void {
    this.selectedIndex.set(index);
    this.focusedIndex.set(index);
  }

  focusTab(index: number): void {
    this.focusedIndex.set(index);
    this.tabButtons()[index]?.nativeElement.focus();
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
    this.focusTab(target);
  }
}
