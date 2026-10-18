/**
 * Entrada do mockup do hero: quando o card fica visível, os números do
 * "Visão geral" sobem de 0 até o valor final. Puramente decorativo — o
 * texto final já está no HTML, então sem JS (ou com prefers-reduced-motion)
 * os valores corretos aparecem direto, sem animação.
 */
(function () {
  "use strict";

  const demo = document.querySelector(".hero__demo");
  if (!demo) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  function animateCounters() {
    demo.querySelectorAll(".hero__mock-stat-value").forEach((el) => {
      const target = el.textContent.trim();
      const numeric = parseInt(target.replace(/[^\d]/g, ""), 10);
      if (!numeric) return;
      const prefix = (target.match(/^[^\d]*/) || [""])[0];
      const duration = 1100;
      const start = performance.now();

      function tick(now) {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const current = Math.round(numeric * eased);
        el.textContent = prefix + current.toLocaleString("pt-BR");
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
    });
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(animateCounters, 620);
          obs.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );
  observer.observe(demo);
})();
