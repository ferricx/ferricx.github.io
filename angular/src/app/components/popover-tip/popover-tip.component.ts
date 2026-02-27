import { Component, ElementRef, HostListener, Input, ViewChild, numberAttribute } from '@angular/core';

let popoverIdCounter = 0;

@Component({
  selector: 'app-popover-tip',
  standalone: true,
  templateUrl: './popover-tip.component.html',
  styleUrl: './popover-tip.component.scss'
})
export class PopoverTipComponent {
  @Input()
  text = 'This is a helpful tip.';

  @Input()
  linkHref = '';

  @Input()
  linkLabel = 'Learn more';

  @Input()
  ariaLabel = 'Show tip';

  @Input({ transform: numberAttribute })
  closeDelay = 0;

  protected isOpen = false;
  protected positionClass = '';
  protected readonly popoverId = `popover-tip-${popoverIdCounter++}`;

  @ViewChild('popoverPanel', { static: true })
  private readonly popoverPanel!: ElementRef<HTMLElement>;

  private closeTimer: ReturnType<typeof setTimeout> | null = null;
  private positionDetectionTimers: ReturnType<typeof setTimeout>[] = [];
  private openedByHover = false;
  private openedByFocus = false;
  private openedByClick = false;

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  protected handlePopoverToggle(): void {
    this.isOpen = this.isPopoverOpen();

    if (this.isOpen) {
      if (!this.openedByHover && !this.openedByFocus) {
        this.openedByClick = true;
      }

      this.schedulePositionDetections();
      return;
    }

    this.clearCloseTimer();
    this.clearPositionDetectionTimers();
    this.openedByHover = false;
    this.openedByFocus = false;
    this.openedByClick = false;
  }

  protected markOpenedByClick(): void {
    this.clearCloseTimer();
    this.openedByHover = false;
    this.openedByFocus = false;
    this.openedByClick = true;
  }

  protected openByHover(): void {
    if (this.openedByClick) {
      return;
    }

    this.clearCloseTimer();

    if (this.isOpen && !this.openedByHover) {
      return;
    }

    this.openedByHover = true;
    this.openedByFocus = false;
    this.openedByClick = false;
    this.openPopoverPanel();
  }

