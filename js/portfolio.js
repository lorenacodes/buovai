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
  const PORTAL_DASH_HTML = `<div style="background:linear-gradient(180deg,#1d2b55,#1a2138);border-right:1px solid #2c3347;display:flex;flex-direction:column;padding:1.160cqw 0.527cqw"><div style="display:flex;align-items:center;gap:0.633cqw;padding:0 0.633cqw 1.160cqw;border-bottom:1px solid #2c3a5e"><span style="width:1.371cqw;height:1.371cqw;background:#e8eaf2;color:#1d2b55;display:grid;place-items:center;font-weight:800;font-size:0.791cqw;border-radius:0.211cqw">T</span><span style="display:flex;flex-direction:column"><span style="font-size:0.791cqw;font-weight:700;color:#f3f4f8">Trilhar Contabilidade</span><span style="font-size:0.580cqw;font-weight:600;letter-spacing:.05em;color:#aab0c4">PORTAL DO CLIENTE</span></span></div><div style="display:flex;flex-direction:column;gap:0.211cqw;margin-top:1.266cqw"><div style="padding:0.527cqw 0.686cqw;border-radius:0.316cqw;font-size:0.791cqw;font-weight:600;color:#e8eaf2;background:#2a3a6e;border:1px solid #3d4f8a">Início</div><div style="padding:0.527cqw 0.686cqw;border-radius:0.316cqw;font-size:0.791cqw;font-weight:600;color:#e8eaf2;">Boletos</div><div style="padding:0.527cqw 0.686cqw;border-radius:0.316cqw;font-size:0.791cqw;font-weight:600;color:#e8eaf2;">Documentos</div><div style="padding:0.527cqw 0.686cqw;border-radius:0.316cqw;font-size:0.791cqw;font-weight:600;color:#e8eaf2;">Meus dados</div></div><div style="margin-top:auto;display:flex;align-items:center;gap:0.527cqw;padding:0.949cqw 0.633cqw 0;border-top:1px solid #2c3a5e"><span style="width:1.582cqw;height:1.582cqw;border-radius:50%;background:#2c3347;display:grid;place-items:center;font-size:0.580cqw;font-weight:700;color:#e8eaf2">CL</span><span style="display:flex;flex-direction:column;gap:0.211cqw"><span style="display:inline-block;width:6.329cqw;height:0.949cqw;background:rgba(150,165,210,.35);filter:blur(0.264cqw);border-radius:0.158cqw"></span><span style="font-size:0.580cqw;color:#aab0c4">Cliente</span></span></div></div><div style="padding:1.899cqw 1.899cqw;display:flex;flex-direction:column;gap:1.371cqw;overflow:hidden"><div style="display:flex;justify-content:space-between;align-items:center"><span style="display:flex;flex-direction:column;gap:0.316cqw"><span style="font-size:1.371cqw;font-weight:700;color:#f3f4f8">Olá, bem-vindo de volta</span><span style="font-size:0.738cqw;color:#aab0c4">Aqui ficam só os seus boletos e documentos.</span></span><span style="font-size:0.791cqw;font-weight:700;padding:0.686cqw 1.160cqw;border-radius:0.422cqw;background:#e9b42c;color:#1a1f2e">Enviar documento</span></div><div style="display:flex;gap:0.949cqw"><div style="flex:1;background:#1e2436;border:1px solid #2c3347;border-radius:0.738cqw;padding:1.055cqw;display:flex;flex-direction:column;gap:0.422cqw"><span style="width:2.215cqw;height:2.215cqw;border-radius:50%;background:rgba(242,179,61,.16);display:grid;place-items:center;font-size:0.949cqw;color:#f2b33d">!</span><span style="font-size:0.633cqw;font-weight:700;letter-spacing:.06em;color:#aab0c4">EM ABERTO</span><span style="font-size:1.371cqw;font-weight:700;color:#f3f4f8">2 boletos</span><span style="font-size:0.633cqw;color:#8a91a8">O próximo vence em 4 dias</span></div><div style="flex:1;background:#1e2436;border:1px solid #2c3347;border-radius:0.738cqw;padding:1.055cqw;display:flex;flex-direction:column;gap:0.422cqw"><span style="width:2.215cqw;height:2.215cqw;border-radius:50%;background:rgba(95,208,138,.16);display:grid;place-items:center;font-size:0.949cqw;color:#5fd08a"><svg width="1em" height="1em" viewBox="0 0 10 10" style="display:block"><path d="M1.5 5.3L3.8 7.6L8.5 2.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span style="font-size:0.633cqw;font-weight:700;letter-spacing:.06em;color:#aab0c4">PAGOS</span><span style="font-size:1.371cqw;font-weight:700;color:#f3f4f8">8 boletos</span><span style="font-size:0.633cqw;color:#8a91a8">Comprovantes disponíveis</span></div><div style="flex:1;background:#1e2436;border:1px solid #2c3347;border-radius:0.738cqw;padding:1.055cqw;display:flex;flex-direction:column;gap:0.422cqw"><span style="width:2.215cqw;height:2.215cqw;border-radius:50%;background:rgba(120,140,230,.18);display:grid;place-items:center;font-size:0.949cqw;color:#8ea2f0">▤</span><span style="font-size:0.633cqw;font-weight:700;letter-spacing:.06em;color:#aab0c4">DOCUMENTOS FIXOS</span><span style="font-size:1.371cqw;font-weight:700;color:#f3f4f8">5 arquivos</span><span style="font-size:0.633cqw;color:#8a91a8">Sempre à mão para baixar</span></div></div><div style="display:grid;grid-template-columns:2.3fr 1fr;gap:0.949cqw;min-height:0"><div style="background:#1e2436;border:1px solid #2c3347;border-radius:0.738cqw;overflow:hidden"><div style="display:flex;justify-content:space-between;padding:0.949cqw 1.055cqw"><span style="font-size:0.897cqw;font-weight:700;color:#f3f4f8">Meus boletos</span><span style="font-size:0.686cqw;color:#aab0c4">Ver histórico</span></div><div style="display:grid;grid-template-columns:2.2fr 1.3fr 1fr 1.2fr 1.2fr 1fr;padding:0.527cqw 1.055cqw;font-size:0.580cqw;font-weight:700;letter-spacing:.06em;color:#8a91a8"><span>CATEGORIA</span><span>COMPETÊNCIA</span><span>VALOR</span><span>VENCIMENTO</span><span>STATUS</span><span></span></div><div style="display:grid;grid-template-columns:2.2fr 1.3fr 1fr 1.2fr 1.2fr 1fr;align-items:center;padding:0.897cqw 1.055cqw;border-top:1px solid #2c3347;font-size:0.738cqw;color:#e8eaf2"><span style="font-weight:600">Boleto · Honorários</span><span style="color:#aab0c4">Outubro/2026</span><span style="display:inline-block;width:3.692cqw;height:0.949cqw;background:rgba(150,165,210,.35);filter:blur(0.264cqw);border-radius:0.158cqw"></span><span>30/10/2026</span><span><span style="font-size:0.686cqw;font-weight:600;color:#c9cfe2;background:#2c3347;padding:0.211cqw 0.527cqw;border-radius:1.055cqw;white-space:nowrap">Pendente</span></span><span style="justify-self:end;font-size:0.686cqw;font-weight:600;padding:0.369cqw 0.686cqw;border-radius:0.369cqw;background:#e9b42c;color:#1a1f2e">Pagar</span></div><div style="display:grid;grid-template-columns:2.2fr 1.3fr 1fr 1.2fr 1.2fr 1fr;align-items:center;padding:0.897cqw 1.055cqw;border-top:1px solid #2c3347;font-size:0.738cqw;color:#e8eaf2"><span style="font-weight:600">Boleto · Imposto (DAS)</span><span style="color:#aab0c4">Outubro/2026</span><span style="display:inline-block;width:3.692cqw;height:0.949cqw;background:rgba(150,165,210,.35);filter:blur(0.264cqw);border-radius:0.158cqw"></span><span>23/10/2026</span><span><span style="font-size:0.686cqw;font-weight:600;color:#f2b33d;background:rgba(242,179,61,.14);padding:0.211cqw 0.527cqw;border-radius:1.055cqw;white-space:nowrap">Vence em 4 dias</span></span><span style="justify-self:end;font-size:0.686cqw;font-weight:600;padding:0.369cqw 0.686cqw;border-radius:0.369cqw;background:#e9b42c;color:#1a1f2e">Pagar</span></div><div style="display:grid;grid-template-columns:2.2fr 1.3fr 1fr 1.2fr 1.2fr 1fr;align-items:center;padding:0.897cqw 1.055cqw;border-top:1px solid #2c3347;font-size:0.738cqw;color:#e8eaf2"><span style="font-weight:600">Boleto · Honorários</span><span style="color:#aab0c4">Setembro/2026</span><span style="display:inline-block;width:3.692cqw;height:0.949cqw;background:rgba(150,165,210,.35);filter:blur(0.264cqw);border-radius:0.158cqw"></span><span>30/09/2026</span><span><span style="font-size:0.686cqw;font-weight:600;color:#5fd08a;background:rgba(95,208,138,.14);padding:0.211cqw 0.527cqw;border-radius:1.055cqw;white-space:nowrap">Pago</span></span><span style="justify-self:end;font-size:0.686cqw;font-weight:600;padding:0.369cqw 0.686cqw;border-radius:0.369cqw;border:1px solid #3a4258;color:#e8eaf2">Comprovante</span></div><div style="display:grid;grid-template-columns:2.2fr 1.3fr 1fr 1.2fr 1.2fr 1fr;align-items:center;padding:0.897cqw 1.055cqw;border-top:1px solid #2c3347;font-size:0.738cqw;color:#e8eaf2"><span style="font-weight:600">Boleto · Imposto (DAS)</span><span style="color:#aab0c4">Setembro/2026</span><span style="display:inline-block;width:3.692cqw;height:0.949cqw;background:rgba(150,165,210,.35);filter:blur(0.264cqw);border-radius:0.158cqw"></span><span>20/09/2026</span><span><span style="font-size:0.686cqw;font-weight:600;color:#5fd08a;background:rgba(95,208,138,.14);padding:0.211cqw 0.527cqw;border-radius:1.055cqw;white-space:nowrap">Pago</span></span><span style="justify-self:end;font-size:0.686cqw;font-weight:600;padding:0.369cqw 0.686cqw;border-radius:0.369cqw;border:1px solid #3a4258;color:#e8eaf2">Comprovante</span></div></div><div style="background:#1e2436;border:1px solid #2c3347;border-radius:0.738cqw;padding:0.949cqw 1.055cqw;display:flex;flex-direction:column;gap:0.211cqw"><span style="font-size:0.897cqw;font-weight:700;color:#f3f4f8;margin-bottom:0.527cqw">Documentos fixos</span><div style="display:flex;justify-content:space-between;align-items:center;padding:0.633cqw 0;border-top:1px solid #2c3347;font-size:0.738cqw;color:#e8eaf2"><span>Contrato social</span><span style="font-size:0.738cqw;color:#8ea2f0">↓︎</span></div><div style="display:flex;justify-content:space-between;align-items:center;padding:0.633cqw 0;border-top:1px solid #2c3347;font-size:0.738cqw;color:#e8eaf2"><span>Cartão CNPJ</span><span style="font-size:0.738cqw;color:#8ea2f0">↓︎</span></div><div style="display:flex;justify-content:space-between;align-items:center;padding:0.633cqw 0;border-top:1px solid #2c3347;font-size:0.738cqw;color:#e8eaf2"><span>Alvará de funcionamento</span><span style="font-size:0.738cqw;color:#8ea2f0">↓︎</span></div><div style="display:flex;justify-content:space-between;align-items:center;padding:0.633cqw 0;border-top:1px solid #2c3347;font-size:0.738cqw;color:#e8eaf2"><span>Certidão negativa de débitos</span><span style="font-size:0.738cqw;color:#8ea2f0">↓︎</span></div><div style="display:flex;justify-content:space-between;align-items:center;padding:0.633cqw 0;border-top:1px solid #2c3347;font-size:0.738cqw;color:#e8eaf2"><span>Inscrição estadual</span><span style="font-size:0.738cqw;color:#8ea2f0">↓︎</span></div></div></div></div>`;

  // Prints reais de um sistema interno de gestão de obras, com nomes de
  // clientes, valores, endereços, dados de colaboradores e o nome do
  // próprio sistema borrados (a empresa não autorizou o uso de nenhum
  // nome, então client_name e title ficam genéricos e nada disso aparece
  // legível nas imagens).
  const MILA_SHOTS = [
    { key: "obras", label: "Obras", src: "assets/caso-mila-obras-v1.png", caption: "Kanban de obras por etapa do funil comercial e produtivo, com KPIs de total, em andamento e orçamento no topo." },
    { key: "detalhe", label: "Ficha da obra", src: "assets/caso-mila-obra-detalhe-v1.png", caption: "Cada obra reúne valor, prazos, endereço de entrega com mapa, empresas vinculadas e um checklist do que falta para avançar de etapa." },
    { key: "frota", label: "Frota", src: "assets/caso-mila-frota-v1.png", caption: "Planejamento de rota de entrega: distância, tempo total, paradas e os trechos da viagem calculados automaticamente." },
    { key: "tarefas", label: "Tarefas", src: "assets/caso-mila-tarefas-v1.png", caption: "Até a manutenção do próprio sistema roda dentro dele: backlog, tarefas em andamento e concluídas, com subtarefas e anexos." },
    { key: "rh", label: "Colaboradores", src: "assets/caso-mila-rh-v1.png", caption: "Módulo de RH com dados do colaborador, férias e atestados, com pendências de cadastro sinalizadas automaticamente." },
    { key: "producao", label: "Produção", src: "assets/caso-mila-producao-v1.png", caption: "Ordens de produção por obra, com quantidade, pedido vinculado, status e entrega ligada a cada uma." },
    { key: "estoque", label: "Estoque", src: "assets/caso-mila-estoque-v1.png", caption: "Acompanha o estoque em cada etapa da fábrica, do rolo de aço até a entrega, com o total fabricado no mês e no ano." },
    { key: "permissoes", label: "Permissões", src: "assets/caso-mila-permissoes-v1.png", caption: "Controle de acesso por colaborador: cada um só vê as abas liberadas pra sua função, módulo por módulo." },
    { key: "perfil", label: "Meu perfil", src: "assets/caso-mila-perfil-v1.png", caption: "Painel personalizável: cada usuário ajusta tema, cor do sistema e os próprios dados de cadastro." },
  ];

  // Site institucional público, com a marca da própria empresa borrada
  // (mesmo motivo do case de gestão de obras: uso do nome não autorizado).
  const MILATEC_SITE_SHOTS = [
    { key: "inicio", label: "Início", src: "assets/caso-milatec-inicio-v1.png", caption: "Página inicial com os números da empresa e chamada direta pra pedir orçamento." },
    { key: "solar", label: "Energia solar", src: "assets/caso-milatec-solar-v1.png", caption: "Linha de produtos de estruturas solares, com os mesmos números de credibilidade da home." },
    { key: "solucoes", label: "Soluções", src: "assets/caso-milatec-solucoes-v1.png", caption: "Catálogo de soluções com foto real de obra, não imagem de banco de imagens." },
    { key: "modular", label: "Modular", src: "assets/caso-milatec-modular-v1.png", caption: "Linha de produtos modulares (escritórios, tiny houses, banheiros de obra), cada um com sua própria página." },
    { key: "steelframe", label: "Steel Frame", src: "assets/caso-milatec-steelframe-v1.png", caption: "Lançamento de uma nova linha de produto, com a mesma identidade visual do restante do site." },
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
      intro: "O administrador publica boletos e documentos, e o cliente acessa o portal para pagar. Abra o caso para ver as telas e o detalhamento técnico, com os dados pessoais borrados.",
      // Bolha de vídeo com o depoimento (muda, em loop) direto por cima
      // do mockup, pra dar a sensação de "ela explicando o problema
      // enquanto as telas vão passando atrás" — antes era uma seção
      // separada lá embaixo, longe do caso em si (pedido da Lorena).
      testimonialVideo: {
        src: "assets/depoimento-trilhar.mp4",
        poster: "assets/depoimento-trilhar-poster.jpg",
        name: "Tinaysa Freitas",
        role: "Fundadora da Trilhar Contabilidade",
        quote: "A Lorena realizou um trabalho impecável. Ela atendeu todas as minhas demandas e foi sempre muito solícita.",
      },
    },
    "Sistema de Gestão de Obras": {
      shots: MILA_SHOTS,
      urlLabel: "sistema · painel administrativo",
      heading: 'Da planilha para um sistema que já sustenta <span style="color:#457528">mais de 1.500 obras.</span>',
      intro: "13 módulos interligados, de venda a pós-obra, sincronizados em tempo real: orçamento, frota, estoque, produção e RH num só lugar. Abra o caso para ver as telas e o detalhamento técnico, com os dados da empresa borrados.",
    },
    "Site Institucional": {
      shots: MILATEC_SITE_SHOTS,
      urlLabel: "site · institucional",
      heading: 'Um site institucional <span style="color:#457528">pensado para converter visita em orçamento.</span>',
      intro: "Cada linha de produto (telhados, solar, modular, steel frame) com sua própria página, números de credibilidade e botão de orçamento sempre à vista. A maior parte do site é em vídeo, não texto: a ideia foi mostrar o produto em ação, não explicar. Abra o caso para ver as telas, com a marca da empresa borrada.",
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
          `<button type="button" role="tab" data-case-tab="${s.key}" class="case-tab-btn" style="flex:0 0 auto;white-space:nowrap;text-align:center;border:0;background:${i === 0 ? "#0e0f0b" : "transparent"};color:${i === 0 ? "#fffceb" : "#0e0f0b"};font:inherit;cursor:pointer">${s.label}</button>`
      ).join("");

      const imgs = shots.map((s, i) =>
        s.illustration
          ? `<div data-case-shot="${s.key}" style="position:absolute;inset:0;opacity:${i === 0 ? 1 : 0};transition:opacity .7s ease;background:#171c2b;font-family:Inter,system-ui,sans-serif;display:grid;grid-template-columns:14.873cqw 1fr;pointer-events:none">${PORTAL_DASH_HTML}</div>`
          : `<img src="${s.src}" alt="Painel administrativo: ${escapeHtml(s.label)}" loading="lazy" data-case-shot="${s.key}" style="position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover;object-position:top left;opacity:${i === 0 ? 1 : 0};transition:opacity .7s ease">`
      ).join("");

      const dots = shots.map(
        (s, i) =>
          `<button type="button" data-case-dot="${s.key}" aria-label="${escapeHtml(s.label)}" style="width:${i === 0 ? "28px" : "10px"};height:4px;padding:0;border:0;background:${i === 0 ? "#1f4905" : "rgba(14,15,11,.22)"};cursor:pointer;transition:width .4s ease,background .4s"></button>`
      ).join("");

      return `
        <div data-project-id="${project.id}" data-case-title="${escapeHtml(project.title || "")}" data-screen-label="Caso ${index + 1}" class="case-card" style="--reveal-delay:${index * 130}ms;position:relative;overflow:hidden;scroll-snap-align:start;border:1px solid #0e0f0b;background:#efeedb;padding:clamp(32px,3.6vw,52px) clamp(24px,3vw,40px);display:grid;grid-template-rows:auto auto 1fr auto;row-gap:24px">
          <div style="height:240px;overflow:hidden">
            <div style="font-family:'Lexend Exa',sans-serif;font-size:12px;color:#457528;margin-bottom:18px">//caso ${String(index + 1).padStart(2, "0")} · ${escapeHtml(project.client_name || "")}</div>
            <h2 style="font-family:'Lexend Exa',sans-serif;font-weight:400;font-size:clamp(22px,2.1vw,28px);line-height:1.18;letter-spacing:-.04em;margin:0 0 14px;color:#0e0f0b;text-wrap:balance;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden">${copy.heading}</h2>
            <p style="font-size:15.5px;line-height:1.6;margin:0;color:#0e0f0b;text-wrap:pretty;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden">${copy.intro}</p>
          </div>
          <div style="position:relative">
            <div role="tablist" class="case-scroller case-tablist" style="display:flex;flex-wrap:nowrap;overflow-x:auto;border:1px solid #0e0f0b;max-width:100%;font-family:'Lexend Exa',sans-serif">${tabs}</div>
            <div aria-hidden="true" class="case-tablist-fade"></div>
          </div>
          <div data-case-mockup="${project.id}" style="position:relative">
            <div style="position:relative;width:100%;background:#fffceb;border:1px solid #0e0f0b;transform:none;transform-origin:50% 50%;transition:transform .35s ease-out,box-shadow .35s ease-out;backface-visibility:hidden" data-case-frame>
              <div style="display:flex;align-items:center;gap:12px;padding:9px 12px;border-bottom:1px solid #0e0f0b">
                <span style="display:flex;gap:5px"><span style="width:8px;height:8px;border-radius:50%;border:1px solid #0e0f0b"></span><span style="width:8px;height:8px;border-radius:50%;border:1px solid #0e0f0b"></span><span style="width:8px;height:8px;border-radius:50%;border:1px solid #0e0f0b"></span></span>
                <span data-case-url style="flex:1;font-family:'Lexend Exa',sans-serif;font-size:10px;color:#457528;padding:4px 10px;background:rgba(69,117,40,.08)">${copy.urlLabel}</span>
              </div>
              <div style="position:relative;width:100%;aspect-ratio:1896/937;overflow:hidden;container-type:inline-size">
                ${imgs}
                <button type="button" data-case-shot-prev class="case-shot-nav case-shot-nav--prev" aria-label="Tela anterior">‹</button>
                <button type="button" data-case-shot-next class="case-shot-nav case-shot-nav--next" aria-label="Próxima tela">›</button>
                ${copy.testimonialVideo ? `
                  <div class="case-video-bubble" data-case-bubble>
                    <video data-case-bubble-video src="${copy.testimonialVideo.src}" poster="${copy.testimonialVideo.poster}" muted loop playsinline preload="metadata" aria-label="Depoimento em vídeo de ${escapeHtml(copy.testimonialVideo.name)}, ${escapeHtml(copy.testimonialVideo.role)}"></video>
                    <button type="button" class="case-video-bubble__sound" data-case-bubble-sound aria-label="Ativar som do depoimento" title="Ativar som">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"></path><line class="case-mute-x" x1="16" y1="9" x2="22" y2="15"></line><line class="case-mute-x" x1="22" y1="9" x2="16" y2="15"></line></svg>
                    </button>
                  </div>
                ` : ""}
              </div>
            </div>
            <div style="position:relative;display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-top:14px">
              <span data-case-shot-label style="font-family:'Lexend Exa',sans-serif;font-size:12px;color:#457528">//01 ${escapeHtml(shots[0].label)}</span>
              <div style="display:flex;gap:6px">${dots}</div>
            </div>
          </div>
          <button type="button" class="case-link" data-open-case="${project.id}" style="font-family:'Lexend Exa',sans-serif;font-size:13px;color:#0e0f0b;border-bottom:1px solid #0e0f0b;width:max-content;padding-bottom:4px;white-space:nowrap;background:none;border-left:0;border-right:0;border-top:0;cursor:pointer;padding-left:0;padding-right:0">Abrir o caso completo ↗︎</button>
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
                `<button type="button" role="tab" data-tab-btn="${i}" class="case-tab-btn" style="flex:1 1 auto;white-space:nowrap;text-align:center;padding:12px 16px;border:0;background:${i === 0 ? "#0e0f0b" : "transparent"};color:${i === 0 ? "#fffceb" : "#0e0f0b"};font:inherit;cursor:pointer">${label}</button>`
            )
            .join("")}
        </div>`
      : "";

    return `
      <div data-project-id="${project.id}" data-screen-label="Caso ${index + 1}" style="width:100%;max-width:1376px;margin:0 auto;padding:0 28px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))">
        <div data-glow="1" style="position:relative;overflow:hidden;background:radial-gradient(circle at 100% 0%,rgba(222,250,154,.45) 0%,rgba(148,171,134,.22) 35%,rgba(239,238,219,0) 72%),#efeedb;padding:clamp(40px,5vw,72px) clamp(0px,4vw,64px);display:flex;flex-direction:column;justify-content:center;gap:40px;min-height:560px">
          <div>
            <div style="font-family:'Lexend Exa',sans-serif;font-size:12px;color:#457528;margin-bottom:28px">//caso ${String(index + 1).padStart(2, "0")} · ${escapeHtml(project.client_name || "")}</div>
            <h2 style="font-family:'Lexend Exa',sans-serif;font-weight:400;font-size:clamp(26px,2.8vw,40px);line-height:1.14;letter-spacing:-.05em;margin:0 0 24px;color:#0e0f0b;text-wrap:balance">${escapeHtml(project.title)}</h2>
            <p style="font-size:17px;line-height:1.65;margin:0;color:#0e0f0b;max-width:460px;text-wrap:pretty">${escapeHtml(project.summary || "")}</p>
          </div>
          <div style="display:flex;flex-direction:column;gap:20px">
            ${tabs}
            <button type="button" class="case-link" data-open-case="${project.id}" style="font-family:'Lexend Exa',sans-serif;font-size:13px;color:#0e0f0b;border:0;border-bottom:1px solid #0e0f0b;width:max-content;padding-bottom:4px;white-space:nowrap;background:none;cursor:pointer">Abrir o caso completo ↗︎</button>
          </div>
        </div>
        <div style="${mediaOrder}position:relative;overflow:hidden;background:#fffceb;padding:clamp(24px,3vw,44px) clamp(16px,2.2vw,32px);display:flex;align-items:center">
          <div style="position:relative;width:100%;aspect-ratio:16/11;background:#fffceb;border:1px solid #0e0f0b">${media}</div>
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

    // Bolha do depoimento: toca sozinha, mudo, em loop, independente da
    // troca de telas — só pausa quando sai da tela (economiza bateria/
    // dados de quem só passou os olhos) e volta ao reaparecer. Som é
    // opt-in, pelo botão: autoplay com áudio é bloqueado pelo navegador
    // de qualquer forma, e tocar som sem pedir seria intrusivo.
    const bubble = panel.querySelector("[data-case-bubble]");
    const bubbleVideo = panel.querySelector("[data-case-bubble-video]");
    const bubbleSound = panel.querySelector("[data-case-bubble-sound]");
    if (bubbleVideo) {
      bubbleVideo.play().catch(() => {});
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) bubbleVideo.play().catch(() => {});
            else bubbleVideo.pause();
          });
        },
        { threshold: 0.3 }
      ).observe(bubbleVideo);
    }
    if (bubbleSound && bubbleVideo && bubble) {
      bubbleSound.addEventListener("click", (e) => {
        e.stopPropagation();
        bubbleVideo.muted = !bubbleVideo.muted;
        bubble.classList.toggle("is-unmuted", !bubbleVideo.muted);
        bubbleSound.setAttribute("aria-label", bubbleVideo.muted ? "Ativar som do depoimento" : "Silenciar depoimento");
      });
    }

    function render() {
      const i = shots.findIndex((s) => s.key === tab);
      imgs.forEach((img) => { img.style.opacity = img.getAttribute("data-case-shot") === tab ? "1" : "0"; });
      dots.forEach((d) => {
        const active = d.getAttribute("data-case-dot") === tab;
        d.style.width = active ? "36px" : "14px";
        d.style.background = active ? "#1f4905" : "rgba(14,15,11,.22)";
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
    function step(delta) {
      const i = shots.findIndex((s) => s.key === tab);
      setTab(shots[(i + delta + shots.length) % shots.length].key);
    }

    dots.forEach((d) => d.addEventListener("click", () => setTab(d.getAttribute("data-case-dot"))));
    tabBtns.forEach((b) => b.addEventListener("click", () => setTab(b.getAttribute("data-case-tab"))));

    // Botões discretos em cima da própria imagem pra trocar de tela —
    // os pontinhos embaixo eram pequenos demais pra clicar com precisão
    // (pedido da Lorena). Ficam quase invisíveis até passar o mouse/tocar
    // perto, pra não poluir a interface.
    const shotPrev = panel.querySelector("[data-case-shot-prev]");
    const shotNext = panel.querySelector("[data-case-shot-next]");
    if (shotPrev) shotPrev.addEventListener("click", (e) => { e.stopPropagation(); step(-1); });
    if (shotNext) shotNext.addEventListener("click", (e) => { e.stopPropagation(); step(1); });

    mockup.addEventListener("mouseenter", () => { paused = true; });
    mockup.addEventListener("mouseleave", () => {
      paused = false;
      tilt = null;
      frame.style.transform = "none";
      frame.style.boxShadow = "none";
    });
    mockup.addEventListener("mousemove", (e) => {
      const r = mockup.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      tilt = [x, y];
      frame.style.transform = "perspective(1400px) rotateY(" + (x * 12).toFixed(2) + "deg) rotateX(" + (-y * 8).toFixed(2) + "deg)";
      frame.style.boxShadow = (-x * 20).toFixed(0) + "px " + (20 - y * 16).toFixed(0) + "px 32px rgba(14,15,11,.18)";
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

    modalEl.querySelector('[data-field="problem"]').textContent = project.problem || "-";
    modalEl.querySelector('[data-field="solution"]').textContent = project.solution || "-";

    const highlightsEl = modalEl.querySelector('[data-field="highlights"]');
    highlightsEl.innerHTML = (project.highlights || []).map((h) => `<li>${escapeHtml(h)}</li>`).join("");

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

  // Setinhas ao lado de "0N casos" rolam o carrossel de cases um cartão
  // por vez, em vez de deixar o terceiro caso (e os próximos) caírem
  // numa linha embaixo — pedido da Lorena pra ficar lado a lado.
  function bindCaseScroller() {
    const scroller = document.getElementById("caseScroller");
    const prevBtn = document.getElementById("caseScrollPrev");
    const nextBtn = document.getElementById("caseScrollNext");
    if (!scroller || !prevBtn || !nextBtn) return;
    const step = () => (scroller.querySelector(".case-card") || {}).offsetWidth + 28 || scroller.clientWidth * 0.8;
    prevBtn.addEventListener("click", () => scroller.scrollBy({ left: -step(), behavior: "smooth" }));
    nextBtn.addEventListener("click", () => scroller.scrollBy({ left: step(), behavior: "smooth" }));
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

      listEl.innerHTML = `
        <div style="position:relative;max-width:1376px;margin:0 auto">
          <div id="caseScroller" class="case-scroller" style="display:flex;gap:28px;padding:0 28px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth">
            ${projects.map((project, index) => renderCase(project, index)).join("")}
          </div>
          <button type="button" id="caseScrollPrev" class="case-arrow case-arrow--prev" aria-label="Caso anterior">←︎</button>
          <button type="button" id="caseScrollNext" class="case-arrow case-arrow--next" aria-label="Próximo caso">→︎</button>
        </div>
      `;
      bindCaseEvents();
      bindCaseScroller();

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
