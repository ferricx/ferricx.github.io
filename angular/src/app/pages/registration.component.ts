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
export class RegistrationComponent {}
