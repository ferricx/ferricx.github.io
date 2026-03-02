import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';

export interface FieldError {
  fieldId: string;
  message: string;
}

@Component({
  selector: 'app-error-summary',
  standalone: true,
  templateUrl: './error-summary.component.html',
  styleUrl: './error-summary.component.css',
})
export class ErrorSummaryComponent implements AfterViewInit, OnDestroy {
  @Input()
  formId = '';

  @ViewChild('summaryBox')
  private summaryBox?: ElementRef<HTMLDivElement>;

  protected errors: FieldError[] = [];

  private formElement: HTMLFormElement | null = null;

  constructor(private readonly hostElement: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.formElement = this.resolveForm();

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

  protected focusField(event: Event, fieldId: string): void {
    event.preventDefault();

    const root = this.formElement || document;
    const target = root.querySelector<HTMLElement>(`#${CSS.escape(fieldId)}`);

    if (target) {
      target.focus();
    }
  }

  private readonly handleSubmit = (event: Event): void => {
    const form = event.target as HTMLFormElement;

    if (form.checkValidity()) {
      this.errors = [];
      return;
    }

    event.preventDefault();

    const invalidInputs = Array.from(
      form.querySelectorAll<HTMLInputElement>(':invalid')
    );

    this.errors = invalidInputs.map((input) => ({
      fieldId: input.id,
      message: this.getErrorMessage(input),
    }));

    // Focus the summary box on the next tick (after render)
    requestAnimationFrame(() => {
      this.summaryBox?.nativeElement.focus();
    });
  };

  private readonly handleReset = (): void => {
    this.errors = [];
  };

  private getErrorMessage(input: HTMLInputElement): string {
    const { validity } = input;
    const label = this.findLabel(input);

    if (validity.valueMissing) {
      return `${label} is required.`;
    }

    // Look for the format-message on the parent form-group / app-form-group
    const formGroup = input.closest('app-form-group');
    const formatMessage = formGroup?.getAttribute('format-message');

    if (validity.patternMismatch || validity.customError) {
      return formatMessage || input.validationMessage || 'Please enter a valid value.';
    }

    if (validity.typeMismatch) {
      return `Enter a valid ${input.type}.`;
    }

    return formatMessage || 'Please enter a valid value.';
  }

  private findLabel(input: HTMLInputElement): string {
    const formGroup = input.closest('app-form-group');

    if (formGroup) {
      return formGroup.getAttribute('label') || 'This field';
    }

    const label = this.formElement?.querySelector<HTMLLabelElement>(
      `label[for="${CSS.escape(input.id)}"]`
    );

    return label?.textContent?.trim() || 'This field';
  }

  private resolveForm(): HTMLFormElement | null {
    if (this.formId) {
      return document.getElementById(this.formId) as HTMLFormElement | null;
    }

    return this.hostElement.nativeElement.closest('form');
  }
}
