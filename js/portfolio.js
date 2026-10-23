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
  // Ilustração (não é screenshot real) do portal do cliente: sistema
  // em produção, ainda sem print disponível. Porte literal do bloco
  // de divs com unidades cqw do arquivo original.
  const PORTAL_DASH_HTML = `<div style="background:linear-gradient(180deg,#1d2b55,#1a2138);border-right:1px solid #2c3347;display:flex;flex-direction:column;padding:1.160cqw 0.527cqw"><div style="display:flex;align-items:center;gap:0.633cqw;padding:0 0.633cqw 1.160cqw;border-bottom:1px solid #2c3a5e"><span style="width:1.371cqw;height:1.371cqw;background:#e8eaf2;color:#1d2b55;display:grid;place-items:center;font-weight:800;font-size:0.791cqw;border-radius:0.211cqw">T</span><span style="display:flex;flex-direction:column"><span style="font-size:0.791cqw;font-weight:700;color:#f3f4f8">Trilhar Contabilidade</span><span style="font-size:0.580cqw;font-weight:600;letter-spacing:.05em;color:#aab0c4">PORTAL DO CLIENTE</span></span></div><div style="display:flex;flex-direction:column;gap:0.211cqw;margin-top:1.266cqw"><div style="padding:0.527cqw 0.686cqw;border-radius:0.316cqw;font-size:0.791cqw;font-weight:600;color:#e8eaf2;background:#2a3a6e;border:1px solid #3d4f8a">Início</div><div style="padding:0.527cqw 0.686cqw;border-radius:0.316cqw;font-size:0.791cqw;font-weight:600;color:#e8eaf2;">Boletos</div><div style="padding:0.527cqw 0.686cqw;border-radius:0.316cqw;font-size:0.791cqw;font-weight:600;color:#e8eaf2;">Documentos</div><div style="padding:0.527cqw 0.686cqw;border-radius:0.316cqw;font-size:0.791cqw;font-weight:600;color:#e8eaf2;">Meus dados</div></div><div style="margin-top:auto;display:flex;align-items:center;gap:0.527cqw;padding:0.949cqw 0.633cqw 0;border-top:1px solid #2c3a5e"><span style="width:1.582cqw;height:1.582cqw;border-radius:50%;background:#2c3347;display:grid;place-items:center;font-size:0.580cqw;font-weight:700;color:#e8eaf2">CL</span><span style="display:flex;flex-direction:column;gap:0.211cqw"><span style="display:inline-block;width:6.329cqw;height:0.949cqw;background:rgba(150,165,210,.35);filter:blur(0.264cqw);border-radius:0.158cqw"></span><span style="font-size:0.580cqw;color:#aab0c4">Cliente</span></span></div></div><div style="padding:1.899cqw 1.899cqw;display:flex;flex-direction:column;gap:1.371cqw;overflow:hidden"><div style="display:flex;justify-content:space-between;align-items:center"><span style="display:flex;flex-direction:column;gap:0.316cqw"><span style="font-size:1.371cqw;font-weight:700;color:#f3f4f8">Olá, bem-vindo de volta</span><span style="font-size:0.738cqw;color:#aab0c4">Aqui ficam só os seus boletos e documentos.</span></span><span style="font-size:0.791cqw;font-weight:700;padding:0.686cqw 1.160cqw;border-radius:0.422cqw;background:#e9b42c;color:#1a1f2e">Enviar documento</span></div><div style="display:flex;gap:0.949cqw"><div style="flex:1;background:#1e2436;border:1px solid #2c3347;border-radius:0.738cqw;padding:1.055cqw;display:flex;flex-direction:column;gap:0.422cqw"><span style="width:2.215cqw;height:2.215cqw;border-radius:50%;background:rgba(242,179,61,.16);display:grid;place-items:center;font-size:0.949cqw;color:#f2b33d">!</span><span style="font-size:0.633cqw;font-weight:700;letter-spacing:.06em;color:#aab0c4">EM ABERTO</span><span style="font-size:1.371cqw;font-weight:700;color:#f3f4f8">2 boletos</span><span style="font-size:0.633cqw;color:#8a91a8">O próximo vence em 4 dias</span></div><div style="flex:1;background:#1e2436;border:1px solid #2c3347;border-radius:0.738cqw;padding:1.055cqw;display:flex;flex-direction:column;gap:0.422cqw"><span style="width:2.215cqw;height:2.215cqw;border-radius:50%;background:rgba(95,208,138,.16);display:grid;place-items:center;font-size:0.949cqw;color:#5fd08a">✓</span><span style="font-size:0.633cqw;font-weight:700;letter-spacing:.06em;color:#aab0c4">PAGOS</span><span style="font-size:1.371cqw;font-weight:700;color:#f3f4f8">8 boletos</span><span style="font-size:0.633cqw;color:#8a91a8">Comprovantes disponíveis</span></div><div style="flex:1;background:#1e2436;border:1px solid #2c3347;border-radius:0.738cqw;padding:1.055cqw;display:flex;flex-direction:column;gap:0.422cqw"><span style="width:2.215cqw;height:2.215cqw;border-radius:50%;background:rgba(120,140,230,.18);display:grid;place-items:center;font-size:0.949cqw;color:#8ea2f0">▤</span><span style="font-size:0.633cqw;font-weight:700;letter-spacing:.06em;color:#aab0c4">DOCUMENTOS FIXOS</span><span style="font-size:1.371cqw;font-weight:700;color:#f3f4f8">5 arquivos</span><span style="font-size:0.633cqw;color:#8a91a8">Sempre à mão para baixar</span></div></div><div style="display:grid;grid-template-columns:2.3fr 1fr;gap:0.949cqw;min-height:0"><div style="background:#1e2436;border:1px solid #2c3347;border-radius:0.738cqw;overflow:hidden"><div style="display:flex;justify-content:space-between;padding:0.949cqw 1.055cqw"><span style="font-size:0.897cqw;font-weight:700;color:#f3f4f8">Meus boletos</span><span style="font-size:0.686cqw;color:#aab0c4">Ver histórico</span></div><div style="display:grid;grid-template-columns:2.2fr 1.3fr 1fr 1.2fr 1.2fr 1fr;padding:0.527cqw 1.055cqw;font-size:0.580cqw;font-weight:700;letter-spacing:.06em;color:#8a91a8"><span>CATEGORIA</span><span>COMPETÊNCIA</span><span>VALOR</span><span>VENCIMENTO</span><span>STATUS</span><span></span></div><div style="display:grid;grid-template-columns:2.2fr 1.3fr 1fr 1.2fr 1.2fr 1fr;align-items:center;padding:0.897cqw 1.055cqw;border-top:1px solid #2c3347;font-size:0.738cqw;color:#e8eaf2"><span style="font-weight:600">Boleto · Honorários</span><span style="color:#aab0c4">Outubro/2026</span><span style="display:inline-block;width:3.692cqw;height:0.949cqw;background:rgba(150,165,210,.35);filter:blur(0.264cqw);border-radius:0.158cqw"></span><span>30/10/2026</span><span><span style="font-size:0.686cqw;font-weight:600;color:#c9cfe2;background:#2c3347;padding:0.211cqw 0.527cqw;border-radius:1.055cqw;white-space:nowrap">Pendente</span></span><span style="justify-self:end;font-size:0.686cqw;font-weight:600;padding:0.369cqw 0.686cqw;border-radius:0.369cqw;background:#e9b42c;color:#1a1f2e">Pagar</span></div><div style="display:grid;grid-template-columns:2.2fr 1.3fr 1fr 1.2fr 1.2fr 1fr;align-items:center;padding:0.897cqw 1.055cqw;border-top:1px solid #2c3347;font-size:0.738cqw;color:#e8eaf2"><span style="font-weight:600">Boleto · Imposto (DAS)</span><span style="color:#aab0c4">Outubro/2026</span><span style="display:inline-block;width:3.692cqw;height:0.949cqw;background:rgba(150,165,210,.35);filter:blur(0.264cqw);border-radius:0.158cqw"></span><span>23/10/2026</span><span><span style="font-size:0.686cqw;font-weight:600;color:#f2b33d;background:rgba(242,179,61,.14);padding:0.211cqw 0.527cqw;border-radius:1.055cqw;white-space:nowrap">Vence em 4 dias</span></span><span style="justify-self:end;font-size:0.686cqw;font-weight:600;padding:0.369cqw 0.686cqw;border-radius:0.369cqw;background:#e9b42c;color:#1a1f2e">Pagar</span></div><div style="display:grid;grid-template-columns:2.2fr 1.3fr 1fr 1.2fr 1.2fr 1fr;align-items:center;padding:0.897cqw 1.055cqw;border-top:1px solid #2c3347;font-size:0.738cqw;color:#e8eaf2"><span style="font-weight:600">Boleto · Honorários</span><span style="color:#aab0c4">Setembro/2026</span><span style="display:inline-block;width:3.692cqw;height:0.949cqw;background:rgba(150,165,210,.35);filter:blur(0.264cqw);border-radius:0.158cqw"></span><span>30/09/2026</span><span><span style="font-size:0.686cqw;font-weight:600;color:#5fd08a;background:rgba(95,208,138,.14);padding:0.211cqw 0.527cqw;border-radius:1.055cqw;white-space:nowrap">Pago</span></span><span style="justify-self:end;font-size:0.686cqw;font-weight:600;padding:0.369cqw 0.686cqw;border-radius:0.369cqw;border:1px solid #3a4258;color:#e8eaf2">Comprovante</span></div><div style="display:grid;grid-template-columns:2.2fr 1.3fr 1fr 1.2fr 1.2fr 1fr;align-items:center;padding:0.897cqw 1.055cqw;border-top:1px solid #2c3347;font-size:0.738cqw;color:#e8eaf2"><span style="font-weight:600">Boleto · Imposto (DAS)</span><span style="color:#aab0c4">Setembro/2026</span><span style="display:inline-block;width:3.692cqw;height:0.949cqw;background:rgba(150,165,210,.35);filter:blur(0.264cqw);border-radius:0.158cqw"></span><span>20/09/2026</span><span><span style="font-size:0.686cqw;font-weight:600;color:#5fd08a;background:rgba(95,208,138,.14);padding:0.211cqw 0.527cqw;border-radius:1.055cqw;white-space:nowrap">Pago</span></span><span style="justify-self:end;font-size:0.686cqw;font-weight:600;padding:0.369cqw 0.686cqw;border-radius:0.369cqw;border:1px solid #3a4258;color:#e8eaf2">Comprovante</span></div></div><div style="background:#1e2436;border:1px solid #2c3347;border-radius:0.738cqw;padding:0.949cqw 1.055cqw;display:flex;flex-direction:column;gap:0.211cqw"><span style="font-size:0.897cqw;font-weight:700;color:#f3f4f8;margin-bottom:0.527cqw">Documentos fixos</span><div style="display:flex;justify-content:space-between;align-items:center;padding:0.633cqw 0;border-top:1px solid #2c3347;font-size:0.738cqw;color:#e8eaf2"><span>Contrato social</span><span style="font-size:0.738cqw;color:#8ea2f0">↓</span></div><div style="display:flex;justify-content:space-between;align-items:center;padding:0.633cqw 0;border-top:1px solid #2c3347;font-size:0.738cqw;color:#e8eaf2"><span>Cartão CNPJ</span><span style="font-size:0.738cqw;color:#8ea2f0">↓</span></div><div style="display:flex;justify-content:space-between;align-items:center;padding:0.633cqw 0;border-top:1px solid #2c3347;font-size:0.738cqw;color:#e8eaf2"><span>Alvará de funcionamento</span><span style="font-size:0.738cqw;color:#8ea2f0">↓</span></div><div style="display:flex;justify-content:space-between;align-items:center;padding:0.633cqw 0;border-top:1px solid #2c3347;font-size:0.738cqw;color:#e8eaf2"><span>Certidão negativa de débitos</span><span style="font-size:0.738cqw;color:#8ea2f0">↓</span></div><div style="display:flex;justify-content:space-between;align-items:center;padding:0.633cqw 0;border-top:1px solid #2c3347;font-size:0.738cqw;color:#e8eaf2"><span>Inscrição estadual</span><span style="font-size:0.738cqw;color:#8ea2f0">↓</span></div></div></div></div>`;

  // Prints reais de um sistema interno de gestão de obras, com nomes de
  // clientes, valores, endereços, dados de colaboradores e o nome do
  // próprio sistema borrados (a empresa não autorizou o uso de nenhum
  // nome, então client_name e title ficam genéricos e nada disso aparece
  // legível nas imagens).
  const MILA_SHOTS = [
    { key: "obras", label: "Obras", src: "assets/caso-mila-obras-v1.png", caption: "Kanban de obras por etapa do funil comercial e produtivo, com KPIs de total, em andamento e orçamento no topo." },
    { key: "detalhe", label: "Ficha da obra", src: "assets/caso-mila-obra-detalhe-v1.png", caption: "Cada obra reúne valor, prazos, endereço de entrega com mapa, empresas vinculadas e um checklist do que falta para avançar de etapa." },
    { key: "frota", label: "Frota", src: "assets/caso-mila-frota-v1.png", caption: "Planejamento de rota de entrega: distância, tempo total, paradas e os trechos da viagem calculados automaticamente." },
    { key: "tarefas", label: "Tarefas de TI", src: "assets/caso-mila-tarefas-v1.png", caption: "Até a manutenção do próprio sistema roda dentro dele: backlog, tarefas em andamento e concluídas, com subtarefas e anexos." },
    { key: "rh", label: "Colaboradores", src: "assets/caso-mila-rh-v1.png", caption: "Módulo de RH com dados do colaborador, férias e atestados, com pendências de cadastro sinalizadas automaticamente." },
  ];

  const TRILHAR_SHOTS = [
    { key: "vg", label: "Visão geral", src: "assets/caso-contab-visao-geral-v3.png", caption: "O escritório acompanha clientes, documentos e financeiro num só painel." },
    { key: "cl", label: "Ficha do cliente", src: "assets/caso-contab-cliente-v3.png", caption: "Cada cliente reúne dados cadastrais, boletos, documentos, pendências e histórico." },
    { key: "fin", label: "Financeiro", src: "assets/caso-contab-financeiro-v3.png", caption: "Boletos organizados por ano, mês e dia, com status e vencimento de cada um." },
    { key: "cat", label: "Categorias personalizáveis", src: "assets/caso-contab-categorias-v2.png", caption: "O escritório cria as próprias categorias de documentos, define quem pode enviar cada uma e quais têm valor financeiro." },
    { key: "pc", label: "Portal do cliente", illustration: true, caption: "Cada cliente entra com o próprio acesso e vê só o que é dele: boletos em aberto e pagos, comprovantes e documentos fixos. Ilustração, pois o sistema está em produção." },
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

  // Copy fixa por caso que usa o mockup interativo (abas + crossfade +
  // tilt no mouse). Chaveado pelo título do project, que é estável e sob
  // nosso controle (ao contrário de client_name, que no case de gestão de obras é um
  // texto anônimo que pode ser reescrito).
  const INTERACTIVE_COPY = {
    "Portal do Cliente": {
      shots: TRILHAR_SHOTS,
      urlLabel: "trilhar · painel administrativo",
      portalKey: "pc",
      portalUrlLabel: "trilhar · portal do cliente",
      heading: 'Um portal para um escritório de contabilidade, <span style="color:#457528">feito para a rotina dele.</span>',
      intro: "O administrador publica boletos e documentos, e o cliente acessa o portal para pagar. Abra o caso para ver as telas, com os dados pessoais borrados.",
      diffTitle: "//o diferencial",
      diffParas: [
        "O sistema foi pensado para não depender de manutenções frequentes. Por isso, os próprios administradores do escritório criam as categorias de documentos, definem quem pode enviar cada uma e quais têm valor financeiro, sem precisar de um programador. A base foi pensada para crescer junto com o escritório e receber integrações futuras com sistemas bancários.",
        "Cada cliente do escritório tem o próprio acesso e vê apenas o que é dele: boletos enviados, pendências e documentos. E o portal é totalmente navegável no celular e em telas menores.",
      ],
    },
    "Sistema de Gestão de Obras": {
      shots: MILA_SHOTS,
      urlLabel: "sistema · painel administrativo",
      heading: 'Um sistema de gestão só para uma construtora, <span style="color:#457528">com 13 módulos interligados.</span>',
      intro: "Venda, obra, frota, manutenção e RH, tudo num só lugar, sincronizado em tempo real entre os usuários. Abra o caso para ver as telas, com os dados da empresa borrados.",
      diffTitle: "//o diferencial",
      diffParas: [
        "Migrado de planilhas e ferramentas soltas para uma base única, sem depender de no-code. Cada módulo evolui isolado, com testes automatizados cobrindo o banco e a camada de JavaScript, sem precisar reescrever o resto do sistema conforme a operação cresce.",
        "Do orçamento com cálculo automático de imposto interestadual ao acompanhamento da frota de entrega no mapa, a mesma plataforma cobre comercial, engenharia, produção, logística e RH, com acesso restrito por convite.",
      ],
    },
  };

  // Painel grande por caso: estilos inline copiados literalmente do bloco
  // "Caso 01" do arquivo original. Cases com entrada em INTERACTIVE_COPY
  // usam o mockup interativo (abas, crossfade automático, tilt no mouse,
  // pontos de navegação); qualquer outro case futuro cai no bloco simples
  // de 2 abas.
  function renderCase(project, index) {
    const copy = INTERACTIVE_COPY[project.title];

    if (copy) {
      const shots = copy.shots;
      const tabs = shots.map(
        (s, i) =>
          `<button type="button" role="tab" data-case-tab="${s.key}" class="case-tab-btn" style="padding:12px 16px;border:0;background:${i === 0 ? "#0e0f0b" : "transparent"};color:${i === 0 ? "#fffceb" : "#0e0f0b"};font:inherit;cursor:pointer">${s.label}</button>`
      ).join("");

      const imgs = shots.map((s, i) =>
        s.illustration
          ? `<div data-case-shot="${s.key}" style="position:absolute;inset:0;opacity:${i === 0 ? 1 : 0};transition:opacity .7s ease;background:#171c2b;font-family:Inter,system-ui,sans-serif;display:grid;grid-template-columns:14.873cqw 1fr;pointer-events:none">${PORTAL_DASH_HTML}</div>`
          : `<img src="${s.src}" alt="Painel administrativo: ${escapeHtml(s.label)}" loading="lazy" data-case-shot="${s.key}" style="position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover;object-position:top left;opacity:${i === 0 ? 1 : 0};transition:opacity .7s ease">`
      ).join("");

      const dots = shots.map(
        (s, i) =>
          `<button type="button" data-case-dot="${s.key}" aria-label="${escapeHtml(s.label)}" style="width:${i === 0 ? "36px" : "14px"};height:4px;padding:0;border:0;background:${i === 0 ? "#defa9a" : "rgba(255,252,235,.35)"};cursor:pointer;transition:width .4s ease,background .4s"></button>`
      ).join("");

      const diffParas = copy.diffParas
        .map((p, i) => `<p style="font-size:16px;line-height:1.65;margin:${i === 0 ? "0" : "12px"} 0 0;color:#0e0f0b;text-wrap:pretty">${p}</p>`)
        .join("");

      return `
        <div data-project-id="${project.id}" data-screen-label="Caso ${index + 1}" style="position:relative;overflow:hidden;background:#efeedb;width:100%;max-width:1376px;margin:0 auto;padding:0 28px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))">
          <div data-glow="1" style="position:relative;overflow:hidden;padding:clamp(40px,5vw,72px) clamp(0px,4vw,64px);display:flex;flex-direction:column;justify-content:center;gap:40px;min-height:560px">
            <div>
              <div style="font-family:'Lexend Exa',sans-serif;font-size:12px;color:#457528;margin-bottom:28px">//caso ${String(index + 1).padStart(2, "0")} · ${escapeHtml(project.client_name || "")}</div>
              <h2 style="font-family:'Lexend Exa',sans-serif;font-weight:400;font-size:clamp(26px,2.8vw,40px);line-height:1.14;letter-spacing:-.05em;margin:0 0 24px;color:#0e0f0b;text-wrap:balance">${copy.heading}</h2>
              <p style="font-size:17px;line-height:1.65;margin:0;color:#0e0f0b;max-width:460px;text-wrap:pretty">${copy.intro}</p>
              <div style="margin-top:28px;padding-top:20px;border-top:1px solid #0e0f0b;max-width:460px">
                <div style="font-family:'Lexend Exa',sans-serif;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#457528;margin-bottom:10px">${copy.diffTitle}</div>
                ${diffParas}
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:20px">
              <div role="tablist" style="display:flex;flex-wrap:wrap;border:1px solid #0e0f0b;max-width:100%;font-family:'Lexend Exa',sans-serif;font-size:12px">${tabs}</div>
              <button type="button" class="case-link" data-open-case="${project.id}" style="font-family:'Lexend Exa',sans-serif;font-size:13px;color:#0e0f0b;border-bottom:1px solid #0e0f0b;width:max-content;padding-bottom:4px;white-space:nowrap;background:none;border-left:0;border-right:0;border-top:0;cursor:pointer;padding-left:0;padding-right:0">Abrir o caso completo ↗</button>
            </div>
          </div>
          <div data-case-mockup="${project.id}" style="position:relative;overflow:hidden;background:radial-gradient(circle at 0% 0%,#3f5204 0%,#94ab86 28%,#1f4905 62%,#defa9a 100%);padding:clamp(32px,5vw,72px) clamp(20px,4vw,56px);display:flex;flex-direction:column;justify-content:center;gap:22px">
            <div style="position:relative;background:#1a1f2e;border:1px solid rgba(255,252,235,.18);box-shadow:0 36px 80px rgba(14,15,11,.45);transform:none;transform-origin:50% 50%;transition:transform .35s ease-out,box-shadow .35s ease-out;backface-visibility:hidden" data-case-frame>
              <div style="display:flex;align-items:center;gap:12px;padding:9px 12px;background:#0e0f0b;border-bottom:1px solid rgba(255,252,235,.12)">
                <span style="display:flex;gap:5px"><span style="width:8px;height:8px;background:#3a3d33"></span><span style="width:8px;height:8px;background:#3a3d33"></span><span style="width:8px;height:8px;background:#3a3d33"></span></span>
                <span data-case-url style="flex:1;font-family:'Lexend Exa',sans-serif;font-size:10px;color:#c9cbb5;padding:4px 10px;background:rgba(255,252,235,.06)">${copy.urlLabel}</span>
              </div>
              <div style="position:relative;width:100%;aspect-ratio:1896/937;overflow:hidden;container-type:inline-size">${imgs}</div>
            </div>
            <div style="position:relative;display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap">
              <span data-case-shot-label style="font-family:'Lexend Exa',sans-serif;font-size:12px;color:#fffceb">//01 ${escapeHtml(shots[0].label)}</span>
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
      <div data-project-id="${project.id}" data-screen-label="Caso ${index + 1}" style="width:100%;max-width:1376px;margin:0 auto;padding:0 28px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))">
        <div data-glow="1" style="position:relative;overflow:hidden;background:#efeedb;padding:clamp(40px,5vw,72px) clamp(0px,4vw,64px);display:flex;flex-direction:column;justify-content:center;gap:40px;min-height:560px">
          <div>
            <div style="font-family:'Lexend Exa',sans-serif;font-size:12px;color:#457528;margin-bottom:28px">//caso ${String(index + 1).padStart(2, "0")} · ${escapeHtml(project.client_name || "")}</div>
            <h2 style="font-family:'Lexend Exa',sans-serif;font-weight:400;font-size:clamp(26px,2.8vw,40px);line-height:1.14;letter-spacing:-.05em;margin:0 0 24px;color:#0e0f0b;text-wrap:balance">${escapeHtml(project.title)}</h2>
            <p style="font-size:17px;line-height:1.65;margin:0;color:#0e0f0b;max-width:460px;text-wrap:pretty">${escapeHtml(project.summary || "")}</p>
          </div>
          <div style="display:flex;flex-direction:column;gap:20px">
            ${tabs}
            <button type="button" class="case-link" data-open-case="${project.id}" style="font-family:'Lexend Exa',sans-serif;font-size:13px;color:#0e0f0b;border:0;border-bottom:1px solid #0e0f0b;width:max-content;padding-bottom:4px;white-space:nowrap;background:none;cursor:pointer">Abrir o caso completo ↗</button>
          </div>
        </div>
        <div style="${mediaOrder}position:relative;overflow:hidden;background:radial-gradient(circle at 100% 0%,#3f5204 0%,#94ab86 28%,#1f4905 62%,#defa9a 100%);padding:clamp(32px,5vw,72px) clamp(20px,4vw,56px);display:flex;align-items:center">
          <div style="position:relative;width:100%;aspect-ratio:16/11;background:#fffceb;box-shadow:0 36px 80px rgba(14,15,11,.45)">${media}</div>
        </div>
      </div>
    `;
  }

  // ---- Mockup interativo dos cases com várias telas: ciclo automático
  // (a cada 4200ms), pausa + tilt 3D ao passar o mouse, navegação por
  // pontos. Porte literal de casePause/caseResume/caseTiltMove/tlGo do
  // arquivo original, generalizado para qualquer caso com entrada em
  // INTERACTIVE_COPY (não só a Trilhar).
  function bindInteractiveCarousel(panel, shots, copy) {
    let tab = shots[0].key;
    let paused = false;
    let tilt = null;

    const frame = panel.querySelector("[data-case-frame]");
    const labelEl = panel.querySelector("[data-case-shot-label]");
    const urlEl = panel.querySelector("[data-case-url]");
    const imgs = Array.from(panel.querySelectorAll("[data-case-shot]"));
    const dots = Array.from(panel.querySelectorAll("[data-case-dot]"));
    const tabBtns = Array.from(panel.querySelectorAll("[data-case-tab]"));
    const mockup = panel.querySelector("[data-case-mockup]");

    function render() {
      const i = shots.findIndex((s) => s.key === tab);
      imgs.forEach((img) => { img.style.opacity = img.getAttribute("data-case-shot") === tab ? "1" : "0"; });
      dots.forEach((d) => {
        const active = d.getAttribute("data-case-dot") === tab;
        d.style.width = active ? "36px" : "14px";
        d.style.background = active ? "#defa9a" : "rgba(255,252,235,.35)";
      });
      tabBtns.forEach((b) => {
        const active = b.getAttribute("data-case-tab") === tab;
        b.style.background = active ? "#0e0f0b" : "transparent";
        b.style.color = active ? "#fffceb" : "#0e0f0b";
      });
      if (labelEl) labelEl.textContent = "//" + String(i + 1).padStart(2, "0") + " " + shots[i].label;
      if (urlEl) urlEl.textContent = copy.portalKey && tab === copy.portalKey ? copy.portalUrlLabel : copy.urlLabel;
    }

    function setTab(key) { tab = key; render(); }

    dots.forEach((d) => d.addEventListener("click", () => setTab(d.getAttribute("data-case-dot"))));
    tabBtns.forEach((b) => b.addEventListener("click", () => setTab(b.getAttribute("data-case-tab"))));

    mockup.addEventListener("mouseenter", () => { paused = true; });
    mockup.addEventListener("mouseleave", () => {
      paused = false;
      tilt = null;
      frame.style.transform = "none";
      frame.style.boxShadow = "0 36px 80px rgba(14,15,11,.45)";
    });
    mockup.addEventListener("mousemove", (e) => {
      const r = mockup.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      tilt = [x, y];
      frame.style.transform = "perspective(1400px) rotateY(" + (x * 12).toFixed(2) + "deg) rotateX(" + (-y * 8).toFixed(2) + "deg)";
      frame.style.boxShadow = (-x * 40).toFixed(0) + "px " + (40 - y * 30).toFixed(0) + "px 80px rgba(14,15,11,.5)";
    });

    setInterval(() => {
      if (paused) return;
      const i = shots.findIndex((s) => s.key === tab);
      setTab(shots[(i + 1) % shots.length].key);
    }, 4200);

    render();
  }

  function setupShots(project) {
    const shots = (INTERACTIVE_COPY[project.title] || {}).shots || null;
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
            ${
              shot.illustration
                ? `<div style="position:relative;width:100%;aspect-ratio:1896/937;overflow:hidden;container-type:inline-size"><div style="position:absolute;inset:0;background:#171c2b;font-family:Inter,system-ui,sans-serif;display:grid;grid-template-columns:14.873cqw 1fr">${PORTAL_DASH_HTML}</div></div>`
                : `<img src="${shot.src}" alt="Interface do sistema ${escapeHtml(project.title)}" loading="lazy" style="width:100%;display:block" />`
            }
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
        const id = panel.getAttribute("data-project-id");
        const project = projects.find((p) => String(p.id) === id);
        const copy = project && INTERACTIVE_COPY[project.title];
        if (copy) bindInteractiveCarousel(panel, copy.shots, copy);
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

      // Trava de segurança: nunca publica o nome real da empresa do case
      // gestão de obras, que não autorizou o uso da marca. O case em si fica visível
      // (client_name já anonimizado no banco); isso só protege contra um
      // nome real voltar a aparecer por engano em algum campo.
      const HIDDEN = /milatec|milalab|\bmila\b/i;
      projects = (data || []).filter(
        (p) => !HIDDEN.test(`${p.client_name || ""} ${p.title || ""}`)
      );

      if (!projects.length) {
        listEl.innerHTML = `<div style="padding:2rem 28px;color:rgba(14,15,11,.56);font-size:.95rem">Novos cases em publicação em breve.</div>`;
        return;
      }

      const countEl = document.getElementById("caseCount");
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
