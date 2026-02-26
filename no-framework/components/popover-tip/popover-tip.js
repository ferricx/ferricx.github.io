class PopoverTip extends HTMLElement {
  static stylesheetText = "";
  static stylesheetPromise;
  static templateElement;
  static templatePromise;
  static nextInstanceId = 0;

  constructor() {
    super();
    this.boundHandleToggle = (event) => this.handleToggle(event);
    this.boundHandleTriggerMouseEnter = () => this.handleTriggerMouseEnter();
    this.boundHandlePanelMouseEnter = () => this.handlePanelMouseEnter();
    this.boundHandleHoverLeave = (event) => this.handleHoverLeave(event);
    this.boundHandleDocumentPointerMove = (event) => this.handleDocumentPointerMove(event);
    this.boundHandleTriggerFocusIn = () => this.handleTriggerFocusIn();
    this.boundHandleFocusOut = (event) => this.handleFocusOut(event);
    this.boundHandleTriggerPointerDown = () => this.handleTriggerPointerDown();
    this.boundHandleContentTransitionEnd = (event) => this.handleContentTransitionEnd(event);
    this.boundHandleLayoutChange = () => {
      this.requestPositionDetection();
      this.scheduleLayoutSettleDetection();
    };
    this.positionDetectionTimers = [];
    this.positionDetectionFrame = null;
    this.layoutSettleTimer = null;
    this.hoverCloseTimer = null;
    this.resizeObserver = null;
    this.pendingOpenReason = "";
    this.openedByHover = false;
    this.suppressFocusOpenUntil = 0;
    this.isTrackingHoverPointer = false;
    this.lastPointerClientX = null;
    this.lastPointerClientY = null;
    this.hoverOutDisabledUntil = 0;
  }

  async connectedCallback() {
    await this.render();
    await this.applyStyles();

    this.triggerElement = this.querySelector(".popover-trigger");
    this.panelElement = this.querySelector(".popover");
    this.contentElement = this.querySelector(".popover-body") || this.querySelector(".popover-content");

    this.addInteractionListeners();

    if (this.panelElement) {
      this.panelElement.addEventListener("toggle", this.boundHandleToggle);
    }

    if (this.contentElement) {
      this.contentElement.addEventListener("transitionend", this.boundHandleContentTransitionEnd);
    }
  }

  disconnectedCallback() {
    this.clearDetectionTimers();
    this.stopLayoutChangeListeners();
    this.stopHoverPointerTracking();
    this.clearHoverCloseTimer();
    this.removeInteractionListeners();

    if (this.panelElement) {
      this.panelElement.removeEventListener("toggle", this.boundHandleToggle);
    }

    if (this.contentElement) {
      this.contentElement.removeEventListener("transitionend", this.boundHandleContentTransitionEnd);
    }
  }

  addInteractionListeners() {
    if (this.triggerElement) {
      this.triggerElement.addEventListener("mouseenter", this.boundHandleTriggerMouseEnter);
      this.triggerElement.addEventListener("mouseleave", this.boundHandleHoverLeave);
      this.triggerElement.addEventListener("focusin", this.boundHandleTriggerFocusIn);
      this.triggerElement.addEventListener("focusout", this.boundHandleFocusOut);
      this.triggerElement.addEventListener("pointerdown", this.boundHandleTriggerPointerDown);
    }

    if (this.panelElement) {
      this.panelElement.addEventListener("mouseenter", this.boundHandlePanelMouseEnter);
      this.panelElement.addEventListener("mouseleave", this.boundHandleHoverLeave);
      this.panelElement.addEventListener("focusout", this.boundHandleFocusOut);
    }
  }

  removeInteractionListeners() {
    if (this.triggerElement) {
      this.triggerElement.removeEventListener("mouseenter", this.boundHandleTriggerMouseEnter);
      this.triggerElement.removeEventListener("mouseleave", this.boundHandleHoverLeave);
      this.triggerElement.removeEventListener("focusin", this.boundHandleTriggerFocusIn);
      this.triggerElement.removeEventListener("focusout", this.boundHandleFocusOut);
      this.triggerElement.removeEventListener("pointerdown", this.boundHandleTriggerPointerDown);
    }

    if (this.panelElement) {
      this.panelElement.removeEventListener("mouseenter", this.boundHandlePanelMouseEnter);
      this.panelElement.removeEventListener("mouseleave", this.boundHandleHoverLeave);
      this.panelElement.removeEventListener("focusout", this.boundHandleFocusOut);
    }
  }

  startHoverPointerTracking() {
    if (this.isTrackingHoverPointer) {
      return;
    }

    this.isTrackingHoverPointer = true;
    document.addEventListener("pointermove", this.boundHandleDocumentPointerMove, { capture: true, passive: true });
  }

  stopHoverPointerTracking() {
    if (!this.isTrackingHoverPointer) {
      return;
    }

    this.isTrackingHoverPointer = false;
    document.removeEventListener("pointermove", this.boundHandleDocumentPointerMove, true);
  }

  clearHoverCloseTimer() {
    if (this.hoverCloseTimer !== null) {
      clearTimeout(this.hoverCloseTimer);
      this.hoverCloseTimer = null;
    }
  }

  openPopoverBy(reason) {
    if (!this.panelElement || this.panelElement.matches(":popover-open")) {
      return;
    }

    this.pendingOpenReason = reason;
    this.panelElement.showPopover();
  }

  handleTriggerMouseEnter() {
    this.clearHoverCloseTimer();
    this.openPopoverBy("hover");
  }

  handlePanelMouseEnter() {
    this.clearHoverCloseTimer();
  }

  isPointInsideElement(element, clientX, clientY) {
    if (!element || !Number.isFinite(clientX) || !Number.isFinite(clientY)) {
      return false;
    }

    const rect = element.getBoundingClientRect();

    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
  }

  isPointerOverTriggerOrPanel(clientX, clientY) {
    return this.isPointInsideElement(this.triggerElement, clientX, clientY) || this.isPointInsideElement(this.panelElement, clientX, clientY);
  }

  handleTriggerPointerDown() {
    const now = performance.now();
    this.suppressFocusOpenUntil = now + 300;
    this.hoverOutDisabledUntil = now + 500;

    if (this.panelElement?.matches(":popover-open") && this.openedByHover) {
      this.openedByHover = false;
      this.stopHoverPointerTracking();
      this.clearHoverCloseTimer();
    }
  }

  isHoverOutTemporarilyDisabled() {
    return performance.now() < this.hoverOutDisabledUntil;
  }

  handleTriggerFocusIn() {
    if (performance.now() < this.suppressFocusOpenUntil) {
      return;
    }

    this.openPopoverBy("focus");
  }

  handleFocusOut(event) {
    if (!this.panelElement?.matches(":popover-open")) {
      return;
    }

    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && this.contains(nextTarget)) {
      return;
    }

    setTimeout(() => {
      if (!this.panelElement?.matches(":popover-open")) {
        return;
      }

      const activeElement = document.activeElement;

      if (!(activeElement instanceof Node) || !this.contains(activeElement)) {
        this.panelElement.hidePopover();
      }
    }, 0);
  }

  handleContentTransitionEnd(event) {
    if (!this.panelElement?.matches(":popover-open")) {
      return;
    }

    if (event.propertyName !== "transform" && event.propertyName !== "opacity") {
      return;
    }

    this.detectPopoverPosition();
  }

  handleHoverLeave(event) {
    if (!this.panelElement?.matches(":popover-open") || !this.openedByHover || this.isHoverOutTemporarilyDisabled()) {
      return;
    }

    if (Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
      this.lastPointerClientX = event.clientX;
      this.lastPointerClientY = event.clientY;
    }

    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && this.contains(nextTarget)) {
      return;
    }

    this.scheduleHoverCloseCheck();
  }

  handleDocumentPointerMove(event) {
    if (!this.panelElement?.matches(":popover-open") || !this.openedByHover || this.isHoverOutTemporarilyDisabled()) {
      return;
    }

    this.lastPointerClientX = event.clientX;
    this.lastPointerClientY = event.clientY;

    if (this.isPointerOverTriggerOrPanel(event.clientX, event.clientY)) {
      this.clearHoverCloseTimer();
      return;
    }

    const target = event.target;

    if (target instanceof Node && this.contains(target)) {
      this.clearHoverCloseTimer();
      return;
    }

    const hoveringTrigger = this.triggerElement?.matches(":hover");
    const hoveringPanel = this.panelElement?.matches(":hover");

    if (hoveringTrigger || hoveringPanel) {
      this.clearHoverCloseTimer();
      return;
    }

    this.scheduleHoverCloseCheck();
  }

  scheduleHoverCloseCheck() {
    if (this.hoverCloseTimer !== null) {
      return;
    }

    this.hoverCloseTimer = setTimeout(() => {
      this.hoverCloseTimer = null;

      if (!this.panelElement?.matches(":popover-open") || !this.openedByHover) {
        return;
      }

      if (this.isHoverOutTemporarilyDisabled()) {
        return;
      }

      if (this.isPointerOverTriggerOrPanel(this.lastPointerClientX, this.lastPointerClientY)) {
        return;
      }

      const hoveringTrigger = this.triggerElement?.matches(":hover");
      const hoveringPanel = this.panelElement?.matches(":hover");

      if (!hoveringTrigger && !hoveringPanel) {
        this.panelElement.hidePopover();
      }
    }, 60);
  }

  clearDetectionTimers() {
    for (const timer of this.positionDetectionTimers) {
      clearTimeout(timer);
    }

    this.positionDetectionTimers = [];
  }

  requestPositionDetection() {
    if (this.positionDetectionFrame !== null) {
      return;
    }

    this.positionDetectionFrame = requestAnimationFrame(() => {
      this.positionDetectionFrame = null;

      if (this.panelElement?.matches(":popover-open")) {
        this.detectPopoverPosition();
      }
    });
  }

  scheduleLayoutSettleDetection() {
    if (this.layoutSettleTimer !== null) {
      clearTimeout(this.layoutSettleTimer);
    }

    this.layoutSettleTimer = setTimeout(() => {
      this.layoutSettleTimer = null;

      if (this.panelElement?.matches(":popover-open")) {
        this.detectPopoverPosition();
      }
    }, 120);
  }

  startLayoutChangeListeners() {
    window.addEventListener("resize", this.boundHandleLayoutChange);
    window.addEventListener("scroll", this.boundHandleLayoutChange, { capture: true, passive: true });

    if (typeof ResizeObserver === "undefined" || this.resizeObserver) {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => this.boundHandleLayoutChange());

    if (this.triggerElement) {
      this.resizeObserver.observe(this.triggerElement);
    }

    if (this.panelElement) {
      this.resizeObserver.observe(this.panelElement);
    }
  }

  stopLayoutChangeListeners() {
    window.removeEventListener("resize", this.boundHandleLayoutChange);
    window.removeEventListener("scroll", this.boundHandleLayoutChange, true);

    if (this.positionDetectionFrame !== null) {
      cancelAnimationFrame(this.positionDetectionFrame);
      this.positionDetectionFrame = null;
    }

    if (this.layoutSettleTimer !== null) {
      clearTimeout(this.layoutSettleTimer);
      this.layoutSettleTimer = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  schedulePositionDetections() {
    this.clearDetectionTimers();

    const delays = [0, 40, 100, 180, 280, 420];

    for (const delay of delays) {
      const timer = setTimeout(() => {
        if (this.panelElement?.matches(":popover-open")) {
          this.detectPopoverPosition();
        }
      }, delay);

      this.positionDetectionTimers.push(timer);
    }
  }

  handleToggle(event) {
    const isOpen = event.newState === "open";
    const openReason = this.pendingOpenReason;
    this.pendingOpenReason = "";

    this.triggerElement.setAttribute("aria-expanded", String(isOpen));

    if (isOpen) {
      this.openedByHover = openReason === "hover";

      if (this.openedByHover) {
        this.startHoverPointerTracking();
      } else {
        this.stopHoverPointerTracking();
      }

      this.startLayoutChangeListeners();
      this.schedulePositionDetections();
      return;
    }

    this.openedByHover = false;
    this.stopHoverPointerTracking();
    this.clearHoverCloseTimer();
    this.stopLayoutChangeListeners();
    this.clearDetectionTimers();
  }

  clearPositionClasses() {
    if (!this.panelElement) {
      return;
    }

    this.panelElement.classList.remove(
      "position-right",
      "position-left",
      "position-above",
      "position-center-above",
      "position-below",
      "position-center-below"
    );
  }

  getPositionClassFromCssTry() {
    const cssPosition = this.getCssPositionToken();

    const classByPosition = {
      right: "position-right",
      left: "position-left",
      above: "position-above",
      "center-above": "position-center-above",
      below: "position-below",
      "center-below": "position-center-below"
    };

    return classByPosition[cssPosition] || "";
  }

  getCssPositionToken() {
    if (!this.panelElement) {
      return "";
    }

    return getComputedStyle(this.panelElement).getPropertyValue("--popover-position").trim();
  }

  getCenterTolerance(popoverRect) {
    if (!this.panelElement) {
      return Math.max(20, popoverRect.width * 0.15);
    }

    const customToleranceValue = getComputedStyle(this.panelElement).getPropertyValue("--popover-center-tolerance").trim();
    const baseTolerance = Math.max(20, popoverRect.width * 0.15);

    if (!customToleranceValue) {
      return baseTolerance;
    }

    const customTolerance = parseFloat(customToleranceValue);

    if (!Number.isFinite(customTolerance)) {
      return baseTolerance;
    }

    if (customToleranceValue.endsWith("rem")) {
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

      if (Number.isFinite(rootFontSize)) {
        return baseTolerance + Math.max(0, customTolerance * rootFontSize);
      }
    }

    return baseTolerance + Math.max(0, customTolerance);
  }

  detectPositionClassByGeometry(popoverRect, anchorRect, anchorCenterX) {
    const popoverCenterX = popoverRect.left + popoverRect.width / 2;
    const centerTolerance = this.getCenterTolerance(popoverRect);

    const isAbove = popoverRect.top < anchorRect.top && popoverRect.bottom <= anchorRect.top + 24;
    const isBelow = popoverRect.bottom > anchorRect.bottom && popoverRect.top >= anchorRect.bottom - 24;

    if (popoverRect.left >= anchorRect.right - 10) {
      return "position-right";
    }

    if (popoverRect.right <= anchorRect.left + 10) {
      return "position-left";
    }

    if (isAbove) {
      if (Math.abs(popoverCenterX - anchorCenterX) <= centerTolerance) {
        return "position-center-above";
      }

      return "position-above";
    }

    if (isBelow) {
      if (Math.abs(popoverCenterX - anchorCenterX) <= centerTolerance) {
        return "position-center-below";
      }

      return "position-below";
    }

    return "";
  }

  detectPopoverPosition() {
    if (!this.panelElement || !this.triggerElement) {
      return;
    }

    const popoverRect = this.panelElement.getBoundingClientRect();
    const contentRect = this.panelElement.querySelector(".popover-content")?.getBoundingClientRect() || popoverRect;
    const anchorRect = this.triggerElement.getBoundingClientRect();

    const anchorCenterX = anchorRect.left + anchorRect.width / 2;

    let cssPositionToken = this.getCssPositionToken();
    let positionClass = this.getPositionClassFromCssTry();
    const geometryPositionClass = this.detectPositionClassByGeometry(popoverRect, anchorRect, anchorCenterX);

    this.clearPositionClasses();

    if (!positionClass) {
      void this.panelElement.offsetWidth;
      cssPositionToken = this.getCssPositionToken();
      positionClass = this.getPositionClassFromCssTry();
    }

    if (cssPositionToken === "center-above") {
      positionClass = "position-center-above";
    } else if (cssPositionToken === "above") {
      positionClass = "position-above";
    }

    if (!positionClass) {
      positionClass = geometryPositionClass;
    } else if (positionClass === "position-right" && geometryPositionClass && geometryPositionClass !== "position-right") {
      positionClass = geometryPositionClass;
    }

    if (positionClass === "position-above" || positionClass === "position-center-above" || positionClass === "position-center-below") {
      const rawOffset = anchorCenterX - contentRect.left;
      const minOffset = 14;
      const maxOffset = Math.max(minOffset, contentRect.width - 14);
      const triangleOffset = Math.min(maxOffset, Math.max(minOffset, rawOffset));
      this.panelElement.style.setProperty("--triangle-offset", `${triangleOffset}px`);
    } else {
      this.panelElement.style.removeProperty("--triangle-offset");
    }

    if (positionClass) {
      this.panelElement.classList.add(positionClass);
      return;
    }

    this.panelElement.classList.add("position-right");
  }

  async applyStyles() {
    const styleElement = this.querySelector("#component-styles");

    if (!styleElement) {
      return;
    }

    if (!PopoverTip.stylesheetText) {
      if (!PopoverTip.stylesheetPromise) {
        const cssUrl = new URL("./styles.css", import.meta.url);
        PopoverTip.stylesheetPromise = fetch(cssUrl)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Unable to load styles: ${response.status}`);
            }

            return response.text();
          });
      }

      PopoverTip.stylesheetText = await PopoverTip.stylesheetPromise;
    }

    styleElement.textContent = PopoverTip.stylesheetText;
  }

  async ensureTemplate() {
    if (PopoverTip.templateElement) {
      return;
    }

    if (!PopoverTip.templatePromise) {
      const templateUrl = new URL("./popover-tip.html", import.meta.url);
      PopoverTip.templatePromise = fetch(templateUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Unable to load template: ${response.status}`);
          }

          return response.text();
        })
        .then((templateText) => {
          const template = document.createElement("template");
          template.innerHTML = templateText;
          PopoverTip.templateElement = template;
        });
    }

    await PopoverTip.templatePromise;
  }

  async render() {
    const labelText = this.querySelector('[slot="label"]')?.textContent?.trim() || this.getAttribute("label") || "Tip";
    const tipText = this.getAttribute("text") || "This is a helpful tip.";

    await this.ensureTemplate();

    this.innerHTML = `<style id="component-styles"></style>`;

    const fragment = PopoverTip.templateElement.content.cloneNode(true);
    const triggerElement = fragment.querySelector("#popover-trigger");
    const panelElement = fragment.querySelector("#username-tip");
    const labelSlot = fragment.querySelector('slot[name="label"]');
    const contentSlot = fragment.querySelector("#content-slot");

    if (!triggerElement || !panelElement) {
      return;
    }

    const instanceId = PopoverTip.nextInstanceId++;
    const popoverId = `popover-tip-${instanceId}`;
    const triggerId = `${popoverId}-trigger`;
    const anchorName = `--${popoverId}-anchor`;

    triggerElement.id = triggerId;
    triggerElement.setAttribute("aria-controls", popoverId);
    triggerElement.setAttribute("aria-describedby", popoverId);
    triggerElement.setAttribute("popovertarget", popoverId);
    triggerElement.style.setProperty("anchor-name", anchorName);

    panelElement.id = popoverId;
    panelElement.style.setProperty("position-anchor", anchorName);

    if (labelSlot) {
      const labelSpan = document.createElement("span");
      labelSpan.textContent = labelText;
      labelSlot.replaceWith(labelSpan);
    }

    if (contentSlot) {
      contentSlot.textContent = tipText;
    }

    this.appendChild(fragment);
  }
}

customElements.define("popover-tip", PopoverTip);