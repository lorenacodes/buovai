/**
 * Envia o formulário de contato direto para a tabela contact_messages
 * no Supabase (INSERT público, protegido por RLS). Inclui honeypot
 * anti-spam simples.
 */
(function () {
  "use strict";

  const form = document.getElementById("contact-form");
  if (!form) return;

  const statusEl = document.getElementById("contact-status");
  const submitBtn = form.querySelector('[type="submit"]');
  const submitLabel = submitBtn.querySelector(".btn-label");

  function setStatus(kind, message) {
    statusEl.textContent = message;
    statusEl.classList.remove("form-status--ok", "form-status--error");
    statusEl.classList.add("is-visible", kind === "ok" ? "form-status--ok" : "form-status--error");
  }

  function clearStatus() {
    statusEl.classList.remove("is-visible", "form-status--ok", "form-status--error");
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitLabel.textContent = isLoading ? "Enviando..." : "Enviar mensagem";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearStatus();

    const formData = new FormData(form);

    // Honeypot: se preenchido, é bot — finge sucesso e não envia nada.
    if (formData.get("website")) {
      form.reset();
      setStatus("ok", "Mensagem enviada. Retornaremos em breve.");
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
      setStatus("error", "Preencha nome, e-mail e mensagem para continuar.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(payload.email)) {
      setStatus("error", "Digite um e-mail válido.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await window.buovaiClient.from("contact_messages").insert(payload);
      if (error) throw error;

      form.reset();
      setStatus("ok", "Mensagem enviada com sucesso. Retornamos em até 1 dia útil.");
    } catch (err) {
      console.error("[Buovai] Falha ao enviar contato:", err);
      setStatus("error", "Não foi possível enviar agora. Tente novamente ou use o e-mail direto.");
    } finally {
      setLoading(false);
    }
  });
})();
