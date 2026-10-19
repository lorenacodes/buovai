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
      .map(() => `<div class="skeleton" aria-hidden="true"></div>`)
      .join("");
  }

  function renderTags(tags) {
    return (tags || [])
      .slice(0, 4)
      .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
      .join("");
  }

  // Testemunho real ainda não coletado — mantém o bloco como roteiro
  // (texto entre colchetes), igual ao protótipo, até termos a citação e o
  // vídeo de verdade.
  function renderTestimonial(index) {
    return `
      <div class="case-testimonial" data-screen-label="Depoimento">
        <div class="container case-testimonial__inner">
          <div class="case-testimonial__video">
            <div class="case-testimonial__play">
              <span class="btn-circle" aria-hidden="true">▶</span>
              <span class="eyebrow">vídeo do depoimento</span>
            </div>
          </div>
          <div>
            <p class="eyebrow">depoimento — caso ${String(index + 1).padStart(2, "0")}</p>
            <blockquote>“[Trecho do depoimento da cliente, em uma ou duas frases.]”</blockquote>
            <div class="case-testimonial__who">
              <div class="n">[Nome da cliente]</div>
              <div class="r">[Cargo] — [Nome do escritório de contabilidade]</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderCase(project, index) {
    const shots = SCREENSHOTS[project.client_name] || [];
    const tabShots = shots.slice(0, 2);
    const hasTabs = tabShots.length > 1;
    const tabLabels = ["Administrador", "Cliente"];

    const media = tabShots.length
      ? tabShots
          .map(
            (shot, i) => `
              <img src="${shot.src}" alt="Interface do sistema ${escapeHtml(project.title)}" loading="lazy" data-tab-img="${i}" ${i === 0 ? "" : "hidden"} />
            `
          )
          .join("")
      : `<span class="case-card__media-placeholder" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>`;

    const tabs = hasTabs
      ? `
        <div class="case-tabs" role="tablist">
          ${tabLabels
            .map((label, i) => `<button type="button" role="tab" data-tab-btn="${i}" class="${i === 0 ? "is-active" : ""}">${label}</button>`)
            .join("")}
        </div>
      `
      : "";

    return `
      <div class="case-panel" data-project-id="${project.id}" data-screen-label="Caso ${index + 1}">
        <div class="case-panel__intro">
          <div>
            <p class="eyebrow">caso ${String(index + 1).padStart(2, "0")} — ${escapeHtml(project.client_name || "")}</p>
            <h3>${escapeHtml(project.title)}</h3>
            <p>${escapeHtml(project.summary || "")}</p>
            <div class="case-panel__tags">${renderTags(project.tags)}</div>
          </div>
          <div class="case-panel__foot">
            ${tabs}
            <button type="button" class="case-panel__link" data-open-case="${project.id}">Abrir o caso completo ↗</button>
          </div>
        </div>
        <div class="case-panel__media">
          <div class="case-panel__frame">${media}</div>
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
          <figure class="case-modal__shot-item">
            <img src="${shot.src}" alt="Interface do sistema ${escapeHtml(project.title)}" loading="lazy" />
            <figcaption>${escapeHtml(shot.caption)}</figcaption>
          </figure>
        `
      )
      .join("");

    const multi = shots.length > 1;
    dotsEl.innerHTML = multi
      ? shots.map((_, i) => `<button type="button" aria-label="Ir para imagem ${i + 1}" data-dot="${i}"></button>`).join("")
      : "";
    prevBtn.style.display = multi ? "" : "none";
    nextBtn.style.display = multi ? "" : "none";

    const dots = Array.from(dotsEl.querySelectorAll("button"));
    const items = Array.from(trackEl.querySelectorAll(".case-modal__shot-item"));

    function updateActive() {
      const index = Math.round(trackEl.scrollLeft / trackEl.clientWidth);
      dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
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

    listEl.querySelectorAll(".case-panel").forEach((panel) => {
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
        listEl.innerHTML = `<div class="portfolio-empty">Novos cases em publicação em breve.</div>`;
        return;
      }

      const countEl = document.getElementById("portfolio-count");
      if (countEl) countEl.textContent = `${String(projects.length).padStart(2, "0")} caso${projects.length > 1 ? "s" : ""}`;

      listEl.innerHTML = projects
        .map((project, index) => renderCase(project, index) + (index === 0 ? renderTestimonial(index) : ""))
        .join("");
      bindCaseEvents();

      if (window.buovaiReveal) window.buovaiReveal(listEl.querySelectorAll(".case-panel, .case-testimonial"));
    } catch (err) {
      console.error("[Buovai] Falha ao carregar portfólio:", err);
      listEl.innerHTML = `<div class="portfolio-error">Não foi possível carregar os cases agora. Atualize a página em instantes.</div>`;
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
