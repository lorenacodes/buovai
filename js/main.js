/**
 * Interações gerais de UI: header on scroll, menu mobile, smooth-scroll,
 * reveal-on-scroll e ano corrente no rodapé.
 */
(function () {
  "use strict";

  // ---- Tema claro/escuro ----
  var THEME_KEY = "buovai-theme";
  var root = document.documentElement;
  var themeToggle = document.getElementById("theme-toggle");

  function applyTheme(theme) {
    if (theme === "light" || theme === "dark") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
  }

  var savedTheme = null;
  try {
    savedTheme = localStorage.getItem(THEME_KEY);
  } catch (e) {
    /* localStorage indisponível (modo privado) — segue o tema do sistema */
  }
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      var current = root.getAttribute("data-theme") || (prefersDark ? "dark" : "light");
      var next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {
        /* silencioso */
      }
    });
  }

  // ---- Header on scroll ----
  const header = document.getElementById("site-header");
  const onScroll = () => {
    if (window.scrollY > 24) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

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
})();
