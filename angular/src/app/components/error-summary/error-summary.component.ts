import {
  Component,
  ElementRef,
  Input,
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
export class ErrorSummaryComponent {
  @Input()
  formId = '';

  @ViewChild('summaryBox')
  private summaryBox?: ElementRef<HTMLDivElement>;

  protected errors = signal<FieldError[]>([]);

  private formElement: HTMLFormElement | null = null;

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
}
