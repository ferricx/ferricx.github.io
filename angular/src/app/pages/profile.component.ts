import { Component, inject } from '@angular/core';
import { FormGroupComponent } from '../components/form-group/form-group.component';
import { ErrorSummaryComponent } from '../components/error-summary/error-summary.component';
import { ThemeService, ThemeMode } from '../services/theme.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormGroupComponent, ErrorSummaryComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
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
