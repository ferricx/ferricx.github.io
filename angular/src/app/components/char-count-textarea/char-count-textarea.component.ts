import { Component, Input, OnDestroy, signal } from '@angular/core';

@Component({
  selector: 'app-char-count-textarea',
  standalone: true,
  templateUrl: './char-count-textarea.component.html',
  styleUrl: './char-count-textarea.component.css'
})
export class CharCountTextareaComponent implements OnDestroy {
  @Input() label = '';
  @Input() inputId = '';
  @Input() name = '';
  @Input() rows = 4;
  @Input() debounceMs = 2000;

  readonly count = signal(0);
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  get countId(): string {
    return `${this.inputId}-count`;
  }

  onInput(event: Event): void {
    const length = (event.target as HTMLTextAreaElement).value.length;
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.count.set(length);
      this.debounceTimer = null;
    }, this.debounceMs);
  }

  ngOnDestroy(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }
  }
}
