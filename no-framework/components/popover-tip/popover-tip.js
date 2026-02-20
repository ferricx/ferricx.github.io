class PopoverTip extends HTMLElement {
  static stylesheetText = "";
  static stylesheetPromise;
  static templateElement;
  static templatePromise;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.boundHandleToggle = (event) => this.handleToggle(event);
    this.boundHandleViewportChange = () => this.handleViewportChange();
  }

  async connectedCallback() {
    await this.render();
    await this.applyStyles();

    this.triggerElement = this.shadowRoot.getElementById("popover-trigger");
    this.panelElement = this.shadowRoot.getElementById("popover-panel");

    this.panelElement.addEventListener("toggle", this.boundHandleToggle);
    window.addEventListener("resize", this.boundHandleViewportChange);
    window.addEventListener("scroll", this.boundHandleViewportChange, true);
  }

  disconnectedCallback() {
    if (this.panelElement) {
      this.panelElement.removeEventListener("toggle", this.boundHandleToggle);
    }

    window.removeEventListener("resize", this.boundHandleViewportChange);
    window.removeEventListener("scroll", this.boundHandleViewportChange, true);
  }

  handleToggle(event) {
    const isOpen = event.newState === "open";
    this.triggerElement.setAttribute("aria-expanded", String(isOpen));

    if (isOpen) {
      this.positionPopover();
    }
  }

  handleViewportChange() {
    if (!this.panelElement?.matches(":popover-open")) {
      return;
    }

    this.positionPopover();
  }

  positionPopover() {
    if (!this.triggerElement || !this.panelElement) {
      return;
    }

    const viewportPadding = 8;
    const offset = 8;
    const triggerRect = this.triggerElement.getBoundingClientRect();
    const panelRect = this.panelElement.getBoundingClientRect();

    let top = triggerRect.bottom + offset;
    let left = triggerRect.left;

    if (left + panelRect.width > window.innerWidth - viewportPadding) {
      left = window.innerWidth - panelRect.width - viewportPadding;
    }

    if (left < viewportPadding) {
      left = viewportPadding;
    }

    if (top + panelRect.height > window.innerHeight - viewportPadding) {
      top = triggerRect.top - panelRect.height - offset;
    }

    if (top < viewportPadding) {
      top = viewportPadding;
    }

    this.panelElement.style.left = `${Math.round(left)}px`;
    this.panelElement.style.top = `${Math.round(top)}px`;
  }

  async applyStyles() {
    const styleElement = this.shadowRoot.getElementById("component-styles");

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
          })
          .catch(() => "");
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
        })
        .catch(() => {
          const template = document.createElement("template");
          template.innerHTML = `<span class="popover-root"></span>`;
          PopoverTip.templateElement = template;
        });
    }

    await PopoverTip.templatePromise;
  }

  async render() {
    const tipText = this.getAttribute("text") || "This is a helpful tip.";

    await this.ensureTemplate();

    this.shadowRoot.innerHTML = `<style id="component-styles"></style>`;
    this.shadowRoot.appendChild(PopoverTip.templateElement.content.cloneNode(true));

    const contentSlot = this.shadowRoot.getElementById("content-slot");
    if (contentSlot) {
      contentSlot.textContent = tipText;
    }
  }
}

customElements.define("popover-tip", PopoverTip);