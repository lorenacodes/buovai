/**
 * Contador leve de visualizações de página, sem cookies nem identificação
 * pessoal — grava 1 linha em site_views por carregamento, usada só para a
 * Lorena acompanhar tráfego e origem de campanhas no painel administrativo.
 * Só grava depois que o visitante aceita no aviso de cookies/LGPD
 * (js/cookie-consent.js).
 */
(function () {
  function record() {
    try {
      var params = new URLSearchParams(location.search);
      // O builder do supabase-js só dispara a requisição quando a Promise
      // é consumida (await/.then) — sem isso, o insert nunca saía do
      // navegador. Por isso o .then()/.catch() aqui, mesmo sem usar o
      // resultado.
      window.buovaiClient.from("site_views").insert({
        path: location.pathname,
        referrer: document.referrer || null,
        utm_source: params.get("utm_source") || null,
        utm_medium: params.get("utm_medium") || null,
        utm_campaign: params.get("utm_campaign") || null,
        device: window.matchMedia && window.matchMedia("(max-width: 760px)").matches ? "mobile" : "desktop",
      }).then(function () {}, function () {});
    } catch (e) {}
  }

  var consent = window.buovaiConsent && window.buovaiConsent.get();
  if (consent === "accepted") record();

  document.addEventListener("buovai:consent", function (e) {
    if (e.detail && e.detail.value === "accepted") record();
  });
})();
