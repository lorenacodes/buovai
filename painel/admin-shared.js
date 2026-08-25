/**
 * Utilitários compartilhados pelas páginas administrativas do painel:
 * autenticação/guarda de admin, sidebar, helpers de formatação e o
 * carregamento de estados/cidades (IBGE) para os selects de lead.
 */
window.BuovaiAdmin = (function () {
  "use strict";

  var UF_LIST = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
    "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
    "SP", "SE", "TO",
  ];

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str == null ? "" : str;
    return div.innerHTML;
  }

  function fmtDate(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  }

  function fmtDateTime(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function fmtMoney(value) {
    if (value == null || value === "") return "—";
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function maskCnpj(value) {
    var digits = (value || "").replace(/\D/g, "").slice(0, 14);
    return digits
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  function isValidCnpj(raw) {
    var cnpj = (raw || "").replace(/\D/g, "");
    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
    function calc(len) {
      var weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      var sum = 0;
      for (var i = 0; i < len; i++) sum += parseInt(cnpj[i], 10) * weights[i];
      var r = sum % 11;
      return r < 2 ? 0 : 11 - r;
    }
    var d1 = calc(12);
    var d2 = calc(13);
    return d1 === parseInt(cnpj[12], 10) && d2 === parseInt(cnpj[13], 10);
  }

  var cityCache = {};
  async function loadCities(uf) {
    if (!uf) return [];
    if (cityCache[uf]) return cityCache[uf];
    try {
      var res = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados/" + uf + "/municipios");
      var data = await res.json();
      var cities = data.map(function (c) { return c.nome; }).sort();
      cityCache[uf] = cities;
      return cities;
    } catch (e) {
      return [];
    }
  }

  async function logActivity(client, entityType, entityId, action, detail) {
    try {
      await client.from("activity_log").insert({ entity_type: entityType, entity_id: entityId, action: action, detail: detail || null });
    } catch (e) {
      /* não bloqueia o fluxo se o log falhar */
    }
  }

  var NAV_ITEMS = [
    { key: "leads", label: "Leads", href: "leads.html" },
    { key: "projects", label: "Projetos", href: "projects.html" },
    { key: "tasks", label: "Tarefas", href: "tasks.html" },
  ];

  function renderSidebar(activeKey, userEmail) {
    var navHtml = NAV_ITEMS.map(function (item) {
      return '<a href="' + item.href + '" class="' + (item.key === activeKey ? "is-active" : "") + '">' + item.label + "</a>";
    }).join("");

    return (
      '<aside class="admin-sidebar">' +
        '<a href="../index.html" class="admin-sidebar__brand"><img src="../assets/img/logo-mark.png" alt="" aria-hidden="true" /><span>Buovai</span></a>' +
        navHtml +
        '<a href="index.html">Ver como cliente</a>' +
        '<div class="admin-sidebar__footer">' +
          "<span>" + escapeHtml(userEmail || "") + "</span>" +
          '<button class="btn btn-ghost btn-sm" id="ba-logout-btn" style="width:100%;">Sair</button>' +
        "</div>" +
      "</aside>"
    );
  }

  /**
   * Garante sessão + admin. Injeta a sidebar no elemento #admin-sidebar-mount
   * e devolve { client, session }. Redireciona e interrompe se não autorizado.
   */
  async function boot(activeKey) {
    var client = window.buovaiClient;
    var { data: sessionData } = await client.auth.getSession();
    var session = sessionData.session;

    if (!session) {
      window.location.href = "login.html";
      return null;
    }

    var { data: isAdmin } = await client.rpc("is_admin");
    if (!isAdmin) {
      window.location.href = "index.html";
      return null;
    }

    var mount = document.getElementById("admin-sidebar-mount");
    if (mount) mount.outerHTML = renderSidebar(activeKey, session.user.email);

    var logoutBtn = document.getElementById("ba-logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async function () {
        await client.auth.signOut();
        window.location.href = "login.html";
      });
    }

    return { client: client, session: session };
  }

  return {
    UF_LIST: UF_LIST,
    escapeHtml: escapeHtml,
    fmtDate: fmtDate,
    fmtDateTime: fmtDateTime,
    fmtMoney: fmtMoney,
    maskCnpj: maskCnpj,
    isValidCnpj: isValidCnpj,
    loadCities: loadCities,
    logActivity: logActivity,
    boot: boot,
  };
})();
