import { Injectable } from '@angular/core';
import {
  argbFromHex,
  hexFromArgb,
  themeFromSourceColor,
} from '@material/material-color-utilities';

const COLOR_KEY = 'theme-source-color';
const MODE_KEY = 'theme-mode';
const DEFAULT_COLOR = '#2563eb';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private sourceColor = DEFAULT_COLOR;
  private mode: ThemeMode = 'light';

  constructor() {
    const savedColor = localStorage.getItem(COLOR_KEY);
    const savedMode = localStorage.getItem(MODE_KEY) as ThemeMode | null;
    if (savedColor) this.sourceColor = savedColor;
    if (savedMode === 'dark') this.mode = 'dark';
    this.apply();
  }

  getSourceColor(): string {
    return this.sourceColor;
  }

  getMode(): ThemeMode {
    return this.mode;
  }

  applyTheme(hex: string): void {
    this.sourceColor = hex;
    localStorage.setItem(COLOR_KEY, hex);
    this.apply();
  }

  setMode(mode: ThemeMode): void {
    this.mode = mode;
    localStorage.setItem(MODE_KEY, mode);
    this.apply();
  }

  resetTheme(): void {
    localStorage.removeItem(COLOR_KEY);
    localStorage.removeItem(MODE_KEY);
    this.sourceColor = DEFAULT_COLOR;
    this.mode = 'light';

    const root = document.documentElement;
    root.removeAttribute('data-theme');
    const props = [
      '--tab-surface', '--tab-surface-muted', '--tab-input-bg', '--tab-border',
      '--tab-text', '--tab-text-muted', '--tab-accent',
      '--tab-accent-soft', '--tab-error', '--tab-error-soft',
    ];
    for (const prop of props) {
      root.style.removeProperty(prop);
    }
  }

  private apply(): void {
    const argb = argbFromHex(this.sourceColor);
    const theme = themeFromSourceColor(argb);
    const s = this.mode === 'dark' ? theme.schemes.dark : theme.schemes.light;

    const root = document.documentElement;
    root.setAttribute('data-theme', this.mode);
    root.style.setProperty('--tab-surface', hexFromArgb(s.surface));
    root.style.setProperty('--tab-surface-muted', hexFromArgb(s.surfaceVariant));
    root.style.setProperty('--tab-input-bg', this.mode === 'light' ? '#ffffff' : hexFromArgb(s.surfaceVariant));
    root.style.setProperty('--tab-border', hexFromArgb(s.outline));
    root.style.setProperty('--tab-text', hexFromArgb(s.onSurface));
    root.style.setProperty('--tab-text-muted', hexFromArgb(s.onSurfaceVariant));
    root.style.setProperty('--tab-accent', hexFromArgb(s.primary));
    root.style.setProperty('--tab-accent-soft', hexFromArgb(s.primaryContainer));
    root.style.setProperty('--tab-error', hexFromArgb(s.error));
    root.style.setProperty('--tab-error-soft', hexFromArgb(s.errorContainer));
  }
}
