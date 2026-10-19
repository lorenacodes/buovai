/**
 * Hero: porte 1:1 da lógica do componente original (classe Component do
 * arquivo "Buov Site v2" enviado) para vanilla JS, sem o runtime React da
 * ferramenta de design. Mesmos nomes de ref (agora ids), mesmas constantes
 * de tempo, mesma matemática. Ver tick()/tryAnim()/buildTrace()/frame()
 * abaixo — cada um corresponde ao método de mesmo nome no original.
 */
(function () {
  "use strict";

  const hero = document.getElementById("hero");
  if (!hero) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const rf = {
    hero,
    brand: document.getElementById("brand"),
    star: document.getElementById("star"),
    words: document.getElementById("words"),
    botWrap: document.getElementById("botWrap"),
    cover: document.getElementById("cover"),
    slot: document.getElementById("slot"),
    typed: document.getElementById("typed"),
    typedText: document.getElementById("typedText"),
    botSlide: document.getElementById("botSlide"),
    spark: document.getElementById("spark"),
    bot: document.getElementById("bot"),
    head: document.getElementById("head"),
    antL: document.getElementById("antL"),
    antR: document.getElementById("antR"),
    eyes: document.getElementById("eyes"),
    lid: document.getElementById("lid"),
  };

  const words = ["sistemas internos", "portais para clientes", "automações", "integrações", "sites profissionais", "migração de sistemas"];
  let state = { wi: 0, ci: 0, del: false };
  let typeTimer = null;

  function tick() {
    const word = words[state.wi];
    let delay = state.del ? 35 : 70;
    if (!state.del && state.ci < word.length) {
      state.ci++;
    } else if (!state.del) {
      state.del = true;
      delay = 1800;
    } else if (state.ci > 0) {
      state.ci--;
    } else {
      state.del = false;
      state.wi = (state.wi + 1) % words.length;
      delay = 300;
    }
    if (rf.typedText) rf.typedText.textContent = words[state.wi].slice(0, state.ci);
    typeTimer = setTimeout(tick, delay);
  }

  // ---- blobDefs / satinEl: fundo "satin" (manchas de gradiente verde) ----
  // Criado sempre (com ou sem motion reduzido) — é o fundo do painel, não
  // só um efeito; sem isso o hero fica sem a textura verde.
  const blobDefs = [
    ["#defa9a", 46, 0.1],
    ["#94ab86", 75, 0.05],
    ["#457528", 70, 0.035],
    ["#3f5204", 80, 0.02],
  ];
  const blobEls = [];
  if (rf.brand) {
    const satinEl = document.createElement("div");
    satinEl.style.cssText = "position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 70% 60% at 14% 26%,#defa9a 0%,#94ab86 30%,#457528 62%,#1f4905 92%);filter:blur(60px);transform:scale(1.15)";
    blobDefs.forEach(([c, s]) => {
      const el = document.createElement("div");
      el.style.cssText = `position:absolute;left:0;top:0;width:${s}vmax;height:${s}vmax;margin-left:${-s / 2}vmax;margin-top:${-s / 2}vmax;border-radius:50%;background:radial-gradient(circle,${c} 0%,${c}cc 35%,${c}00 70%);will-change:transform`;
      satinEl.appendChild(el);
      blobEls.push(el);
    });
    rf.brand.appendChild(satinEl);
  }

  if (reduceMotion) {
    // Sem dissolução/robô animado/cursor: conteúdo já no estado final, o
    // fundo "satin" fica parado numa posição central, e o loop de texto
    // (troca de conteúdo, não movimento) continua normalmente.
    if (rf.words) Array.from(rf.words.children).forEach((s) => { s.style.opacity = 1; s.style.transform = "none"; s.style.clipPath = "inset(-10% -6% -30% -6%)"; });
    if (rf.cover) rf.cover.style.display = "none";
    if (rf.star) { rf.star.style.opacity = "0.85"; rf.star.style.transform = "translate(calc(100% - 64px), 64px) scale(0.8)"; }
    if (rf.botWrap) rf.botWrap.style.transform = "scale(1)";
    blobEls.forEach((el) => {
      const r = hero.getBoundingClientRect();
      el.style.transform = `translate(${r.width / 2}px,${r.height / 2}px)`;
    });
    typeTimer = setTimeout(tick, 500);
    return;
  }

  let intro0 = performance.now();
  let traceDone = false;
  let trace = null;
  let animOn = false;
  let burst = -1e9;
  let mx = 0, my = 0;

  function onBotClick() {
    burst = performance.now();
    spawn(12, true);
    intro0 = performance.now();
    traceDone = false;
    resetWords();
    clearTimeout(typeTimer);
    state = { wi: 0, ci: 0, del: false };
    if (rf.typedText) rf.typedText.textContent = "";
    typeTimer = setTimeout(tick, 7000);
  }
  if (rf.bot) rf.bot.addEventListener("click", onBotClick);

  function resetWords() {
    const w = rf.words;
    if (w) {
      Array.from(w.children).forEach((s) => {
        s.style.opacity = 0;
        s.style.transform = "translateY(.55em)";
        s.style.clipPath = "inset(0 0 100% 0)";
      });
    }
    trace = null;
    if (rf.cover) rf.cover.style.display = "";
  }

  function spawn(n, fromBot) {
    const L = rf.spark;
    if (!L || !hero) return;
    const hr = hero.getBoundingClientRect();
    let ox = mx, oy = my;
    if (fromBot && rf.bot) {
      const br = rf.bot.getBoundingClientRect();
      ox = br.left - hr.left + br.width / 2;
      oy = br.top - hr.top + br.height * 0.55;
    }
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.textContent = "✦";
      const ang = Math.random() * Math.PI * 2;
      const dist = fromBot ? 80 + Math.random() * 160 : 10 + Math.random() * 30;
      const size = 10 + Math.random() * (fromBot ? 22 : 12);
      const col = Math.random() < 0.7 ? "#fffceb" : "#defa9a";
      s.style.cssText = `position:absolute;left:${ox}px;top:${oy}px;font-size:${size}px;color:${col};line-height:1;transform:translate(-50%,-50%);transition:transform 1.1s cubic-bezier(.2,.7,.2,1),opacity 1.1s ease;opacity:1`;
      L.appendChild(s);
      requestAnimationFrame(() => {
        s.style.transform = `translate(calc(-50% + ${Math.cos(ang) * dist}px),calc(-50% + ${Math.sin(ang) * dist - 20}px)) rotate(${Math.random() * 180 - 90}deg) scale(.3)`;
        s.style.opacity = "0";
      });
      setTimeout(() => s.remove(), 1200);
    }
  }

  function buildTrace() {
    const wr = rf.words, cv = rf.cover;
    if (!hero || !wr || !cv) return null;
    const W = hero.clientWidth, H = hero.clientHeight;
    if (!W || !H) return null;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr;
    cv.height = H * dpr;
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cw = 120, ch = 34, tiles = [];
    for (let y = 0, r = 0; y < H; y += ch, r++) {
      for (let x = 0, c = 0; x < W; x += cw, c++) tiles.push({ x, y, w: cw, h: ch, r, c });
    }
    const L = W < 700
      ? [[0.04, 0.05, 0.92, 0.06], [0.04, 0.14, 0.92, 0.16], [0.04, 0.33, 0.44, 0.2], [0.52, 0.33, 0.44, 0.2], [0.04, 0.56, 0.92, 0.38]]
      : [[0.03, 0.05, 0.94, 0.055], [0.03, 0.14, 0.13, 0.8], [0.19, 0.14, 0.245, 0.17], [0.455, 0.14, 0.245, 0.17], [0.72, 0.14, 0.25, 0.17], [0.19, 0.35, 0.51, 0.59], [0.72, 0.35, 0.25, 0.59]];
    const blocks = L.map(([x, y, w, hh]) => ({ x: x * W, y: y * H, w: w * W, h: hh * H }));
    const area = blocks.reduce((s, b) => s + b.w * b.h, 0);
    const N = tiles.length;
    const s0 = Math.sqrt(area / N) * 1.06;
    const slots = [];
    blocks.forEach((b, bi) => {
      const cols = Math.max(1, Math.round(b.w / s0));
      const rows = Math.max(1, Math.round(b.h / s0));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) slots.push({ x: b.x + (c * b.w) / cols, y: b.y + (r * b.h) / rows, w: b.w / cols, h: b.h / rows, bi });
      }
    });
    const key = (o) => o.y * 4 + (o.x / W) * H;
    const ts = tiles.slice().sort((a, b) => key(a) - key(b));
    const ss = slots.slice().sort((a, b) => key(a) - key(b));
    const diag = Math.hypot(W, H);
    ts.forEach((t, i) => {
      t.slot = i < ss.length ? ss[Math.floor((i * ss.length) / Math.max(ss.length, N))] : null;
      t.d = (Math.hypot(t.x, H - t.y) / diag) * 800 + Math.random() * 220;
    });
    return { ctx, W, H, tiles: ts, words: Array.from(wr.children) };
  }

  function tryAnim() {
    if (animOn || !hero || !rf.lid) return;
    animOn = true;

    const st = { x: 0, y: 0, tx: 0, ty: 0, last: -1e9, init: false, ex: 0, ey: 0, tilt: 0, aL: 0, aLv: 0, aR: 0, aRv: 0, nextBlink: performance.now() + 2500, lastSpark: 0 };
    const B = blobDefs.map(() => ({ x: 0, y: 0 }));

    function move(e) {
      const r = hero.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (y >= -80 && y <= r.height + 200) { st.tx = x; st.ty = y; st.last = performance.now(); }
    }
    window.addEventListener("pointermove", move);
    function tap() { st.nextBlink = performance.now(); }
    hero.addEventListener("pointerdown", tap);

    const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
    const easeOutExpo = (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
    const easeInCubic = (p) => p * p * p;
    const clamp01 = (v) => Math.max(0, Math.min(1, v));

    function frame(now) {
      const W = hero.clientWidth, H = hero.clientHeight, live = now - st.last < 3000;
      const T = now - intro0;
      const D0 = 2400;

      if (!trace && !traceDone) trace = buildTrace();
      const P = trace, cover = rf.cover;

      if (P && cover && cover.style.display !== "none") {
        const ctx = P.ctx, t = T - 2800, G = 2;
        const io = ease, ox = easeOutExpo, ic = easeInCubic;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const dpr = ctx.canvas.width / P.W;
        const zp = clamp01((t - 3000) / 1000), z = 1 + ic(zp) * 0.35, za = 1 - io(zp);
        ctx.setTransform(dpr * z, 0, 0, dpr * z, (dpr * P.W) / 2 * (1 - z), dpr * P.H * 0.45 * (1 - z));
        const head = 1 - clamp01(t / 450);
        const scanX = -200 + ox(clamp01((t - 2350) / 650)) * (P.W + 400);
        const scanOn = t > 2350 && t < 3100;
        ctx.font = "400 10px 'Lexend Exa',sans-serif";
        ctx.textBaseline = "middle";
        for (const q of P.tiles) {
          const lift = ox(clamp01((t - q.d) / 350));
          const mv = ox(clamp01((t - q.d - 350) / 900));
          const sl = q.slot, sh = 1 - 0.14 * lift * (1 - mv);
          const cx0 = q.x + q.w / 2, cy0 = q.y + q.h / 2;
          let x, y, w, hh, a = za;
          if (sl) {
            const cx1 = sl.x + sl.w / 2, cy1 = sl.y + sl.h / 2, w1 = sl.w - 2 * G, h1 = sl.h - 2 * G;
            const cx = cx0 + (cx1 - cx0) * mv, cy = cy0 + (cy1 - cy0) * mv;
            w = (q.w + (w1 - q.w) * mv) * sh; hh = (q.h + (h1 - q.h) * mv) * sh;
            x = cx - w / 2; y = cy - hh / 2;
          } else {
            w = q.w * sh * (1 - mv); hh = q.h * sh * (1 - mv);
            x = cx0 - w / 2; y = cy0 - hh / 2;
            a *= 1 - mv;
          }
          if (a <= 0.002 || w <= 0) continue;
          ctx.fillStyle = `rgba(214,214,207,${a.toFixed(3)})`;
          ctx.fillRect(x, y, w, hh);
          if (lift < 0.05) {
            ctx.fillStyle = "rgba(14,15,11,.09)";
            ctx.fillRect(x, y, 1, hh);
            ctx.fillRect(x, y, w, 1);
          }
          if (scanOn) {
            const ol = Math.max(0, 1 - Math.abs(x + w / 2 - scanX) / 160);
            if (ol > 0) {
              ctx.fillStyle = `rgba(222,250,154,${(0.55 * ol * a).toFixed(3)})`;
              ctx.fillRect(x, y, w, hh);
            }
          }
          if (head > 0) {
            ctx.fillStyle = `rgba(14,15,11,${(0.45 * head).toFixed(3)})`;
            if (q.r === 0 && q.c > 0) ctx.fillText(String.fromCharCode(64 + q.c), x + 8, y + hh / 2);
            if (q.c === 0 && q.r > 0) ctx.fillText(String(q.r), x + 8, y + hh / 2);
          }
        }
        if (scanOn) {
          ctx.fillStyle = "rgba(255,252,235,.9)";
          ctx.fillRect(scanX, 0, 1, P.H);
        }
        P.words.forEach((el, i) => {
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

      if (rf.star) {
        const q = clamp01((T - 6200) / 900);
        rf.star.style.transform = `translate(${W - 64}px,${64}px) scale(${(0.8 * q).toFixed(3)}) rotate(${(q * 180 + Math.max(0, T - D0 - 2700) / 60).toFixed(1)}deg)`;
        rf.star.style.opacity = q;
      }

      if (rf.slot && rf.typed && rf.botSlide) {
        const gap = rf.slot.offsetWidth - rf.typed.offsetWidth;
        st.slide = st.slide == null ? gap : st.slide + (gap - st.slide) * 0.12;
        rf.botSlide.style.transform = `translateX(${(-st.slide).toFixed(1)}px)`;
      }
      const bw = rf.botWrap;
      if (bw) {
        const bp = Math.max(0, Math.min(1, (T - 6600) / 600));
        const sc = bp <= 0 ? 0 : 1 + Math.sin(bp * Math.PI) * 0.15 * (1 - bp) - (1 - bp) * (1 - bp);
        bw.style.transform = `scale(${Math.max(0, sc).toFixed(3)})`;
      }

      if (!live) {
        const tt = now / 1000;
        st.tx = W * (0.5 + 0.35 * Math.sin(tt * 0.27));
        st.ty = H * (0.45 + 0.3 * Math.sin(tt * 0.41 + 1));
      }
      if (!st.init) {
        st.x = st.tx; st.y = st.ty;
        B.forEach((b) => { b.x = W / 2; b.y = H / 2; });
        st.init = true;
      }
      const vx = st.tx - st.x, vy = st.ty - st.y;
      st.x += vx * 0.2; st.y += vy * 0.2;
      mx = st.x; my = st.y;

      B.forEach((b, i) => {
        const k = blobDefs[i][2];
        const offx = i === 0 ? 0 : Math.cos(now / 4000 + i * 2) * W * 0.25;
        const offy = i === 0 ? 0 : Math.sin(now / 5000 + i * 1.7) * H * 0.3;
        const gx = i === 0 ? st.x : i === 1 ? W * 0.16 + offx * 0.2 + (st.x - W / 2) * 0.06 : (i % 2 ? W - st.x * 0.6 : W * 0.75 + st.x * 0.2) + offx;
        const gy = i === 0 ? st.y : i === 1 ? H * 0.22 + offy * 0.15 : (i % 2 ? H - st.y * 0.5 : st.y) + offy;
        b.x += (gx - b.x) * k; b.y += (gy - b.y) * k;
        const el = blobEls[i];
        if (el) el.style.transform = `translate(${b.x.toFixed(1)}px,${b.y.toFixed(1)}px)`;
      });

      const bot = rf.bot;
      if (bot) {
        const br = bot.getBoundingClientRect(), hr = hero.getBoundingClientRect();
        const cx = br.left - hr.left + br.width / 2, cy = br.top - hr.top + br.height * 0.58;
        const dx = st.x - cx, dy = st.y - cy, d = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, d / 260);
        st.ex += ((dx / d) * 22 * reach - st.ex) * 0.2;
        st.ey += ((dy / d) * 16 * reach - st.ey) * 0.2;
        st.tilt += (Math.max(-10, Math.min(10, dx / 40)) - st.tilt) * 0.08;
        const sp = Math.hypot(vx, vy);
        st.aLv += (-vx * 0.25 - st.aL) * 0.08; st.aLv *= 0.82; st.aL += st.aLv;
        st.aRv += (-vx * 0.25 - st.aR) * 0.08; st.aRv *= 0.85; st.aR += st.aRv;
        const bt = now - burst;
        const bounce = bt < 600 ? Math.sin((bt / 600) * Math.PI) * -14 : 0;
        if (rf.eyes) rf.eyes.setAttribute("transform", `translate(${st.ex.toFixed(2)},${st.ey.toFixed(2)})`);
        if (rf.head) rf.head.style.transform = `translateY(${bounce}px) rotate(${st.tilt.toFixed(2)}deg)`;
        if (rf.antL) rf.antL.style.transform = `rotate(${Math.max(-35, Math.min(35, st.aL)).toFixed(2)}deg)`;
        if (rf.antR) rf.antR.style.transform = `rotate(${Math.max(-35, Math.min(35, st.aR)).toFixed(2)}deg)`;
        let lid = 1;
        if (now > st.nextBlink) {
          const p = (now - st.nextBlink) / 160;
          if (p >= 1) st.nextBlink = now + 2200 + Math.random() * 3500;
          else lid = Math.abs(1 - 2 * p);
        }
        if (bt < 300) lid = Math.min(lid, Math.abs(1 - (2 * bt) / 300));
        if (rf.lid) rf.lid.setAttribute("transform", `translate(0 300) scale(1 ${Math.max(0.08, lid).toFixed(3)}) translate(0 -300)`);
        if (live && sp > 6 && now - st.lastSpark > 90) { st.lastSpark = now; spawn(1, false); }
      }

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  typeTimer = setTimeout(tick, 7000);
  setTimeout(tryAnim, 300);
})();
