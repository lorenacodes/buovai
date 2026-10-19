/**
 * Interações gerais que não fazem parte do arquivo de design em si:
 * reveal-on-scroll (o mockup é estático, isso só suaviza a rolagem) e o
 * ano corrente no rodapé.
 */
(function () {
  "use strict";

  // ---- Reveal on scroll ----
  const revealTargets = document.querySelectorAll("[data-reveal]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
  );
  revealTargets.forEach((el) => observer.observe(el));

  // Exposto para elementos renderizados dinamicamente (cards do portfólio)
  window.buovaiReveal = function (elements) {
    elements.forEach((el) => {
      el.setAttribute("data-reveal", "");
      requestAnimationFrame(() => observer.observe(el));
    });
  };

  // ---- Ano corrente ----
  const yearEl = document.getElementById("current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
