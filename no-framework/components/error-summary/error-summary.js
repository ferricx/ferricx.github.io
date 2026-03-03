class ErrorSummary extends HTMLElement {
  static stylesheetText = "";
  static stylesheetPromise;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.boundHandleSubmit = (event) => this.handleSubmit(event);
    this.boundHandleReset = () => this.handleReset();
  }

  connectedCallback() {
    this.render();
    this.applyStyles();

    const form = this.closest("form");

    if (form) {
      form.addEventListener("submit", this.boundHandleSubmit);
      form.addEventListener("reset", this.boundHandleReset);
      this.formElement = form;
    }
  }

  disconnectedCallback() {
    if (this.formElement) {
      this.formElement.removeEventListener("submit", this.boundHandleSubmit);
      this.formElement.removeEventListener("reset", this.boundHandleReset);
    }
  }

  handleSubmit(event) {
    const form = this.formElement;

    if (!form) {
      return;
    }

    const errors = this.collectErrors(form);

    if (errors.length === 0) {
      this.clearSummary();
      return;
    }

    event.preventDefault();
    this.showSummary(errors);
  }

  handleReset() {
    this.clearSummary();
  }

  collectErrors(form) {
    const formGroups = Array.from(form.querySelectorAll("form-group"));
    const errors = [];

    for (const group of formGroups) {
      const input = group.shadowRoot?.getElementById("field-input");

      if (!input) {
        continue;
      }

      // Trigger custom validation so setCustomValidity is current
      group.applyCustomValidation?.();

      if (input.checkValidity()) {
        continue;
      }

      const fieldId = group.getAttribute("field-id") || "field";
      const label = group.getAttribute("label") || "This field";
      const message = this.getErrorMessage(input, label, group);

      errors.push({ fieldId, label, message, input, group });
    }

    return errors;
  }

  getErrorMessage(input, label, group) {
    const { validity } = input;

    if (validity.valueMissing) {
      return "is empty.";
    }

    if (validity.typeMismatch) {
      return `is not a valid ${input.type}.`;
    }

    if (validity.patternMismatch || validity.customError) {
      return "is not in the correct format.";
    }

    return "is not valid.";
  }

  showSummary(errors) {
    const container = this.shadowRoot.getElementById("summary-container");

    if (!container) {
      return;
    }

    const heading = document.createElement("h2");
    heading.id = "error-summary-heading";
    heading.textContent = "Form errors:";

    const list = document.createElement("ul");

    for (const error of errors) {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#${error.fieldId}`;
      link.textContent = `${error.label}: ${error.message}`;

      link.addEventListener("click", (event) => {
        event.preventDefault();
        error.input.focus();
      });

      li.appendChild(link);
      list.appendChild(li);
    }

    container.innerHTML = "";
    container.setAttribute("role", "region");
    container.setAttribute("aria-labelledby", "error-summary-heading");
    container.appendChild(heading);
    container.appendChild(list);
    container.hidden = false;

    const firstLink = container.querySelector("a");
    firstLink?.focus();

    // Also trigger inline errors on each form-group
    for (const error of errors) {
      error.group.validate?.(false);
    }
  }

  clearSummary() {
    const container = this.shadowRoot.getElementById("summary-container");

    if (container) {
      container.innerHTML = "";
      container.hidden = true;
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style id="component-styles"></style>
      <div id="summary-container" tabindex="-1" hidden></div>
    `;
  }

  async applyStyles() {
    const styleElement = this.shadowRoot.getElementById("component-styles");

    if (!styleElement) {
      return;
    }

    if (!ErrorSummary.stylesheetText) {
      if (!ErrorSummary.stylesheetPromise) {
        const cssUrl = new URL("./styles.css", import.meta.url);
        ErrorSummary.stylesheetPromise = fetch(cssUrl)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Unable to load styles: ${response.status}`);
            }

            return response.text();
          })
          .catch(() => "");
      }

      ErrorSummary.stylesheetText = await ErrorSummary.stylesheetPromise;
    }

    styleElement.textContent = ErrorSummary.stylesheetText;
  }
}

customElements.define("error-summary", ErrorSummary);
