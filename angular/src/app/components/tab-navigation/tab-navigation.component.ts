import { ChangeDetectorRef, Component, ElementRef, QueryList, ViewChildren, inject } from '@angular/core';
import { FormGroupComponent } from '../form-group/form-group.component';
import { ErrorSummaryComponent } from '../error-summary/error-summary.component';
import { StateComboboxComponent } from '../state-combobox/state-combobox.component';

@Component({
  selector: 'app-tab-navigation',
  standalone: true,
  imports: [FormGroupComponent, ErrorSummaryComponent, StateComboboxComponent],
  templateUrl: './tab-navigation.component.html',
  styleUrl: './tab-navigation.css'
})
export class TabNavigationComponent {
  @ViewChildren('tabButton')
  private readonly tabButtons!: QueryList<ElementRef<HTMLButtonElement>>;

  private readonly cdr = inject(ChangeDetectorRef);

  protected activeTabIndex = 0;
  private tabDirection: 'forward' | 'backward' = 'forward';

  protected readonly tabs = [
    { id: 'personal', label: 'Personal' },
    { id: 'contact', label: 'Contact' }
  ];

  protected activateTab(index: number, moveFocus: boolean): void {
    if (index === this.activeTabIndex) {
      if (moveFocus) {
        this.tabButtons.get(index)?.nativeElement.focus();
      }
      return;
    }

    this.tabDirection = index > this.activeTabIndex ? 'forward' : 'backward';
    document.documentElement.dataset['tabDirection'] = this.tabDirection;

    const update = () => {
      this.activeTabIndex = index;
      this.cdr.detectChanges();
      if (moveFocus) {
        this.tabButtons.get(index)?.nativeElement.focus();
      }
    };

    if (!document.startViewTransition) {
      update();
      return;
    }

    document.startViewTransition(update);
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