import "../form-group/form-group.js";
import "../popover-tip/popover-tip.js";

class TabNavigation extends HTMLElement {
  static stylesheetText = "";
  static stylesheetPromise;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.tabs = [];
    this.panels = [];
    this.activeIndex = 0;
  }

  async connectedCallback() {
    this.render();
    await this.applyStyles();

    this.tabs = Array.from(this.shadowRoot.querySelectorAll('[role="tab"]'));
    this.panels = Array.from(this.shadowRoot.querySelectorAll('[role="tabpanel"]'));

    this.tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => this.activateTab(index, true));
      tab.addEventListener("keydown", (event) => this.handleKeydown(event, index));
    });

    this.activateTab(0, false);
  }

  async applyStyles() {
    const styleElement = this.shadowRoot.getElementById("component-styles");

    if (!styleElement) {
      return;
    }

    if (!TabNavigation.stylesheetText) {
      if (!TabNavigation.stylesheetPromise) {
        const cssUrl = new URL("./tab-navigation.css", import.meta.url);
        TabNavigation.stylesheetPromise = fetch(cssUrl)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Unable to load styles: ${response.status}`);
            }

            return response.text();
          })
          .catch(() => "");
      }

      TabNavigation.stylesheetText = await TabNavigation.stylesheetPromise;
    }

    styleElement.textContent = TabNavigation.stylesheetText;
  }

  handleKeydown(event, index) {
    const key = event.key;

    if (key === "ArrowRight") {
      event.preventDefault();
      this.activateTab((index + 1) % this.tabs.length, true);
      return;
    }

    if (key === "ArrowLeft") {
      event.preventDefault();
      this.activateTab((index - 1 + this.tabs.length) % this.tabs.length, true);
      return;
    }

    if (key === "Home") {
      event.preventDefault();
      this.activateTab(0, true);
      return;
    }

    if (key === "End") {
      event.preventDefault();
      this.activateTab(this.tabs.length - 1, true);
      return;
    }

    if (key === "Enter" || key === " ") {
      event.preventDefault();
      this.activateTab(index, true);
    }
  }

  activateTab(index, moveFocus) {
    this.activeIndex = index;

    this.tabs.forEach((tab, tabIndex) => {
      const isSelected = tabIndex === index;
      tab.setAttribute("aria-selected", String(isSelected));
      tab.setAttribute("tabindex", isSelected ? "0" : "-1");
    });

    this.panels.forEach((panel, panelIndex) => {
      panel.hidden = panelIndex !== index;
    });

    if (moveFocus) {
      this.tabs[index].focus();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style id="component-styles"></style>

      <div role="tablist" aria-label="Pages">
        <button id="tab-page-1" role="tab" aria-controls="panel-page-1" aria-selected="true" tabindex="0" type="button">Introduction</button>
        <button id="tab-page-2" role="tab" aria-controls="panel-page-2" aria-selected="false" tabindex="-1" type="button">User Info</button>
        <button id="tab-page-3" role="tab" aria-controls="panel-page-3" aria-selected="false" tabindex="-1" type="button">Page 3</button>
        <button id="tab-page-4" role="tab" aria-controls="panel-page-4" aria-selected="false" tabindex="-1" type="button">Page 4</button>
      </div>

      <section id="panel-page-1" role="tabpanel" aria-labelledby="tab-page-1">
        <p>Ispo lorem vanta selorim quade nesto rilum feri talon. Miro pexa linor, dasto velin cruma poret sivena tral.</p>
        <p><popover-tip text="You can switch tabs with arrow keys, Home, and End."><span slot="label">Keyboard tip</span></popover-tip></p>
        <p>Quorin fespal umo derin, laska torim veno prast. Zendi foral nupra kesto, belin dravo sita moren alti.</p>
        <p>Trevi nolar ifta querin posha, umbra felin dovar kresto. Polin varga seti runda, xelom nisti para dulin.</p>
      </section>
      <section id="panel-page-2" role="tabpanel" aria-labelledby="tab-page-2" hidden>
        <form novalidate>
          <form-group field-id="first-name" name="firstName" label="First name" autocomplete="given-name" pattern="[A-Za-z]+(?:[ '-][A-Za-z]+)*" format-message="First name can include letters, spaces, apostrophes, and hyphens." required></form-group>
          <form-group field-id="last-name" name="lastName" label="Last name" autocomplete="family-name" pattern="[A-Za-z]+(?:[ '-][A-Za-z]+)*" format-message="Last name can include letters, spaces, apostrophes, and hyphens." required></form-group>
          <form-group field-id="date-of-birth" name="dateOfBirth" label="Date of birth (MM/DD/YYYY)" autocomplete="bday" inputmode="numeric" pattern="(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])/\\d{4}" maxlength="10" format-message="Use MM/DD/YYYY format." required></form-group>
        </form>
      </section>
      <section id="panel-page-3" role="tabpanel" aria-labelledby="tab-page-3" hidden>Content for page 3</section>
      <section id="panel-page-4" role="tabpanel" aria-labelledby="tab-page-4" hidden>Content for page 4</section>
    `;
  }
}

customElements.define("tab-navigation", TabNavigation);