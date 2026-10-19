/**
 * Acordeão de perguntas frequentes (#duvidas): abre uma por vez,
 * acessível via aria-expanded. O arquivo original é estático (fatia de
 * React com estado embutido); aqui é só a abertura/fechamento em JS puro.
 */
(function () {
  "use strict";

  const items = document.querySelectorAll(".faq-item");
  if (!items.length) return;

  function close(item) {
    const a = item.querySelector(".faq-a");
    const btn = item.querySelector(".faq-q");
    const sign = item.querySelector(".faq-sign");
    if (a) a.style.maxHeight = "0";
    if (btn) btn.setAttribute("aria-expanded", "false");
    if (sign) sign.textContent = "+";
  }

  function open(item) {
    const a = item.querySelector(".faq-a");
    const btn = item.querySelector(".faq-q");
    const sign = item.querySelector(".faq-sign");
    if (a) a.style.maxHeight = a.scrollHeight + "px";
    if (btn) btn.setAttribute("aria-expanded", "true");
    if (sign) sign.textContent = "–";
  }

  items.forEach((item) => {
    const btn = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    if (a) a.style.transition = "max-height 320ms cubic-bezier(.16,.84,.24,1)";
    if (!btn) return;

    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      items.forEach(close);
      if (!isOpen) open(item);
    });
  });
})();
