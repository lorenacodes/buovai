/**
 * Busca os cases publicados em portfolio_projects (Supabase) e renderiza
 * a lista de cards + o modal de detalhe de cada case.
 */
(function () {
  "use strict";

  const listEl = document.getElementById("portfolio-list");
  const modalEl = document.getElementById("case-modal");
  if (!listEl) return;

  let projects = [];

  // Prints reais dos sistemas, com dados sensíveis borrados. Mapeados por
  // client_name porque a tabela portfolio_projects ainda não tem coluna de imagem.
  const SCREENSHOTS = {
    "Trilhar Contabilidade": [
      {
        src: "assets/img/case-trilhar-dashboard.jpg",
        caption: "Visão geral do painel administrativo. Indicadores da operação em tempo real.",
      },
      {
        src: "assets/img/case-trilhar-clientes.jpg",
        caption: "Lista de clientes. Nomes, e-mails e CPFs borrados para preservar a privacidade dos clientes da Trilhar.",
      },
      {
        src: "assets/img/case-trilhar-detalhe.jpg",
        caption: "Ficha individual do cliente. Dados pessoais borrados para preservar a privacidade.",
      },
      {
        src: "assets/img/case-trilhar-financeiro.jpg",
        caption: "Financeiro: controle de boletos por competência, com upload de documento vinculado. Nome do cliente borrado.",
      },
      {
        src: "assets/img/case-trilhar-config.jpg",
        caption: "Configurações: categorias de documento totalmente customizáveis, sem alterar código.",
      },
    ],
  };

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }

  function renderSkeleton() {
    listEl.innerHTML = Array.from({ length: 2 })
      .map(() => `<div aria-hidden="true" style="aspect-ratio:16/10;background:#efeedb"></div>`)
      .join("");
  }

  function renderTags(tags) {
    return (tags || [])
      .slice(0, 4)
      .map((t) => `<span style="display:inline-flex;align-items:center;padding:.35em .75em;font-family:'Lexend Exa',sans-serif;font-size:.66rem;background:rgba(69,117,40,.08);border:1px solid rgba(69,117,40,.3);color:#457528">${escapeHtml(t)}</span>`)
      .join("");
  }

  // Testemunho real ainda não coletado — mantém o bloco como roteiro
  // (texto entre colchetes), igual ao arquivo original, até termos a
  // citação e o vídeo de verdade. Estilos inline copiados literalmente.
  function renderTestimonial(index) {
    return `
      <div style="background:#efeedb" data-screen-label="Depoimento">
        <div style="max-width:1320px;margin:0 auto;padding:clamp(48px,6vw,88px) 28px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:48px 72px;align-items:center">
          <div style="position:relative;aspect-ratio:16/9;background:#0e0f0b;display:grid;place-items:center;overflow:hidden">
            <div style="position:absolute;inset:0;background:radial-gradient(circle at 0% 0%,#3f5204 0%,#1f4905 55%,#0e0f0b 100%);opacity:.7"></div>
            <div style="position:relative;display:flex;flex-direction:column;align-items:center;gap:18px;color:#fffceb">
              <span style="width:72px;height:72px;border:1px solid #fffceb;border-radius:50%;display:grid;place-items:center;font-size:22px;padding-left:5px">▶</span>
              <span style="font-family:'Lexend Exa',sans-serif;font-size:12px">//vídeo do depoimento</span>
            </div>
          </div>
          <div>
            <div style="font-family:'Lexend Exa',sans-serif;font-size:12px;color:#457528;margin-bottom:24px">//depoimento — caso ${String(index + 1).padStart(2, "0")}</div>
            <p style="font-family:'Lexend Exa',sans-serif;font-weight:300;font-size:clamp(20px,2.2vw,30px);line-height:1.35;letter-spacing:-.04em;margin:0 0 32px;text-wrap:pretty">"[Trecho do depoimento da cliente, em uma ou duas frases.]"</p>
            <div style="border-top:1px solid #0e0f0b;padding-top:18px">
              <div style="font-family:'Lexend Exa',sans-serif;font-size:15px;letter-spacing:-.02em">[Nome da cliente]</div>
              <div style="font-size:14px;color:#2b2e24;margin-top:6px">[Cargo] — [Nome do escritório de contabilidade]</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Painel grande por caso: estilos inline copiados literalmente do bloco
  // "Caso 01"/"Caso 02" do arquivo original (mesmo gradiente, mesmo
  // padding, mesma estrutura de tabs). A alternância de lado da imagem
  // (order:-1 nos casos de índice ímpar) também é do original.
  function renderCase(project, index) {
    const shots = SCREENSHOTS[project.client_name] || [];
    const tabShots = shots.slice(0, 2);
    const hasTabs = tabShots.length > 1;
    const tabLabels = ["Administrador", "Cliente"];
    const mediaOrder = index % 2 ? "order:-1;" : "";

    const media = tabShots.length
      ? tabShots
          .map(
            (shot, i) =>
              `<img src="${shot.src}" alt="Interface do sistema ${escapeHtml(project.title)}" loading="lazy" data-tab-img="${i}" ${i === 0 ? "" : "hidden"} style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block" />`
          )
          .join("")
      : `<span aria-hidden="true" style="position:absolute;inset:0;display:grid;place-items:center;font-family:'Lexend Exa',sans-serif;font-size:3rem;color:#457528;opacity:.4">${String(index + 1).padStart(2, "0")}</span>`;

    const tabs = hasTabs
      ? `<div role="tablist" style="display:flex;border:1px solid #0e0f0b;width:max-content;max-width:100%;font-family:'Lexend Exa',sans-serif;font-size:12px">
          ${tabLabels
            .map(
              (label, i) =>
                `<button type="button" role="tab" data-tab-btn="${i}" class="case-tab-btn" style="padding:12px 16px;border:0;background:${i === 0 ? "#0e0f0b" : "transparent"};color:${i === 0 ? "#fffceb" : "#0e0f0b"};font:inherit;cursor:pointer">${label}</button>`
            )
            .join("")}
        </div>`
      : "";

    return `
      <div data-project-id="${project.id}" data-screen-label="Caso ${index + 1}" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))">
        <div data-glow="1" style="position:relative;overflow:hidden;background:radial-gradient(circle at 0% 0%,#3f5204 0%,#94ab86 28%,#1f4905 62%,#defa9a 100%);padding:clamp(40px,6vw,88px) clamp(28px,5vw,72px);display:flex;flex-direction:column;justify-content:space-between;gap:48px;min-height:620px">
          <div>
            <div style="font-family:'Lexend Exa',sans-serif;font-size:12px;color:#fffceb;margin-bottom:28px">//caso ${String(index + 1).padStart(2, "0")} — ${escapeHtml(project.client_name || "")}</div>
            <h2 style="font-family:'Lexend Exa',sans-serif;font-weight:400;font-size:clamp(26px,2.8vw,40px);line-height:1.14;letter-spacing:-.05em;margin:0 0 24px;color:#0e0f0b;text-wrap:balance">${escapeHtml(project.title)}</h2>
            <p style="font-size:17px;line-height:1.65;margin:0;color:#0e0f0b;max-width:460px;text-wrap:pretty">${escapeHtml(project.summary || "")}</p>
          </div>
          <div style="display:flex;flex-direction:column;gap:20px">
            ${tabs}
            <button type="button" class="case-link" data-open-case="${project.id}" style="font-family:'Lexend Exa',sans-serif;font-size:13px;color:#0e0f0b;border:0;border-bottom:1px solid #0e0f0b;width:max-content;padding-bottom:4px;white-space:nowrap;background:none;cursor:pointer">Abrir o caso completo ↗</button>
          </div>
        </div>
        <div style="${mediaOrder}background:#efeedb;padding:clamp(28px,4vw,56px);display:flex;align-items:center">
          <div style="position:relative;width:100%;aspect-ratio:16/11;box-shadow:0 30px 60px rgba(31,73,5,.18)">${media}</div>
        </div>
      </div>
    `;
  }

  function setupShots(project) {
    const shots = SCREENSHOTS[project.client_name];
    const shotEl = modalEl.querySelector('[data-field="shot"]');
    const trackEl = modalEl.querySelector('[data-field="shot-track"]');
    const dotsEl = modalEl.querySelector('[data-field="shot-dots"]');
    const prevBtn = modalEl.querySelector('[data-field="shot-prev"]');
    const nextBtn = modalEl.querySelector('[data-field="shot-next"]');

    if (!shots || !shots.length) {
      shotEl.hidden = true;
      trackEl.innerHTML = "";
      dotsEl.innerHTML = "";
      return;
    }

    trackEl.innerHTML = shots
      .map(
        (shot) => `
          <figure style="flex:0 0 100%;scroll-snap-align:start;margin:0">
            <img src="${shot.src}" alt="Interface do sistema ${escapeHtml(project.title)}" loading="lazy" style="width:100%;display:block" />
            <figcaption style="padding:.85em 1em;font-size:.82rem;color:rgba(14,15,11,.56);background:#efeedb">${escapeHtml(shot.caption)}</figcaption>
          </figure>
        `
      )
      .join("");

    const multi = shots.length > 1;
    dotsEl.innerHTML = multi
      ? shots
          .map((_, i) => `<button type="button" aria-label="Ir para imagem ${i + 1}" data-dot="${i}" style="width:6px;height:6px;border-radius:50%;background:rgba(14,15,11,.4);border:0;cursor:pointer;padding:0"></button>`)
          .join("")
      : "";
    prevBtn.style.display = multi ? "" : "none";
    nextBtn.style.display = multi ? "" : "none";

    const dots = Array.from(dotsEl.querySelectorAll("button"));
    const items = Array.from(trackEl.querySelectorAll("figure"));

    function updateActive() {
      const index = Math.round(trackEl.scrollLeft / trackEl.clientWidth);
      dots.forEach((d, i) => { d.style.background = i === index ? "#457528" : "rgba(14,15,11,.4)"; });
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === items.length - 1;
    }

    function goTo(index) {
      trackEl.scrollTo({ left: index * trackEl.clientWidth, behavior: "smooth" });
    }

    trackEl.addEventListener("scroll", updateActive, { passive: true });
    dots.forEach((d, i) => d.addEventListener("click", () => goTo(i)));
    if (prevBtn) prevBtn.onclick = () => goTo(Math.max(0, Math.round(trackEl.scrollLeft / trackEl.clientWidth) - 1));
    if (nextBtn) nextBtn.onclick = () => goTo(Math.min(items.length - 1, Math.round(trackEl.scrollLeft / trackEl.clientWidth) + 1));

    trackEl.scrollLeft = 0;
    updateActive();
    shotEl.hidden = false;
  }

  function openModal(project) {
    if (!modalEl) return;

    modalEl.querySelector(".case-modal__tags").innerHTML = renderTags(project.tags);
    modalEl.querySelector(".case-modal__title").textContent = project.title || "";
    modalEl.querySelector(".case-modal__client").textContent = [project.client_name, project.audience]
      .filter(Boolean)
      .join(" · ");
    setupShots(project);

    modalEl.querySelector('[data-field="problem"]').textContent = project.problem || "—";
    modalEl.querySelector('[data-field="solution"]').textContent = project.solution || "—";

    const highlightsEl = modalEl.querySelector('[data-field="highlights"]');
    highlightsEl.innerHTML = (project.highlights || []).map((h) => `<li>${escapeHtml(h)}</li>`).join("");

    const stackEl = modalEl.querySelector('[data-field="stack"]');
    stackEl.innerHTML = (project.tech_stack || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");

    const noteEl = modalEl.querySelector('[data-field="note"]');
    noteEl.textContent = project.access_note || "";
    noteEl.style.display = project.access_note ? "block" : "none";

    modalEl.classList.add("is-open");
    document.body.style.overflow = "hidden";
    modalEl.querySelector(".case-modal__close").focus();
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function bindCaseEvents() {
    listEl.querySelectorAll("[data-open-case]").forEach((btn) => {
      const id = btn.getAttribute("data-open-case");
      const project = projects.find((p) => String(p.id) === id);
      if (!project) return;
      btn.addEventListener("click", () => openModal(project));
    });

    listEl.querySelectorAll("[data-project-id]").forEach((panel) => {
      const tabBtns = panel.querySelectorAll("[data-tab-btn]");
      const imgs = panel.querySelectorAll("[data-tab-img]");
      tabBtns.forEach((tabBtn) => {
        tabBtn.addEventListener("click", () => {
          const target = tabBtn.getAttribute("data-tab-btn");
          tabBtns.forEach((b) => b.classList.toggle("is-active", b === tabBtn));
          imgs.forEach((img) => { img.hidden = img.getAttribute("data-tab-img") !== target; });
        });
      });
    });
  }

  async function loadPortfolio() {
    renderSkeleton();
    try {
      const { data, error } = await window.buovaiClient
        .from("portfolio_projects")
        .select("*")
        .eq("published", true)
        .order("display_order", { ascending: true });

      if (error) throw error;

      // Case do estágio oculto até a empresa autorizar o uso, mesmo anônimo.
      const HIDDEN = /milatec|milalab/i;
      projects = (data || []).filter(
        (p) => !HIDDEN.test(`${p.client_name || ""} ${p.title || ""}`)
      );

      if (!projects.length) {
        listEl.innerHTML = `<div style="padding:2rem 28px;color:rgba(14,15,11,.56);font-size:.95rem">Novos cases em publicação em breve.</div>`;
        return;
      }

      const countEl = document.getElementById("portfolio-count");
      if (countEl) countEl.textContent = `${String(projects.length).padStart(2, "0")} caso${projects.length > 1 ? "s" : ""}`;

      listEl.innerHTML = projects
        .map((project, index) => renderCase(project, index) + (index === 0 ? renderTestimonial(index) : ""))
        .join("");
      bindCaseEvents();

      if (window.buovaiReveal) window.buovaiReveal(listEl.querySelectorAll("[data-screen-label]"));
    } catch (err) {
      console.error("[Buovai] Falha ao carregar portfólio:", err);
      listEl.innerHTML = `<div style="padding:2rem 28px;color:rgba(14,15,11,.56);font-size:.95rem">Não foi possível carregar os cases agora. Atualize a página em instantes.</div>`;
    }
  }

  if (modalEl) {
    modalEl.querySelector(".case-modal__close").addEventListener("click", closeModal);
    modalEl.querySelector(".case-modal__backdrop").addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modalEl.classList.contains("is-open")) closeModal();
    });
  }

  loadPortfolio();
})();