  protected openByFocus(): void {
    this.clearCloseTimer();
    this.openedByHover = false;
    this.openedByFocus = true;
    this.openedByClick = false;
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
    if (this.openedByClick) {
      return;
    }

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
    if (this.openedByClick) {
      return;
    }

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

    if (relatedTarget === null && this.isPointerOverTriggerOrPopover()) {
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
    this.schedulePositionDetections();
  }

  private closePopoverPanel(): void {
    const popover = this.popoverPanel.nativeElement;

    if (popover.matches(':popover-open')) {
      popover.hidePopover();
    }

    this.isOpen = false;
    this.clearPositionDetectionTimers();
    this.openedByHover = false;
    this.openedByFocus = false;
    this.openedByClick = false;
  }

  private schedulePositionDetections(): void {
    this.clearPositionDetectionTimers();

    const delays = [0, 40, 100, 180, 280, 420];

    for (const delay of delays) {
      const timer = setTimeout(() => {
        if (this.isPopoverOpen()) {
          this.detectPopoverPosition();
        }
      }, delay);

      this.positionDetectionTimers.push(timer);
    }
  }

  private clearPositionDetectionTimers(): void {
    for (const timer of this.positionDetectionTimers) {
      clearTimeout(timer);
    }

    this.positionDetectionTimers = [];
  }

  private clearPositionClasses(): void {
    this.applyPositionClassToElement('');
    this.positionClass = '';
  }

  private applyPositionClassToElement(positionClass: string): void {
    const popover = this.popoverPanel?.nativeElement;

    if (!popover) {
      return;
    }

    popover.classList.remove(
      'position-right',
      'position-left',
      'position-above',
      'position-center-above',
      'position-below',
      'position-center-below'
    );

    if (positionClass) {
      popover.classList.add(positionClass);
    }
  }

  private getCssPositionToken(): string {
    const popover = this.popoverPanel?.nativeElement;

    if (!popover) {
      return '';
    }

    return getComputedStyle(popover).getPropertyValue('--popover-position').trim();
  }

  private getPositionClassFromCssTry(cssPositionToken: string): string {
    const classByPosition: Record<string, string> = {
      right: 'position-right',
      left: 'position-left',
      above: 'position-above',
      below: 'position-below'
    };

    return classByPosition[cssPositionToken] ?? '';
  }

  private detectPositionClassByGeometry(popoverRect: DOMRect, anchorRect: DOMRect): string {
    const anchorCenterX = anchorRect.left + anchorRect.width / 2;
    const anchorCenterY = anchorRect.top + anchorRect.height / 2;
    const popoverCenterX = popoverRect.left + popoverRect.width / 2;
    const popoverCenterY = popoverRect.top + popoverRect.height / 2;

    const horizontalOverlap =
      Math.max(0, Math.min(popoverRect.right, anchorRect.right) - Math.max(popoverRect.left, anchorRect.left));
    const verticalOverlap =
      Math.max(0, Math.min(popoverRect.bottom, anchorRect.bottom) - Math.max(popoverRect.top, anchorRect.top));

    const isVerticalPlacement = horizontalOverlap >= verticalOverlap;

    if (isVerticalPlacement) {
      const isAbove = popoverCenterY < anchorCenterY;
      return isAbove ? 'position-above' : 'position-below';
    }

    if (popoverCenterX < anchorCenterX) {
      return 'position-left';
    }

    return 'position-right';
  }

  private detectPopoverPosition(): void {
    const popover = this.popoverPanel?.nativeElement;
    const trigger = this.host.nativeElement.querySelector('.popover-trigger');

    if (!popover || !(trigger instanceof HTMLElement)) {
      return;
    }

    const contentRect =
      (popover.querySelector('.popover-content') as HTMLElement | null)?.getBoundingClientRect() ?? popover.getBoundingClientRect();
    const anchorRect = trigger.getBoundingClientRect();
    const anchorCenterX = anchorRect.left + anchorRect.width / 2;

    const popoverRect = popover.getBoundingClientRect();

    let cssPositionToken = this.getCssPositionToken();
    let positionClass = this.getPositionClassFromCssTry(cssPositionToken);

    this.clearPositionClasses();

    if (!positionClass) {
      void popover.offsetWidth;
      cssPositionToken = this.getCssPositionToken();
      positionClass = this.getPositionClassFromCssTry(cssPositionToken);
    }

    const geometryPositionClass = this.detectPositionClassByGeometry(popoverRect, anchorRect);
    if (!positionClass && geometryPositionClass) {
      positionClass = geometryPositionClass;
    } else if (positionClass === 'position-right' && geometryPositionClass && geometryPositionClass !== 'position-right') {
      positionClass = geometryPositionClass;
    }

    if (
      positionClass === 'position-above' ||
      positionClass === 'position-below'
    ) {
      const rawOffset = anchorCenterX - contentRect.left;
      const minOffset = 14;
      const maxOffset = Math.max(minOffset, contentRect.width - 14);
      const triangleOffset = Math.min(maxOffset, Math.max(minOffset, rawOffset));
      popover.style.setProperty('--triangle-offset', `${triangleOffset}px`);
    } else {
      popover.style.removeProperty('--triangle-offset');
    }

    this.positionClass = positionClass || 'position-right';
    this.applyPositionClassToElement(this.positionClass);
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

  @HostListener('window:resize')
  protected handleWindowResize(): void {
    if (!this.isOpen) {
      return;
    }

    this.schedulePositionDetections();
  }

  @HostListener('window:scroll', [])
  protected handleWindowScroll(): void {
    if (!this.isOpen) {
      return;
    }

    this.schedulePositionDetections();
  }
}
