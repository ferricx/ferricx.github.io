import { AfterViewInit, Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { FormGroupComponent } from '../components/form-group/form-group.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormGroupComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements AfterViewInit {
  @ViewChild('pageHeading') private pageHeading!: ElementRef<HTMLHeadingElement>;
  @ViewChild('currentPwGroup') private currentPwGroup!: FormGroupComponent;
  private readonly router = inject(Router);
  @ViewChild('newPwGroup') private newPwGroup!: FormGroupComponent;
  @ViewChild('confirmPwGroup') private confirmPwGroup!: FormGroupComponent;

  readonly passwordSuccess = signal(false);
  readonly newPasswordValue = signal('');

  readonly passwordRules = computed(() => {
    const v = this.newPasswordValue();
    return [
      { label: 'At least 8 characters', met: v.length >= 8 },
      { label: 'Uppercase letter (A–Z)', met: /[A-Z]/.test(v) },
      { label: 'Lowercase letter (a–z)', met: /[a-z]/.test(v) },
      { label: 'Number (0–9)', met: /[0-9]/.test(v) },
      { label: 'Special character (e.g. !@#$)', met: /[^A-Za-z0-9]/.test(v) },
    ];
  });

  ngAfterViewInit(): void {
    if ((this.router.lastSuccessfulNavigation()?.id ?? 1) > 1) {
      this.pageHeading.nativeElement.focus();
    }
  }

  onPasswordSubmit(event: Event): void {
    event.preventDefault();
    this.passwordSuccess.set(false);
    const form = event.target as HTMLFormElement;

    // Trigger inline validation on all inputs
    const inputs = Array.from(form.querySelectorAll('input'));
    for (const input of inputs) {
      input.dispatchEvent(new Event('invalid', { cancelable: true }));
      if (!input.validity.valid) {
        const formGroup = input.closest('app-form-group') as any;
        formGroup?.markDirty?.();
      }
    }

    if (!form.checkValidity()) {
      return;
    }

    const data = new FormData(form);
    const newPassword = data.get('newPassword') as string;
    const confirmPassword = data.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      const confirmInput = form.elements.namedItem('confirmPassword') as HTMLInputElement;
      confirmInput.setCustomValidity('Passwords do not match.');
      confirmInput.dispatchEvent(new Event('invalid', { cancelable: true }));
      this.confirmPwGroup.markDirty();
      return;
    }

    // TODO: call password update API
    form.reset();
    this.currentPwGroup.reset();
    this.newPwGroup.reset();
    this.confirmPwGroup.reset();
    this.passwordSuccess.set(true);
  }

  onProfileSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    // TODO: handle valid form submission
  }
  private readonly theme = inject(ThemeService);

  get sourceColor(): string {
    return this.theme.getSourceColor();
  }

  get isDark(): boolean {
    return this.theme.getMode() === 'dark';
  }

  onColorChange(event: Event): void {
    const hex = (event.target as HTMLInputElement).value;
    this.theme.applyTheme(hex);
  }

  onModeToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.theme.setMode(checked ? 'dark' : 'light');
  }

  resetTheme(): void {
    this.theme.resetTheme();
  }
}
