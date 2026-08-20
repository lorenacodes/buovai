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

  function renderCard(project, index) {
    const num = String(index + 1).padStart(2, "0");
    return `
      <article class="case-card glass-panel" data-project-id="${project.id}" tabindex="0" role="button" aria-haspopup="dialog" aria-label="Ver case completo: ${escapeHtml(project.title)}">
        <div class="case-card__glow" aria-hidden="true"></div>
        <div class="case-card__inner">
          <div>
            <span class="case-card__index">Case ${num}</span>
            <h3 class="case-card__title">${escapeHtml(project.title)} <span class="case-card__client">— ${escapeHtml(project.client_name || "")}</span></h3>
            <p class="case-card__summary">${escapeHtml(project.summary || "")}</p>
            <div class="case-card__tags">${renderTags(project.tags)}</div>
          </div>
          <div class="case-card__cta">
            <div class="case-card__cta-circle" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M17 7H8M17 7v9"/></svg>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function openModal(project) {
    if (!modalEl) return;

    modalEl.querySelector(".case-modal__tags").innerHTML = renderTags(project.tags);
    modalEl.querySelector(".case-modal__title").textContent = project.title || "";
    modalEl.querySelector(".case-modal__client").textContent = [project.client_name, project.audience]
      .filter(Boolean)
      .join(" · ");
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

  function bindCardEvents() {
    listEl.querySelectorAll(".case-card").forEach((card) => {
      const id = card.getAttribute("data-project-id");
      const project = projects.find((p) => String(p.id) === id);
      if (!project) return;

      card.addEventListener("click", () => openModal(project));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(project);
        }
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

      projects = data || [];

      if (!projects.length) {
        listEl.innerHTML = `<div class="portfolio-empty">Novos cases em publicação em breve.</div>`;
        return;
      }

      listEl.innerHTML = projects.map(renderCard).join("");
      bindCardEvents();

      if (window.buovaiReveal) window.buovaiReveal(listEl.querySelectorAll(".case-card"));
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
