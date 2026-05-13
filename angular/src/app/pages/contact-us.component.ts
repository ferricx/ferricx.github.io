import { AfterViewInit, Component, ElementRef, inject, signal, ViewChild, viewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { openMap, MAPS_FALLBACK_URL } from '../utils/open-map';
import { FormGroupComponent } from '../components/form-group/form-group.component';
import { CharCountTextareaComponent } from '../components/char-count-textarea/char-count-textarea.component';
import { ErrorSummaryComponent } from '../components/error-summary/error-summary.component';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [FormGroupComponent, CharCountTextareaComponent, ErrorSummaryComponent],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css',
})
export class ContactUsComponent implements AfterViewInit {
  @ViewChild('pageHeading') private pageHeading!: ElementRef<HTMLHeadingElement>;
  private readonly router = inject(Router);

  readonly mapsFallbackUrl = MAPS_FALLBACK_URL;
  readonly openMap = openMap;
  readonly submitted = signal(false);

  private readonly charCountTextareas = viewChildren(CharCountTextareaComponent);

  ngAfterViewInit(): void {
    if ((this.router.lastSuccessfulNavigation()?.id ?? 1) > 1) {
      this.pageHeading.nativeElement.focus();
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;

    const allInputs = Array.from(form.querySelectorAll<HTMLInputElement>('input'));
    const allTextareas = Array.from(form.querySelectorAll<HTMLTextAreaElement>('textarea'));

    for (const input of allInputs) {
      input.dispatchEvent(new Event('invalid', { cancelable: true }));
      if (!input.validity.valid) {
        const formGroup = input.closest('app-form-group') as any;
        if (formGroup && typeof formGroup.markDirty === 'function') formGroup.markDirty();
      }
    }

    for (const textarea of allTextareas) {
      textarea.dispatchEvent(new Event('invalid', { cancelable: true }));
      if (!textarea.validity.valid) {
        const charCountField = textarea.closest('app-char-count-textarea') as any;
        if (charCountField && typeof charCountField.markDirty === 'function') charCountField.markDirty();
      }
    }

    const allTextareasValid = this.charCountTextareas().map(c => c.validate()).every(Boolean);
    const invalidInputs = allInputs.filter(i => !i.validity.valid);

    if (invalidInputs.length > 0 || !allTextareasValid) return;

    this.submitted.set(true);
    setTimeout(() => {
      document.querySelector<HTMLElement>('.success-panel h2')?.focus();
    }, 0);
  }

  onStartOver(): void {
    this.submitted.set(false);
  }
}
