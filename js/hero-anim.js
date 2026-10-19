/**
 * Hero: título com revelação por palavra, loop de texto digitado
 * ("//construindo: ..."), robô com olhos/antenas que reagem ao cursor, e
 * fundo "satin" (manchas de gradiente verde em movimento suave). Tudo
 * decorativo e desligado por completo em prefers-reduced-motion (exceto o
 * loop de texto, que é só troca de conteúdo, não movimento).
 */
(function () {
  "use strict";

  const panel = document.getElementById("heroPanel");
  if (!panel) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const WORDS = ["sistemas internos", "portais para clientes", "automações", "integrações", "sites profissionais", "migração de sistemas"];
  const typedEl = document.getElementById("heroTyped");

  // ---- Palavra a palavra no título ----
  const accentEl = document.getElementById("heroAccent");
  if (accentEl) {
    const words = accentEl.textContent.trim().split(/\s+/);
    accentEl.innerHTML = words.map((w, i) => `<span class="word" style="--i:${i}">${w}</span>`).join(" ");
  }
  requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add("is-ready")));

  // ---- Loop de texto digitado ----
  let wi = 0, ci = 0, deleting = false, typeTimer = null;
  function tick() {
    const word = WORDS[wi];
    let delay = deleting ? 35 : 70;
    if (!deleting && ci < word.length) {
      ci++;
    } else if (!deleting) {
      deleting = true;
      delay = 1800;
    } else if (ci > 0) {
      ci--;
    } else {
      deleting = false;
      wi = (wi + 1) % WORDS.length;
      delay = 300;
    }
    if (typedEl) typedEl.textContent = word.slice(0, ci);
    typeTimer = setTimeout(tick, delay);
  }
  if (typedEl) typeTimer = setTimeout(tick, 500);

  // ---- Fundo "satin": manchas de gradiente verde que derivam suavemente ----
  const blobsHost = document.getElementById("heroBlobs");
  const BLOB_DEFS = [
    { color: "#defa9a", size: 46, k: 0.08 },
    { color: "#94ab86", size: 75, k: 0.045 },
    { color: "#457528", size: 70, k: 0.03 },
    { color: "#3f5204", size: 80, k: 0.018 },
  ];
  const blobEls = [];
  if (blobsHost) {
    BLOB_DEFS.forEach((b) => {
      const el = document.createElement("div");
      el.className = "hero__blob";
      el.style.width = b.size + "vmax";
      el.style.height = b.size + "vmax";
      el.style.marginLeft = -b.size / 2 + "vmax";
      el.style.marginTop = -b.size / 2 + "vmax";
      el.style.background = `radial-gradient(circle, ${b.color} 0%, ${b.color}cc 35%, ${b.color}00 70%)`;
      blobsHost.appendChild(el);
      blobEls.push({ el, x: 0, y: 0, k: b.k });
    });
  }

  // ---- Robô: olhos/antenas reagem ao cursor; clique reinicia a entrada ----
  const bot = document.getElementById("heroBot");
  const botEyes = document.getElementById("botEyes");
  const botLid = document.getElementById("botLid");
  const botHead = document.getElementById("botHead");
  const botAntL = document.getElementById("botAntL");
  const botAntR = document.getElementById("botAntR");

  if (reduceMotion) {
    if (blobEls.length) {
      blobEls.forEach((b, i) => {
        b.el.style.left = (20 + i * 22) + "%";
        b.el.style.top = (30 + i * 15) + "%";
      });
    }
    return;
  }

  const state = {
    tx: 0, ty: 0, x: 0, y: 0, init: false,
    ex: 0, ey: 0, tilt: 0, aL: 0, aLv: 0, aR: 0, aRv: 0,
    nextBlink: performance.now() + 2500,
    live: 0,
  };
  let panelRect = panel.getBoundingClientRect();
  function refreshRect() { panelRect = panel.getBoundingClientRect(); }
  window.addEventListener("resize", refreshRect, { passive: true });

  panel.addEventListener("pointermove", (e) => {
    state.tx = e.clientX - panelRect.left;
    state.ty = e.clientY - panelRect.top;
    state.live = performance.now();
  }, { passive: true });

  panel.addEventListener("pointerleave", () => { state.live = 0; });

  let burstAt = -1e9;
  if (bot) {
    bot.addEventListener("click", () => {
      burstAt = performance.now();
      clearTimeout(typeTimer);
      wi = 0; ci = 0; deleting = false;
      typeTimer = setTimeout(tick, 300);
      state.nextBlink = performance.now();
    });
  }

  let raf = null;
  function frame(now) {
    const W = panelRect.width, H = panelRect.height;
    const isLive = now - state.live < 3000;

    if (!isLive) {
      const t = now / 1000;
      state.tx = W * (0.5 + 0.32 * Math.sin(t * 0.27));
      state.ty = H * (0.42 + 0.28 * Math.sin(t * 0.41 + 1));
    }
    if (!state.init) { state.x = state.tx; state.y = state.ty; state.init = true; }
    state.x += (state.tx - state.x) * 0.2;
    state.y += (state.ty - state.y) * 0.2;

    blobEls.forEach((b, i) => {
      const gx = i === 0 ? state.x : (i % 2 ? W - state.x * 0.6 : W * 0.72 + state.x * 0.18) + Math.cos(now / 4200 + i * 2) * W * 0.18;
      const gy = i === 0 ? state.y : (i % 2 ? H - state.y * 0.5 : state.y * 0.8) + Math.sin(now / 5200 + i * 1.7) * H * 0.22;
      b.x += (gx - b.x) * b.k;
      b.y += (gy - b.y) * b.k;
      b.el.style.transform = `translate(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px)`;
    });

    if (bot) {
      const br = bot.getBoundingClientRect();
      const cx = br.left - panelRect.left + br.width / 2;
      const cy = br.top - panelRect.top + br.height * 0.5;
      const dx = state.x - cx, dy = state.y - cy;
      const d = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, d / 260);
      state.ex += ((dx / d) * 22 * reach - state.ex) * 0.2;
      state.ey += ((dy / d) * 16 * reach - state.ey) * 0.2;
      state.tilt += (Math.max(-10, Math.min(10, dx / 40)) - state.tilt) * 0.08;

      const bt = now - burstAt;
      const bounce = bt < 600 ? Math.sin((bt / 600) * Math.PI) * -12 : 0;

      if (botEyes) botEyes.setAttribute("transform", `translate(${state.ex.toFixed(2)}, ${state.ey.toFixed(2)})`);
      if (botHead) botHead.style.transform = `translateY(${bounce}px) rotate(${state.tilt.toFixed(2)}deg)`;
      if (botAntL) botAntL.style.transform = `rotate(${Math.max(-25, Math.min(25, -dx / 40)).toFixed(2)}deg)`;
      if (botAntR) botAntR.style.transform = `rotate(${Math.max(-25, Math.min(25, -dx / 40)).toFixed(2)}deg)`;

      let lid = 1;
      if (now > state.nextBlink) {
        const p = (now - state.nextBlink) / 160;
        if (p >= 1) state.nextBlink = now + 2400 + Math.random() * 3200;
        else lid = Math.abs(1 - 2 * p);
      }
      if (bt < 300) lid = Math.min(lid, Math.abs(1 - (2 * bt) / 300));
      if (botLid) botLid.setAttribute("transform", `translate(0 300) scale(1 ${Math.max(0.08, lid).toFixed(3)}) translate(0 -300)`);
    }

    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
})();
