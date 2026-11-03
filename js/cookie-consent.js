/**
 * Aviso de cookies/LGPD. Mostra uma barra no primeiro acesso; a escolha
 * (aceitar/recusar) fica salva em localStorage e dispara o evento
 * "buovai:consent" para os módulos que dependem dela (ex.: js/pageview.js).
 * "Aceitar" libera o registro de visualização de página (site_views);
 * "Recusar" nunca grava nada — o site funciona normalmente do mesmo jeito.
 */
(function () {
  var KEY = "buovaiConsent";

  function getConsent() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function setConsent(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
    document.dispatchEvent(new CustomEvent("buovai:consent", { detail: { value: v } }));
  }

  window.buovaiConsent = { get: getConsent, set: setConsent };

  function showBanner() {
    var wrap = document.createElement("div");
    wrap.id = "cookieBar";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-label", "Aviso de cookies");
    wrap.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:80;background:#0e0f0b;color:#fffceb;padding:20px max(20px, calc((100vw - 1320px) / 2 + 20px));display:flex;gap:20px;flex-wrap:wrap;align-items:center;justify-content:space-between;box-shadow:0 -12px 30px rgba(14,15,11,.25)";
    wrap.innerHTML =
      '<span style="flex:1 1 320px;font-size:13px;line-height:1.6;color:#e6e4d2">Usamos cookies e um contador simples de visitas para entender como o site é usado, conforme a LGPD. Nenhum dado é vendido ou compartilhado com terceiros. <a href="privacidade.html" style="color:#defa9a;text-decoration:underline">Saiba mais na Política de Privacidade</a>.</span>' +
      '<span style="display:flex;gap:10px;flex-wrap:wrap;font-family:\'Lexend Exa\',sans-serif;font-size:12px">' +
      '<button type="button" id="cookieReject" style="padding:12px 16px;background:transparent;border:1px solid rgba(255,252,235,.4);color:#fffceb;cursor:pointer">Recusar</button>' +
      '<button type="button" id="cookieAccept" style="padding:12px 18px;background:#defa9a;border:0;color:#0e0f0b;cursor:pointer">Aceitar</button>' +
      "</span>";
    document.body.appendChild(wrap);
    wrap.querySelector("#cookieAccept").addEventListener("click", function () {
      setConsent("accepted");
      wrap.remove();
    });
    wrap.querySelector("#cookieReject").addEventListener("click", function () {
      setConsent("rejected");
      wrap.remove();
    });
  }

  var current = getConsent();
  if (current !== "accepted" && current !== "rejected") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", showBanner);
    else showBanner();
  }

  // Link "Gerenciar cookies" no rodapé reabre a barra pra trocar a escolha.
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("#cookiePrefsLink");
    if (!t) return;
    e.preventDefault();
    var existing = document.getElementById("cookieBar");
    if (existing) existing.remove();
    showBanner();
  });
})();
