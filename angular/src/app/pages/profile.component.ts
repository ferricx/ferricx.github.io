import { Component, inject } from '@angular/core';
import { FormGroupComponent } from '../components/form-group/form-group.component';
import { ErrorSummaryComponent } from '../components/error-summary/error-summary.component';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormGroupComponent, ErrorSummaryComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  private readonly theme = inject(ThemeService);

  get sourceColor(): string {
    return this.theme.getSourceColor();
  }

  onColorChange(event: Event): void {
    const hex = (event.target as HTMLInputElement).value;
    this.theme.applyTheme(hex);
  }

  resetTheme(): void {
    this.theme.resetTheme();
  }
}
