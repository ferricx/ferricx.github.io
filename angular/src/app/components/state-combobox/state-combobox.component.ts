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
  protected readonly anchorName: string;
  protected readonly states = US_STATES;
  protected errorMessage = '';
  protected activeDescendantId: string | null = null;
  protected selectedIndex = -1;

  private activeIndex = -1;
  private formElement: HTMLFormElement | null = null;
  private typeaheadBuffer = '';
  private typeaheadTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly host: ElementRef<HTMLElement>) {
    const id = instanceCounter++;
    this.listboxId = `state-listbox-${id}`;
    this.anchorName = `--state-combobox-${id}`;
  }

  protected get errorId(): string {
    return `${this.fieldId}-error`;
  }

  protected get displayValue(): string {
    if (this.selectedIndex < 0) return '';
    const s = US_STATES[this.selectedIndex];
    return `${s.name} (${s.abbreviation})`;
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
      this.formElement.addEventListener('reset', this.handleReset);
    }
  }

  ngOnDestroy(): void {
    if (this.formElement) {
      this.formElement.removeEventListener('reset', this.handleReset);
    }
  }

  protected onClick(): void {
    if (this.isOpen) {
      this.closeListbox();
    } else {
      this.activeIndex = this.selectedIndex;
      this.activeDescendantId = this.activeIndex >= 0 ? this.optionId(this.activeIndex) : null;
      this.openListbox();
      if (this.activeIndex >= 0) {
        this.scrollActiveIntoView();
      }
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const key = event.key;

    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      if (!this.isOpen) {
        this.activeIndex = this.selectedIndex;
        this.activeDescendantId = this.activeIndex >= 0 ? this.optionId(this.activeIndex) : null;
        this.openListbox();
      }
      this.moveActive(key === 'ArrowDown' ? 1 : -1);
      return;
    }

    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      if (this.isOpen && this.activeIndex >= 0) {
        this.selectOption(this.activeIndex);
      } else if (!this.isOpen) {
        this.activeIndex = this.selectedIndex;
        this.activeDescendantId = this.activeIndex >= 0 ? this.optionId(this.activeIndex) : null;
        this.openListbox();
        if (this.activeIndex >= 0) {
          this.scrollActiveIntoView();
        }
      }
      return;
    }

    if (key === 'Escape') {
      if (this.isOpen) {
        event.preventDefault();
        this.closeListbox();
      }
      return;
    }

    if (key === 'Home') {
      event.preventDefault();
      if (!this.isOpen) this.openListbox();
      this.activeIndex = 0;
      this.activeDescendantId = this.optionId(0);
      this.scrollActiveIntoView();
      return;
    }

    if (key === 'End') {
      event.preventDefault();
      if (!this.isOpen) this.openListbox();
      this.activeIndex = US_STATES.length - 1;
      this.activeDescendantId = this.optionId(this.activeIndex);
      this.scrollActiveIntoView();
      return;
    }

    // Typeahead: printable single characters
    if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      this.handleTypeahead(key);
    }
  }

  protected onBlur(): void {
    setTimeout(() => {
      if (this.isOpen) {
        this.closeListbox();
      }
      this.validate();
    }, 150);
  }

  protected onOptionClick(index: number): void {
    this.selectOption(index);
    this.comboInput.nativeElement.focus();
  }

  protected onOptionPointerEnter(index: number): void {
    this.activeIndex = index;
    this.activeDescendantId = this.optionId(index);
  }

  private selectOption(index: number): void {
    this.selectedIndex = index;
    this.activeIndex = index;
    this.activeDescendantId = this.optionId(index);
    this.closeListbox();
    this.errorMessage = '';
  }

  private handleTypeahead(char: string): void {
    const lowerChar = char.toLowerCase();

    if (this.typeaheadTimer) {
      clearTimeout(this.typeaheadTimer);
    }

    this.typeaheadTimer = setTimeout(() => {
      this.typeaheadBuffer = '';
      this.typeaheadTimer = null;
    }, 500);

    // Same character repeated: cycle through matches starting with that letter
    if (this.typeaheadBuffer.length === 1 && this.typeaheadBuffer === lowerChar) {
      const matchingIndices: number[] = [];
      for (let i = 0; i < US_STATES.length; i++) {
        if (US_STATES[i].name.toLowerCase().startsWith(lowerChar)) {
          matchingIndices.push(i);
        }
      }

      if (matchingIndices.length > 0) {
        const currentPos = matchingIndices.indexOf(this.activeIndex);
        const nextPos = (currentPos + 1) % matchingIndices.length;
        this.setActiveAndOpen(matchingIndices[nextPos]);
      }
      // Keep buffer as single char for continued cycling
      return;
    }

    // Different character: append to buffer and search
    this.typeaheadBuffer += lowerChar;

    const matchIndex = US_STATES.findIndex((s) =>
      s.name.toLowerCase().startsWith(this.typeaheadBuffer)
    );

    if (matchIndex >= 0) {
      this.setActiveAndOpen(matchIndex);
    }
  }

  private setActiveAndOpen(index: number): void {
    if (!this.isOpen) {
      this.openListbox();
    }
    this.activeIndex = index;
    this.activeDescendantId = this.optionId(index);
    this.scrollActiveIntoView();
  }

  private moveActive(direction: 1 | -1): void {
    if (this.activeIndex === -1) {
      this.activeIndex = direction === 1 ? 0 : US_STATES.length - 1;
    } else {
      this.activeIndex =
        (this.activeIndex + direction + US_STATES.length) % US_STATES.length;
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
    if (this.required && this.selectedIndex < 0) {
      this.errorMessage = 'Select a state.';
      return false;
    }
    this.errorMessage = '';
    return true;
  }

  private readonly handleReset = (): void => {
    this.selectedIndex = -1;
    this.activeIndex = -1;
    this.activeDescendantId = null;
    this.errorMessage = '';
  };
}
