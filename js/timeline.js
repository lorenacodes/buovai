/**
 * "Como trabalho": timeline arrastável com janela de mockup que se
 * constrói conforme o progresso avança. O "setor" (tema do mockup) é
 * controlado externamente por js/sector-picker.js, que dispara o evento
 * "buovai:sector" sempre que o usuário escolhe ou troca de área — este
 * módulo escuta esse evento para trocar tlTheme/lb/LAY, em vez do antigo
 * seletor de pills embutido. Porte 1:1 da lógica original
 * (tlRun/tlGo/tlFromX/tlDown/tlObserve + o cálculo de tlBlocks/tlNotes,
 * incluindo o vocabulário completo de tipos de bloco: top/menu/card/
 * main/list/rows/cols/bars/grid/nav/id/hero/tile).
 */
(function () {
  "use strict";

  const root = document.getElementById("tlRoot");
  if (!root) return;

  const stepsEl = document.getElementById("tlSteps");
  const areaBtn = document.getElementById("tlAreaBtn");
  const areaLabelEl = document.getElementById("tlAreaLabel");
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

  // lb = ["buov.ai / <área>", "<bloco1>", "<bloco2>", "<bloco3>", "<bloco4 legenda>"]
  // por setor, igual a SECT[*].tl no arquivo original; "site" não tem tl (isSite).
  const SECTOR_TL = {
    contabilidade: ["buov.ai / escritório", "Clientes", "Documentos", "Honorários", "Entregas do mês"],
    industria: ["buov.ai / produção", "Ordens", "Insumos", "Qualidade", "Produção da semana"],
    comercio: ["buov.ai / loja", "Pedidos", "Clientes", "Estoque", "Vendas no mês"],
    servicos: ["buov.ai / serviços", "Agenda", "Orçamentos", "Contratos", "Atendimentos do mês"],
    engenharia: ["buov.ai / obras", "Projetos", "Medições", "Cronograma", "Avanço da obra"],
    saude: ["buov.ai / clínica"],
    educacao: ["buov.ai / escola"],
  };
  const SECTOR_NOTES = {
    contabilidade: ["DAS de quem?", "cliente pediu de novo", "boleto por WhatsApp", "planilha de honorários"],
    industria: ["qual lote?", "o estoque bate?", "apontamento no papel", "planilha do PCP"],
    comercio: ["pedido pelo WhatsApp", "o estoque bate?", "quem vendeu?", "planilha do vendedor"],
    servicos: ["quem atende?", "orçamento em PDF", "contrato assinado?", "agenda no caderno"],
    saude: ["quem faltou?", "confirmação por WhatsApp", "ficha em papel", "convênio ou particular?"],
    educacao: ["quantas vagas?", "frequência no papel", "recado para os pais", "planilha de notas"],
    engenharia: ["medição semanal?", "quem assina?", "fotos da obra", "cronograma no Excel"],
  };
  const SECTOR_LABEL = {
    contabilidade: "Contabilidade",
    industria: "Indústria",
    comercio: "Comércio",
    servicos: "Serviços",
    engenharia: "Engenharia",
    saude: "Saúde",
    educacao: "Educação",
    site: "Site institucional",
  };

  // Layout por setor: [label, left%, top%, width%, height%, kind]
  const LAY = {
    contabilidade: [["Clientes", 0, 12, 24, 88, "list"], ["Documentos do mês", 27, 12, 46, 58, "rows"], ["Honorários", 76, 12, 24, 58, "list"], ["Entregas do mês", 27, 74, 73, 26, "bars"]],
    industria: [["Ordens de produção", 0, 12, 64, 56, "cols"], ["Máquinas", 67, 12, 33, 56, "bars"], ["Insumos", 0, 72, 40, 28, "rows"], ["Qualidade", 43, 72, 57, 28, "main"]],
    comercio: [["Produtos", 0, 12, 62, 88, "grid4"], ["Pedido atual", 65, 12, 35, 60, "rows"], ["Vendas no mês", 65, 76, 35, 24, "card"]],
    servicos: [["Agenda", 0, 12, 60, 88, "grid7"], ["Atendimentos do dia", 63, 12, 37, 52, "list"], ["Contratos", 63, 68, 37, 32, "card"]],
    saude: [["Agenda", 0, 12, 48, 88, "grid7"], ["Pacientes do dia", 51, 12, 49, 52, "rows"], ["Confirmações", 51, 68, 24, 32, "card"], ["Retornos", 78, 68, 22, 32, "card"]],
    educacao: [["Turmas", 0, 12, 30, 88, "list"], ["Notas e frequência", 33, 12, 67, 56, "rows"], ["Matrículas", 33, 72, 32, 28, "card"], ["Comunicados", 68, 72, 32, 28, "bars"]],
    engenharia: [["Cronograma", 0, 12, 64, 58, "gantt"], ["Fotos da obra", 67, 12, 33, 58, "grid2"], ["Medições", 0, 74, 64, 26, "rows"], ["Avanço da obra", 67, 74, 33, 26, "card"]],
  };
  const SITE_BLOCKS = [
    ["Menu + logo", 0, 0, 100, 10, "nav"],
    ["Identidade visual", 0, 13, 30, 40, "id"],
    ["Destaque principal", 33, 13, 67, 40, "hero"],
    ["Serviços", 0, 57, 32, 43, "tile"],
    ["Sobre", 34, 57, 32, 43, "tile"],
    ["Contato e WhatsApp", 68, 57, 32, 43, "tile"],
  ];

  const c01 = (v) => Math.max(0, Math.min(1, v));
  const pc = (v) => v.toFixed(1) + "%";
  function mix(a, b, t) {
    const pa = a.match(/\w\w/g).map((x) => parseInt(x, 16));
    const pb = b.match(/\w\w/g).map((x) => parseInt(x, 16));
    return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
  }

  let currentSector = null; // null = sem escolha -> tema padrão "comercio"
  let tlP = 0;
  let tlTarget = 0;
  let tlAuto = false;
  let tlTouched = false;
  let tlDrag = false;
  let raf = 0;

  function themeKey() {
    return currentSector && (LAY[currentSector] || currentSector === "site") ? currentSector : "comercio";
  }

  function blocksFor() {
    const key = themeKey();
    if (key === "site") return SITE_BLOCKS;
    const lb = SECTOR_TL[key] || SECTOR_TL.comercio;
    const lay = LAY[key] || LAY.comercio;
    return [[lb[0], 0, 0, 100, 9, "top"], ...lay];
  }

  function tlLabelText() {
    const key = themeKey();
    return key === "site" ? "Site institucional" : SECTOR_LABEL[key] || "Comércio";
  }

  function blockInner(kind, fill, fin, ac, mu, pill, co) {
    switch (kind) {
      case "top":
        return `<div style="position:absolute;right:10px;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:8px;opacity:${co}"><span style="display:block;width:70px;height:12px;border:1px solid ${mu}"></span><span style="display:block;width:12px;height:12px;border-radius:50%;background:${ac}"></span></div>`;
      case "menu": {
        const rows = [70, 55, 62, 48, 58].map((v, j) => {
          const bg = j === 0 && fill >= 1 ? (fin > 0 ? "rgba(222,250,154,.18)" : "#efeedb") : "transparent";
          return `<div style="display:flex;align-items:center;gap:6px;padding:4px;background:${bg}"><span style="display:block;width:8px;height:8px;flex:none;background:${ac}"></span><span style="display:block;height:4px;width:${pc(v * fill)};background:${mu};transition:width .3s"></span></div>`;
        }).join("");
        return `<div style="flex:1;display:flex;flex-direction:column;gap:12px;padding-top:10px;opacity:${co}">${rows}</div>`;
      }
      case "card":
        return `<div style="display:flex;flex-direction:column;gap:7px;opacity:${co}"><span style="display:block;height:10px;width:${pc(50 * fill)};background:${ac};transition:width .3s"></span><div style="display:flex;align-items:center;gap:6px"><span style="display:block;height:4px;width:${pc(35 * fill)};background:${mu};transition:width .3s"></span><span style="display:block;height:8px;width:${pc(20 * fill)};background:${pill}"></span></div></div>`;
      case "main": {
        const area = (0.18 * fill).toFixed(3);
        const dash = (100 - fill * 100).toFixed(1);
        return `<svg viewBox="0 0 100 50" preserveAspectRatio="none" style="flex:1;width:100%;opacity:${co}"><line x1="0" y1="12" x2="100" y2="12" stroke="${mu}" stroke-width="1" vector-effect="non-scaling-stroke" stroke-dasharray="2 3"></line><line x1="0" y1="26" x2="100" y2="26" stroke="${mu}" stroke-width="1" vector-effect="non-scaling-stroke" stroke-dasharray="2 3"></line><line x1="0" y1="40" x2="100" y2="40" stroke="${mu}" stroke-width="1" vector-effect="non-scaling-stroke" stroke-dasharray="2 3"></line><polygon points="0,50 0,40 16,35 32,37 48,25 64,28 80,15 100,8 100,50" fill="${ac}" opacity="${area}"></polygon><polyline points="0,40 16,35 32,37 48,25 64,28 80,15 100,8" fill="none" stroke="${ac}" stroke-width="2" vector-effect="non-scaling-stroke" pathLength="100" stroke-dasharray="100" stroke-dashoffset="${dash}"></polyline></svg>`;
      }
      case "list": {
        const rows = [70, 52, 64, 46, 58].map((v, j) => {
          const chk = j < 2 && fill >= 1 ? ac : "transparent";
          return `<div style="display:flex;align-items:center;gap:6px"><span style="display:block;width:9px;height:9px;flex:none;border:1px solid ${ac};background:${chk}"></span><span style="display:block;height:4px;width:${pc(v * fill)};background:${mu};transition:width .3s"></span><span style="display:block;margin-left:auto;height:7px;width:18%;flex:none;background:${pill}"></span></div>`;
        }).join("");
        return `<div style="flex:1;display:flex;flex-direction:column;gap:12px;padding-top:10px;opacity:${co}">${rows}</div>`;
      }
      case "rows": {
        const trs = [0, 1, 2, 3].map((r) => {
          const hh = r === 0 ? "5px" : "4px";
          const c = r === 0 ? ac : mu;
          const rowPill = r === 0 ? "transparent" : r === 1 && fill >= 1 ? ac : pill;
          const cells = [38, 22, 16].map((v) => `<span style="display:block;height:${hh};width:${pc(v * fill * (r === 0 ? 0.7 : 1))};flex:none;background:${c}"></span>`).join("");
          return `<div style="display:flex;align-items:center;gap:8px;padding-bottom:6px;border-bottom:1px solid ${mu}">${cells}<span style="display:block;margin-left:auto;height:7px;width:16%;flex:none;background:${rowPill}"></span></div>`;
        }).join("");
        return `<div style="flex:1;display:flex;flex-direction:column;gap:7px;padding-top:6px;opacity:${co}">${trs}</div>`;
      }
      case "cols": {
        const colBg = fin > 0 ? "rgba(14,15,11,.25)" : "#f6f4e6";
        const cardBg = fin > 0 ? "rgba(255,252,235,.06)" : "#fffceb";
        const cols = [3, 2, 1].map((n, ci) => {
          const tw = pc([45, 60, 35][ci] * fill);
          const cards = Array.from({ length: n }, (_, j) => {
            const w = pc((70 - j * 12) * fill);
            const w2 = pc((45 + j * 8) * fill);
            return `<div style="padding:5px;border:1px solid ${mu};display:flex;flex-direction:column;gap:3px;background:${cardBg}"><span style="display:block;height:3px;width:${w};flex:none;background:${mu}"></span><span style="display:block;height:3px;width:${w2};flex:none;background:${mu}"></span></div>`;
          }).join("");
          return `<div style="display:flex;flex-direction:column;gap:5px;padding:5px;background:${colBg}"><span style="display:block;height:4px;width:${tw};flex:none;background:${ac}"></span>${cards}</div>`;
        }).join("");
        return `<div style="flex:1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;padding-top:6px;opacity:${co}">${cols}</div>`;
      }
      case "bars":
      case "gantt": {
        const track = fin > 0 ? "rgba(255,252,235,.12)" : "#efeedb";
        const gbData = kind === "gantt" ? [[0, 30], [18, 34], [40, 26], [52, 30], [70, 26]] : [[0, 82], [0, 64], [0, 91], [0, 47], [0, 73]];
        const gb = gbData.map(([o, gw]) => `<div style="display:flex;align-items:center;gap:8px"><span style="display:block;height:4px;width:20%;flex:none;background:${mu}"></span><div style="flex:1;position:relative;height:8px;background:${track}"><span style="position:absolute;top:0;bottom:0;left:${o}%;width:${pc(gw * fill)};background:${ac};transition:width .3s"></span></div></div>`).join("");
        return `<div style="flex:1;display:flex;flex-direction:column;justify-content:space-around;gap:6px;padding-top:4px;opacity:${co}">${gb}</div>`;
      }
      case "grid7":
      case "grid4":
      case "grid2": {
        const gc = kind === "grid7" ? 7 : kind === "grid4" ? 4 : 2;
        const count = kind === "grid7" ? 35 : kind === "grid4" ? 12 : 6;
        const litCells = [3, 8, 9, 15, 17, 22, 26, 30];
        const cells = Array.from({ length: count }, (_, j) => {
          let bg;
          if (fill <= 0) bg = "transparent";
          else if (kind === "grid7") bg = litCells.includes(j) ? ac : "transparent";
          else if (kind === "grid4") bg = j % 5 === 1 ? ac : fin > 0 ? "rgba(255,252,235,.08)" : "#f6f4e6";
          else bg = fin > 0 ? "rgba(255,252,235,.1)" : "#e3e1cc";
          return `<span style="display:block;min-height:8px;background:${bg};border:1px solid ${mu}"></span>`;
        }).join("");
        return `<div style="flex:1;display:grid;grid-template-columns:repeat(${gc},minmax(0,1fr));grid-auto-rows:1fr;gap:4px;padding-top:6px;opacity:${co}">${cells}</div>`;
      }
      case "nav":
        return `<div style="position:absolute;right:10px;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:10px;opacity:${co}"><span style="display:block;height:4px;width:24px;background:${mu};transition:width .3s"></span><span style="display:block;height:4px;width:24px;background:${mu};transition:width .3s"></span><span style="display:block;height:4px;width:24px;background:${mu};transition:width .3s"></span><span style="display:block;width:44px;height:14px;background:${ac}"></span></div>`;
      case "id": {
        const fg = fin > 0.5 ? "#fffceb" : "#2b2e24";
        return `<div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:12px;opacity:${co}"><span style="font-family:'Lexend Exa',sans-serif;font-size:clamp(20px,3vw,34px);letter-spacing:-.06em;line-height:1;color:${fg}">Aa</span><div style="display:flex;gap:5px"><span style="display:block;width:16px;height:16px;background:#1f4905;border:1px solid ${mu}"></span><span style="display:block;width:16px;height:16px;background:#457528"></span><span style="display:block;width:16px;height:16px;background:#defa9a"></span><span style="display:block;width:16px;height:16px;background:#fffceb;border:1px solid ${mu}"></span></div></div>`;
      }
      case "hero": {
        const fg = fin > 0.5 ? "#fffceb" : "#2b2e24";
        return `<div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:9px;opacity:${co}"><span style="display:block;height:10px;width:${pc(80 * fill)};background:${fg};transition:width .3s"></span><span style="display:block;height:10px;width:${pc(60 * fill)};background:${fg};transition:width .3s"></span><span style="display:block;height:4px;width:${pc(70 * fill)};background:${mu};transition:width .3s"></span><span style="display:block;margin-top:4px;width:${pc(30 * fill)};height:14px;background:${ac}"></span></div>`;
      }
      case "tile":
        return `<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;gap:7px;opacity:${co}"><span style="display:block;width:14px;height:14px;background:${ac}"></span><span style="display:block;height:4px;width:${pc(70 * fill)};background:${mu};transition:width .3s"></span><span style="display:block;height:4px;width:${pc(50 * fill)};background:${mu};transition:width .3s"></span></div>`;
      default:
        return "";
    }
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

    // ---- "trocar área" ----
    if (areaLabelEl) areaLabelEl.textContent = tlLabelText().toLowerCase();

    // ---- window chrome ----
    const tlStatus = ["rascunho", "wireframe", "em construção", "● no ar"][stage];
    statusBadge.textContent = tlStatus;
    statusBadge.style.background = stage === 3 ? "#defa9a" : "#c9cbb5";
    windowEl.style.background = fin > 0 ? mix("fffceb", "16330f", fin) : "#fffceb";
    canvasEl.style.backgroundImage = tp < 0.3 ? `radial-gradient(circle,rgba(14,15,11,${(0.18 * (1 - c01((tp - 0.2) / 0.1))).toFixed(3)}) 1px,transparent 1.5px)` : "none";

    // ---- blocks ----
    const B = blocksFor();
    blocksEl.innerHTML = B.map(([label, l, t, w, hh, kind], i) => {
      const wire = c01((tp - 0.2) / 0.1 - i * 0.35);
      const fill = c01((tp - 0.5 - i * 0.03) / 0.035);
      const vo = fill >= 1 ? 1 - c01((tp - 0.8) / 0.06) : 0;
      const bs = fill >= 1 ? "solid" : "dashed";
      const bc = fill >= 1 ? (fin > 0 ? `rgba(222,250,154,${(0.2 + 0.25 * fin).toFixed(3)})` : "#c9c8b4") : "#8a8d7c";
      const bg = fill > 0 ? (fin > 0 ? mix("fffceb", i === 0 ? "0e0f0b" : "1f4905", fin) : "#fffceb") : "transparent";
      const fg = fin > 0.5 ? "#fffceb" : "#2b2e24";
      const lo = 0.4 + 0.6 * Math.max(wire * 0.5, fill);
      const ac = fin > 0 ? mix("457528", "defa9a", fin) : "#457528";
      const mu = fin > 0 ? `rgba(255,252,235,${(0.25 + 0.1 * fin).toFixed(3)})` : "#c9c8b4";
      const pill = fin > 0 ? `rgba(222,250,154,${(0.35 + 0.4 * fin).toFixed(3)})` : "#e3e1cc";
      const co = fill.toFixed(3);
      const xo = (wire * (1 - fill) * 0.7).toFixed(3);
      const inner = blockInner(kind, fill, fin, ac, mu, pill, co);
      return `<div style="position:absolute;left:${l}%;top:${t}%;width:${w}%;height:${hh}%;opacity:${wire.toFixed(3)};border:1px ${bs} ${bc};background:${bg};padding:8px 10px;display:flex;flex-direction:column;justify-content:space-between;gap:6px;overflow:hidden">
        <span style="font-family:'Lexend Exa',sans-serif;font-size:10px;color:${fg};opacity:${lo.toFixed(3)};white-space:nowrap">${label}</span>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;opacity:${xo};pointer-events:none"><line x1="0" y1="0" x2="100" y2="100" stroke="#8a8d7c" stroke-width="1" vector-effect="non-scaling-stroke"></line><line x1="100" y1="0" x2="0" y2="100" stroke="#8a8d7c" stroke-width="1" vector-effect="non-scaling-stroke"></line></svg>
        ${inner}
        <span style="position:absolute;top:6px;right:6px;width:16px;height:16px;display:grid;place-items:center;background:#defa9a;color:#0e0f0b;font-size:10px;line-height:1;opacity:${vo.toFixed(3)}">✓</span>
      </div>`;
    }).join("");

    // ---- sticky notes ----
    const key = themeKey();
    const notes = key === "site" ? ["qual a cor da marca?", "logo nova?", "abre no celular?", "botão de WhatsApp"] : SECTOR_NOTES[key] || SECTOR_NOTES.comercio;
    const N = [[notes[0], 6, 20, 1], [notes[1], 50, 24, 2], [notes[2], 18, 66, Math.min(3, B.length - 1)], [notes[3], 56, 76, B.length - 1]];
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

  if (areaBtn) {
    areaBtn.addEventListener("click", () => {
      if (window.buovaiSector) window.buovaiSector.open();
    });
  }

  window.addEventListener("buovai:sector", (e) => {
    currentSector = e.detail && e.detail.key ? e.detail.key : null;
    tlP = 0;
    tlTarget = 0;
    render();
    setTimeout(() => tlGo(1, true), 60);
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
