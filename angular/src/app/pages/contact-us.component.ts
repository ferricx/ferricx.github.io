import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css',
})
export class ContactUsComponent implements AfterViewInit {
  @ViewChild('pageHeading') private pageHeading!: ElementRef<HTMLHeadingElement>;

  submitted = false;
  success = false;

  formData = { name: '', email: '', message: '' };

  ngAfterViewInit(): void {
    this.pageHeading.nativeElement.focus();
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.formData.name && this.formData.email && this.formData.message) {
      this.success = true;
      this.submitted = false;
      this.formData = { name: '', email: '', message: '' };
    }
  }
}
