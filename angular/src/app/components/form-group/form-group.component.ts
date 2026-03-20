import { AfterViewInit, Component, ContentChild, ElementRef, Input, OnDestroy, TemplateRef, ViewChild, booleanAttribute, numberAttribute } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { PopoverTipComponent } from '../popover-tip/popover-tip.component';

@Component({
  selector: 'app-form-group',
  standalone: true,
  imports: [PopoverTipComponent, NgTemplateOutlet],
  templateUrl: './form-group.component.html',
  styleUrl: './form-group.component.css'
})
export class FormGroupComponent implements AfterViewInit, OnDestroy {
  @Input({ alias: 'field-id' })
  fieldId = 'field';

  @Input()
  name = 'field';

  @Input()
  label = 'Field';

  @Input()
  type = 'text';

  @Input()
  autocomplete = '';

  @Input()
  pattern: string | null = null;

  @Input()
  inputmode: string | null = null;

  @Input({ transform: numberAttribute })
  maxlength: number | null = null;

  @Input({ alias: 'format-message' })
  formatMessage = 'Use the required format.';

  @Input()
  hint = '';

  @Input({ transform: booleanAttribute })
  required = false;

  @ContentChild('tip')
  tipContent!: TemplateRef<unknown>;

  @ViewChild('fieldInput', { static: true })
  private readonly fieldInput!: ElementRef<HTMLInputElement>;

  protected errorMessage = '';

  private formElement: HTMLFormElement | null = null;

  protected get errorId(): string {
    return `${this.fieldId}-error`;
  }

  protected get hintId(): string {
    return `${this.fieldId}-hint`;
  }

  ngAfterViewInit(): void {
    this.formElement = this.hostElement.nativeElement.closest('form');

    if (this.formElement) {
      this.formElement.addEventListener('submit', this.handleSubmit);
    }
  }

  ngOnDestroy(): void {
    if (this.formElement) {
      this.formElement.removeEventListener('submit', this.handleSubmit);
    }
  }

  protected onInvalid(event: Event): void {
    event.preventDefault();
    this.showError(this.getValidationMessage());
  }

  private readonly handleSubmit = (event: Event): void => {
    const input = this.fieldInput.nativeElement;

    this.applyCustomValidation();

    if (input.checkValidity()) {
      this.showError('');
      return;
    }

    event.preventDefault();
    this.showError(this.getValidationMessage());
  };

  private applyCustomValidation(): void {
    const input = this.fieldInput.nativeElement;
    input.setCustomValidity('');

    if (!this.pattern || input.value.length === 0) {
      return;
    }

    try {
      const regex = new RegExp(`^(?:${this.pattern})$`);

      if (!regex.test(input.value)) {
        input.setCustomValidity(this.formatMessage || 'Use the required format.');
      }
    } catch {
      input.setCustomValidity('');
    }
  }

  private getValidationMessage(): string {
    const input = this.fieldInput.nativeElement;
    const { validity } = input;

    if (validity.valueMissing) {
      return `Enter ${this.label.toLowerCase()}.`;
    }

    if (validity.patternMismatch) {
      return this.formatMessage || 'Use the required format.';
    }

    if (validity.typeMismatch) {
      return `Enter a valid ${input.type} address.`;
    }

    if (validity.customError) {
      return input.validationMessage;
    }

    return 'Enter a valid value.';
  }

  private showError(message: string): void {
    this.errorMessage = message;
  }

  constructor(private readonly hostElement: ElementRef<HTMLElement>) {}
}
