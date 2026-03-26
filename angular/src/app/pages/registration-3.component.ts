import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { FormGroupComponent } from '../components/form-group/form-group.component';
import { ErrorSummaryComponent } from '../components/error-summary/error-summary.component';
import { StateComboboxComponent } from '../components/state-combobox/state-combobox.component';

export interface Registration {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
}

@Component({
  selector: 'app-registration-3',
  standalone: true,
  imports: [FormGroupComponent, ErrorSummaryComponent, StateComboboxComponent],
  templateUrl: './registration-3.component.html',
  styleUrl: './registration-3.component.css'
})
export class Registration3Component {
  readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('regDialog');
  readonly form = viewChild<ElementRef<HTMLFormElement>>('regForm');
  readonly registrations = signal<Registration[]>([]);

  openDialog() {
    this.dialog()?.nativeElement.showModal();
  }

  closeDialog() {
    this.dialog()?.nativeElement.close();
  }

  submitForm() {
    const form = this.form()?.nativeElement;
    if (!form) return;

    form.requestSubmit();

    if (!form.checkValidity()) return;

    const data = new FormData(form);
    this.registrations.update(list => [
      ...list,
      {
        firstName: data.get('firstName') as string,
        lastName: data.get('lastName') as string,
        email: data.get('email') as string,
        phone: data.get('phone') as string,
        city: data.get('city') as string,
        state: data.get('state') as string,
      }
    ]);

    form.reset();
    this.closeDialog();
  }
}
