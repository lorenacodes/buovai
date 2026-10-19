/**
 * "Como trabalho": timeline arrastável com janela de mockup que se
 * constrói conforme o progresso avança, e um seletor de "situação" que
 * troca o conteúdo simulado na janela. Porte 1:1 da lógica original
 * (tlRun/tlGo/tlFromX/tlDown/tlObserve + o cálculo de tlBlocks/tlNotes).
 */
(function () {
  "use strict";

  const root = document.getElementById("tlRoot");
  if (!root) return;

  const stepsEl = document.getElementById("tlSteps");
  const themesEl = document.getElementById("tlThemes");
  const windowEl = document.getElementById("tlWindow");
  const canvasEl = document.getElementById("tlCanvas");
  const notesEl = document.getElementById("tlNotes");
  const blocksEl = document.getElementById("tlBlocks");
  const statusBadge = document.getElementById("tlStatusBadge");
  const trackEl = document.getElementById("tlTrack");
  const trackFill = document.getElementById("tlTrackFill");
  const trackThumb = document.getElementById("tlTrackThumb");

  const STEPS = [
    ["Conversa inicial", "Você descreve o problema e eu pergunto sobre a operação até entender como ela funciona hoje."],
    ['Definição do que é "pronto"', "Combinamos escopo, prioridades e o critério para considerar cada entrega concluída."],
    ["Construção em ciclos curtos", "Mostro cada parte funcionando e ajusto com o seu retorno antes de seguir para a próxima."],
    ["Entrega e acompanhamento", "Coloco o sistema no ar e continuo disponível para ajustes depois da entrega."],
  ];

  const TH = [
    ["Tudo em planilhas", ["buov.ai / operação", "Cadastros", "Processos", "Relatórios", "Rotina num lugar só"], ["planilha_FINAL_v7", "quem atualizou?", "a fórmula quebrou", "dado duplicado"]],
    ["Migrar sistema ou dados", ["buov.ai / migração", "Dados antigos", "Conferência", "Novo sistema", "Migração sem parar a operação"], ["sistema antigo lento", "dados em 3 lugares", "não pode parar", "histórico de anos"]],
    ["Orçamentos à mão", ["buov.ai / orçamentos", "Orçamentos", "Itens e preços", "Aprovação", "Propostas no mês"], ["margem por item?", "quem aprova?", "proposta em PDF", "tabela de preços"]],
    ["Sistemas que não conversam", ["buov.ai / integração", "Sistema atual", "Outro sistema", "Regras", "Dados sincronizados"], ["digito duas vezes", "exporta e importa", "erro de digitação", "confere no fim do dia"]],
    ["Portal para clientes", ["buov.ai / portal", "Documentos", "Pagamentos", "Clientes", "Acessos do mês"], ["onde fica o boleto?", "envio por WhatsApp", "documentos por e-mail", "cliente pergunta tudo"]],
    ["Algo do meu setor", ["buov.ai / sob medida", "Projetos", "Medições", "Cronograma", "Avanço"], ["medição semanal?", "quem assina?", "fotos do serviço", "cronograma no Excel"]],
  ];

  const BAR_H = [38, 62, 48, 80, 66, 92];
  const ROW_W = [88, 64, 76, 52, 70];

  const c01 = (v) => Math.max(0, Math.min(1, v));
  function mix(a, b, t) {
    const pa = a.match(/\w\w/g).map((x) => parseInt(x, 16));
    const pb = b.match(/\w\w/g).map((x) => parseInt(x, 16));
    return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
  }

  let tlTheme = 0;
  let tlP = 0;
  let tlTarget = 0;
  let tlAuto = false;
  let tlTouched = false;
  let tlDrag = false;
  let raf = 0;

  function blocksFor(theme) {
    const lb = TH[theme][1];
    return [
      [lb[0], 0, 0, 100, 9],
      ["Menu", 0, 12, 19, 88],
      [lb[1], 22, 12, 24, 22],
      [lb[2], 49, 12, 24, 22],
      [lb[3], 76, 12, 24, 22],
      [lb[4], 22, 38, 50, 62, "main"],
      ["Pendências", 75, 38, 25, 62, "list"],
    ];
  }

  function render() {
    const tp = tlP;
    const stage = Math.min(3, Math.floor(tp * 4 - 1e-9 < 0 ? 0 : tp * 4 - 1e-9));
    const fin = c01((tp - 0.78) / 0.14);

    // ---- steps ----
    stepsEl.innerHTML = STEPS.map(([title, text], i) => {
      const on = i === stage;
      const op = on ? 1 : 0.5;
      const nc = i <= stage ? "#defa9a" : "rgba(255,252,235,.5)";
      return `<button type="button" data-step="${i}" style="display:grid;grid-template-columns:64px minmax(0,1fr);gap:18px;align-items:start;text-align:left;padding:22px 0;background:transparent;border:0;border-bottom:1px solid rgba(255,252,235,.4);cursor:pointer;color:#fffceb;opacity:${op};transition:opacity .3s">
        <span style="font-family:'Lexend Exa',sans-serif;font-weight:300;font-size:40px;letter-spacing:-.06em;line-height:1;color:${nc}">0${i + 1}</span>
        <span style="display:flex;flex-direction:column;gap:8px">
          <span style="font-family:'Lexend Exa',sans-serif;font-size:17px;letter-spacing:-.03em;line-height:1.3">${title}</span>
          ${on ? `<span style="font-size:15px;line-height:1.6;color:#e6e8d4">${text}</span>` : ""}
        </span>
      </button>`;
    }).join("");
    stepsEl.querySelectorAll("[data-step]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-step"));
        tlGo((i + 0.96) / 4);
      });
    });

    // ---- theme picker ----
    themesEl.innerHTML = TH.map((t, i) => {
      const on = i === tlTheme;
      return `<button type="button" data-theme="${i}" style="padding:9px 12px;border:1px solid rgba(255,252,235,.45);background:${on ? "#defa9a" : "transparent"};color:${on ? "#0e0f0b" : "#fffceb"};font:inherit;cursor:pointer">${t[0]}</button>`;
    }).join("");
    themesEl.querySelectorAll("[data-theme]").forEach((btn) => {
      btn.addEventListener("click", () => {
        tlTheme = Number(btn.getAttribute("data-theme"));
        tlP = 0;
        tlTarget = 0;
        render();
        setTimeout(() => tlGo(1, true), 60);
      });
    });

    // ---- window chrome ----
    const tlStatus = ["rascunho", "wireframe", "em construção", "● no ar"][stage];
    statusBadge.textContent = tlStatus;
    statusBadge.style.background = stage === 3 ? "#defa9a" : "#c9cbb5";
    windowEl.style.background = fin > 0 ? mix("fffceb", "16330f", fin) : "#fffceb";
    canvasEl.style.backgroundImage = tp < 0.3 ? `radial-gradient(circle,rgba(14,15,11,${(0.18 * (1 - c01((tp - 0.2) / 0.1))).toFixed(3)}) 1px,transparent 1.5px)` : "none";

    // ---- blocks ----
    const B = blocksFor(tlTheme);
    blocksEl.innerHTML = B.map(([label, l, t, w, hh, kind], i) => {
      const wire = c01((tp - 0.2) / 0.1 - i * 0.35);
      const fill = c01((tp - 0.5 - i * 0.03) / 0.035);
      const vo = fill >= 1 ? 1 - c01((tp - 0.8) / 0.06) : 0;
      const bs = fill >= 1 ? "solid" : "dashed";
      const bc = fill >= 1 ? (fin > 0 ? `rgba(222,250,154,${(0.25 + 0.3 * fin).toFixed(3)})` : "#c9c8b4") : "#8a8d7c";
      const bg = fill > 0 ? (fin > 0 ? mix("efeedb", i === 0 ? "0e0f0b" : "1f4905", fin) : mix("fffceb", "efeedb", fill)) : "transparent";
      const fg = fin > 0.5 ? "#fffceb" : "#2b2e24";
      const lo = 0.35 + 0.65 * fill;
      const ac = fin > 0 ? mix("457528", "defa9a", fin) : "#94ab86";
      let inner = "";
      if (kind === "main") {
        inner = `<div style="flex:1;display:flex;align-items:flex-end;gap:8%;padding:4px 2px 0">${BAR_H.map((v) => `<div style="flex:1;height:${(v * fill).toFixed(1)}%;background:${ac};transition:height .3s"></div>`).join("")}</div>`;
      } else if (kind === "list") {
        inner = `<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-start;gap:9%;padding-top:6%">${ROW_W.map((v) => `<div style="height:5px;width:${(v * fill).toFixed(1)}%;background:${ac};opacity:.8"></div>`).join("")}</div>`;
      }
      return `<div style="position:absolute;left:${l}%;top:${t}%;width:${w}%;height:${hh}%;opacity:${wire.toFixed(3)};border:1px ${bs} ${bc};background:${bg};padding:8px 10px;display:flex;flex-direction:column;justify-content:space-between;gap:6px;overflow:hidden">
        <span style="font-family:'Lexend Exa',sans-serif;font-size:10px;color:${fg};opacity:${lo.toFixed(3)};white-space:nowrap">${label}</span>
        ${inner}
        <span style="position:absolute;top:6px;right:6px;width:16px;height:16px;display:grid;place-items:center;background:#defa9a;color:#0e0f0b;font-size:10px;line-height:1;opacity:${vo.toFixed(3)}">✓</span>
      </div>`;
    }).join("");

    // ---- sticky notes ----
    const th2 = TH[tlTheme][2];
    const N = [[th2[0], 10, 18, 2], [th2[1], 52, 30, 4], [th2[2], 26, 62, 5], [th2[3], 54, 74, 6]];
    notesEl.innerHTML = N.map(([text, l, t, tgt], k) => {
      const inn = c01(tp / 0.05 - k * 0.5);
      const out = c01((tp - 0.2) / 0.1);
      const b = B[tgt];
      const dx = (b[1] + b[3] / 2 - l) * out * 0.6;
      const dy = (b[2] + b[4] / 2 - t) * out * 0.6;
      const op = Math.max(0, Math.min(inn, 1 - out));
      const tr = `translate(${dx.toFixed(1)}%,${dy.toFixed(1)}%) rotate(${k % 2 ? 2 : -2}deg)`;
      return `<span style="position:absolute;left:${l}%;top:${t}%;opacity:${op.toFixed(3)};transform:${tr};padding:6px 10px;border:1px dashed #6b6f60;background:#fffceb;color:#2b2e24;font:italic 500 14px 'Open Sans',sans-serif;white-space:nowrap">${text}</span>`;
    }).join("");

    // ---- track ----
    const pct = (tp * 100).toFixed(2) + "%";
    trackFill.style.width = pct;
    trackThumb.style.left = pct;
  }

  function tlRun() {
    if (raf) return;
    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min(50, now - last);
      last = now;
      let p = tlP;
      if (tlAuto) {
        p = Math.min(tlTarget, p + dt / 9000);
        if (p >= tlTarget) tlAuto = false;
      } else if (!tlDrag) {
        p += (tlTarget - p) * Math.min(1, dt / 160);
      }
      if (Math.abs(p - tlP) > 0.0005) tlP = p;
      render();
      if (tlAuto || tlDrag || Math.abs(tlTarget - p) > 0.001) {
        raf = requestAnimationFrame(frame);
      } else {
        raf = 0;
        if (Math.abs(tlTarget - p) > 0) { tlP = tlTarget; render(); }
      }
    };
    raf = requestAnimationFrame(frame);
  }

  function tlGo(p, auto) {
    tlTarget = Math.max(0, Math.min(1, p));
    tlAuto = !!auto;
    if (!auto) tlTouched = true;
    tlRun();
  }

  function tlFromX(x) {
    const r = trackEl.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (x - r.left) / r.width));
    tlTarget = p;
    tlP = p;
    render();
  }

  trackEl.addEventListener("pointerdown", (e) => {
    tlTouched = true;
    tlAuto = false;
    tlDrag = true;
    tlFromX(e.clientX);
    const mv = (ev) => tlFromX(ev.clientX);
    const up = () => {
      tlDrag = false;
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
  });

  render();

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting && !tlTouched && tlP < 0.01) tlGo(1, true);
      }),
      { threshold: 0.35 }
    );
    obs.observe(root);
  }
})();
