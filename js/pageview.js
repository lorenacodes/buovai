/**
 * Contador leve de visualizações de página, sem cookies nem identificação
 * pessoal — grava 1 linha em site_views por carregamento, usada só para a
 * Lorena acompanhar tráfego no painel administrativo.
 */
(function () {
  try {
    window.buovaiClient.from("site_views").insert({
      path: location.pathname,
      referrer: document.referrer || null,
    });
  } catch (e) {}
})();
