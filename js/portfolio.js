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
    "Milatec": [
      {
        src: "assets/img/case-milalab.jpg",
        caption: "Painel do MilaLab — dados sensíveis borrados para preservar a privacidade do cliente.",
      },
    ],
    "Trilhar Contabilidade": [
      {
        src: "assets/img/case-trilhar-dashboard.jpg",
        caption: "Visão geral do painel administrativo — indicadores da operação em tempo real.",
      },
      {
        src: "assets/img/case-trilhar-clientes.jpg",
        caption: "Lista de clientes — nomes, e-mails e CPFs borrados para preservar a privacidade dos clientes da Trilhar.",
      },
      {
        src: "assets/img/case-trilhar-detalhe.jpg",
        caption: "Ficha individual do cliente — dados pessoais borrados para preservar a privacidade.",
      },
      {
        src: "assets/img/case-trilhar-financeiro.jpg",
        caption: "Financeiro — controle de boletos por competência, com upload de documento vinculado. Nome do cliente borrado.",
      },
      {
        src: "assets/img/case-trilhar-config.jpg",
        caption: "Configurações — categorias de documento totalmente customizáveis, sem alterar código.",
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

  function renderCard(project, index) {
    const num = String(index + 1).padStart(2, "0");
    const firstShot = (SCREENSHOTS[project.client_name] || [])[0];
    const media = firstShot
      ? `<img src="${firstShot.src}" alt="Interface do sistema ${escapeHtml(project.title)}" loading="lazy" />`
      : `<span class="case-card__media-placeholder" aria-hidden="true">${num}</span>`;

    return `
      <article class="case-card" data-project-id="${project.id}" tabindex="0" role="button" aria-haspopup="dialog" aria-label="Ver case completo: ${escapeHtml(project.title)}">
        <div class="case-card__media">${media}</div>
        <div class="case-card__body">
          <div class="case-card__meta">
            <span class="case-card__index">Case ${num}</span>
          </div>
          <h3 class="case-card__title">${escapeHtml(project.title)} <span class="case-card__client">— ${escapeHtml(project.client_name || "")}</span></h3>
          <p class="case-card__summary">${escapeHtml(project.summary || "")}</p>
          <div class="case-card__tags">${renderTags(project.tags)}</div>
          <div class="case-card__cta">
            <span>Ver case completo</span>
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M17 7H8M17 7v9"/></svg>
          </div>
        </div>
      </article>
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
