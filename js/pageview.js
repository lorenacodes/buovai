/**
 * Contador leve de visualizações de página, sem cookies nem identificação
 * pessoal — grava 1 linha em site_views por carregamento, usada só para a
 * Lorena acompanhar tráfego, origem de campanhas e engajamento (tempo na
 * página, até onde rolou) no painel administrativo. Só grava depois que o
 * visitante aceita no aviso de cookies/LGPD (js/cookie-consent.js).
 */
(function () {
  var rowId = null;
  var maxScroll = 0;
  var secondsVisible = 0;
  var lastMilestoneSent = 0;

  function scrollPct() {
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return 100;
    return Math.max(0, Math.min(100, Math.round((window.scrollY / scrollable) * 100)));
  }

  function updateEngagement(force) {
    if (!rowId) return;
    var milestone = Math.floor(maxScroll / 25) * 25;
    var dueTime = secondsVisible > 0 && secondsVisible % 15 === 0;
    if (!force && milestone === lastMilestoneSent && !dueTime) return;
    lastMilestoneSent = milestone;
    try {
      window.buovaiClient.from("site_views").update({ max_scroll_pct: maxScroll, time_on_page_sec: secondsVisible }).eq("id", rowId).then(function () {}, function () {});
    } catch (e) {}
  }

  function startEngagementTracking() {
    window.addEventListener("scroll", function () {
      maxScroll = Math.max(maxScroll, scrollPct());
      updateEngagement(false);
    }, { passive: true });

    setInterval(function () {
      if (document.visibilityState === "visible") {
        secondsVisible += 1;
        updateEngagement(false);
      }
    }, 1000);

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") updateEngagement(true);
    });
  }

  function record() {
    try {
      var params = new URLSearchParams(location.search);
      // O builder do supabase-js só dispara a requisição quando a Promise
      // é consumida (await/.then) — sem isso, o insert nunca saía do
      // navegador. Por isso o .then()/.catch() aqui, mesmo sem usar o
      // resultado.
      // Gera o id no navegador (em vez de ler de volta com .select()) pra
      // não precisar dar permissão de leitura da tabela pra quem só devia
      // poder inserir/atualizar a própria visita.
      var id = window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : null;
      window.buovaiClient.from("site_views").insert({
        id: id || undefined,
        path: location.pathname,
        referrer: document.referrer || null,
        utm_source: params.get("utm_source") || null,
        utm_medium: params.get("utm_medium") || null,
        utm_campaign: params.get("utm_campaign") || null,
        device: window.matchMedia && window.matchMedia("(max-width: 760px)").matches ? "mobile" : "desktop",
      }).then(function () {
        if (id) { rowId = id; startEngagementTracking(); }
      }, function () {});
    } catch (e) {}
  }

  var consent = window.buovaiConsent && window.buovaiConsent.get();
  if (consent === "accepted") record();

  document.addEventListener("buovai:consent", function (e) {
    if (e.detail && e.detail.value === "accepted") record();
  });
})();
