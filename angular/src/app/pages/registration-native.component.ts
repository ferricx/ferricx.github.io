import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-registration-native',
  standalone: true,
  imports: [],
  templateUrl: './registration-native.component.html',
  styleUrl: './registration-native.component.css'
})
export class RegistrationNativeComponent {
  onSubmit(form: NgForm) {
    if (form.valid) {
      // handle valid form submission
    }
  }
}
