/**
 * Contador leve de visualizações de página, sem cookies nem identificação
 * pessoal — grava 1 linha em site_views por carregamento, usada só para a
 * Lorena acompanhar tráfego no painel administrativo. Só grava depois que
 * o visitante aceita no aviso de cookies/LGPD (js/cookie-consent.js).
 */
(function () {
  function record() {
    try {
      window.buovaiClient.from("site_views").insert({
        path: location.pathname,
        referrer: document.referrer || null,
      });
    } catch (e) {}
  }

  var consent = window.buovaiConsent && window.buovaiConsent.get();
  if (consent === "accepted") record();

  document.addEventListener("buovai:consent", function (e) {
    if (e.detail && e.detail.value === "accepted") record();
  });
})();
