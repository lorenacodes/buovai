/**
 * Efeitos de apoio do arquivo de design: robô-guia que acompanha a rolagem,
 * robô-companheiro no rodapé (dorme/acorda) e os efeitos de magnetismo
 * (botões) e brilho de cursor (painéis data-glow). Tudo desativado sob
 * prefers-reduced-motion.
 */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Faíscas ----
  function spawnAt(el) {
    if (reduceMotion || !el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < 6; i++) {
      const s = document.createElement("span");
      s.textContent = "✦";
      const ang = (Math.PI * 2 * i) / 6 + Math.random() * 0.5;
      const dist = 26 + Math.random() * 18;
      s.style.cssText =
        "position:fixed;left:" + cx + "px;top:" + cy + "px;" +
        "font-size:" + (10 + Math.random() * 6) + "px;color:#defa9a;" +
        "pointer-events:none;z-index:4000;transition:transform .6s cubic-bezier(.16,.84,.24,1),opacity .6s;" +
        "transform:translate(-50%,-50%);opacity:1";
      document.body.appendChild(s);
      requestAnimationFrame(() => {
        s.style.transform =
          "translate(" + (Math.cos(ang) * dist - 50) + "%," + (Math.sin(ang) * dist - 50) + "%)";
        s.style.opacity = "0";
      });
      setTimeout(() => s.remove(), 650);
    }
  }
  window.buovaiSpawnSparks = spawnAt;

  // ---- Magnetismo + brilho de cursor ----
  function initFx() {
    const magnets = Array.from(document.querySelectorAll("[data-magnet]"));
    const glows = Array.from(document.querySelectorAll("[data-glow]"));
    if (reduceMotion || (!magnets.length && !glows.length)) return;

    magnets.forEach((el) => {
      el.style.transition = "transform .25s cubic-bezier(.16,.84,.24,1)";
    });

    window.addEventListener("mousemove", (e) => {
      magnets.forEach((el) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        const radius = Math.max(r.width, r.height) * 1.6 + 60;
        if (dist < radius) {
          const pull = (1 - dist / radius) * 0.32;
          el.style.transform = "translate(" + dx * pull + "px," + dy * pull + "px)";
        } else {
          el.style.transform = "";
        }
      });

      glows.forEach((el) => {
        const r = el.getBoundingClientRect();
        const inside =
          e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        if (inside) {
          el.style.setProperty("--gx", ((e.clientX - r.left) / r.width) * 100 + "%");
          el.style.setProperty("--gy", ((e.clientY - r.top) / r.height) * 100 + "%");
          el.classList.add("is-glowing");
        } else {
          el.classList.remove("is-glowing");
        }
      });
    });

    magnets.forEach((el) =>
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      })
    );
  }

  // ---- Robô-guia (anota a seção ativa e explica cada parte) ----
  function initGuide() {
    if (reduceMotion) return;

    const cfg = [
      ["Ponto de partida", "Aqui eu te mostro de onde parte o projeto.", false],
      ["Casos reais", "Esses são trabalhos que já entreguei.", false],
      ["Serviços", "O que posso fazer por você, na prática.", false],
      ["Como trabalho", "Arrasta a linha do tempo pra ver o processo.", true],
      ["Portal do cliente", "Cada cliente acompanha o projeto por aqui.", false],
      ["Quem faz", "Spoiler: sou eu, a Lorena.", true],
      ["Dúvidas", "Separei as perguntas mais comuns.", false],
      ["Contato", "Bora conversar sobre o seu projeto?", true],
    ];

    const sections = cfg
      .map(([label, msg, dark]) => {
        const el = document.querySelector('[data-screen-label="' + label + '"]');
        return el ? { el, label, msg, dark } : null;
      })
      .filter(Boolean);
    if (!sections.length) return;

    const wrap = document.createElement("div");
    wrap.className = "guide-bot";
    wrap.innerHTML =
      '<div class="guide-bot__bubble"><span class="guide-bot__text"></span></div>' +
      '<svg class="guide-bot__svg" width="40" height="40" viewBox="0 0 40 40" fill="none">' +
      '<rect class="g-head" x="8" y="12" width="24" height="18" rx="6" fill="#0e0f0b"/>' +
      '<line class="g-antL" x1="14" y1="12" x2="11" y2="4" stroke="#0e0f0b" stroke-width="2"/>' +
      '<line class="g-antR" x1="26" y1="12" x2="29" y2="4" stroke="#0e0f0b" stroke-width="2"/>' +
      '<circle cx="11" cy="4" r="2" fill="#defa9a"/><circle cx="29" cy="4" r="2" fill="#defa9a"/>' +
      '<g class="g-eyes"><circle cx="16" cy="21" r="2.4" fill="#defa9a"/><circle cx="24" cy="21" r="2.4" fill="#defa9a"/></g>' +
      '<rect class="g-lid" x="13" y="19" width="14" height="5" fill="#0e0f0b" opacity="0"/>' +
      "</svg>";
    document.body.appendChild(wrap);

    const canvas = document.createElement("canvas");
    canvas.className = "guide-bot__canvas";
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const bubbleText = wrap.querySelector(".guide-bot__text");
    let typeTimer = null;
    let current = -1;
    let lastY = window.scrollY;

    function typeMsg(msg) {
      clearTimeout(typeTimer);
      bubbleText.textContent = "";
      let i = 0;
      (function step() {
        bubbleText.textContent = msg.slice(0, i);
        i++;
        if (i <= msg.length) typeTimer = setTimeout(step, 22);
      })();
    }

    function drawBrackets(h) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!h) return;
      const r = h.getBoundingClientRect();
      const pad = 14;
      const x1 = r.left - pad;
      const y1 = r.top - pad;
      const x2 = r.right + pad;
      const y2 = r.bottom + pad;
      const len = 22;
      ctx.strokeStyle = "rgba(14,15,11,.55)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      [
        [x1, y1, [x1 + len, y1], [x1, y1 + len]],
        [x2, y1, [x2 - len, y1], [x2, y1 + len]],
        [x1, y2, [x1 + len, y2], [x1, y2 - len]],
        [x2, y2, [x2 - len, y2], [x2, y2 - len]],
      ].forEach(([cx, cy, a, b]) => {
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(cx, cy);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
      });
    }

    function update() {
      const mid = window.innerHeight * 0.4;
      let idx = 0;
      sections.forEach((s, i) => {
        const r = s.el.getBoundingClientRect();
        if (r.top <= mid) idx = i;
      });
      const s = sections[idx];
      wrap.classList.toggle("is-dark", !!s.dark);
      const heading = s.el.querySelector("h2, h3");
      drawBrackets(heading);

      if (idx !== current) {
        current = idx;
        typeMsg(s.msg);
      }

      const vy = window.scrollY - lastY;
      lastY = window.scrollY;
      const tilt = Math.max(-14, Math.min(14, vy * 0.6));
      wrap.querySelector(".guide-bot__svg").style.transform = "rotate(" + tilt + "deg)";
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();

    setInterval(() => {
      const lid = wrap.querySelector(".g-lid");
      lid.style.opacity = "1";
      setTimeout(() => (lid.style.opacity = "0"), 140);
    }, 3600 + Math.random() * 2000);

    wrap.addEventListener("click", () => {
      const next = sections[Math.min(current + 1, sections.length - 1)];
      next.el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // ---- Robô do rodapé (dorme até o rodapé aparecer, aí acorda e se despede) ----
  function initFooterBot() {
    const footer = document.querySelector("footer");
    const brandCol = footer && footer.querySelector("div[style*='flex:2']");
    const fab = document.querySelector(".fab");
    if (!footer || !brandCol) return;

    const bot = document.createElement("div");
    bot.className = "footer-bot";
    bot.innerHTML =
      '<div class="footer-bot__bubble"><span class="footer-bot__text"></span></div>' +
      '<svg width="34" height="34" viewBox="0 0 40 40" fill="none">' +
      '<rect class="f-head" x="8" y="12" width="24" height="18" rx="6" fill="#fffceb"/>' +
      '<line class="f-antL" x1="14" y1="12" x2="11" y2="4" stroke="#fffceb" stroke-width="2"/>' +
      '<line class="f-antR" x1="26" y1="12" x2="29" y2="4" stroke="#fffceb" stroke-width="2"/>' +
      '<g class="f-eyes"><circle cx="16" cy="21" r="2.4" fill="#1f4905"/><circle cx="24" cy="21" r="2.4" fill="#1f4905"/></g>' +
      '<rect class="f-lid" x="13" y="19" width="14" height="5" fill="#fffceb" opacity="0"/>' +
      "</svg>" +
      '<span class="footer-bot__z">z</span>';
    brandCol.appendChild(bot);

    const lines = [
      "Obrigada por chegar até aqui!",
      "Se travar em algo, me chama.",
      "Até a próxima — bora construir?",
      "Esse robô aqui é só decoração... ou será?",
    ];

    let awake = false;
    const zTimer = setInterval(() => {
      if (!awake) bot.classList.toggle("is-z2");
    }, 1200);

    function wake() {
      if (awake) return;
      awake = true;
      clearInterval(zTimer);
      bot.classList.add("is-awake");

      let scene = 0;
      try {
        scene = (parseInt(localStorage.getItem("buov-foot-scene") || "0", 10) + 1) % 4;
        localStorage.setItem("buov-foot-scene", String(scene));
      } catch (e) {}

      if (!reduceMotion) {
        bot.classList.add("scene-" + scene);
        if (scene === 1 && window.buovaiSpawnSparks) {
          setTimeout(() => window.buovaiSpawnSparks(bot), 400);
        }
      }

      const text = lines[scene] || lines[0];
      const bubbleText = bot.querySelector(".footer-bot__text");
      if (reduceMotion) {
        bubbleText.textContent = text;
        return;
      }
      let i = 0;
      (function step() {
        bubbleText.textContent = text.slice(0, i);
        i++;
        if (i <= text.length) setTimeout(step, 24);
      })();
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            wake();
            if (fab) fab.style.opacity = "0";
          } else if (fab) {
            fab.style.opacity = "1";
          }
        });
      },
      { threshold: 0.25 }
    );
    obs.observe(footer);
  }

  initFx();
  initGuide();
  initFooterBot();
})();
