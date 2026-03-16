import { Component } from '@angular/core';
import { FormGroupComponent } from '../components/form-group/form-group.component';
import { ErrorSummaryComponent } from '../components/error-summary/error-summary.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormGroupComponent, ErrorSummaryComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {}
