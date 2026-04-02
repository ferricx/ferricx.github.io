import { Component, ElementRef, Input, ViewChild, signal } from '@angular/core';

export const PHONE_COUNTRIES: readonly { name: string; dialCode: string }[] = [
  { name: 'United States', dialCode: '+1' },
  { name: 'Canada', dialCode: '+1' },
  { name: 'Australia', dialCode: '+61' },
  { name: 'Brazil', dialCode: '+55' },
  { name: 'China', dialCode: '+86' },
  { name: 'France', dialCode: '+33' },
  { name: 'Germany', dialCode: '+49' },
  { name: 'India', dialCode: '+91' },
  { name: 'Japan', dialCode: '+81' },
  { name: 'Mexico', dialCode: '+52' },
  { name: 'South Korea', dialCode: '+82' },
  { name: 'United Kingdom', dialCode: '+44' },
];

@Component({
  selector: 'app-phone-field',
  standalone: true,
  templateUrl: './phone-field.component.html',
  styleUrl: './phone-field.component.css'
})
export class PhoneFieldComponent {
  @Input({ alias: 'field-id' }) fieldId = 'phone';
  @Input() name = 'phone';
  @Input() label = 'Phone number';
  @Input() required = false;

  @ViewChild('numberInput') private numberInput!: ElementRef<HTMLInputElement>;
  @ViewChild('countrySelect') private countrySelect!: ElementRef<HTMLSelectElement>;

  protected readonly countries = PHONE_COUNTRIES;
  protected dialCode = signal('+1');
  protected localNumber = signal('');
  protected errorMessage = signal('');

  private dirty = false;

  protected get combinedValue(): string {
    return this.dialCode() + this.localNumber();
  }

  protected get errorId(): string {
    return `${this.fieldId}-error`;
  }

  protected get countrySelectId(): string {
    return `${this.fieldId}-country`;
  }

  protected get numberId(): string {
    return `${this.fieldId}-number`;
  }

  markDirty(): void {
    this.dirty = true;
  }

  reset(): void {
    this.dialCode.set('+1');
    this.localNumber.set('');
    this.dirty = false;
    this.errorMessage.set('');
    if (this.numberInput) this.numberInput.nativeElement.value = '';
    if (this.countrySelect) this.countrySelect.nativeElement.value = '+1';
  }

  setValue(phone: string): void {
    const sorted = [...this.countries].sort((a, b) => b.dialCode.length - a.dialCode.length);
    const match = sorted.find(c => phone.startsWith(c.dialCode));
    if (match) {
      this.dialCode.set(match.dialCode);
      this.localNumber.set(phone.slice(match.dialCode.length));
    } else {
      this.localNumber.set(phone);
    }
    if (this.numberInput) this.numberInput.nativeElement.value = this.localNumber();
    if (this.countrySelect) this.countrySelect.nativeElement.value = this.dialCode();
  }

  protected onCountryChange(event: Event): void {
    this.dialCode.set((event.target as HTMLSelectElement).value);
  }

  protected onInput(event: Event): void {
    this.dirty = true;
    this.localNumber.set((event.target as HTMLInputElement).value);
    if (this.errorMessage()) this.validate();
  }

  protected onBlur(): void {
    if (this.dirty) this.validate();
  }

  protected onInvalid(event: Event): void {
    event.preventDefault();
    this.dirty = true;
    this.validate();
  }

  private validate(): void {
    const input = this.numberInput?.nativeElement;
    if (!input) return;
    if (this.required && !input.value) {
      this.errorMessage.set(`${this.label} is required.`);
    } else if (input.value && !/^\d{6,14}$/.test(input.value)) {
      this.errorMessage.set('Phone number must be 6 to 14 digits.');
    } else {
      this.errorMessage.set('');
    }
  }
}
