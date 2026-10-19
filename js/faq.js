/**
 * Acordeão de perguntas frequentes (#duvidas): abre uma por vez,
 * acessível via aria-expanded.
 */
(function () {
  "use strict";

  const items = document.querySelectorAll(".faq-item");
  if (!items.length) return;

  items.forEach((item) => {
    const btn = item.querySelector(".faq-item__q");
    const sign = item.querySelector(".faq-item__sign");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");
      items.forEach((other) => {
        other.classList.remove("is-open");
        const otherBtn = other.querySelector(".faq-item__q");
        const otherSign = other.querySelector(".faq-item__sign");
        if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
        if (otherSign) otherSign.textContent = "+";
      });
      if (willOpen) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        if (sign) sign.textContent = "–";
      }
    });
  });
})();
