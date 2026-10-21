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

  // ---- CTA do header: só aparece depois que o hero sai de vista,
  // igual a onScrollNav/showNavCta do arquivo original ----
  const navCta = document.getElementById("navCta");
  const heroEl = document.getElementById("inicio");
  if (navCta && heroEl) {
    let shown = false;
    const onScrollNav = () => {
      const past = heroEl.getBoundingClientRect().bottom < 80;
      if (past === shown) return;
      shown = past;
      if (past) {
        navCta.style.display = "";
        navCta.style.animation = "modIn .4s cubic-bezier(.16,.84,.24,1) both";
      } else {
        navCta.style.display = "none";
      }
    };
    window.addEventListener("scroll", onScrollNav, { passive: true });
    onScrollNav();
  }

  // ---- Modal "Área do cliente": porte de loginOpen/loginAsCli/loginAsAdm
  // do arquivo original, ligado à página real de login (painel/login.html)
  // em vez do preview do arquivo de design ----
  const loginModal = document.getElementById("loginModal");
  const portalBtn = document.getElementById("portalBtn");
  if (loginModal && portalBtn) {
    const headEl = document.getElementById("loginModalHead");
    const enterEl = document.getElementById("loginModalEnter");
    const clientBtn = document.getElementById("loginRoleClient");
    const adminBtn = document.getElementById("loginRoleAdmin");
    const closeBtn = document.getElementById("loginModalClose");
    const skipLink = document.getElementById("loginModalSkip");

    function setRole(role) {
      const isAdmin = role === "admin";
      headEl.textContent = isAdmin ? "Entre no painel de administração." : "Entre para acompanhar o seu projeto.";
      enterEl.href = isAdmin ? "painel/login.html?as=admin" : "painel/login.html";
      clientBtn.style.background = isAdmin ? "transparent" : "#0e0f0b";
      clientBtn.style.color = isAdmin ? "#0e0f0b" : "#fffceb";
      adminBtn.style.background = isAdmin ? "#0e0f0b" : "transparent";
      adminBtn.style.color = isAdmin ? "#fffceb" : "#0e0f0b";
    }

    function openModal() {
      setRole("client");
      loginModal.style.display = "flex";
    }
    function closeModal() {
      loginModal.style.display = "none";
    }

    portalBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    skipLink.addEventListener("click", closeModal);
    clientBtn.addEventListener("click", () => setRole("client"));
    adminBtn.addEventListener("click", () => setRole("admin"));
    loginModal.addEventListener("click", (e) => {
      if (e.target === loginModal) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && loginModal.style.display === "flex") closeModal();
    });
  }
})();
