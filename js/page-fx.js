/**
 * Porte 1:1 de initFx/initGuide/initFooterBot/spawnAt do arquivo de
 * design original (métodos da classe Component). Desativado sob
 * prefers-reduced-motion, igual ao original.
 */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- spawnAt: rajada de faíscas ----
  function spawnAt(el) {
    const r = el.getBoundingClientRect();
    for (let i = 0; i < 10; i++) {
      const s = document.createElement("span");
      s.textContent = "✦";
      const a = -Math.PI * (0.1 + Math.random() * 0.8);
      const d = 50 + Math.random() * 70;
      s.style.cssText =
        "position:fixed;left:" + (r.left + r.width / 2) + "px;top:" + (r.top + r.height * 0.3) + "px;" +
        "z-index:60;pointer-events:none;color:" + (Math.random() < 0.6 ? "#fffceb" : "#defa9a") + ";" +
        "font-size:" + (10 + Math.random() * 12) + "px;transform:translate(-50%,-50%);" +
        "transition:transform 1s cubic-bezier(.2,.7,.2,1),opacity 1s ease";
      document.body.appendChild(s);
      requestAnimationFrame(() => {
        s.style.transform = "translate(calc(-50% + " + Math.cos(a) * d + "px),calc(-50% + " + Math.sin(a) * d + "px)) scale(.4)";
        s.style.opacity = "0";
      });
      setTimeout(() => s.remove(), 1100);
    }
  }
  window.buovaiSpawnSparks = spawnAt;

  // ---- initFx: brilho de cursor (data-glow) + magnetismo (data-magnet) + reveal ----
  function initFx() {
    const reduce = reduceMotion;
    const fine = window.matchMedia("(pointer: fine)").matches;

    const glows = Array.from(document.querySelectorAll("[data-glow]")).map((el) => {
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
      el.style.overflow = "hidden";
      const o = document.createElement("div");
      // Brilho mais suave e orgânico (como as manchas que seguem o cursor
      // no hero), em vez do ponto de luz nítido do arquivo original —
      // pedido explícito da Lorena, única exceção à fidelidade literal.
      o.style.cssText =
        "position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .9s ease;mix-blend-mode:soft-light;filter:blur(50px);" +
        "background:radial-gradient(760px circle at var(--gx,50%) var(--gy,50%),rgba(222,250,154,.6) 0%,rgba(148,171,134,.4) 35%,rgba(69,117,40,.2) 60%,rgba(69,117,40,0) 80%)";
      el.insertBefore(o, el.firstChild);
      Array.from(el.children).forEach((c) => {
        if (c !== o && getComputedStyle(c).position === "static") c.style.position = "relative";
      });
      return { el: el, o: o, x: 0, y: 0, tx: 0, ty: 0 };
    });

    const mags = Array.from(document.querySelectorAll("[data-magnet]")).map((el) => ({ el: el, x: 0, y: 0, tx: 0, ty: 0 }));

    const onMove = (e) => {
      glows.forEach((g) => {
        const r = g.el.getBoundingClientRect();
        const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        g.tx = e.clientX - r.left;
        g.ty = e.clientY - r.top;
        g.o.style.opacity = inside ? 1 : 0;
      });
      if (fine) {
        mags.forEach((m) => {
          const r = m.el.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const d = Math.hypot(dx, dy);
          const R = Math.max(r.width, r.height) * 0.9;
          if (d < R) {
            m.tx = dx * 0.18;
            m.ty = dy * 0.3;
          } else {
            m.tx = 0;
            m.ty = 0;
          }
        });
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });

    const loop = () => {
      glows.forEach((g) => {
        g.x += (g.tx - g.x) * 0.12;
        g.y += (g.ty - g.y) * 0.12;
        g.o.style.setProperty("--gx", g.x.toFixed(1) + "px");
        g.o.style.setProperty("--gy", g.y.toFixed(1) + "px");
      });
      mags.forEach((m) => {
        m.x += (m.tx - m.x) * 0.18;
        m.y += (m.ty - m.y) * 0.18;
        m.el.style.transform = Math.abs(m.x) + Math.abs(m.y) > 0.05 ? "translate(" + m.x.toFixed(2) + "px," + m.y.toFixed(2) + "px)" : "";
      });
      requestAnimationFrame(loop);
    };
    if (!reduce) requestAnimationFrame(loop);

    if (!reduce && "IntersectionObserver" in window) {
      const items = Array.from(
        document.querySelectorAll(
          'section:not(#inicio) h2, section:not(#inicio) h2 + p, [data-screen-label="Serviços"] a, #processo [style*="padding:28px 28px 8px 0"], [data-screen-label="Dúvidas"] button'
        )
      );
      items.forEach((el) => {
        el.style.opacity = 0;
        el.style.transform = (el.style.transform || "") + " translateY(28px)";
        el.style.transition = "opacity .9s ease, transform 1s cubic-bezier(.16,.84,.24,1), background .25s";
        el.dataset.rv = "1";
      });
      const io = new IntersectionObserver(
        (es) =>
          es.forEach((en) => {
            if (en.isIntersecting) {
              const el = en.target;
              const sib = Array.from(el.parentElement.children).filter((c) => c.dataset.rv);
              const k = Math.max(0, sib.indexOf(el));
              el.style.transitionDelay = k * 0.08 + "s";
              el.style.opacity = 1;
              el.style.transform = el.style.transform.replace(" translateY(28px)", "");
              io.unobserve(el);
            }
          }),
        { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
      );
      items.forEach((el) => io.observe(el));
    }

    initGuide();
    initFooterBot();
  }

  // ---- initGuide: robô que acompanha a rolagem e anota a seção ativa ----
  function initGuide() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Em telas pequenas o robô flutuante atrapalha mais do que ajuda
    // (pedido da Lorena) — desativado abaixo de 640px.
    if (window.innerWidth < 640) return;

    const BOT =
      '<svg viewBox="-20 10 390 460" style="width:100%;height:auto;overflow:visible;display:block"><defs><mask id="buov-guide-mask" maskUnits="userSpaceOnUse" x="-40" y="0" width="440" height="480"><circle cx="170" cy="283" r="172" fill="#fff"></circle><rect x="40" y="172" width="260" height="236" rx="104" fill="#000"></rect><path d="M132 146 Q170 136 208 146" stroke="#000" stroke-width="5" fill="none" stroke-linecap="round"></path><rect x="66" y="230" width="208" height="134" rx="67" fill="#fff"></rect><g class="g-eyes"><g class="g-lid"><circle cx="122" cy="297" r="15" fill="#000"></circle><circle cx="218" cy="297" r="15" fill="#000"></circle></g></g></mask></defs><g class="g-head" style="transform-origin:170px 283px"><g class="g-antL" style="transform-origin:76px 132px"><line x1="76" y1="132" x2="18" y2="38" stroke="currentColor" stroke-width="8" stroke-linecap="round"></line></g><g class="g-antR" style="transform-origin:246px 126px"><line x1="246" y1="126" x2="292" y2="24" stroke="currentColor" stroke-width="8" stroke-linecap="round"></line></g><rect x="-8" y="266" width="14" height="38" rx="7" fill="currentColor"></rect><rect x="334" y="266" width="14" height="38" rx="7" fill="currentColor"></rect><rect x="-10" y="100" width="370" height="370" fill="currentColor" mask="url(#buov-guide-mask)"></rect></g></svg>';

    const cfg = [
      ["Ponto de partida", "Todo bom sistema começa por entender a rotina.", 0],
      // Aqui o robô não aponta pro título da seção, e sim revezando entre
      // os quadros dos dois cases (o mockup da tela), como se estivesse
      // apresentando cada captura — com falas curtas e concretas sobre
      // problemas reais de cada cliente, sem repetir o que o próprio
      // texto do card já diz (pedido da Lorena). Duas falas por case,
      // intercaladas, pra dar variedade sem ficar preso só numa. Busca
      // de novo a cada frame, pois os mockups só existem depois do fetch
      // assíncrono do portfólio.
      ["Casos reais", null, 0, [
        { sel: '[data-case-title="Sistema de Gestão de Obras"] [data-case-frame]', msg: "A rota de entrega era decidida no olho. Hoje o sistema calcula o trajeto sozinho." },
        { sel: '[data-case-title="Portal do Cliente"] [data-case-frame]', msg: "Os documentos viviam espalhados em pastas do Drive, com o telefone tocando atrás de boleto." },
        { sel: '[data-case-title="Sistema de Gestão de Obras"] [data-case-frame]', msg: "O orçamento levava horas pra fechar. Agora sai em minutos, com a proposta já pronta." },
        { sel: '[data-case-title="Portal do Cliente"] [data-case-frame]', msg: "Cada cliente só enxerga os próprios documentos. Isso é garantido pelo banco, não só pela tela." },
      ]],
      ["Serviços", "Não precisa saber o termo técnico para começar.", 0],
      ["Como trabalho", "Cada etapa validada com você antes da próxima.", 1],
      ["Portal do cliente", "Você acompanha o andamento sem precisar pedir.", 0],
      ["Quem faz", "Do diagnóstico à entrega, sem intermediários.", 1],
      ["Dúvidas", "Se ficou alguma pergunta, ela responde pessoalmente.", 0],
      ["Contato", "Descreva como é hoje. O caminho vem na resposta.", 1],
    ];
    const secs = cfg
      .map(([lab, msg, dark, targetSel]) => {
        const el = document.querySelector('[data-screen-label="' + lab + '"]');
        const cases = Array.isArray(targetSel) ? targetSel : null;
        return el ? { el: el, msg: msg, dark: dark, h2: el.querySelector("h2"), targetSel: cases ? null : targetSel || null, cases: cases, skipLabel: cases ? true : !!targetSel } : null;
      })
      .filter(Boolean);

    const cv = document.createElement("canvas");
    cv.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:24";
    const wrap = document.createElement("div");
    wrap.style.cssText =
      "position:fixed;left:0;top:0;z-index:26;width:64px;cursor:pointer;opacity:0;will-change:transform;transition:opacity .4s ease";
    wrap.innerHTML = BOT;
    wrap.title = "Próxima seção";
    const bub = document.createElement("div");
    bub.style.cssText =
      "position:fixed;left:0;top:0;z-index:26;pointer-events:none;font-family:'Lexend Exa',sans-serif;font-size:11px;background:#0e0f0b;color:#defa9a;padding:8px 12px;white-space:nowrap;opacity:0;transition:opacity .3s ease";
    document.body.append(cv, wrap, bub);

    const q = (s) => wrap.querySelector(s);
    const head = q(".g-head"), aL = q(".g-antL"), aR = q(".g-antR"), eyes = q(".g-eyes"), lid = q(".g-lid");
    const ctx = cv.getContext("2d");
    let dpr = 1;
    const size = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = innerWidth * dpr;
      cv.height = innerHeight * dpr;
    };
    size();
    addEventListener("resize", size);

    const st = {
      x: innerWidth - 100, y: -120, vx: 0, vy: 0,
      mx: innerWidth / 2, my: innerHeight / 2, ex: 0, ey: 0,
      active: -1, t0: 0, txt: "", blink: performance.now() + 2000, lastY: scrollY, sv: 0,
    };
    addEventListener("pointermove", (e) => { st.mx = e.clientX; st.my = e.clientY; }, { passive: true });
    addEventListener("pointerdown", () => { st.blink = performance.now(); }, { passive: true });
    wrap.addEventListener("click", () => {
      const nx = secs[Math.min(secs.length - 1, st.active + 1)];
      if (nx) scrollTo({ top: nx.el.getBoundingClientRect().top + scrollY - 70, behavior: "smooth" });
    });

    const io = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
    const cl = (v) => Math.max(0, Math.min(1, v));

    const frame = (now) => {
      const W = innerWidth, H = innerHeight, mob = W < 820, S = mob ? 48 : 64;
      wrap.style.width = S + "px";
      const hero = document.getElementById("inicio");
      const hb = hero ? hero.getBoundingClientRect().bottom : 0;
      let act = -1;
      secs.forEach((s, i) => {
        const r = s.el.getBoundingClientRect();
        if (r.top < H * 0.6 && r.bottom > H * 0.3) act = i;
      });
      const fte = document.querySelector("footer");
      const ftTop = fte ? fte.getBoundingClientRect().top : 1e9;
      const visible = hb < H * 0.35 && act >= 0 && ftTop > H * 0.75 && secs[act] && (secs[act].msg || "").indexOf("Descreva como") !== 0;
      wrap.style.opacity = visible ? 1 : 0;
      if (act !== st.active && act >= 0) { st.active = act; st.t0 = now; st.blink = now + 150; st.caseIdx = 0; st.caseAt = now; }
      const pl = document.documentElement.hasAttribute("data-planilha");
      if (pl !== st.pl) { st.pl = pl; st.t0 = now; st.blink = now + 100; }
      const s = secs[st.active];
      // Quando tem mais de um case pra apresentar, o robô reveza entre
      // eles (muda alvo e fala a cada CASE_ROTATE_MS), em vez de ficar
      // preso só no primeiro (pedido da Lorena: falar dos dois casos).
      const CASE_ROTATE_MS = 6500;
      let activeCase = null;
      if (s && s.cases && s.cases.length) {
        if (st.caseAt == null) st.caseAt = now;
        if (now - st.caseAt > CASE_ROTATE_MS) {
          st.caseAt = now;
          st.caseIdx = ((st.caseIdx || 0) + 1) % s.cases.length;
          st.t0 = now;
          st.txt = "";
        }
        activeCase = s.cases[st.caseIdx || 0];
      }
      // Quando o robô está apontando pro quadro (targetSel/cases), a fala
      // fica visível o tempo todo que a seção estiver ativa, igual à
      // linha — não é um flash, é ele explicando mesmo (pedido da Lorena).
      bub.style.opacity = visible && (now - st.t0 < 3200 || st.pl || (s && s.skipLabel)) ? 1 : 0;
      const target = s
        ? (activeCase && document.querySelector(activeCase.sel)) || (s.targetSel && document.querySelector(s.targetSel)) || s.h2
        : null;
      let tx = W - S - (mob ? 16 : 36), ty = mob ? H - S - 90 : H * 0.45;
      if (target && !mob) {
        const r = target.getBoundingClientRect();
        ty = Math.max(90, Math.min(H - S - 40, r.top + r.height / 2 - S / 2));
        // No case de "apontar pro quadro", o robô sai do canto e vai pra
        // perto do próprio quadro (tipo um professor explicando a tela),
        // em vez de ficar fixo na borda direita da tela (pedido da Lorena).
        // Encosta no lado do quadro que sobra espaço na tela, pra não ficar
        // espremido contra a borda quando o quadro está na coluna direita.
        if (s.skipLabel) {
          const rightSide = r.right + S + 64 < W;
          tx = rightSide ? Math.min(W - S - 20, r.right + 64) : Math.max(20, r.left - S - 64);
        }
      }
      if (!visible) ty = -S * 2;
      st.vx += (tx - st.x) * 0.06; st.vy += (ty - st.y) * 0.06;
      st.vx *= 0.78; st.vy *= 0.78;
      st.x += st.vx; st.y += st.vy;
      st.sv += (scrollY - st.lastY - st.sv) * 0.2; st.lastY = scrollY;
      wrap.style.transform = "translate(" + st.x.toFixed(1) + "px," + st.y.toFixed(1) + "px)";
      head.style.transform = "rotate(" + Math.max(-14, Math.min(14, st.vy * 0.6)).toFixed(2) + "deg)";
      const sw = Math.max(-40, Math.min(40, -st.vy * 2.2 - st.sv * 0.8));
      aL.style.transform = "rotate(" + sw.toFixed(1) + "deg)";
      aR.style.transform = "rotate(" + (sw * 0.8).toFixed(1) + "deg)";
      const building = !st.pl && target && (s.skipLabel || now - st.t0 < 2600);
      let lx = st.mx, ly = st.my;
      const cx = st.x + S / 2, cy = st.y + S * 0.62;
      if (building) {
        const r = target.getBoundingClientRect();
        lx = r.left; ly = r.top + r.height / 2;
      }
      const dx = lx - cx, dy = ly - cy, d = Math.hypot(dx, dy) || 1, rch = Math.min(1, d / 200);
      st.ex += ((dx / d) * 22 * rch - st.ex) * 0.2;
      st.ey += ((st.pl ? 14 : (dy / d) * 16 * rch) - st.ey) * 0.2;
      eyes.setAttribute("transform", "translate(" + st.ex.toFixed(2) + " " + st.ey.toFixed(2) + ")");
      let lv = 1;
      if (now > st.blink) {
        const p = (now - st.blink) / 160;
        if (p >= 1) st.blink = now + 2500 + Math.random() * 3000;
        else lv = Math.abs(1 - 2 * p);
      }
      lid.setAttribute("transform", "translate(0 300) scale(1 " + Math.max(0.08, lv).toFixed(3) + ") translate(0 -300)");
      if (s) {
        // O balão era sempre fundo preto + texto lima — some em seções que
        // já são pretas/escuras (ex. "Quem faz"), sobrando só o texto solto
        // por cima do conteúdo, sem caixa nenhuma por trás (bug real, não
        // só estético). Inverte as cores nas seções escuras.
        bub.style.background = s.dark ? "#fffceb" : "#0e0f0b";
        bub.style.color = s.dark ? "#1f4905" : "#defa9a";
        // O robô em si também era sempre preto (#0e0f0b) — o mesmo bug do
        // balão, mas no corpo dele: em seções escuras ele se camuflava
        // inteiro com o fundo e sumia (pedido da Lorena). O SVG agora usa
        // currentColor nas partes visíveis, então basta trocar a cor do
        // wrapper conforme a seção.
        wrap.style.color = s.dark ? "#fffceb" : "#0e0f0b";
        const msg = st.pl ? "Assim fica na ferramenta pronta. Volte para o sistema." : (activeCase ? activeCase.msg : s.msg);
        const n = Math.min(msg.length, Math.floor((now - st.t0 - 200) / 32));
        const txt = n > 0 ? msg.slice(0, n) : "";
        if (txt !== st.txt) { st.txt = txt; bub.textContent = txt || " "; }
        const bw = bub.offsetWidth;
        // No modo "apontar pro quadro" a fala vai embaixo do robô, não do
        // lado — do lado ela ficava bem em cima da linha/régua e escondia
        // o traço (pedido da Lorena: dá pra ver que ele está apontando).
        // Clampa dentro da largura da tela — perto da borda, um balão
        // centrado no robô vazava pra fora e cortava o texto (pedido da
        // Lorena: não quer mais ver a fala cortada).
        const bubX = s.skipLabel
          ? Math.min(W - bw - 16, Math.max(16, st.x + S / 2 - bw / 2))
          : st.x - bw - 14;
        // Nas seções sem "apontar pro quadro" (ex. "Quem faz"), o balão
        // ficava na altura do robô — que fica centralizado no título — e
        // acabava em cima do próprio texto do h2. Usa a base do h2 como
        // referência em vez da posição do robô, pra ficar sempre abaixo
        // do título (pedido da Lorena: balão estava sobrepondo o título).
        const h2Rect = !s.skipLabel && s.h2 ? s.h2.getBoundingClientRect() : null;
        const bubY = s.skipLabel
          ? st.y + S + 14
          : h2Rect
          ? Math.min(H - 60, h2Rect.bottom + 16)
          : st.y + S + 14;
        bub.style.transform = mob
          ? "translate(" + (st.x + S - bw).toFixed(1) + "px," + (st.y - 40).toFixed(1) + "px)"
          : "translate(" + bubX.toFixed(1) + "px," + bubY.toFixed(1) + "px)";
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // No modo "apontar pro quadro" (cases), nenhuma versão do traço
      // (régua, seta, extensão do corpo) convenceu — tirado por completo.
      // O robô ainda se posiciona perto do quadro e fala sobre ele, só
      // sem nenhum desenho de linha/colchete (pedido da Lorena).
      if (visible && !st.pl && target && !s.skipLabel) {
        const t = now - st.t0, r = target.getBoundingClientRect(), pad = 18;
        const x0 = r.left - pad, y0 = r.top - pad, x1 = r.left + Math.min(r.width, target.scrollWidth) + pad, y1 = r.bottom + pad;
        const col = s.dark ? "222,250,154" : "31,73,5", bp = io(cl(t / 700)), fade = 1 - cl((t - 2000) / 600);
        if (fade > 0) {
          ctx.lineWidth = 1;
          const ex = x1, ey = r.top + r.height / 2, bx = cx + (ex - cx) * bp, by = cy + (ey - cy) * bp;
          const bfade = 1 - cl((t - 900) / 500);
          if (bfade > 0) {
            ctx.strokeStyle = "rgba(" + col + "," + 0.6 * bfade + ")";
            ctx.setLineDash([3, 5]);
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = "rgba(" + col + "," + bfade + ")";
            ctx.fillRect(bx - 2, by - 2, 4, 4);
          }
          const cp = io(cl((t - 500) / 700)), L = 22 * cp;
          ctx.strokeStyle = "rgba(" + col + "," + 0.9 * fade + ")";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]].forEach(([px, py, sx, sy]) => {
            ctx.moveTo(px + sx * L, py); ctx.lineTo(px, py); ctx.lineTo(px, py + sy * L);
          });
          ctx.stroke();
          const lp = io(cl((t - 900) / 900));
          if (lp > 0) {
            ctx.strokeStyle = "rgba(" + col + "," + 0.35 * fade + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x0, y1 + 8); ctx.lineTo(x0 + (x1 - x0) * lp, y1 + 8); ctx.stroke();
            ctx.font = "400 10px 'Lexend Exa',sans-serif";
            ctx.fillStyle = "rgba(" + col + "," + 0.8 * fade + ")";
            ctx.fillText("//" + String(st.active + 1).padStart(2, "0") + " montado", x0, y1 + 24);
          }
        }
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  // ---- initFooterBot: robô que dorme até o rodapé aparecer, acorda e se despede ----
  function initFooterBot() {
    const ft = document.querySelector("footer");
    if (!ft) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const box = document.createElement("div");
    box.style.cssText = "position:relative;width:72px;margin-top:28px;pointer-events:auto;cursor:pointer";
    box.innerHTML =
      '<svg viewBox="-20 10 390 460" style="width:100%;height:auto;overflow:visible;display:block"><defs><mask id="buov-foot-mask" maskUnits="userSpaceOnUse" x="-40" y="0" width="440" height="480"><circle cx="170" cy="283" r="172" fill="#fff"></circle><rect x="40" y="172" width="260" height="236" rx="104" fill="#000"></rect><path d="M132 146 Q170 136 208 146" stroke="#000" stroke-width="5" fill="none" stroke-linecap="round"></path><rect x="66" y="230" width="208" height="134" rx="67" fill="#fff"></rect><g class="f-eyes"><g class="f-lid"><circle cx="122" cy="297" r="15" fill="#000"></circle><circle cx="218" cy="297" r="15" fill="#000"></circle></g></g></mask></defs><g class="f-head" style="transform-origin:170px 440px"><g class="f-antL" style="transform-origin:76px 132px"><line x1="76" y1="132" x2="18" y2="38" stroke="#fffceb" stroke-width="8" stroke-linecap="round"></line></g><g class="f-antR" style="transform-origin:246px 126px"><line x1="246" y1="126" x2="292" y2="24" stroke="#fffceb" stroke-width="8" stroke-linecap="round"></line></g><rect x="-8" y="266" width="14" height="38" rx="7" fill="#fffceb"></rect><rect x="334" y="266" width="14" height="38" rx="7" fill="#fffceb"></rect><rect x="-10" y="100" width="370" height="370" fill="#fffceb" mask="url(#buov-foot-mask)"></rect></g></svg>';
    const zz = document.createElement("div");
    zz.style.cssText = "position:absolute;left:70%;top:-10px;font-family:'Lexend Exa',sans-serif;font-size:13px;color:#fffceb;pointer-events:none";
    const bub = document.createElement("div");
    bub.style.cssText =
      "position:absolute;left:100%;top:14px;margin-left:16px;font-family:'Lexend Exa',sans-serif;font-size:11px;background:#1f4905;color:#defa9a;padding:8px 12px;white-space:nowrap;opacity:0;transform:translateY(6px);transition:opacity .35s ease,transform .35s ease";
    box.append(zz, bub);
    const brandCol = ft.querySelector("img") ? ft.querySelector("img").parentElement : ft;
    brandCol.appendChild(box);

    const q = (s) => box.querySelector(s);
    const head = q(".f-head"), aL = q(".f-antL"), aR = q(".f-antR"), eyes = q(".f-eyes"), lid = q(".f-lid");

    let scene = 0;
    try {
      scene = (parseInt(localStorage.getItem("buov-foot-scene") || "0", 10) || 0) % 4;
      localStorage.setItem("buov-foot-scene", String(scene + 1));
    } catch (e) {}
    const lines = [
      "Até logo. Volte quando quiser.",
      "Obrigado pela visita.",
      "Se precisar, é só chamar no WhatsApp.",
      "Encerrando por aqui. Até a próxima.",
    ];
    let state = "sleep", t0 = performance.now(), typed = "";
    const wa = () => document.querySelector('a[aria-label="WhatsApp"]');

    // ---- Tocar no robô acorda ele na hora, com uma fala própria e um
    // convite pro WhatsApp (pedido da Lorena) ----
    const WA_LINK = "https://wa.me/5579998289485";
    const TAP_MSG = "Olá! Você me acordou. Quer falar no nosso WhatsApp?";
    let tapActive = false;
    box.addEventListener("click", (e) => {
      if (e.target === bub && tapActive) {
        window.open(WA_LINK, "_blank", "noopener");
        return;
      }
      tapActive = true;
      footSpark = false;
      state = "wake";
      t0 = performance.now();
      typed = "";
    });
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((en) => {
          const w = wa();
          if (w) {
            w.style.transition = "opacity .3s ease";
            w.style.opacity = en.isIntersecting && en.intersectionRatio > 0.2 ? "0" : "1";
            w.style.pointerEvents = en.isIntersecting && en.intersectionRatio > 0.2 ? "none" : "";
          }
          if (en.isIntersecting && en.intersectionRatio > 0.5 && state === "sleep") {
            state = "wake"; t0 = performance.now();
          }
        }),
      { threshold: [0, 0.2, 0.5, 0.8] }
    );
    io.observe(ft);

    const cl = (v) => Math.max(0, Math.min(1, v));
    let footSpark = false;
    const frame = (now) => {
      const t = now - t0;
      let lv = 0.08, rot = 0, aLr = 0, aRr = 0, ty = 0, ex = 0, ey = 0;
      if (state === "sleep") {
        const b = Math.sin(now / 900);
        ty = b * 2; rot = -4 + b * 1.5; aLr = 18; aRr = 14; ey = 8;
        const zp = (now % 2400) / 2400;
        zz.textContent = zp < 0.5 ? "z" : "z z";
        zz.style.opacity = String(Math.sin(zp * Math.PI));
        zz.style.transform = "translate(" + zp * 10 + "px," + -zp * 16 + "px)";
      } else {
        zz.style.opacity = "0";
        const open = cl((t - 200) / 300);
        lv = 0.08 + 0.92 * open;
        if (t > 700 && t < 860) lv = Math.abs(1 - 2 * ((t - 700) / 160)) * 0.92 + 0.08;
        const spring = t < 1400 ? Math.sin(t / 60) * 22 * (1 - t / 1400) : 0;
        aLr = spring; aRr = -spring * 0.8;
        rot = Math.sin(t / 140) * 3 * (1 - cl(t / 1200));
        const act = t - 1200;
        if (act > 0) {
          if (tapActive) {
            const j = act < 500 ? Math.sin((act / 500) * Math.PI) : 0;
            ex = 18; ey = -6; rot = j * 10;
            if (act > 200 && !footSpark) { footSpark = true; spawnAt(box); }
          } else if (scene === 0) {
            const w = Math.sin(act / 120) * 28 * (act < 2400 ? 1 : 0);
            aRr = w; aLr = -w * 0.3; ex = -14;
          } else if (scene === 1) {
            const j = act < 700 ? Math.sin((act / 700) * Math.PI) : 0;
            ty = -j * 26; rot = j * -6;
            if (act > 300 && !footSpark) { footSpark = true; spawnAt(box); }
            ex = -10; ey = -6;
          } else if (scene === 2) { ex = 20; ey = -4; rot = 4; }
          else if (scene === 3) { ex = -12; }
          // Depois de falar, o robô volta a dormir (pedido da Lorena) —
          // no arquivo original só a cena 3 fazia isso; aqui todas fazem.
          // Tocar nele deixa a fala um pouco mais tempo na tela, pro
          // cliente ter chance de clicar no convite do WhatsApp.
          const windDownStart = tapActive ? 6500 : 2600;
          if (act > windDownStart) {
            const c = cl((act - windDownStart) / 900);
            lv = (scene === 3 && !tapActive ? 1 : lv) - c * (scene === 3 && !tapActive ? 0.92 : lv - 0.08);
            rot = -4 * c;
            if (c >= 1) { state = "sleep"; tapActive = false; }
          }
          const msg = tapActive ? TAP_MSG : lines[scene];
          const n = Math.min(msg.length, Math.floor(act / 34));
          const tx = msg.slice(0, n);
          if (tx !== typed) { typed = tx; bub.textContent = tx || " "; }
          const show = act < windDownStart || scene === 2;
          bub.style.opacity = show && state !== "sleep" ? "1" : "0";
          bub.style.transform = show ? "none" : "translateY(6px)";
          bub.style.cursor = tapActive ? "pointer" : "default";
        }
      }
      if (reduce) { lv = state === "sleep" ? 0.08 : 1; ty = 0; rot = 0; }
      head.style.transform = "translateY(" + ty.toFixed(1) + "px) rotate(" + rot.toFixed(2) + "deg)";
      aL.style.transform = "rotate(" + aLr.toFixed(1) + "deg)";
      aR.style.transform = "rotate(" + aRr.toFixed(1) + "deg)";
      eyes.setAttribute("transform", "translate(" + ex + " " + ey + ")");
      lid.setAttribute("transform", "translate(0 300) scale(1 " + lv.toFixed(3) + ") translate(0 -300)");
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  initFx();
})();
