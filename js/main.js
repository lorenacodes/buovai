/**
 * Interações gerais de UI: header on scroll, menu mobile, smooth-scroll,
 * reveal-on-scroll e ano corrente no rodapé.
 */
(function () {
  "use strict";

  // ---- Config única de contato/identidade (ver js/site-config.js) ----
  const cfg = window.BUOVAI_SITE;
  if (cfg) {
    document.querySelectorAll('[data-site-field="name"]').forEach((el) => { el.textContent = cfg.name; });
    document.querySelectorAll('[data-site-field="title"]').forEach((el) => {
      if (cfg.title) { el.textContent = cfg.title; el.hidden = false; }
      else { el.hidden = true; }
    });
    document.querySelectorAll('[data-site-field="phone-display"]').forEach((el) => { el.textContent = cfg.phoneDisplay; });
    document.querySelectorAll('[data-site-field="email"]').forEach((el) => { el.textContent = cfg.email; });
    document.querySelectorAll('[data-site-href="whatsapp"]').forEach((el) => { el.href = cfg.whatsappUrl; });
    document.querySelectorAll('[data-site-href="email"]').forEach((el) => { el.href = "mailto:" + cfg.email; });
  }

  // ---- Header on scroll ----
  const header = document.getElementById("site-header");
  const onScroll = () => {
    if (window.scrollY > 24) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // ---- Altura real do header, exposta como --header-h pro hero calcular
  // a própria altura sem recorrer a um min-height arbitrário ----
  const setHeaderHeight = () => {
    document.documentElement.style.setProperty("--header-h", `${header.getBoundingClientRect().height}px`);
  };
  setHeaderHeight();
  window.addEventListener("resize", setHeaderHeight, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(setHeaderHeight);

  // ---- Menu mobile ----
  const toggle = document.getElementById("nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const isOpen = header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        header.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

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
    { threshold: 0.14, rootMargin: "0px 0px -60px 0px" }
  );
  revealTargets.forEach((el) => observer.observe(el));

  // Exposto para elementos renderizados dinamicamente (ex: cards do portfólio)
  window.buovaiReveal = function (elements) {
    elements.forEach((el, i) => {
      el.setAttribute("data-reveal", "");
      el.style.setProperty("--reveal-delay", `${i * 90}ms`);
      requestAnimationFrame(() => observer.observe(el));
    });
  };

  // ---- Ano corrente ----
  const yearEl = document.getElementById("current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- WhatsApp flutuante: mensagem automática com saudação por horário ----
  const whatsappFab = document.querySelector(".whatsapp-fab");
  if (whatsappFab) {
    const hour = new Date().getHours();
    let saudacao;
    if (hour >= 5 && hour < 12) saudacao = "Bom dia";
    else if (hour >= 12 && hour < 18) saudacao = "Boa tarde";
    else saudacao = "Boa noite";

    const mensagem =
      `${saudacao}! Encontrei seu site e gostaria de conversar sobre o desenvolvimento de um sistema ou site.\n\n` +
      `Quero entender melhor como você trabalha e como poderia me ajudar no meu caso.`;

    const numero = (cfg && cfg.phoneDigits) || "5579998289485";
    whatsappFab.href = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
  }
})();
