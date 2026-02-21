import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { FormGroupComponent } from './components/form-group/form-group.component';
import { PopoverTipComponent } from './components/popover-tip/popover-tip.component';

@Component({
  selector: 'app-root',
  imports: [FormGroupComponent, PopoverTipComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  @ViewChildren('tabButton')
  private readonly tabButtons!: QueryList<ElementRef<HTMLButtonElement>>;

  protected activeTabIndex = 0;

  protected readonly tabs = [
    { id: 'page-1', label: 'Introduction' },
    { id: 'page-2', label: 'User Info' },
    { id: 'page-3', label: 'Page 3' },
    { id: 'page-4', label: 'Page 4' }
  ];

  protected activateTab(index: number, moveFocus: boolean): void {
    this.activeTabIndex = index;

    if (!moveFocus) {
      return;
    }

    this.tabButtons.get(index)?.nativeElement.focus();
  }

  protected handleTabKeydown(event: KeyboardEvent, index: number): void {
    const key = event.key;

    if (key === 'ArrowRight') {
      event.preventDefault();
      this.activateTab((index + 1) % this.tabs.length, true);
      return;
    }

    if (key === 'ArrowLeft') {
      event.preventDefault();
      this.activateTab((index - 1 + this.tabs.length) % this.tabs.length, true);
      return;
    }

    if (key === 'Home') {
      event.preventDefault();
      this.activateTab(0, true);
      return;
    }

    if (key === 'End') {
      event.preventDefault();
      this.activateTab(this.tabs.length - 1, true);
      return;
    }

    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      this.activateTab(index, true);
    }
  }
}
