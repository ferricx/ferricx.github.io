import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroupComponent } from '../components/form-group/form-group.component';
import { ErrorSummaryComponent } from '../components/error-summary/error-summary.component';
import { StateComboboxComponent } from '../components/state-combobox/state-combobox.component';
import { PhoneFieldComponent } from '../components/phone-field/phone-field.component';

@Component({
  selector: 'app-registration-2',
  standalone: true,
  imports: [FormGroupComponent, ErrorSummaryComponent, StateComboboxComponent, PhoneFieldComponent],
  templateUrl: './registration-2.component.html',
  styleUrl: './registration-2.component.css'
})
export class Registration2Component implements AfterViewInit {
  private readonly router = inject(Router);
  @ViewChild('stepperEl') private stepperEl!: ElementRef<HTMLElement>;

  protected activeStep = 0;

  ngAfterViewInit(): void {
    if ((this.router.lastSuccessfulNavigation()?.id ?? 1) > 1) {
      document.getElementById('reg2-step1-form')?.focus();
    }
  }

  protected readonly steps = [
    { id: 'personal', label: 'Personal' },
    { id: 'contact', label: 'Contact' },
    { id: 'payment', label: 'Payment' },
    { id: 'review', label: 'Review' }
  ];

  protected reviewData: { label: string; value: string }[][] = [];

  protected goToStep(index: number): void {
    if (index < 0 || index >= this.steps.length) return;
    this.activeStep = index;
    setTimeout(() => {
      const panels = this.stepperEl.nativeElement.querySelectorAll<HTMLElement>('.step-panel');
      const panel = panels[index];
      if (!panel) return;
      const first = panel.querySelector<HTMLElement>('input:not([type="hidden"]), select');
      first?.focus();
    });
  }

  protected onStepSubmit(event: Event, nextStep: number): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (nextStep >= 0) {
      if (nextStep === 3) {
        this.collectReviewData();
      }
      this.goToStep(nextStep);
    }
  }

  private collectReviewData(): void {
    const el = this.stepperEl.nativeElement;
    const panels = el.querySelectorAll<HTMLElement>('.step-panel');
    this.reviewData = [];

    panels.forEach(panel => {
      const fields: { label: string; value: string }[] = [];
      panel.querySelectorAll<HTMLElement>('app-form-group, app-state-combobox, app-phone-field').forEach(comp => {
        const labelEl = comp.querySelector('label:not(.sr-only)');
        const input = comp.tagName === 'APP-PHONE-FIELD'
          ? comp.querySelector<HTMLInputElement>('input[type="hidden"]')
          : comp.querySelector<HTMLInputElement | HTMLSelectElement>('input, select');
        const label = labelEl?.textContent?.replace(/\s*\*$/, '').trim() ?? '';
        const value = input?.value ?? '';
        if (label) {
          fields.push({ label, value: value || '—' });
        }
      });
      if (fields.length) {
        this.reviewData.push(fields);
      }
    });
  }
}
