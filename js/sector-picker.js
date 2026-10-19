/**
 * Seletor de "área" (setor de atuação do visitante): pergunta flutuante
 * que aparece depois de alguns segundos, lembra a escolha em
 * localStorage ("buov-area") e personaliza a linha do hero, as palavras
 * digitadas e o tema do mockup da linha do tempo via o evento
 * "buovai:sector" (ouvido por hero-anim.js e timeline.js). Porte 1:1 de
 * SECT/chooseSector/askArea/areaOpen/showAreaChip do arquivo original.
 */
(function () {
  "use strict";

  const SECT = [
    { key: "contabilidade", label: "Contabilidade", words: ["portais para clientes", "envio de documentos", "cobrança de honorários", "migração de sistemas"], line: "Para escritórios contábeis: portal de documentos e boletos, cadastro de clientes e rotinas automáticas." },
    { key: "industria", label: "Indústria", words: ["controle de produção", "ordens de serviço", "estoque de insumos", "integração com o ERP"], line: "Para indústrias: produção, ordens de serviço, estoque e integração com o sistema que você já usa." },
    { key: "comercio", label: "Comércio", words: ["controle de pedidos", "orçamentos rápidos", "estoque", "integração com a loja"], line: "Para comércio: pedidos, orçamentos, estoque e clientes num lugar só." },
    { key: "servicos", label: "Serviços", words: ["agenda e atendimentos", "orçamentos", "contratos", "portal do cliente"], line: "Para empresas de serviços: agenda, orçamentos, contratos e acompanhamento do cliente." },
    { key: "engenharia", label: "Engenharia", words: ["medições de obra", "cronogramas", "orçamentos de obra", "relatórios técnicos"], line: "Para engenharia e construção: medições, cronograma, orçamentos de obra e relatórios." },
    { key: "saude", label: "Saúde", words: ["agenda de consultas", "cadastro de pacientes", "confirmação de horários", "portal do paciente"], line: "Para clínicas e consultórios: agenda, cadastro de pacientes, confirmações e portal do paciente." },
    { key: "educacao", label: "Educação", words: ["matrículas", "notas e frequência", "portal do aluno", "comunicação com responsáveis"], line: "Para escolas e cursos: matrículas, turmas, notas, frequência e portal para alunos e responsáveis." },
    { key: "site", label: "Site institucional", words: ["sites profissionais", "landing pages", "identidade visual", "domínio próprio"], line: "Para quem precisa de presença online: site ou landing page com identidade visual, que abre bem no celular." },
  ];

  const heroSectorLine = document.getElementById("heroSectorLine");
  const tlAreaLabel = document.getElementById("tlAreaLabel");

  let sector = null;
  let open = false; // askArea || areaOpen (mesmo widget, motivos diferentes de estar aberto)
  let askedOnce = false;
  let popupEl = null;
  let askTimer = null;

  function sectorOf(key) {
    return SECT.find((s) => s.key === key) || null;
  }

  function save(key) {
    try { localStorage.setItem("buov-area", key || "skip"); } catch (e) {}
  }

  function applySector() {
    const s = sectorOf(sector);
    if (heroSectorLine) {
      if (s) {
        heroSectorLine.textContent = "//" + s.line;
        heroSectorLine.style.display = "block";
      } else {
        heroSectorLine.style.display = "none";
      }
    }
    if (tlAreaLabel && s) tlAreaLabel.textContent = s.label.toLowerCase();
    window.dispatchEvent(new CustomEvent("buovai:sector", { detail: { key: sector, sector: s } }));
    renderPopup();
  }

  function chooseSector(key) {
    sector = key || null;
    save(sector);
    open = false;
    askedOnce = true;
    applySector();
  }

  function renderPopup() {
    const s = sectorOf(sector);
    if (popupEl) { popupEl.remove(); popupEl = null; }

    if (open) {
      // "showAsk": pergunta com todas as opções
      popupEl = document.createElement("div");
      popupEl.style.cssText = "position:fixed;left:20px;bottom:20px;z-index:45;width:min(380px,calc(100vw - 40px));background:#0e0f0b;color:#fffceb;padding:20px;box-shadow:0 24px 60px rgba(14,15,11,.4);animation:modIn .5s cubic-bezier(.16,.84,.24,1) both";
      const opts = SECT.map(
        (x) =>
          `<button type="button" data-area-opt="${x.key}" class="area-opt-btn" style="padding:9px 12px;border:1px solid rgba(255,252,235,.4);background:${x.key === sector ? "#defa9a" : "transparent"};color:${x.key === sector ? "#0e0f0b" : "#fffceb"};font:inherit;cursor:pointer">${x.label}</button>`
      ).join("");
      popupEl.innerHTML = `
        <div style="font-family:'Lexend Exa',sans-serif;font-size:10px;color:#defa9a;margin-bottom:10px">buov.ai</div>
        <div style="font-size:15px;line-height:1.5;margin-bottom:16px">Para mostrar exemplos da sua realidade: qual é a sua área?</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;font-family:'Lexend Exa',sans-serif;font-size:11px">${opts}</div>
        <div style="display:flex;gap:16px;margin-top:14px">
          ${s ? '<button type="button" data-area-clear style="padding:0;background:none;border:0;color:#defa9a;font-family:\'Lexend Exa\',sans-serif;font-size:10px;cursor:pointer;text-decoration:underline">Remover exemplo</button>' : ""}
          <button type="button" data-area-skip style="padding:0;background:none;border:0;color:#c9cbb5;font-family:'Lexend Exa',sans-serif;font-size:10px;cursor:pointer;text-decoration:underline">${s ? "Fechar" : "Pular"}</button>
        </div>
      `;
      document.body.appendChild(popupEl);
      popupEl.querySelectorAll("[data-area-opt]").forEach((btn) =>
        btn.addEventListener("click", () => chooseSector(btn.getAttribute("data-area-opt")))
      );
      const clearBtn = popupEl.querySelector("[data-area-clear]");
      if (clearBtn) clearBtn.addEventListener("click", () => chooseSector(null));
      popupEl.querySelector("[data-area-skip]").addEventListener("click", () => {
        save(sector);
        open = false;
        askedOnce = true;
        renderPopup();
      });
    } else if (s) {
      // "showAreaChip": chip persistente com a área escolhida
      popupEl = document.createElement("div");
      popupEl.style.cssText = "position:fixed;left:20px;bottom:20px;z-index:45;display:flex;background:#0e0f0b;box-shadow:0 12px 30px rgba(14,15,11,.3);font-family:'Lexend Exa',sans-serif;font-size:10px";
      popupEl.innerHTML = `
        <button type="button" data-area-reopen style="padding:10px 14px;background:transparent;color:#fffceb;border:0;font:inherit;cursor:pointer" class="area-chip-btn">Exemplos para: <span style="color:#defa9a">${s.label}</span> · trocar</button>
        <button type="button" data-area-clear aria-label="Remover exemplo" title="Remover exemplo" style="padding:10px 12px;background:transparent;color:#c9cbb5;border:0;border-left:1px solid rgba(255,252,235,.2);font:inherit;cursor:pointer" class="area-chip-close">✕</button>
      `;
      document.body.appendChild(popupEl);
      popupEl.querySelector("[data-area-reopen]").addEventListener("click", () => { open = true; renderPopup(); });
      popupEl.querySelector("[data-area-clear]").addEventListener("click", () => chooseSector(null));
    }
  }

  window.buovaiSector = {
    open: () => { open = true; renderPopup(); },
    get: () => sector,
    words: () => (sectorOf(sector) || {}).words || null,
  };

  let saved = null;
  try { saved = localStorage.getItem("buov-area"); } catch (e) {}
  if (saved && saved !== "skip" && sectorOf(saved)) {
    sector = saved;
    applySector();
  } else if (!saved) {
    askTimer = setTimeout(() => {
      open = true;
      renderPopup();
    }, 7400);
  } else {
    renderPopup();
  }
})();
