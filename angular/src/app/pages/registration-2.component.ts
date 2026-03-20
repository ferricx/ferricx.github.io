import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroupComponent } from '../components/form-group/form-group.component';
import { ErrorSummaryComponent } from '../components/error-summary/error-summary.component';
import { StateComboboxComponent } from '../components/state-combobox/state-combobox.component';

@Component({
  selector: 'app-registration-2',
  standalone: true,
  imports: [FormGroupComponent, ErrorSummaryComponent, StateComboboxComponent],
  templateUrl: './registration-2.component.html',
  styleUrl: './registration-2.component.css'
})
export class Registration2Component {
  @ViewChild('stepperEl') private stepperEl!: ElementRef<HTMLElement>;

  protected activeStep = 0;

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
      panel.querySelectorAll<HTMLElement>('app-form-group, app-state-combobox').forEach(comp => {
        const labelEl = comp.querySelector('label');
        const input = comp.querySelector<HTMLInputElement | HTMLSelectElement>('input, select');
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
