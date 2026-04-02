import { AfterViewInit, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroupComponent } from '../components/form-group/form-group.component';
import { ErrorSummaryComponent } from '../components/error-summary/error-summary.component';
import { StateComboboxComponent } from '../components/state-combobox/state-combobox.component';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [FormGroupComponent, ErrorSummaryComponent, StateComboboxComponent],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent implements AfterViewInit {
  private readonly router = inject(Router);
  submitted = signal(false);

  ngAfterViewInit(): void {
    if ((this.router.lastSuccessfulNavigation()?.id ?? 1) > 1) {
      document.getElementById('registration-form')?.focus();
    }
  }

  onRegistrationSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    if (!form.checkValidity()) {
      // Trigger invalid event on all inputs to show inline errors
      const inputs = Array.from(form.querySelectorAll('input'));
      for (const input of inputs) {
        input.dispatchEvent(new Event('invalid', { cancelable: true }));
        if (!input.validity.valid) {
          // Mark the parent form-group as dirty so errors persist
          const formGroup = input.closest('app-form-group') as any;
          if (formGroup && typeof formGroup.markDirty === 'function') {
            formGroup.markDirty();
          }
        }
      }
      form.reportValidity();
      return;
    }
    this.submitted.set(true);
    setTimeout(() => {
      const h2 = document.querySelector<HTMLElement>('.success-panel h2');
      h2?.focus();
    }, 0);
  }

  onStartOver(form: HTMLFormElement): void {
    form.reset();
    this.submitted.set(false);
  }
}
