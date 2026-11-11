#!/usr/bin/env node
/**
 * Suíte de testes de fumaça do site institucional — não substitui revisão
 * manual, mas pega regressão óbvia antes de publicar (o site não tinha
 * nenhum teste automatizado; até agora cada mudança era validada só na
 * mão, com script de Playwright descartável a cada sessão).
 *
 * Roda local, sem dependência de rede real: sobe o próprio site num
 * servidor estático e estuba window.buovaiClient (o Supabase real é
 * bloqueado neste ambiente, e não faz sentido depender de dados reais
 * pra um teste de fumaça).
 *
 * Uso: node tests/smoke.js
 * (ou: npm test, se tiver o package.json do repo)
 */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const PORT = 8971;

const MIME = {
  ".html": "text/html", ".js": "application/javascript", ".css": "text/css",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".json": "application/json", ".mp4": "video/mp4", ".txt": "text/plain",
  ".xml": "application/xml",
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split("?")[0]);
      if (p === "/") p = "/index.html";
      const full = path.join(ROOT, p);
      if (!full.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
      fs.readFile(full, (err, data) => {
        if (err) { res.writeHead(404); res.end("not found"); return; }
        res.writeHead(200, { "Content-Type": MIME[path.extname(full)] || "application/octet-stream" });
        res.end(data);
      });
    });
    server.listen(PORT, () => resolve(server));
  });
}

// ---- stub de portfólio: dados fictícios SÓ para este teste local (nunca
// publicados) — os títulos batem com INTERACTIVE_COPY em js/portfolio.js
// pra exercitar o carrossel interativo e a bolha de depoimento. ----
function stubClient() {
  const projects = [
    { id: "p1", title: "Portal do Cliente", client_name: "Cliente de teste", published: true, display_order: 1 },
    { id: "p2", title: "Sistema de Gestão de Obras", client_name: "Cliente de teste 2", published: true, display_order: 2 },
    { id: "p3", title: "Site Institucional", client_name: "Cliente de teste 3", published: true, display_order: 3 },
  ];
  window.buovaiClient = {
    from: () => ({ select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: projects, error: null }) }) }) }),
  };
}

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  const mark = ok ? "✓" : "✗";
  console.log(mark + " " + name + (detail ? " — " + detail : ""));
}

