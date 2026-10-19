/**
 * Envia o formulário de contato direto para a tabela contact_messages no
 * Supabase (INSERT público, protegido por RLS). Ao enviar com sucesso,
 * troca o formulário pela mensagem de confirmação — igual ao
 * notSent/sent do arquivo original (lá é estado React; aqui é a mesma
 * troca feita à mão, já que esta é a página real, não a maquete).
 */
(function () {
  "use strict";

  const form = document.getElementById("contact-form");
  if (!form) return;

  const wrap = form.parentElement;
  const statusEl = document.getElementById("contact-status");
  const submitBtn = form.querySelector('[type="submit"]');
  const submitLabel = submitBtn.querySelector(".btn-label");

  function setStatus(message, color) {
    statusEl.textContent = message;
    statusEl.style.display = message ? "block" : "none";
    statusEl.style.color = color || "#b23b3b";
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitLabel.textContent = isLoading ? "Enviando..." : "Enviar mensagem ↗";
  }

  function showSentConfirmation() {
    const confirmation = document.createElement("div");
    confirmation.style.cssText = "display:flex;flex-direction:column;gap:20px";
    confirmation.innerHTML =
      '<div style="font-family:\'Lexend Exa\',sans-serif;font-size:12px;color:#457528">//mensagem enviada</div>' +
      '<div style="font-family:\'Lexend Exa\',sans-serif;font-size:clamp(24px,2.6vw,36px);letter-spacing:-.05em;line-height:1.15">Recebi. Respondo em até 1 dia útil.</div>' +
      '<button type="button" style="width:max-content;padding:0 0 4px;background:none;border:0;border-bottom:1px solid #0e0f0b;font-family:\'Lexend Exa\',sans-serif;font-size:12px;cursor:pointer;color:#0e0f0b">Enviar outra mensagem</button>';
    confirmation.querySelector("button").addEventListener("click", () => {
      confirmation.replaceWith(form);
      form.reset();
      setStatus("");
    });
    form.replaceWith(confirmation);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("");

    const formData = new FormData(form);

    // Honeypot: se preenchido, é bot — finge sucesso e não envia nada.
    if (formData.get("website")) {
      showSentConfirmation();
      return;
    }

    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      company: String(formData.get("company") || "").trim() || null,
      budget: String(formData.get("budget") || "").trim() || null,
      message: String(formData.get("message") || "").trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      setStatus("Preencha nome, e-mail e mensagem para continuar.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(payload.email)) {
      setStatus("Digite um e-mail válido.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await window.buovaiClient.from("contact_messages").insert(payload);
      if (error) throw error;
      showSentConfirmation();
    } catch (err) {
      console.error("[Buovai] Falha ao enviar contato:", err);
      setStatus("Não foi possível enviar agora. Tente novamente ou use o e-mail direto.");
    } finally {
      setLoading(false);
    }
  });
})();
