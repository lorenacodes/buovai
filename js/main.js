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

  // ---- Modal "Área do cliente": porte literal de loginOpen/loginAsCli/
  // loginAsAdm/loginForm/loginSent/loginMagic/loginSubmit do arquivo
  // original. Autenticação real (Supabase Auth) embutida no próprio
  // modal — mesma lógica de painel/login.html (signInWithPassword/
  // signInWithOtp + rpc is_admin), mas sem navegar para nenhuma outra
  // página até o login funcionar. Cliente autenticado vai para
  // painel/portal.html (porte real, com banco de dados, do "Buov
  // Portal v2.dc.html" enviado). ----
  const loginModal = document.getElementById("loginModal");
  const portalBtn = document.getElementById("portalBtn");
  if (loginModal && portalBtn && window.buovaiClient) {
    const headEl = document.getElementById("loginModalHead");
    const clientBtn = document.getElementById("loginRoleClient");
    const adminBtn = document.getElementById("loginRoleAdmin");
    const closeBtn = document.getElementById("loginModalClose");
    const skipLink = document.getElementById("loginModalSkip");
    const formEl = document.getElementById("loginForm");
    const sentView = document.getElementById("loginSentView");
    const sentEmailEl = document.getElementById("loginSentEmail");
    const backBtn = document.getElementById("loginBackBtn");
    const emailEl = document.getElementById("loginEmail");
    const passEl = document.getElementById("loginPass");
    const passField = document.getElementById("loginPassField");
    const otpHint = document.getElementById("loginOtpHint");
    const toggleOtpBtn = document.getElementById("loginToggleOtp");
    const errEl = document.getElementById("loginErr");
    const submitBtn = document.getElementById("loginSubmitBtn");
    const googleBtn = document.getElementById("loginGoogleBtn");
    const passToggleBtn = document.getElementById("loginPassToggle");

    // Botão de olho pra ver a senha enquanto digita (pedido da Lorena).
    if (passToggleBtn) {
      const openIcon = passToggleBtn.querySelector("[data-eye-open]");
      const closedIcon = passToggleBtn.querySelector("[data-eye-closed]");
      passToggleBtn.addEventListener("click", () => {
        const show = passEl.type === "password";
        passEl.type = show ? "text" : "password";
        openIcon.hidden = show;
        closedIcon.hidden = !show;
        passToggleBtn.setAttribute("aria-label", show ? "Ocultar senha" : "Mostrar senha");
        passToggleBtn.setAttribute("aria-pressed", String(show));
      });
    }

    let role = "client";
    let otpMode = false;

    function setRole(r) {
      role = r;
      const isAdmin = role === "admin";
      headEl.textContent = isAdmin ? "Entre no painel de administração." : "Entre para acompanhar o seu projeto.";
      clientBtn.style.background = isAdmin ? "transparent" : "#0e0f0b";
      clientBtn.style.color = isAdmin ? "#0e0f0b" : "#fffceb";
      adminBtn.style.background = isAdmin ? "#0e0f0b" : "transparent";
      adminBtn.style.color = isAdmin ? "#fffceb" : "#0e0f0b";
    }

    // Alterna entre "entrar com senha" e "primeiro acesso por link de
    // e-mail" — mesmo padrão já usado em painel/login.html. Resolve a
    // confusão de ter o campo de senha visível junto do link de acesso
    // (pedido da Lorena: quem clica em "primeiro acesso" deve só
    // preencher o e-mail, sem parecer que senha é obrigatória).
    function setOtpMode(on) {
      otpMode = on;
      passField.style.display = on ? "none" : "flex";
      passEl.required = false;
      otpHint.style.display = on ? "block" : "none";
      submitBtn.textContent = on ? "Enviar link por e-mail" : "Entrar";
      toggleOtpBtn.textContent = on ? "Já tem senha? Entrar com e-mail e senha" : "Primeiro acesso ou esqueceu a senha? Entre por link de e-mail";
    }

    function showForm() {
      sentView.style.display = "none";
      formEl.style.display = "flex";
    }
    function showSent(email) {
      sentEmailEl.textContent = email;
      sentView.style.display = "flex";
      formEl.style.display = "none";
    }
    function showErr(msg) {
      errEl.textContent = msg;
      errEl.style.display = "block";
    }
    function clearErr() {
      errEl.style.display = "none";
    }

    function openModal() {
      setRole("client");
      setOtpMode(false);
      showForm();
      clearErr();
      formEl.reset();
      if (passToggleBtn && passEl.type === "text") passToggleBtn.click();
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
    toggleOtpBtn.addEventListener("click", () => { setOtpMode(!otpMode); clearErr(); });
    backBtn.addEventListener("click", () => { showForm(); clearErr(); });
    emailEl.addEventListener("input", clearErr);
    passEl.addEventListener("input", clearErr);
    loginModal.addEventListener("click", (e) => {
      if (e.target === loginModal) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && loginModal.style.display === "flex") closeModal();
    });

    async function goToPanel() {
      window.location.href = "painel/portal.html";
    }

    formEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = emailEl.value.trim();

      if (otpMode) {
        if (!email.includes("@")) {
          showErr("Preencha o e-mail.");
          return;
        }
        clearErr();
        submitBtn.disabled = true;
        submitBtn.textContent = "Verificando...";

        // Só manda o link se esse e-mail já foi liberado por um
        // administrador (tabela clients ou admins) — sem isso, qualquer
        // e-mail digitado criava uma conta nova sozinho (pedido da
        // Lorena: mostrar claramente que o acesso precisa já existir).
        const { data: hasAccess, error: checkError } = await window.buovaiClient.rpc("email_has_access", { p_email: email });

        if (checkError) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Enviar link por e-mail";
          showErr("Não foi possível verificar o acesso agora. Tente de novo em instantes.");
          return;
        }

        if (!hasAccess) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Enviar link por e-mail";
          showErr("Esse e-mail ainda não tem acesso liberado. Peça para quem administra o seu projeto te adicionar.");
          return;
        }

        const redirectTo = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "/painel/set-password.html");
        const { error } = await window.buovaiClient.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
        submitBtn.disabled = false;
        submitBtn.textContent = "Enviar link por e-mail";
        if (error) {
          showErr("Não foi possível enviar o link agora. Tente de novo em instantes.");
          return;
        }
        showSent(email);
        return;
      }

      const pass = passEl.value;
      if (!email || !pass) {
        showErr("Preencha e-mail e senha.");
        return;
      }
      clearErr();
      submitBtn.disabled = true;
      submitBtn.textContent = "Entrando...";
      const { error } = await window.buovaiClient.auth.signInWithPassword({ email, password: pass });
      submitBtn.disabled = false;
      submitBtn.textContent = "Entrar";
      if (error) {
        showErr("E-mail ou senha incorretos.");
        return;
      }
      await goToPanel();
    });

    googleBtn.addEventListener("click", async () => {
      googleBtn.disabled = true;
      const redirectTo = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "/painel/portal.html");
      const { error } = await window.buovaiClient.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
      if (error) {
        googleBtn.disabled = false;
        showErr("Login com Google ainda não está disponível. Use e-mail e senha, ou o link de acesso.");
      }
    });

    // Se já tem sessão ativa, nem precisa abrir o modal de login —
    // manda direto pro painel certo ao clicar.
    window.buovaiClient.auth.getSession().then((res) => {
      if (!res.data.session) return;
      portalBtn.removeEventListener("click", openModal);
      portalBtn.addEventListener("click", (e) => {
        e.preventDefault();
        goToPanel();
      });
    });
  }
})();
