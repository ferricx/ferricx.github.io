import { Component, Input, ContentChild, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { signal } from '@angular/core';

@Component({
  selector: 'app-form-group',
  standalone: true,
  imports: [],
  templateUrl: './form-group.component.html',
  styleUrl: './form-group.component.css'
})
export class FormGroupComponent {
    private dirty = false;
    // Mark the field as dirty from outside (e.g., after submit)
    public markDirty() {
      this.dirty = true;
    }

  public reset() {
    this.dirty = false;
    this.errorMessage.set('');
  }
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

  @Input()
  maxlength: number | null = null;

  @Input({ alias: 'format-message' })
  formatMessage = 'Use the required format.';

  @Input()
  hint = '';

  @Input()
  required = false;

  @Input()
  autofocus = false;

  @Input({ alias: 'native-validation' })
  nativeValidation = false;

  @ContentChild('tip')
  tipContent!: TemplateRef<unknown>;

  @ViewChild('fieldInput', { static: true })
  private readonly fieldInput!: ElementRef<HTMLInputElement>;

  protected errorMessage = signal('');

  protected get errorId(): string {
    return `${this.fieldId}-error`;
  }

  protected get hintId(): string {
    return `${this.fieldId}-hint`;
  }

  protected onInvalid(event: Event): void {
    if (this.nativeValidation) {
      return;
    }
    event.preventDefault();
    this.dirty = true;
    const input = this.fieldInput.nativeElement;
    if (!input.validity.valid) {
      this.showError(this.getValidationMessage());
    } else {
      this.showError('');
    }
  }

  protected onBlur(): void {
    if (this.nativeValidation) {
      this.showError('');
      return;
    }
    const input = this.fieldInput.nativeElement;
    this.applyCustomValidation();
    // Only show error if user has interacted (dirty) and invalid
    if (this.dirty && !input.validity.valid) {
      this.showError(this.getValidationMessage());
    } else {
      this.showError('');
    }
  }
  protected onInput(): void {
    this.dirty = true;
  }

  private applyCustomValidation(): void {
    const input = this.fieldInput.nativeElement;
    // Clear any previous custom error so the browser can re-evaluate native validity
    input.setCustomValidity('');

    // Only set a custom error for pattern mismatch, do not clear if required/type errors exist
    // Skip pattern validation for type='email' fields
    if (this.pattern && input.value.length > 0 && this.type !== 'email') {
      try {
        const regex = new RegExp(`^(?:${this.pattern})$`);
        if (!regex.test(input.value)) {
          input.setCustomValidity(this.formatMessage || 'Use the required format.');
          return;
        }
      } catch {
        // If regex is invalid, do not set custom error
      }
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

    // No error if valid
    return '';
  }

  private showError(message: string): void {
    this.errorMessage.set(message);
  }

  constructor(private readonly hostElement: ElementRef<HTMLElement>) {}
}
