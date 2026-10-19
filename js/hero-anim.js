/**
 * Hero: réplica fiel da animação de entrada do protótipo (dissolver em
 * mosaico tipo "planilha" revelando título + robô), loop de texto digitado
 * ("//construindo: ..."), robô com olhos/antenas que reagem ao cursor e
 * faíscas ao clicar, e fundo "satin" (manchas de gradiente em movimento
 * suave atrás do cursor). Tudo decorativo; a dissolução e o restante das
 * animações contínuas são desligadas por completo em prefers-reduced-motion
 * (o conteúdo aparece direto, sem dissolver) — só o loop de texto digitado
 * continua (é troca de conteúdo, não movimento).
 */
(function () {
  "use strict";

  const panel = document.getElementById("heroPanel");
  if (!panel) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const WORDS = ["sistemas internos", "portais para clientes", "automações", "integrações", "sites profissionais", "migração de sistemas"];
  const typedEl = document.getElementById("heroTyped");

  // ---- Palavra a palavra no título (estado inicial escondido via CSS) ----
  const accentEl = document.getElementById("heroAccent");
  let wordEls = [];
  if (accentEl) {
    const words = accentEl.textContent.trim().split(/\s+/);
    accentEl.innerHTML = words.map((w) => `<span class="word">${w}</span>`).join(" ");
    wordEls = Array.from(accentEl.querySelectorAll(".word"));
  }

  function showWordsImmediately() {
    wordEls.forEach((el) => {
      el.style.opacity = 1;
      el.style.transform = "none";
      el.style.clipPath = "inset(-10% -6% -30% -6%)";
    });
  }

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
  function restartTyping(delay) {
    clearTimeout(typeTimer);
    wi = 0; ci = 0; deleting = false;
    if (typedEl) typedEl.textContent = "";
    typeTimer = setTimeout(tick, delay);
  }

  // ---- Fundo "satin": manchas de gradiente verde que derivam suavemente ----
  const blobsHost = document.getElementById("heroBlobs");
  const BLOB_DEFS = [
    { color: "#defa9a", size: 46, k: 0.1 },
    { color: "#94ab86", size: 75, k: 0.05 },
    { color: "#457528", size: 70, k: 0.035 },
    { color: "#3f5204", size: 80, k: 0.02 },
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

  // ---- Faíscas (✦) voando a partir de um ponto ----
  const sparkHost = document.getElementById("heroSparks");
  function spawnSparks(n, originX, originY, fromBot) {
    if (!sparkHost) return;
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.textContent = "✦";
      const ang = Math.random() * Math.PI * 2;
      const dist = fromBot ? 80 + Math.random() * 160 : 10 + Math.random() * 30;
      const size = 10 + Math.random() * (fromBot ? 22 : 12);
      const col = Math.random() < 0.7 ? "#fffceb" : "#defa9a";
      s.style.left = originX + "px";
      s.style.top = originY + "px";
      s.style.fontSize = size + "px";
      s.style.color = col;
      s.style.transform = "translate(-50%, -50%)";
      s.style.transition = "transform 1.1s cubic-bezier(.2,.7,.2,1), opacity 1.1s ease";
      s.style.opacity = "1";
      sparkHost.appendChild(s);
      requestAnimationFrame(() => {
        const dx = Math.cos(ang) * dist;
        const dy = Math.sin(ang) * dist - 20;
        const rot = Math.random() * 180 - 90;
        s.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rot}deg) scale(.3)`;
        s.style.opacity = "0";
      });
      setTimeout(() => s.remove(), 1200);
    }
  }

  // ---- Robô ----
  const botSlide = document.getElementById("heroBotSlide");
  const bot = document.getElementById("heroBot");
  const botEyes = document.getElementById("botEyes");
  const botLid = document.getElementById("botLid");
  const botHead = document.getElementById("botHead");
  const botAntL = document.getElementById("botAntL");
  const botAntR = document.getElementById("botAntR");
  const slotEl = document.getElementById("heroSlot");
  const starEl = document.getElementById("heroStar");
  const coverCanvas = document.getElementById("heroCover");

  // ---- Reduced motion: mostra tudo pronto, sem dissolver, sem cursor-tracking ----
  if (reduceMotion) {
    showWordsImmediately();
    if (bot) bot.style.transform = "scale(1)";
    if (starEl) { starEl.style.opacity = "0.85"; }
    if (coverCanvas) coverCanvas.style.display = "none";
    if (blobEls.length) {
      blobEls.forEach((b, i) => {
        b.el.style.left = 20 + i * 22 + "%";
        b.el.style.top = 30 + i * 15 + "%";
      });
    }
    if (typedEl) typeTimer = setTimeout(tick, 500);
    if (bot) {
      bot.addEventListener("click", () => restartTyping(300));
    }
    return;
  }

  const intro0 = performance.now();
  let panelRect = panel.getBoundingClientRect();
  function refreshRect() { panelRect = panel.getBoundingClientRect(); trace = null; traceDone = false; }
  window.addEventListener("resize", refreshRect, { passive: true });

  const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const easeOutExpo = (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
  const easeInCubic = (p) => p * p * p;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  // ---- Monta a malha de "ladrilhos" (estado atual) e os "slots" de destino
  // (onde o título/robô vão aparecer) — um mosaico tipo planilha que se
  // desfaz revelando o conteúdo real. ----
  function buildTrace() {
    const W = panelRect.width, H = panelRect.height;
    if (!W || !H || !coverCanvas) return null;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    coverCanvas.width = W * dpr;
    coverCanvas.height = H * dpr;
    const ctx = coverCanvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cw = 120, ch = 34, tiles = [];
    for (let y = 0, r = 0; y < H; y += ch, r++) {
      for (let x = 0, c = 0; x < W; x += cw, c++) tiles.push({ x, y, w: cw, h: ch, r, c });
    }
    const layout = W < 700
      ? [[0.04, 0.05, 0.92, 0.06], [0.04, 0.14, 0.92, 0.16], [0.04, 0.33, 0.44, 0.2], [0.52, 0.33, 0.44, 0.2], [0.04, 0.56, 0.92, 0.38]]
      : [[0.03, 0.05, 0.94, 0.055], [0.03, 0.14, 0.13, 0.8], [0.19, 0.14, 0.245, 0.17], [0.455, 0.14, 0.245, 0.17], [0.72, 0.14, 0.25, 0.17], [0.19, 0.35, 0.51, 0.59], [0.72, 0.35, 0.25, 0.59]];
    const blocks = layout.map(([x, y, w, h]) => ({ x: x * W, y: y * H, w: w * W, h: h * H }));
    const area = blocks.reduce((s, b) => s + b.w * b.h, 0);
    const N = tiles.length;
    const s = Math.sqrt(area / N) * 1.06;
    const slots = [];
    blocks.forEach((b, bi) => {
      const cols = Math.max(1, Math.round(b.w / s));
      const rows = Math.max(1, Math.round(b.h / s));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) slots.push({ x: b.x + (c * b.w) / cols, y: b.y + (r * b.h) / rows, w: b.w / cols, h: b.h / rows, bi });
      }
    });
    const key = (o) => o.y * 4 + (o.x / W) * H;
    const ts = tiles.slice().sort((a, b) => key(a) - key(b));
    const ss = slots.slice().sort((a, b) => key(a) - key(b));
    const diag = Math.hypot(W, H);
    ts.forEach((t) => {
      t.slot = ss.length ? ss[Math.floor((ts.indexOf(t) * ss.length) / Math.max(ss.length, N))] : null;
      t.d = (Math.hypot(t.x, H - t.y) / diag) * 800 + Math.random() * 220;
    });
    return { ctx, W, H, tiles: ts };
  }

  let trace = null;
  let traceDone = false;

  function drawDissolve(now) {
    const T = now - intro0;
    const t = T - 2800;
    const cover = coverCanvas;
    if (!trace && !traceDone) trace = buildTrace();
    const P = trace;
    if (!P || !cover || traceDone) return;

    const ctx = P.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const dpr = ctx.canvas.width / P.W;
    const zp = clamp01((t - 3000) / 1000);
    const z = 1 + easeInCubic(zp) * 0.35;
    const za = 1 - easeInOut(zp);
    ctx.setTransform(dpr * z, 0, 0, dpr * z, (dpr * P.W) / 2 * (1 - z), dpr * P.H * 0.45 * (1 - z));

    const head = 1 - clamp01(t / 450);
    const scanX = -200 + easeOutExpo(clamp01((t - 2350) / 650)) * (P.W + 400);
    const scanOn = t > 2350 && t < 3100;
    ctx.font = "400 10px 'Lexend Exa', sans-serif";
    ctx.textBaseline = "middle";

    for (const q of P.tiles) {
      const lift = easeOutExpo(clamp01((t - q.d) / 350));
      const mv = easeOutExpo(clamp01((t - q.d - 350) / 900));
      const sl = q.slot;
      const sh = 1 - 0.14 * lift * (1 - mv);
      const cx0 = q.x + q.w / 2, cy0 = q.y + q.h / 2;
      let x, y, w, h, a = za;
      if (sl) {
        const cx1 = sl.x + sl.w / 2, cy1 = sl.y + sl.h / 2;
        const w1 = sl.w - 4, h1 = sl.h - 4;
        const cx = cx0 + (cx1 - cx0) * mv, cy = cy0 + (cy1 - cy0) * mv;
        w = (q.w + (w1 - q.w) * mv) * sh;
        h = (q.h + (h1 - q.h) * mv) * sh;
        x = cx - w / 2; y = cy - h / 2;
      } else {
        w = q.w * sh * (1 - mv);
        h = q.h * sh * (1 - mv);
        x = cx0 - w / 2; y = cy0 - h / 2;
        a *= 1 - mv;
      }
      if (a <= 0.002 || w <= 0) continue;
      ctx.fillStyle = `rgba(214,214,207,${a.toFixed(3)})`;
      ctx.fillRect(x, y, w, h);
      if (lift < 0.05) {
        ctx.fillStyle = "rgba(14,15,11,.09)";
        ctx.fillRect(x, y, 1, h);
        ctx.fillRect(x, y, w, 1);
      }
      if (scanOn) {
        const ol = Math.max(0, 1 - Math.abs(x + w / 2 - scanX) / 160);
        if (ol > 0) {
          ctx.fillStyle = `rgba(222,250,154,${(0.55 * ol * a).toFixed(3)})`;
          ctx.fillRect(x, y, w, h);
        }
      }
      if (head > 0) {
        ctx.fillStyle = `rgba(14,15,11,${(0.45 * head).toFixed(3)})`;
        if (q.r === 0 && q.c > 0) ctx.fillText(String.fromCharCode(64 + q.c), x + 8, y + h / 2);
        if (q.c === 0 && q.r > 0) ctx.fillText(String(q.r), x + 8, y + h / 2);
      }
    }
    if (scanOn) {
      ctx.fillStyle = "rgba(255,252,235,.9)";
      ctx.fillRect(scanX, 0, 1, P.H);
    }

    wordEls.forEach((el, i) => {
      if (t >= 3150 + i * 150 && el.style.opacity !== "1") {
        el.style.opacity = 1;
        el.style.transform = "none";
        el.style.clipPath = "inset(-10% -6% -30% -6%)";
      }
    });

    if (t > 4100) {
      cover.style.display = "none";
      traceDone = true;
      trace = null;
    }
  }

  // ---- Loop contínuo: dissolução (só até terminar), estrela, robô, blobs ----
  const state = {
    tx: 0, ty: 0, x: 0, y: 0, init: false,
    ex: 0, ey: 0, tilt: 0, aL: 0, aLv: 0, aR: 0, aRv: 0,
    nextBlink: performance.now() + 2500,
    live: 0, slide: null,
  };

  panel.addEventListener("pointermove", (e) => {
    state.tx = e.clientX - panelRect.left;
    state.ty = e.clientY - panelRect.top;
    state.live = performance.now();
  }, { passive: true });
  panel.addEventListener("pointerleave", () => { state.live = 0; });

  let burstAt = -1e9;
  let typingStarted = false;
  if (bot) {
    bot.addEventListener("click", () => {
      burstAt = performance.now();
      const br = bot.getBoundingClientRect();
      spawnSparks(12, br.left - panelRect.left + br.width / 2, br.top - panelRect.top + br.height * 0.55, true);
      restartTyping(300);
      state.nextBlink = performance.now();
    });
  }

  let lastSparkAt = 0;
  function frame(now) {
    const W = panelRect.width, H = panelRect.height;
    const isLive = now - state.live < 3000;

    if (!traceDone) drawDissolve(now);

    const T = now - intro0;
    if (starEl) {
      const q = clamp01((T - 6200) / 900);
      starEl.style.transform = `translate(${W - 64}px, 64px) scale(${(0.8 * q).toFixed(3)}) rotate(${(q * 180 + Math.max(0, T - 2400 - 2700) / 60).toFixed(1)}deg)`;
      starEl.style.opacity = q;
    }

    if (!typingStarted && T > 7000) {
      typingStarted = true;
      if (typedEl) typeTimer = setTimeout(tick, 0);
    }

    if (slotEl && typedEl && botSlide) {
      const gap = slotEl.offsetWidth - typedEl.offsetWidth;
      state.slide = state.slide == null ? gap : state.slide + (gap - state.slide) * 0.12;
      botSlide.style.transform = `translateX(${(-state.slide).toFixed(1)}px)`;
    }

    if (bot) {
      const bp = Math.max(0, Math.min(1, (T - 6600) / 600));
      const sc = bp <= 0 ? 0 : 1 + Math.sin(bp * Math.PI) * 0.15 * (1 - bp) - (1 - bp) * (1 - bp);
      bot.style.transform = `scale(${Math.max(0, sc).toFixed(3)})`;
    }

    if (!isLive) {
      const tt = now / 1000;
      state.tx = W * (0.5 + 0.35 * Math.sin(tt * 0.27));
      state.ty = H * (0.45 + 0.3 * Math.sin(tt * 0.41 + 1));
    }
    if (!state.init) {
      state.x = state.tx; state.y = state.ty;
      blobEls.forEach((b) => { b.x = W / 2; b.y = H / 2; });
      state.init = true;
    }
    const vx = state.tx - state.x, vy = state.ty - state.y;
    state.x += vx * 0.2;
    state.y += vy * 0.2;

    blobEls.forEach((b, i) => {
      const offx = i === 0 ? 0 : Math.cos(now / 4000 + i * 2) * W * 0.25;
      const offy = i === 0 ? 0 : Math.sin(now / 5000 + i * 1.7) * H * 0.3;
      const gx = i === 0 ? state.x : i === 1 ? W * 0.16 + offx * 0.2 + (state.x - W / 2) * 0.06 : (i % 2 ? W - state.x * 0.6 : W * 0.75 + state.x * 0.2) + offx;
      const gy = i === 0 ? state.y : i === 1 ? H * 0.22 + offy * 0.15 : (i % 2 ? H - state.y * 0.5 : state.y) + offy;
      b.x += (gx - b.x) * b.k;
      b.y += (gy - b.y) * b.k;
      b.el.style.transform = `translate(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px)`;
    });

    if (bot) {
      const br = bot.getBoundingClientRect();
      const cx = br.left - panelRect.left + br.width / 2;
      const cy = br.top - panelRect.top + br.height * 0.58;
      const dx = state.x - cx, dy = state.y - cy;
      const d = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, d / 260);
      state.ex += ((dx / d) * 22 * reach - state.ex) * 0.2;
      state.ey += ((dy / d) * 16 * reach - state.ey) * 0.2;
      state.tilt += (Math.max(-10, Math.min(10, dx / 40)) - state.tilt) * 0.08;

      const sp = Math.hypot(vx, vy);
      state.aLv += (-vx * 0.25 - state.aL) * 0.08; state.aLv *= 0.82; state.aL += state.aLv;
      state.aRv += (-vx * 0.25 - state.aR) * 0.08; state.aRv *= 0.85; state.aR += state.aRv;

      const bt = now - burstAt;
      const bounce = bt < 600 ? Math.sin((bt / 600) * Math.PI) * -14 : 0;

      if (botEyes) botEyes.setAttribute("transform", `translate(${state.ex.toFixed(2)}, ${state.ey.toFixed(2)})`);
      if (botHead) botHead.style.transform = `translateY(${bounce}px) rotate(${state.tilt.toFixed(2)}deg)`;
      if (botAntL) botAntL.style.transform = `rotate(${Math.max(-35, Math.min(35, state.aL)).toFixed(2)}deg)`;
      if (botAntR) botAntR.style.transform = `rotate(${Math.max(-35, Math.min(35, state.aR)).toFixed(2)}deg)`;

      let lid = 1;
      if (now > state.nextBlink) {
        const p = (now - state.nextBlink) / 160;
        if (p >= 1) state.nextBlink = now + 2200 + Math.random() * 3500;
        else lid = Math.abs(1 - 2 * p);
      }
      if (bt < 300) lid = Math.min(lid, Math.abs(1 - (2 * bt) / 300));
      if (botLid) botLid.setAttribute("transform", `translate(0 300) scale(1 ${Math.max(0.08, lid).toFixed(3)}) translate(0 -300)`);

      if (isLive && sp > 6 && now - lastSparkAt > 90) {
        lastSparkAt = now;
        spawnSparks(1, state.x, state.y, false);
      }
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
