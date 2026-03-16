import { Injectable } from '@angular/core';
import {
  argbFromHex,
  hexFromArgb,
  themeFromSourceColor,
} from '@material/material-color-utilities';

const STORAGE_KEY = 'theme-source-color';
const DEFAULT_COLOR = '#2563eb';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private sourceColor = DEFAULT_COLOR;

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      this.sourceColor = saved;
      this.applyTheme(saved);
    }
  }

  getSourceColor(): string {
    return this.sourceColor;
  }

  applyTheme(hex: string): void {
    this.sourceColor = hex;
    localStorage.setItem(STORAGE_KEY, hex);

    const argb = argbFromHex(hex);
    const theme = themeFromSourceColor(argb);
    const s = theme.schemes.light;

    const root = document.documentElement;
    root.style.setProperty('--tab-surface', hexFromArgb(s.surface));
    root.style.setProperty('--tab-surface-muted', hexFromArgb(s.surfaceVariant));
    root.style.setProperty('--tab-border', hexFromArgb(s.outline));
    root.style.setProperty('--tab-text', hexFromArgb(s.onSurface));
    root.style.setProperty('--tab-text-muted', hexFromArgb(s.onSurfaceVariant));
    root.style.setProperty('--tab-accent', hexFromArgb(s.primary));
    root.style.setProperty('--tab-accent-soft', hexFromArgb(s.primaryContainer));
    root.style.setProperty('--tab-error', hexFromArgb(s.error));
    root.style.setProperty('--tab-error-soft', hexFromArgb(s.errorContainer));
  }

  resetTheme(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.sourceColor = DEFAULT_COLOR;

    const root = document.documentElement;
    const props = [
      '--tab-surface', '--tab-surface-muted', '--tab-border',
      '--tab-text', '--tab-text-muted', '--tab-accent',
      '--tab-accent-soft', '--tab-error', '--tab-error-soft',
    ];
    for (const prop of props) {
      root.style.removeProperty(prop);
    }
  }
}
