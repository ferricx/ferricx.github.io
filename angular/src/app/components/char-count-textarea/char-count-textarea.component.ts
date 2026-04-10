import { Component, ContentChild, Input, OnDestroy, signal, TemplateRef, booleanAttribute } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { PopoverTipComponent } from '../popover-tip/popover-tip.component';

@Component({
  selector: 'app-char-count-textarea',
  standalone: true,
  imports: [PopoverTipComponent, NgTemplateOutlet],
  templateUrl: './char-count-textarea.component.html',
  styleUrl: './char-count-textarea.component.css'
})
export class CharCountTextareaComponent implements OnDestroy {
  @Input() label = '';
  @Input() inputId = '';
  @Input() name = '';
  @Input() rows = 4;
  @Input() debounceMs = 2000;
  @Input() maxLength = 500;
  @Input({ transform: booleanAttribute }) required = false;

  @ContentChild('tip')
  tipContent?: TemplateRef<unknown>;

  readonly count = signal(0);
  readonly errorMessage = signal('');
  private dirty = false;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  get countId(): string {
    return `${this.inputId}-count`;
  }

  get errorId(): string {
    return `${this.inputId}-error`;
  }

  markDirty(): void {
    this.dirty = true;
  }

  reset(): void {
    this.dirty = false;
    this.errorMessage.set('');
    this.count.set(0);
  }

  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const length = textarea.value.length;
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.count.set(length);
      this.debounceTimer = null;
    }, this.debounceMs);

    if (this.dirty && textarea.validity.valid) {
      this.errorMessage.set('');
    }
  }

  onInvalid(event: Event): void {
    event.preventDefault();
    this.dirty = true;
    const textarea = event.target as HTMLTextAreaElement;
    this.errorMessage.set(textarea.validity.valueMissing ? 'is required.' : 'is not valid.');
  }

  onBlur(event: Event): void {
    if (!this.dirty) return;
    const textarea = event.target as HTMLTextAreaElement;
    if (!textarea.validity.valid) {
      this.errorMessage.set(textarea.validity.valueMissing ? 'is required.' : 'is not valid.');
    } else {
      this.errorMessage.set('');
    }
  }

  ngOnDestroy(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }
  }
}
