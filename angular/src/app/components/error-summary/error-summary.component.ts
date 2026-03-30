import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
  signal,
} from '@angular/core';

export interface FieldError {
  fieldId: string;
  label: string;
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

  protected errors = signal<FieldError[]>([]);

  private formElement: HTMLFormElement | null = null;

  private readonly handleInvalid = (): void => {
    this.updateErrors();
  };

  private readonly handleInput = (): void => {
    this.updateErrors();
  };

  private readonly handleReset = (): void => {
    this.errors.set([]);
  };

  private readonly handleSubmit = (): void => {
    this.updateErrors();

    if (this.errors().length > 0) {
      queueMicrotask(() => {
        const firstLink = this.summaryBox?.nativeElement.querySelector<HTMLElement>('ul li:first-child a');
        if (firstLink) {
          firstLink.focus();
        } else {
          this.summaryBox?.nativeElement.focus();
        }
      });
    }
  };

  constructor(private readonly hostElement: ElementRef<HTMLElement>) {}

  protected focusField(event: Event, fieldId: string): void {
    event.preventDefault();

    const root = this.formElement || document;
    const target = root.querySelector<HTMLElement>(`#${CSS.escape(fieldId)}`);

    if (target) {
      target.focus();
    }
  }

  private getErrorMessage(input: HTMLInputElement): string {
    const { validity } = input;

    if (validity.valueMissing) {
      return 'is empty.';
    }

    if (validity.typeMismatch) {
      return `is not a valid ${input.type}.`;
    }

    if (validity.patternMismatch || validity.customError) {
      return 'is not in the correct format.';
    }

    return 'is not valid.';
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

  private updateErrors(): void {
    const form = this.formElement;
    if (!form) {
      this.errors.set([]);
      return;
    }

    const inputs = Array.from(form.querySelectorAll<HTMLInputElement>('input'));
    const nextErrors = inputs
      .filter((input) => !input.validity.valid)
      .map((input) => ({
        fieldId: input.id,
        label: this.findLabel(input),
        message: this.getErrorMessage(input),
      }))
      .filter((error) => error.fieldId.length > 0);

    this.errors.set(nextErrors);
  }

  ngAfterViewInit(): void {
    this.formElement = this.resolveForm();

    if (!this.formElement) {
      return;
    }

    this.formElement.addEventListener('invalid', this.handleInvalid, true);
    this.formElement.addEventListener('input', this.handleInput, true);
    this.formElement.addEventListener('change', this.handleInput, true);
    this.formElement.addEventListener('reset', this.handleReset);
    this.formElement.addEventListener('submit', this.handleSubmit);
  }

  ngOnDestroy(): void {
    if (!this.formElement) {
      return;
    }

    this.formElement.removeEventListener('invalid', this.handleInvalid, true);
    this.formElement.removeEventListener('input', this.handleInput, true);
    this.formElement.removeEventListener('change', this.handleInput, true);
    this.formElement.removeEventListener('reset', this.handleReset);
    this.formElement.removeEventListener('submit', this.handleSubmit);
  }
}
