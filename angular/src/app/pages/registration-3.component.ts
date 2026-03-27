import { AfterViewInit, Component, ElementRef, OnDestroy, signal, viewChild } from '@angular/core';
import { FormGroupComponent } from '../components/form-group/form-group.component';
import { ErrorSummaryComponent } from '../components/error-summary/error-summary.component';

export interface Registration {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  maskedSSN: string;
  phone: string;
  email: string;
}

@Component({
  selector: 'app-registration-3',
  standalone: true,
  imports: [FormGroupComponent, ErrorSummaryComponent],
  templateUrl: './registration-3.component.html',
  styleUrl: './registration-3.component.css'
})
export class Registration3Component implements AfterViewInit, OnDestroy {
  readonly openBtn = viewChild<ElementRef<HTMLButtonElement>>('openBtn');
  readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('regDialog');
  readonly form = viewChild<ElementRef<HTMLFormElement>>('regForm');
  readonly registrations = signal<Registration[]>([]);

  private readonly handleSubmit = (event: Event) => {
    event.preventDefault();

    const form = this.form()?.nativeElement;
    const dialog = this.dialog()?.nativeElement;
    if (!form || !dialog) return;

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
  };

  ngAfterViewInit(): void {
    this.form()?.nativeElement.addEventListener('submit', this.handleSubmit);
  }

  ngOnDestroy(): void {
    this.form()?.nativeElement.removeEventListener('submit', this.handleSubmit);
  }

  openDialog() {
    this.dialog()?.nativeElement.showModal();
  }

  closeDialog() {
    this.dialog()?.nativeElement.close();
    this.openBtn()?.nativeElement.focus();
  }
}