async function main() {
  const server = await startServer();
  const browser = await chromium.launch();
  const ignoredErrors = [/ERR_TUNNEL_CONNECTION_FAILED/, /supabase is not defined/, /getSession/, /Falha ao carregar portf/];
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const pageErrors = [];
  page.on("pageerror", (e) => { if (!ignoredErrors.some((r) => r.test(e.message))) pageErrors.push(e.message); });
  page.on("console", (m) => {
    if (m.type() === "error" && !ignoredErrors.some((r) => r.test(m.text()))) pageErrors.push(m.text());
  });

  try {
    await page.addInitScript(stubClient);
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: "load" });

    // ---- 1. Título e logo ----
    const title = await page.title();
    check("título da página contém 'buov.ai'", /buov\.ai/i.test(title), title);

    // ---- 2. Espera a intro terminar (splash + animação de ~7s) ----
    await page.waitForTimeout(8500);
    const introHidden = await page.evaluate(() => {
      const el = document.getElementById("siteIntro");
      return !el || el.classList.contains("is-hidden") || getComputedStyle(el).display === "none" || getComputedStyle(el).opacity === "0";
    });
    check("splash de entrada esconde depois de carregar", introHidden);

    // ---- 3. Cabeçalho: logo, nav, CTA sempre visível no desktop ----
    const header = await page.evaluate(() => {
      const logo = document.querySelector('header img[alt="buov.ai"]');
      const cta = document.getElementById("navCta");
      const portalBtn = document.getElementById("portalBtn");
      return {
        logoH: logo ? logo.getBoundingClientRect().height : 0,
        ctaVisible: cta ? getComputedStyle(cta).display !== "none" && cta.getBoundingClientRect().width > 0 : false,
        portalBtnVisible: portalBtn ? portalBtn.getBoundingClientRect().width > 0 : false,
      };
    });
    check("logo do cabeçalho com altura >= 34px", header.logoH >= 34, header.logoH + "px");
    check("CTA 'Contar meu problema' visível no desktop (sem precisar rolar)", header.ctaVisible);
    check("botão 'Área do cliente' visível no desktop", header.portalBtnVisible);

    // ---- 4. Palavras digitadas do hero mudam ao longo do tempo ----
    const seenWords = new Set();
    for (let i = 0; i < 4; i++) {
      await page.waitForTimeout(1800);
      const txt = await page.evaluate(() => { const el = document.getElementById("typedText"); return el ? el.textContent : ""; });
      if (txt) seenWords.add(txt);
    }
    check("palavras digitadas do hero variam (não travou numa só)", seenWords.size > 1, [...seenWords].slice(0, 3).join(" | "));

    // ---- 5. Nenhum overflow horizontal em larguras comuns ----
    for (const w of [390, 768, 1024, 1440]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.waitForTimeout(150);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      check(`sem overflow horizontal em ${w}px`, overflow <= 1, overflow + "px de sobra");
    }
    await page.setViewportSize({ width: 1400, height: 900 });

    // ---- 6. Robô-guia aparece ao rolar pra uma seção longe do hero ----
    await page.evaluate(() => {
      const el = document.querySelector('[data-screen-label="Como trabalho"]');
      if (el) el.scrollIntoView({ block: "center" });
    });
    await page.waitForTimeout(600);
    const guide = await page.evaluate(() => {
      let w = null;
      document.querySelectorAll("div").forEach((d) => { if (d.title === "Próxima seção") w = d; });
      return w ? { opacity: w.style.opacity, top: w.getBoundingClientRect().top } : null;
    });
    check("robô-guia aparece (opacidade 1) longe do hero", !!guide && guide.opacity === "1", JSON.stringify(guide));

    // ---- 7. Portfólio: cases carregam (com o stub) e o carrossel troca de aba ----
    await page.evaluate(() => {
      const el = document.getElementById("portfolio-list");
      if (el) el.scrollIntoView({ block: "center" });
    });
    await page.waitForTimeout(600);
    const caseCount = await page.evaluate(() => document.querySelectorAll("[data-case-title]").length);
    check("cases do portfólio renderizam (stub com 3 projetos)", caseCount === 3, caseCount + " case(s)");

    // Espera ativa (até 2s) em vez de um sleep fixo — num runner de CI
    // mais lento/frio, 150ms às vezes não bastava pro clique terminar de
    // processar, dando falso negativo (visto num push real: passou no
    // commit no `main`, falhou no mesmo commit minutos antes na branch,
    // puro timing de ambiente, não bug do site).
    const tabSwitch = await page.evaluate(async () => {
      const panel = document.querySelector('[data-case-title="Portal do Cliente"]');
      if (!panel) return null;
      const tabs = panel.querySelectorAll("[data-case-tab]");
      if (tabs.length < 2) return null;
      tabs[1].click();
      const activeKey = tabs[1].getAttribute("data-case-tab");
      const shot = panel.querySelector(`[data-case-shot="${activeKey}"]`);
      if (!shot) return null;
      const deadline = Date.now() + 2000;
      while (shot.style.opacity !== "1" && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 30));
      }
      return shot.style.opacity;
    });
    check("troca de aba do mockup interativo funciona", tabSwitch === "1", "opacidade da tela ativa: " + tabSwitch);

    // ---- 8. Bolha de vídeo do depoimento: hover aumenta, som alterna, expandir abre lightbox ----
    const bubble = await page.$("[data-case-bubble]");
    if (bubble) {
      const before = await bubble.boundingBox();
      await bubble.hover();
      await page.waitForTimeout(500);
      const after = await bubble.boundingBox();
      check("bolha do depoimento aumenta no hover", after.width > before.width * 1.5, `${before.width.toFixed(0)}px → ${after.width.toFixed(0)}px`);

      const soundBtn = await page.$("[data-case-bubble-sound]");
      const mutedBefore = await page.evaluate(() => document.querySelector("[data-case-bubble-video]").muted);
      await soundBtn.click({ force: true });
      const mutedAfter = await page.evaluate(() => document.querySelector("[data-case-bubble-video]").muted);
      check("botão de som alterna o mudo do vídeo", mutedBefore !== mutedAfter, `${mutedBefore} → ${mutedAfter}`);

      const expandBtn = await page.$("[data-case-bubble-expand]");
      await expandBtn.click({ force: true });
      await page.waitForTimeout(400);
      const lightboxOpen = await page.evaluate(() => document.getElementById("case-video-lightbox").classList.contains("is-open"));
      check("botão de expandir abre o lightbox do vídeo", lightboxOpen);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
      const lightboxClosed = await page.evaluate(() => !document.getElementById("case-video-lightbox").classList.contains("is-open"));
      check("Escape fecha o lightbox do vídeo", lightboxClosed);
    } else {
      check("bolha do depoimento encontrada no DOM", false, "elemento [data-case-bubble] não existe");
    }

    // ---- 9. FAQ abre e fecha ----
    await page.evaluate(() => {
      const el = document.querySelector(".faq-item");
      if (el) el.scrollIntoView({ block: "center" });
    });
    await page.waitForTimeout(300);
    const faqToggle = await page.evaluate(async () => {
      const btn = document.querySelector(".faq-q");
      if (!btn) return null;
      const before = btn.getAttribute("aria-expanded");
      btn.click();
      await new Promise((r) => setTimeout(r, 400));
      const after = btn.getAttribute("aria-expanded");
      return { before, after };
    });
    check("pergunta do FAQ abre ao clicar", !!faqToggle && faqToggle.before === "false" && faqToggle.after === "true", JSON.stringify(faqToggle));

    // ---- 10. Nenhum erro de JS inesperado em toda a navegação ----
    check("nenhum erro de JS inesperado no console", pageErrors.length === 0, pageErrors.slice(0, 5).join(" | "));

    await page.close();
  } finally {
    await browser.close();
    server.close();
  }

  const fails = results.filter((r) => !r.ok);
  console.log("\n" + (fails.length ? fails.length + " falha(s) de " + results.length : "Todos os " + results.length + " testes passaram"));
  process.exit(fails.length ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
