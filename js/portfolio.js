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

  // Prints reais do sistema da Trilhar, com dados sensíveis borrados.
  // Os 4 primeiros alimentam o mockup interativo (abas + crossfade); o
  // modal de detalhe completo usa os mesmos 4, na mesma ordem.
  const TRILHAR_SHOTS = [
    { key: "vg", label: "Visão geral", src: "assets/caso-contab-visao-geral-v3.png", caption: "O escritório acompanha clientes, documentos e financeiro num só painel." },
    { key: "cl", label: "Ficha do cliente", src: "assets/caso-contab-cliente-v3.png", caption: "Cada cliente reúne dados cadastrais, boletos, documentos, pendências e histórico." },
    { key: "fin", label: "Financeiro", src: "assets/caso-contab-financeiro-v3.png", caption: "Boletos organizados por ano, mês e dia, com status e vencimento de cada um." },
    { key: "cat", label: "Categorias personalizáveis", src: "assets/caso-contab-categorias-v2.png", caption: "O escritório cria as próprias categorias de documentos, define quem pode enviar cada uma e quais têm valor financeiro." },
  ];

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
            <div style="font-family:'Lexend Exa',sans-serif;font-size:12px;color:#457528;margin-bottom:24px">//depoimento · caso ${String(index + 1).padStart(2, "0")}</div>
            <p style="font-family:'Lexend Exa',sans-serif;font-weight:300;font-size:clamp(20px,2.2vw,30px);line-height:1.35;letter-spacing:-.04em;margin:0 0 32px;text-wrap:pretty">"[Trecho do depoimento da cliente, em uma ou duas frases.]"</p>
            <div style="border-top:1px solid #0e0f0b;padding-top:18px">
              <div style="font-family:'Lexend Exa',sans-serif;font-size:15px;letter-spacing:-.02em">Tinaysa Freitas</div>
              <div style="font-size:14px;color:#2b2e24;margin-top:6px">Fundadora da Trilhar Contabilidade</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Painel grande por caso: estilos inline copiados literalmente do bloco
  // "Caso 01" do arquivo original. A Trilhar tem o mockup interativo (4
  // abas, crossfade automático, tilt no mouse, pontos de navegação);
  // qualquer outro case futuro cai no bloco simples de 2 abas.
  function renderCase(project, index) {
    const isTrilhar = project.client_name === "Trilhar Contabilidade";

    if (isTrilhar) {
      const tabs = TRILHAR_SHOTS.map(
        (s, i) =>
          `<button type="button" role="tab" data-case-tab="${s.key}" class="case-tab-btn" style="padding:12px 16px;border:0;background:${i === 0 ? "#0e0f0b" : "transparent"};color:${i === 0 ? "#fffceb" : "#0e0f0b"};font:inherit;cursor:pointer">${s.label}</button>`
      ).join("");

      const imgs = TRILHAR_SHOTS.map(
        (s, i) =>
          `<img src="${s.src}" alt="Painel administrativo: ${escapeHtml(s.label)}" loading="lazy" data-case-shot="${s.key}" style="position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover;object-position:top left;opacity:${i === 0 ? 1 : 0};transition:opacity .7s ease">`
      ).join("");

      const dots = TRILHAR_SHOTS.map(
        (s, i) =>
          `<button type="button" data-case-dot="${s.key}" aria-label="${escapeHtml(s.label)}" style="width:${i === 0 ? "36px" : "14px"};height:4px;padding:0;border:0;background:${i === 0 ? "#1f4905" : "rgba(14,15,11,.2)"};cursor:pointer;transition:width .4s ease,background .4s"></button>`
      ).join("");

      return `
        <div data-project-id="${project.id}" data-screen-label="Caso ${index + 1}" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))">
          <div data-glow="1" style="position:relative;overflow:hidden;background:radial-gradient(circle at 0% 0%,#3f5204 0%,#94ab86 28%,#1f4905 62%,#defa9a 100%);padding:clamp(40px,6vw,88px) clamp(28px,5vw,72px);display:flex;flex-direction:column;justify-content:space-between;gap:48px;min-height:620px">
            <div>
              <div style="font-family:'Lexend Exa',sans-serif;font-size:12px;color:#fffceb;margin-bottom:28px">//caso ${String(index + 1).padStart(2, "0")} · Trilhar Contabilidade</div>
              <h2 style="font-family:'Lexend Exa',sans-serif;font-weight:400;font-size:clamp(26px,2.8vw,40px);line-height:1.14;letter-spacing:-.05em;margin:0 0 24px;color:#0e0f0b;text-wrap:balance">Um portal para um escritório de contabilidade, <span style="color:#fffceb">feito para a rotina dele.</span></h2>
              <p style="font-size:17px;line-height:1.65;margin:0;color:#0e0f0b;max-width:460px;text-wrap:pretty">O administrador publica boletos e documentos, e o cliente acessa o portal para pagar. Abra o caso para ver as telas, com os dados pessoais borrados.</p>
              <div style="margin-top:28px;padding-top:20px;border-top:1px solid #0e0f0b;max-width:460px">
                <div style="font-family:'Lexend Exa',sans-serif;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#fffceb;margin-bottom:10px">//o diferencial</div>
                <p style="font-size:16px;line-height:1.65;margin:0;color:#0e0f0b;text-wrap:pretty">O sistema foi pensado para não depender de manutenções frequentes. Por isso, os próprios administradores do escritório criam as categorias de documentos, definem quem pode enviar cada uma e quais têm valor financeiro, sem precisar de um programador. A base foi pensada para crescer junto com o escritório e receber integrações futuras com sistemas bancários.</p>
                <p style="font-size:16px;line-height:1.65;margin:12px 0 0;color:#0e0f0b;text-wrap:pretty">Cada cliente do escritório tem o próprio acesso e vê apenas o que é dele: boletos enviados, pendências e documentos. E o portal é totalmente navegável no celular e em telas menores.</p>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:20px">
              <div role="tablist" style="display:flex;flex-wrap:wrap;border:1px solid #0e0f0b;max-width:100%;font-family:'Lexend Exa',sans-serif;font-size:12px">${tabs}</div>
              <button type="button" class="case-link" data-open-case="${project.id}" style="font-family:'Lexend Exa',sans-serif;font-size:13px;color:#0e0f0b;border-bottom:1px solid #0e0f0b;width:max-content;padding-bottom:4px;white-space:nowrap;background:none;border-left:0;border-right:0;border-top:0;cursor:pointer;padding-left:0;padding-right:0">Abrir o caso completo ↗</button>
            </div>
          </div>
          <div data-case-mockup="${project.id}" style="position:relative;overflow:hidden;background:radial-gradient(circle at 70% 35%,rgba(222,250,154,.55),rgba(255,252,235,0) 60%),#f3f1e1;padding:clamp(32px,5vw,72px) clamp(20px,4vw,56px);display:flex;flex-direction:column;justify-content:center;gap:22px">
            <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(31,73,5,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(31,73,5,.07) 1px,transparent 1px);background-size:48px 48px;pointer-events:none"></div>
            <div data-case-frame style="position:relative;background:#1a1f2e;border:1px solid rgba(255,252,235,.18);box-shadow:0 36px 80px rgba(31,73,5,.3);transform:perspective(1400px) rotateY(-5deg) rotateX(3deg);transform-origin:50% 50%;transition:transform .25s ease-out,box-shadow .25s ease-out;will-change:transform">
              <div style="display:flex;align-items:center;gap:12px;padding:9px 12px;background:#0e0f0b;border-bottom:1px solid rgba(255,252,235,.12)">
                <span style="display:flex;gap:5px"><span style="width:8px;height:8px;background:#3a3d33"></span><span style="width:8px;height:8px;background:#3a3d33"></span><span style="width:8px;height:8px;background:#3a3d33"></span></span>
                <span style="flex:1;font-family:'Lexend Exa',sans-serif;font-size:10px;color:#c9cbb5;padding:4px 10px;background:rgba(255,252,235,.06)">trilhar · painel administrativo</span>
              </div>
              <div style="position:relative;width:100%;aspect-ratio:1896/937;overflow:hidden">${imgs}</div>
            </div>
            <div style="position:relative;display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap">
              <span data-case-shot-label style="font-family:'Lexend Exa',sans-serif;font-size:12px;color:#0e0f0b">//01 Visão geral</span>
              <div style="display:flex;gap:6px">${dots}</div>
            </div>
          </div>
        </div>
      `;
    }

    const shots = [];
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
            <div style="font-family:'Lexend Exa',sans-serif;font-size:12px;color:#fffceb;margin-bottom:28px">//caso ${String(index + 1).padStart(2, "0")} · ${escapeHtml(project.client_name || "")}</div>
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

  // ---- Mockup interativo do case Trilhar: ciclo automático das 4 telas
  // (a cada 4200ms), pausa + tilt 3D ao passar o mouse, navegação por
  // pontos. Porte literal de casePause/caseResume/caseTiltMove/tlGo do
  // arquivo original.
  function bindTrilharCarousel(panel) {
    let tab = TRILHAR_SHOTS[0].key;
    let paused = false;
    let tilt = null;

    const frame = panel.querySelector("[data-case-frame]");
    const labelEl = panel.querySelector("[data-case-shot-label]");
    const imgs = Array.from(panel.querySelectorAll("[data-case-shot]"));
    const dots = Array.from(panel.querySelectorAll("[data-case-dot]"));
    const tabBtns = Array.from(panel.querySelectorAll("[data-case-tab]"));
    const mockup = panel.querySelector("[data-case-mockup]");

    function render() {
      const i = TRILHAR_SHOTS.findIndex((s) => s.key === tab);
      imgs.forEach((img) => { img.style.opacity = img.getAttribute("data-case-shot") === tab ? "1" : "0"; });
      dots.forEach((d) => {
        const active = d.getAttribute("data-case-dot") === tab;
        d.style.width = active ? "36px" : "14px";
        d.style.background = active ? "#1f4905" : "rgba(14,15,11,.2)";
      });
      tabBtns.forEach((b) => {
        const active = b.getAttribute("data-case-tab") === tab;
        b.style.background = active ? "#0e0f0b" : "transparent";
        b.style.color = active ? "#fffceb" : "#0e0f0b";
      });
      if (labelEl) labelEl.textContent = "//" + String(i + 1).padStart(2, "0") + " " + TRILHAR_SHOTS[i].label;
    }

    function setTab(key) { tab = key; render(); }

    dots.forEach((d) => d.addEventListener("click", () => setTab(d.getAttribute("data-case-dot"))));
    tabBtns.forEach((b) => b.addEventListener("click", () => setTab(b.getAttribute("data-case-tab"))));

    mockup.addEventListener("mouseenter", () => { paused = true; });
    mockup.addEventListener("mouseleave", () => {
      paused = false;
      tilt = null;
      frame.style.transform = "perspective(1400px) rotateY(-5deg) rotateX(3deg)";
      frame.style.boxShadow = "0 36px 80px rgba(31,73,5,.3)";
    });
    mockup.addEventListener("mousemove", (e) => {
      const r = mockup.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      tilt = [x, y];
      frame.style.transform = "perspective(1400px) rotateY(" + (x * 14).toFixed(2) + "deg) rotateX(" + (-y * 10).toFixed(2) + "deg) translateZ(0) scale(1.02)";
      frame.style.boxShadow = (-x * 40).toFixed(0) + "px " + (40 - y * 30).toFixed(0) + "px 80px rgba(31,73,5,.35)";
    });

    setInterval(() => {
      if (paused) return;
      const i = TRILHAR_SHOTS.findIndex((s) => s.key === tab);
      setTab(TRILHAR_SHOTS[(i + 1) % TRILHAR_SHOTS.length].key);
    }, 4200);
  }

  function setupShots(project) {
    const shots = project.client_name === "Trilhar Contabilidade" ? TRILHAR_SHOTS : null;
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
      if (panel.querySelector("[data-case-mockup]")) {
        bindTrilharCarousel(panel);
        return;
      }
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
