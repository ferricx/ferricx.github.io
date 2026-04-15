import "./components/form-group/form-group.js";
import "./components/popover-tip/popover-tip.js";
import "./components/error-summary/error-summary.js";

// Wrap details content for grid-template-rows animation
document.querySelectorAll(".tab-navigation details").forEach(details => {
  const children = Array.from(details.children).filter(el => el.tagName.toLowerCase() !== "summary");
  if (!children.length) return;
  const wrapper = document.createElement("div");
  wrapper.className = "details-body";
  children.forEach(el => wrapper.appendChild(el));
  details.appendChild(wrapper);
});

const closeWithAnimation = (details) => {
  if (!details.open) return;
  // Instantly close any nested open details before animating parent closed
  details.querySelectorAll('details[open]').forEach(child => {
    child.open = false;
    child.removeAttribute('data-closing');
  });
  const body = details.querySelector(':scope > .details-body');
  if (!body) { details.open = false; return; }
  details.setAttribute('data-closing', '');
  body.addEventListener('transitionend', () => {
    details.open = false;
    details.removeAttribute('data-closing');
  }, { once: true });
};

document.querySelectorAll('.tab-navigation summary').forEach(summary => {
  summary.addEventListener('click', e => {
    e.preventDefault();
    const details = summary.closest('details');
    if (details.open || details.hasAttribute('data-closing')) {
      closeWithAnimation(details);
    } else {
      // Accordion: instantly close top-level siblings
      const panel = details.closest('[role="tabpanel"]');
      if (panel && details.parentElement === panel) {
        panel.querySelectorAll(':scope > details[open], :scope > details[data-closing]').forEach(sibling => {
          if (sibling !== details) {
            sibling.open = false;
            sibling.removeAttribute('data-closing');
          }
        });
      }
      details.open = true;
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
