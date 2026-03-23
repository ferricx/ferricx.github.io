import { Injectable } from '@angular/core';

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
    root.style.removeProperty('color-scheme');
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
    const [h, s, l] = hexToHsl(this.sourceColor);
    const dark = this.mode === 'dark';

    const root = document.documentElement;
    root.setAttribute('data-theme', this.mode);
    root.style.setProperty('color-scheme', this.mode);

    if (dark) {
      root.style.setProperty('--tab-surface', hsl(h, Math.max(s - 30, 5), 12));
      root.style.setProperty('--tab-surface-muted', hsl(h, Math.max(s - 25, 5), 17));
      root.style.setProperty('--tab-input-bg', hsl(h, Math.max(s - 25, 5), 17));
      root.style.setProperty('--tab-border', hsl(h, Math.max(s - 20, 10), 35));
      root.style.setProperty('--tab-text', hsl(h, Math.min(s, 15), 93));
      root.style.setProperty('--tab-text-muted', hsl(h, Math.min(s, 12), 72));
      root.style.setProperty('--tab-accent', hsl(h, Math.min(s, 85), 68));
      root.style.setProperty('--tab-accent-soft', hsl(h, Math.min(s, 40), 22));
      root.style.setProperty('--tab-error', hsl(0, 75, 65));
      root.style.setProperty('--tab-error-soft', hsl(0, 40, 22));
    } else {
      root.style.setProperty('--tab-surface', '#ffffff');
      root.style.setProperty('--tab-surface-muted', hsl(h, Math.min(s, 30), 97));
      root.style.setProperty('--tab-input-bg', '#ffffff');
      root.style.setProperty('--tab-border', hsl(h, Math.min(s, 20), 65));
      root.style.setProperty('--tab-text', hsl(h, Math.min(s, 25), 10));
      root.style.setProperty('--tab-text-muted', hsl(h, Math.min(s, 15), 30));
      root.style.setProperty('--tab-accent', hsl(h, Math.min(s, 90), 45));
      root.style.setProperty('--tab-accent-soft', hsl(h, Math.min(s, 70), 92));
      root.style.setProperty('--tab-error', hsl(0, 72, 51));
      root.style.setProperty('--tab-error-soft', hsl(0, 93, 94));
    }
  }
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const l = (max + min) / 2;

  if (d === 0) return [0, 0, Math.round(l * 100)];

  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6; break;
    default: h = ((r - g) / d + 4) / 6; break;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hsl(h: number, s: number, l: number): string {
  return `hsl(${h} ${s}% ${l}%)`;
}
