import {
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  Input,
  OnDestroy,
  TemplateRef,
  ViewChild,
  booleanAttribute,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { PopoverTipComponent } from '../popover-tip/popover-tip.component';

const US_STATES: readonly { abbreviation: string; name: string }[] = [
  { abbreviation: 'AL', name: 'Alabama' },
  { abbreviation: 'AK', name: 'Alaska' },
  { abbreviation: 'AS', name: 'American Samoa' },
  { abbreviation: 'AZ', name: 'Arizona' },
  { abbreviation: 'AR', name: 'Arkansas' },
  { abbreviation: 'CA', name: 'California' },
  { abbreviation: 'CO', name: 'Colorado' },
  { abbreviation: 'CT', name: 'Connecticut' },
  { abbreviation: 'DE', name: 'Delaware' },
  { abbreviation: 'DC', name: 'District of Columbia' },
  { abbreviation: 'FL', name: 'Florida' },
  { abbreviation: 'GA', name: 'Georgia' },
  { abbreviation: 'GU', name: 'Guam' },
  { abbreviation: 'HI', name: 'Hawaii' },
  { abbreviation: 'ID', name: 'Idaho' },
  { abbreviation: 'IL', name: 'Illinois' },
  { abbreviation: 'IN', name: 'Indiana' },
  { abbreviation: 'IA', name: 'Iowa' },
  { abbreviation: 'KS', name: 'Kansas' },
  { abbreviation: 'KY', name: 'Kentucky' },
  { abbreviation: 'LA', name: 'Louisiana' },
  { abbreviation: 'ME', name: 'Maine' },
  { abbreviation: 'MD', name: 'Maryland' },
  { abbreviation: 'MA', name: 'Massachusetts' },
  { abbreviation: 'MI', name: 'Michigan' },
  { abbreviation: 'MN', name: 'Minnesota' },
  { abbreviation: 'MS', name: 'Mississippi' },
  { abbreviation: 'MO', name: 'Missouri' },
  { abbreviation: 'MT', name: 'Montana' },
  { abbreviation: 'NE', name: 'Nebraska' },
  { abbreviation: 'NV', name: 'Nevada' },
  { abbreviation: 'NH', name: 'New Hampshire' },
  { abbreviation: 'NJ', name: 'New Jersey' },
  { abbreviation: 'NM', name: 'New Mexico' },
  { abbreviation: 'NY', name: 'New York' },
  { abbreviation: 'NC', name: 'North Carolina' },
  { abbreviation: 'ND', name: 'North Dakota' },
  { abbreviation: 'MP', name: 'Northern Mariana Islands' },
  { abbreviation: 'OH', name: 'Ohio' },
  { abbreviation: 'OK', name: 'Oklahoma' },
  { abbreviation: 'OR', name: 'Oregon' },
  { abbreviation: 'PA', name: 'Pennsylvania' },
  { abbreviation: 'PR', name: 'Puerto Rico' },
  { abbreviation: 'RI', name: 'Rhode Island' },
  { abbreviation: 'SC', name: 'South Carolina' },
  { abbreviation: 'SD', name: 'South Dakota' },
  { abbreviation: 'TN', name: 'Tennessee' },
  { abbreviation: 'TX', name: 'Texas' },
  { abbreviation: 'UM', name: 'U.S. Minor Outlying Islands' },
  { abbreviation: 'VI', name: 'U.S. Virgin Islands' },
  { abbreviation: 'UT', name: 'Utah' },
  { abbreviation: 'VT', name: 'Vermont' },
  { abbreviation: 'VA', name: 'Virginia' },
  { abbreviation: 'WA', name: 'Washington' },
  { abbreviation: 'WV', name: 'West Virginia' },
  { abbreviation: 'WI', name: 'Wisconsin' },
  { abbreviation: 'WY', name: 'Wyoming' },
];

let instanceCounter = 0;

@Component({
  selector: 'app-state-combobox',
  standalone: true,
  imports: [PopoverTipComponent, NgTemplateOutlet],
  templateUrl: './state-combobox.component.html',
  styleUrl: './state-combobox.component.css',
})
export class StateComboboxComponent implements AfterViewInit, OnDestroy {
  @Input({ alias: 'field-id' })
  fieldId = 'state';

  @Input()
  name = 'state';

  @Input()
  label = 'State';

  @Input({ transform: booleanAttribute })
  required = false;

  @ContentChild('tip')
  tipContent!: TemplateRef<unknown>;

  @ViewChild('comboInput', { static: true })
  private readonly comboInput!: ElementRef<HTMLInputElement>;

  @ViewChild('listboxPanel', { static: true })
  private readonly listboxPanel!: ElementRef<HTMLElement>;

  protected readonly listboxId: string;
  protected errorMessage = '';
  protected filteredStates = [...US_STATES];
  protected activeDescendantId: string | null = null;
  protected inputValue = '';

  private activeIndex = -1;
  private formElement: HTMLFormElement | null = null;
  private selectedValue = '';

  protected readonly anchorName: string;

  constructor(private readonly host: ElementRef<HTMLElement>) {
    const id = instanceCounter++;
    this.listboxId = `state-listbox-${id}`;
    this.anchorName = `--state-combobox-${id}`;
  }

  protected get errorId(): string {
    return `${this.fieldId}-error`;
  }

  protected optionId(index: number): string {
    return `${this.listboxId}-opt-${index}`;
  }

  protected get isOpen(): boolean {
    return this.listboxPanel?.nativeElement.matches(':popover-open') ?? false;
  }

  ngAfterViewInit(): void {
    this.formElement = this.host.nativeElement.closest('form');
    if (this.formElement) {
      this.formElement.addEventListener('submit', this.handleSubmit);
      this.formElement.addEventListener('reset', this.handleReset);
    }
  }

  ngOnDestroy(): void {
    if (this.formElement) {
      this.formElement.removeEventListener('submit', this.handleSubmit);
      this.formElement.removeEventListener('reset', this.handleReset);
    }
  }

  protected onClick(): void {
    if (this.isOpen) {
      this.closeListbox();
    } else {
      this.filteredStates = [...US_STATES];
      this.activeIndex = -1;
      this.activeDescendantId = null;
      this.openListbox();
    }
  }

  protected onInput(): void {
    const value = this.comboInput.nativeElement.value;
    this.inputValue = value;
    this.selectedValue = '';
    this.filterStates(value);
    this.activeIndex = -1;
    this.activeDescendantId = null;

    if (this.filteredStates.length > 0) {
      this.openListbox();
    } else {
      this.closeListbox();
    }

    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen) {
          this.filterStates(this.inputValue);
          this.openListbox();
        }
        this.moveActive(1);
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen) {
          this.filterStates(this.inputValue);
          this.openListbox();
        }
        this.moveActive(-1);
        break;

      case 'Enter':
        if (this.isOpen && this.activeIndex >= 0) {
          event.preventDefault();
          this.selectOption(this.filteredStates[this.activeIndex]);
        }
        break;

      case 'Escape':
        if (this.isOpen) {
          event.preventDefault();
          this.closeListbox();
        }
        break;

      case 'Home':
        if (this.isOpen && this.filteredStates.length > 0) {
          event.preventDefault();
          this.activeIndex = 0;
          this.activeDescendantId = this.optionId(0);
          this.scrollActiveIntoView();
        }
        break;

      case 'End':
        if (this.isOpen && this.filteredStates.length > 0) {
          event.preventDefault();
          this.activeIndex = this.filteredStates.length - 1;
          this.activeDescendantId = this.optionId(this.activeIndex);
          this.scrollActiveIntoView();
        }
        break;
    }
  }

  protected onBlur(): void {
    // Delay to allow click on listbox option to fire first
    setTimeout(() => {
      if (this.isOpen) {
        this.closeListbox();
      }
      this.validate();
    }, 150);
  }

  protected onOptionClick(state: { abbreviation: string; name: string }): void {
    this.selectOption(state);
    this.comboInput.nativeElement.focus();
  }

  protected onOptionPointerEnter(index: number): void {
    this.activeIndex = index;
    this.activeDescendantId = this.optionId(index);
  }

  private selectOption(state: { abbreviation: string; name: string }): void {
    this.inputValue = `${state.name} (${state.abbreviation})`;
    this.selectedValue = state.abbreviation;
    this.comboInput.nativeElement.value = this.inputValue;
    this.closeListbox();
    this.errorMessage = '';
  }

  private filterStates(query: string): void {
    const q = query.toLowerCase().trim();
    if (!q) {
      this.filteredStates = [...US_STATES];
      return;
    }
    this.filteredStates = US_STATES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.abbreviation.toLowerCase().includes(q)
    );
  }

  private moveActive(direction: 1 | -1): void {
    if (this.filteredStates.length === 0) return;

    if (this.activeIndex === -1) {
      this.activeIndex = direction === 1 ? 0 : this.filteredStates.length - 1;
    } else {
      this.activeIndex =
        (this.activeIndex + direction + this.filteredStates.length) %
        this.filteredStates.length;
    }

    this.activeDescendantId = this.optionId(this.activeIndex);
    this.scrollActiveIntoView();
  }

  private scrollActiveIntoView(): void {
    requestAnimationFrame(() => {
      const activeEl = this.listboxPanel.nativeElement.querySelector(
        `#${this.activeDescendantId}`
      );
      activeEl?.scrollIntoView({ block: 'nearest' });
    });
  }

  private openListbox(): void {
    const panel = this.listboxPanel.nativeElement;
    if (!panel.matches(':popover-open')) {
      panel.showPopover();
    }
  }

  private closeListbox(): void {
    const panel = this.listboxPanel.nativeElement;
    if (panel.matches(':popover-open')) {
      panel.hidePopover();
    }
    this.activeIndex = -1;
    this.activeDescendantId = null;
  }

  private validate(): boolean {
    if (this.required && !this.selectedValue) {
      const raw = this.comboInput.nativeElement.value.trim();
      if (raw) {
        // Try to match a typed value to a state
        const match = US_STATES.find(
          (s) =>
            s.abbreviation.toLowerCase() === raw.toLowerCase() ||
            s.name.toLowerCase() === raw.toLowerCase()
        );
        if (match) {
          this.selectOption(match);
          return true;
        }
        this.errorMessage = 'Select a valid state.';
      } else {
        this.errorMessage = 'Enter state.';
      }
      return false;
    }
    this.errorMessage = '';
    return true;
  }

  private readonly handleSubmit = (event: Event): void => {
    if (!this.validate()) {
      event.preventDefault();
    }
  };

  private readonly handleReset = (): void => {
    this.inputValue = '';
    this.selectedValue = '';
    this.errorMessage = '';
    this.filteredStates = [...US_STATES];
    this.activeIndex = -1;
    this.activeDescendantId = null;
    this.comboInput.nativeElement.value = '';
  };
}
