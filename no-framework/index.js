import "./components/form-group/form-group.js";
import "./components/popover-tip/popover-tip.js";

const root = document.querySelector(".tab-navigation");

if (root) {
  const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
  const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));

  const activateTab = (index, moveFocus) => {
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
