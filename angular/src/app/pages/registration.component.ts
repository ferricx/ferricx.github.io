import { Component } from '@angular/core';
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
export class RegistrationComponent {
  onRegistrationSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    if (!form.checkValidity()) {
      // Trigger invalid event on all inputs to show inline errors
      const inputs = Array.from(form.querySelectorAll('input'));
      for (const input of inputs) {
        input.dispatchEvent(new Event('invalid', { cancelable: true }));
      }
      form.reportValidity();
      return;
    }
    // TODO: handle valid form submission
  }
}
