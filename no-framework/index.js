import "./components/form-group/form-group.js";
import "./components/popover-tip/popover-tip.js";
import "./components/error-summary/error-summary.js";

// Animate details open/close
const closeDetails = (details) => {
  const body = details.querySelector(":scope > .details-body");
  if (!body || !details.open) return;
  body.style.maxHeight = body.scrollHeight + "px";
  requestAnimationFrame(() => {
    body.style.maxHeight = "0";
    body.style.paddingTop = "0";
    body.style.paddingBottom = "0";
  });
  body.addEventListener("transitionend", () => {
    details.removeAttribute("open");
    body.style.maxHeight = "";
    body.style.paddingTop = "";
    body.style.paddingBottom = "";
  }, { once: true });
};

document.querySelectorAll(".tab-navigation details").forEach(details => {
  const nonSummary = Array.from(details.children).filter(el => el.tagName.toLowerCase() !== "summary");
  if (!nonSummary.length) return;

  const body = document.createElement("div");
  body.className = "details-body";
  nonSummary.forEach(el => body.appendChild(el));
  details.appendChild(body);

  const summary = details.querySelector("summary");
  const isTopLevel = details.parentElement?.getAttribute("role") === "tabpanel";

  summary.addEventListener("click", e => {
    e.preventDefault();

    if (details.open) {
      closeDetails(details);
    } else {
      // Accordion: close sibling top-level details first
      if (isTopLevel) {
        Array.from(details.parentElement.querySelectorAll(":scope > details[open]"))
          .forEach(sibling => sibling !== details && closeDetails(sibling));
      }
      details.setAttribute("open", "");
      body.style.maxHeight = "0";
      body.style.paddingTop = "0";
      body.style.paddingBottom = "0";
      requestAnimationFrame(() => {
        body.style.maxHeight = body.scrollHeight + "px";
        body.style.paddingTop = "";
        body.style.paddingBottom = "";
      });
      body.addEventListener("transitionend", () => {
        body.style.maxHeight = "";
      }, { once: true });
    }
  });
});

const root = document.querySelector(".tab-navigation");

if (root) {
  const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
  const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));
  let activeIndex = 0;

  const activateTab = (index, moveFocus) => {
    if (index === activeIndex) {
      if (moveFocus) tabs[index].focus();
      return;
    }

    root.dataset.tabDirection = index > activeIndex ? "forward" : "backward";
    document.documentElement.dataset.tabDirection = root.dataset.tabDirection;

    const update = () => {
      activeIndex = index;

      tabs.forEach((tab, tabIndex) => {
        const isSelected = tabIndex === index;
        tab.setAttribute("aria-selected", String(isSelected));
        tab.setAttribute("tabindex", isSelected ? "0" : "-1");
      });

      panels.forEach((panel, panelIndex) => {
        panel.hidden = panelIndex !== index;
      });

      if (moveFocus) {
        tabs[index].focus();
      }
    };

    if (!document.startViewTransition) {
      update();
      return;
    }

    document.startViewTransition(update);
  };

  const handleKeydown = (event, index) => {
    const key = event.key;

    if (key === "ArrowRight") {
      event.preventDefault();
      activateTab((index + 1) % tabs.length, true);
      return;
    }

    if (key === "ArrowLeft") {
      event.preventDefault();
      activateTab((index - 1 + tabs.length) % tabs.length, true);
      return;
    }

    if (key === "Home") {
      event.preventDefault();
      activateTab(0, true);
      return;
    }

    if (key === "End") {
      event.preventDefault();
      activateTab(tabs.length - 1, true);
      return;
    }

    if (key === "Enter" || key === " ") {
      event.preventDefault();
      activateTab(index, true);
    }
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(index, true));
    tab.addEventListener("keydown", (event) => handleKeydown(event, index));
  });

  activateTab(0, false);
}
