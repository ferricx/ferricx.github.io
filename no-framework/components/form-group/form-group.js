class FormGroup extends HTMLElement {
  static stylesheetText = "";
  static stylesheetPromise;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.boundHandleInvalid = (event) => this.handleInvalid(event);
    this.boundHandleInput = () => this.validate(true);
    this.boundHandleBlur = () => this.validate(false);
    this.boundHandleSubmit = (event) => this.handleSubmit(event);
  }

  async connectedCallback() {
    this.render();
    await this.applyStyles();

    this.inputElement = this.shadowRoot.getElementById("field-input");
    this.errorElement = this.shadowRoot.getElementById("field-error");

    this.inputElement.addEventListener("invalid", this.boundHandleInvalid);
    this.inputElement.addEventListener("input", this.boundHandleInput);
    this.inputElement.addEventListener("blur", this.boundHandleBlur);

    const form = this.closest("form");
    if (form) {
      form.addEventListener("submit", this.boundHandleSubmit);
      this.formElement = form;
    }
  }

  disconnectedCallback() {
    if (this.inputElement) {
      this.inputElement.removeEventListener("invalid", this.boundHandleInvalid);
      this.inputElement.removeEventListener("input", this.boundHandleInput);
      this.inputElement.removeEventListener("blur", this.boundHandleBlur);
    }

    if (this.formElement) {
      this.formElement.removeEventListener("submit", this.boundHandleSubmit);
    }
  }

  handleInvalid(event) {
    event.preventDefault();
    this.showError(this.getValidationMessage());
  }

  handleSubmit(event) {
    const isValid = this.validate(false);

    if (!isValid) {
      event.preventDefault();
    }
  }

  validate(clearOnly) {
    this.applyCustomValidation();

    if (this.inputElement.checkValidity()) {
      this.showError("");
      return true;
    }

    if (clearOnly) {
      this.showError("");
      return false;
    }

    this.showError(this.getValidationMessage());
    return false;
  }

  applyCustomValidation() {
    this.inputElement.setCustomValidity("");

    const pattern = this.getAttribute("pattern");
    const value = this.inputElement.value;

    if (!pattern || value.length === 0) {
      return;
    }

    try {
      const regex = new RegExp(`^(?:${pattern})$`);

      if (!regex.test(value)) {
        this.inputElement.setCustomValidity(this.getAttribute("format-message") || "Use the required format.");
      }
    } catch {
      this.inputElement.setCustomValidity("");
    }
  }

  getValidationMessage() {
    const { validity } = this.inputElement;
    const label = this.getAttribute("label") || "This field";

    if (validity.valueMissing) {
      return `${label} is required`;
    }

    if (validity.patternMismatch) {
      return this.getAttribute("format-message") || "Use the required format.";
    }

    if (validity.customError) {
      return this.inputElement.validationMessage;
    }

    return "Please enter a valid value.";
  }

  showError(message) {
    this.errorElement.textContent = message;
    this.inputElement.setAttribute("aria-invalid", String(message.length > 0));
  }

  async applyStyles() {
    const styleElement = this.shadowRoot.getElementById("component-styles");

    if (!styleElement) {
      return;
    }

    if (!FormGroup.stylesheetText) {
      if (!FormGroup.stylesheetPromise) {
        const cssUrl = new URL("./styles.css", import.meta.url);
        FormGroup.stylesheetPromise = fetch(cssUrl)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Unable to load styles: ${response.status}`);
            }

            return response.text();
          })
          .catch(() => "");
      }

      FormGroup.stylesheetText = await FormGroup.stylesheetPromise;
    }

    styleElement.textContent = FormGroup.stylesheetText;
  }

  render() {
    const fieldId = this.getAttribute("field-id") || "field";
    const fieldName = this.getAttribute("name") || fieldId;
    const label = this.getAttribute("label") || "Field";
    const type = this.getAttribute("type") || "text";
    const autocomplete = this.getAttribute("autocomplete") || "";
    const pattern = this.getAttribute("pattern");
    const inputmode = this.getAttribute("inputmode");
    const maxlength = this.getAttribute("maxlength");
    const required = this.hasAttribute("required");

    this.shadowRoot.innerHTML = `
      <style id="component-styles"></style>

      <label for="field-input">${label}${required ? '<span class="required-indicator" aria-hidden="true">*</span><span class="sr-only"> (required)</span>' : ""}</label>
      <input
        id="field-input"
        name="${fieldName}"
        type="${type}"
        ${autocomplete ? `autocomplete="${autocomplete}"` : ""}
        ${inputmode ? `inputmode="${inputmode}"` : ""}
        ${pattern ? `pattern="${pattern}"` : ""}
        ${maxlength ? `maxlength="${maxlength}"` : ""}
        ${required ? "required" : ""}
        aria-describedby="field-error"
      />
      <div id="field-error" class="form-error" aria-live="polite"></div>
    `;
  }
}

customElements.define("form-group", FormGroup);
