import { Component, ElementRef, HostListener, Input, ViewChild, numberAttribute } from '@angular/core';

let popoverIdCounter = 0;

@Component({
  selector: 'app-popover-tip',
  standalone: true,
  templateUrl: './popover-tip.component.html',
  styleUrl: './popover-tip.component.css'
})
export class PopoverTipComponent {
  @Input()
  text = 'This is a helpful tip.';

  @Input()
  ariaLabel = 'Show tip';

  @Input({ transform: numberAttribute })
  closeDelay = 0;

  protected isOpen = false;
  protected readonly popoverId = `popover-tip-${popoverIdCounter++}`;

  @ViewChild('popoverPanel', { static: true })
  private readonly popoverPanel!: ElementRef<HTMLElement>;

  private closeTimer: ReturnType<typeof setTimeout> | null = null;
  private openedByHover = false;
  private openedByFocus = false;

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  protected handlePopoverToggle(): void {
    this.isOpen = this.isPopoverOpen();

    if (this.isOpen) {
      return;
    }

    this.clearCloseTimer();
    this.openedByHover = false;
    this.openedByFocus = false;
  }

  protected openByHover(): void {
    this.clearCloseTimer();

    if (this.isOpen && !this.openedByHover) {
      return;
    }

    this.openedByHover = true;
    this.openedByFocus = false;
    this.openPopoverPanel();
  }

  protected openByFocus(): void {
    this.clearCloseTimer();
    this.openedByHover = false;
    this.openedByFocus = true;
    this.openPopoverPanel();
  }

  protected scheduleClose(): void {
    this.clearCloseTimer();
    this.startCloseTimer();
  }

  private scheduleCloseIfNeeded(): void {
    if (this.closeTimer !== null) {
      return;
    }

    this.startCloseTimer();
  }

  private startCloseTimer(): void {
    const delay = Math.max(0, this.closeDelay);

    this.closeTimer = setTimeout(() => {
      if (this.openedByHover && this.isPointerOverTriggerOrPopover()) {
        this.closeTimer = null;
        return;
      }

      this.closePopoverPanel();
      this.closeTimer = null;
    }, delay);
  }

  protected handleHoverEnter(): void {
    if (!this.isOpen || !this.openedByHover) {
      return;
    }

    this.clearCloseTimer();
  }

  protected handleHoverLeave(event: MouseEvent): void {
    if (!this.isOpen || !this.openedByHover) {
      return;
    }

    const relatedTarget = event.relatedTarget;
    const pointerStillOverInteractiveArea = this.isPointerOverTriggerOrPopover();

    if (relatedTarget instanceof Node && this.host.nativeElement.contains(relatedTarget)) {
      if (pointerStillOverInteractiveArea) {
        this.clearCloseTimer();
        return;
      }
    }

    if (pointerStillOverInteractiveArea) {
      this.clearCloseTimer();
      return;
    }

    this.scheduleClose();
  }

  @HostListener('document:pointermove', ['$event'])
  protected handleDocumentPointerMove(event: PointerEvent): void {
    if (!this.isOpen || !this.openedByHover) {
      return;
    }

    if (this.isPointInsideInteractiveArea(event.clientX, event.clientY)) {
      this.clearCloseTimer();
      return;
    }

    this.scheduleCloseIfNeeded();
  }

  protected handleRootFocusOut(event: FocusEvent): void {
    if (!this.isOpen) {
      return;
    }

    const relatedTarget = event.relatedTarget;

    if (relatedTarget instanceof Node && this.host.nativeElement.contains(relatedTarget)) {
      return;
    }

    if (!this.openedByHover) {
      this.closeImmediately();
      return;
    }

    if (this.openedByHover && this.isPointerOverTriggerOrPopover()) {
      return;
    }

    this.scheduleClose();
  }

  @HostListener('document:focusin', ['$event'])
  protected handleDocumentFocusIn(event: FocusEvent): void {
    if (!this.isOpen || !this.openedByFocus) {
      return;
    }

    const target = event.target;

    if (target instanceof Node && this.host.nativeElement.contains(target)) {
      return;
    }

    this.closeImmediately();
  }

  protected handleEscape(event: KeyboardEvent): void {
    if (event.key !== 'Escape') {
      return;
    }

    event.preventDefault();
    this.closeImmediately();
  }

  @HostListener('document:pointerdown', ['$event'])
  protected handleDocumentPointerDown(event: PointerEvent): void {
    if (!this.isOpen) {
      return;
    }

    const target = event.target;

    if (target instanceof Node && this.host.nativeElement.contains(target)) {
      return;
    }

    this.closeImmediately();
  }

  private closeImmediately(): void {
    this.clearCloseTimer();
    this.closePopoverPanel();
  }

  private openPopoverPanel(): void {
    const popover = this.popoverPanel.nativeElement;

    if (!popover.matches(':popover-open')) {
      popover.showPopover();
    }

    this.isOpen = true;
  }

  private closePopoverPanel(): void {
    const popover = this.popoverPanel.nativeElement;

    if (popover.matches(':popover-open')) {
      popover.hidePopover();
    }

    this.isOpen = false;
    this.openedByHover = false;
    this.openedByFocus = false;
  }

  private isPopoverOpen(): boolean {
    return this.popoverPanel.nativeElement.matches(':popover-open');
  }

  private isPointerOverTriggerOrPopover(): boolean {
    const trigger = this.host.nativeElement.querySelector('.popover-trigger');
    const popover = this.host.nativeElement.querySelector('.popover');

    return trigger?.matches(':hover') === true || popover?.matches(':hover') === true;
  }

  private isPointInsideInteractiveArea(clientX: number, clientY: number): boolean {
    const trigger = this.host.nativeElement.querySelector('.popover-trigger');
    const popover = this.host.nativeElement.querySelector('.popover');

    return this.isPointInsideElement(trigger, clientX, clientY) || this.isPointInsideElement(popover, clientX, clientY);
  }

  private isPointInsideElement(element: Element | null, clientX: number, clientY: number): boolean {
    if (!element) {
      return false;
    }

    const rect = element.getBoundingClientRect();

    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
  }

  private clearCloseTimer(): void {
    if (this.closeTimer !== null) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }
}
