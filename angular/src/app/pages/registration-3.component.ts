import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { FormGroupComponent } from '../components/form-group/form-group.component';

export interface Registration {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  maskedSSN: string;
  phone: string;
  email: string;
}

interface FieldError {
  fieldId: string;
  label: string;
  message: string;
}

@Component({
  selector: 'app-registration-3',
  standalone: true,
  imports: [FormGroupComponent],
  templateUrl: './registration-3.component.html',
  styleUrl: './registration-3.component.css'
})
export class Registration3Component {
  readonly openBtn = viewChild<ElementRef<HTMLButtonElement>>('openBtn');
  readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('regDialog');
  readonly registrations = signal<Registration[]>([]);
  readonly errors = signal<FieldError[]>([]);

  onSubmit(event: Event, form: HTMLFormElement): void {
    event.preventDefault();
    this.processForm(form);
  }

  onSubmitButton(event: Event, form: HTMLFormElement): void {
    event.preventDefault();
    this.processForm(form);
  }

  focusField(event: Event, fieldId: string): void {
    event.preventDefault();
    const target = this.dialog()?.nativeElement.querySelector<HTMLElement>(`#${CSS.escape(fieldId)}`);
    target?.focus();
  }

  private processForm(form: HTMLFormElement): void {
    const invalidInputs = Array.from(form.querySelectorAll<HTMLInputElement>('input:invalid'));

    if (invalidInputs.length > 0) {
      const nextErrors = invalidInputs
        .map((input) => {
          const formGroup = input.closest('app-form-group');
          const label = formGroup?.getAttribute('label') || 'This field';
          const message = input.validity.valueMissing
            ? 'is empty.'
            : input.validity.typeMismatch
              ? `is not a valid ${input.type}.`
              : input.validity.patternMismatch || input.validity.customError
                ? 'is not in the correct format.'
                : 'is not valid.';

          return { fieldId: input.id, label, message };
        })
        .filter((item) => item.fieldId.length > 0);

      this.errors.set(nextErrors);

      for (const input of invalidInputs) {
        input.dispatchEvent(new Event('invalid', { cancelable: true }));
      }

      invalidInputs[0]?.focus();
      return;
    }

    this.errors.set([]);
    this.submitDialogForm(form);
  }

  private submitDialogForm(form: HTMLFormElement): void {

    const dialog = form.closest('dialog');
    if (!(dialog instanceof HTMLDialogElement)) {
      return;
    }

    const data = new FormData(form);
    const ssn = (data.get('socialSecurityNumber') as string) || '';

    this.registrations.update(list => [
      ...list,
      {
        firstName: data.get('firstName') as string,
        lastName: data.get('lastName') as string,
        dateOfBirth: data.get('dateOfBirth') as string,
        maskedSSN: '*****' + ssn.slice(-4),
        phone: data.get('phone') as string,
        email: data.get('email') as string,
      }
    ]);

    form.reset();
    dialog.close();
    this.openBtn()?.nativeElement.focus();
  }

  openDialog() {
    this.errors.set([]);
    this.dialog()?.nativeElement.showModal();
  }

  closeDialog() {
    this.errors.set([]);
    this.dialog()?.nativeElement.close();
    this.openBtn()?.nativeElement.focus();
  }
}
