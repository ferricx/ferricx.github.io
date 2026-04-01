import { Component, ElementRef, signal, viewChild, viewChildren } from '@angular/core';
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
  readonly editingIndex = signal<number | null>(null);
  readonly submitted = signal(false);
  private readonly regForm = viewChild<ElementRef<HTMLFormElement>>('regForm');
  private readonly formGroups = viewChildren(FormGroupComponent);

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
    // Trigger invalid event on all inputs to show inline errors
    const allInputs = Array.from(form.querySelectorAll<HTMLInputElement>('input'));
    for (const input of allInputs) {
      input.dispatchEvent(new Event('invalid', { cancelable: true }));
      if (!input.validity.valid) {
        // Mark the parent form-group as dirty so errors persist
        const formGroup = input.closest('app-form-group') as any;
        if (formGroup && typeof formGroup.markDirty === 'function') {
          formGroup.markDirty();
        }
      }
    }

    const invalidInputs = allInputs.filter(input => !input.validity.valid);

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

      // Focus the first link in the error summary
      requestAnimationFrame(() => {
        const dialog = this.dialog()?.nativeElement;
        const firstLink = dialog?.querySelector<HTMLElement>('.error-summary ul li:first-child a');
        firstLink?.focus();
      });
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

    const entry: Registration = {
      firstName: data.get('firstName') as string,
      lastName: data.get('lastName') as string,
      dateOfBirth: data.get('dateOfBirth') as string,
      maskedSSN: '*****' + ssn.slice(-4),
      phone: data.get('phone') as string,
      email: data.get('email') as string,
    };

    const idx = this.editingIndex();
    if (idx !== null) {
      this.registrations.update(list => list.map((item, i) => i === idx ? entry : item));
    } else {
      this.registrations.update(list => [...list, entry]);
    }

    this.editingIndex.set(null);
    form.reset();
    dialog.close();
    this.openBtn()?.nativeElement.focus();
  }

  private resetFormGroups() {
    for (const fg of this.formGroups()) {
      fg.reset();
    }
  }

  openDialog() {
    this.editingIndex.set(null);
    this.errors.set([]);
    this.resetFormGroups();
    this.regForm()?.nativeElement.reset();
    this.dialog()?.nativeElement.showModal();
  }

  closeDialog() {
    this.editingIndex.set(null);
    this.errors.set([]);
    this.resetFormGroups();
    this.regForm()?.nativeElement.reset();
    this.dialog()?.nativeElement.close();
    this.openBtn()?.nativeElement.focus();
  }

  editDependent(index: number): void {
    const reg = this.registrations()[index];
    if (!reg) return;

    this.editingIndex.set(index);
    this.errors.set([]);
    this.resetFormGroups();
    this.regForm()?.nativeElement.reset();
    this.dialog()?.nativeElement.showModal();

    // Pre-fill the dialog form after the dialog is open
    requestAnimationFrame(() => {
      const form = this.regForm()?.nativeElement;
      if (!form) return;

      const fields: Record<string, string> = {
        firstName: reg.firstName,
        lastName: reg.lastName,
        dateOfBirth: reg.dateOfBirth,
        email: reg.email,
        phone: reg.phone,
      };

      for (const [name, value] of Object.entries(fields)) {
        const input = form.querySelector<HTMLInputElement>(`[name="${name}"]`);
        if (input) input.value = value;
      }
    });
  }

  removeDependent(index: number): void {
    this.registrations.update(list => list.filter((_, i) => i !== index));
  }

  onSubmitDependents(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const invalidInputs = Array.from(form.querySelectorAll<HTMLInputElement>('input:invalid'));

    if (invalidInputs.length > 0) {
      invalidInputs[0]?.focus();
      return;
    }

    const data = new FormData(form);
    const dependents: Registration[] = [];

    for (let i = 0; data.has(`dependents[${i}].firstName`); i++) {
      dependents.push({
        firstName: data.get(`dependents[${i}].firstName`) as string,
        lastName: data.get(`dependents[${i}].lastName`) as string,
        dateOfBirth: data.get(`dependents[${i}].dateOfBirth`) as string,
        maskedSSN: data.get(`dependents[${i}].ssn`) as string,
        phone: data.get(`dependents[${i}].phone`) as string,
        email: data.get(`dependents[${i}].email`) as string,
      });
    }

    // Replace signal with latest edited values
    this.registrations.set(dependents);
    this.submitted.set(true);
  }

  onStartOver(): void {
    this.registrations.set([]);
    this.submitted.set(false);
  }
}
