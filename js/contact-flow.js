/**
 * Contato: alterna entre conversa (bot pergunta nome/problema/e-mail/
 * telefone, um de cada vez) e formulário tradicional, com um cartão de
 * pré-visualização ao vivo que mostra o pedido se montando, e a animação
 * do cartão "voando" até o botão "Área do cliente" no header ao enviar.
 * Porte da lógica original (chatQ/botSay/flyCard/fmtPhone), mais a
 * gravação real no Supabase (o arquivo original é só a maquete).
 */
(function () {
  "use strict";

  const liveCard = document.getElementById("liveCard");
  if (!liveCard) return;

  const state = { fName: "", fEmail: "", fPhone: "", fCompany: "", fBudget: "", msg: "", focus: "" };

  // ---- Cartão de pré-visualização ----
  const lc = {
    name: document.getElementById("lcName"),
    nameCaret: document.getElementById("lcNameCaret"),
    company: document.getElementById("lcCompany"),
    companyCaret: document.getElementById("lcCompanyCaret"),
    email: document.getElementById("lcEmail"),
    emailCaret: document.getElementById("lcEmailCaret"),
    phone: document.getElementById("lcPhone"),
    phoneCaret: document.getElementById("lcPhoneCaret"),
    budget: document.getElementById("lcBudget"),
    msg: document.getElementById("lcMsg"),
    msgCaret: document.getElementById("lcMsgCaret"),
    status: document.getElementById("lcStatus"),
    fill: document.getElementById("lcFill"),
  };

  function dash(v) { return v && v.trim() ? v : "—"; }

  function renderCard() {
    lc.name.textContent = dash(state.fName);
    lc.nameCaret.style.display = state.focus === "name" ? "inline" : "none";
    lc.company.textContent = state.fCompany && state.fCompany.trim() ? state.fCompany : "Pessoa física";
    lc.companyCaret.style.display = state.focus === "company" ? "inline" : "none";
    lc.email.textContent = dash(state.fEmail);
    lc.emailCaret.style.display = state.focus === "email" ? "inline" : "none";
    lc.phone.textContent = dash(state.fPhone);
    lc.phoneCaret.style.display = state.focus === "phone" ? "inline" : "none";
    lc.budget.textContent = state.fBudget && state.fBudget.trim() ? state.fBudget : "Prefiro conversar primeiro";
    if (state.msg && state.msg.trim()) {
      lc.msg.textContent = state.msg;
      lc.msg.style.color = "#0e0f0b";
    } else {
      lc.msg.textContent = "Conforme você escreve, o pedido aparece aqui.";
      lc.msg.style.color = "#8a8d7c";
    }
    lc.msgCaret.style.display = state.focus === "msg" ? "inline" : "none";

    const filled = [state.fName, state.fEmail, state.fPhone, state.msg].filter((v) => v && v.trim()).length;
    const flying = liveCard.dataset.flying === "1";
    const sent = liveCard.dataset.sent === "1";
    lc.fill.style.width = (sent ? 100 : (filled / 4) * 100) + "%";
    lc.status.textContent = sent ? "enviado · em análise" : flying ? "enviando…" : filled ? "rascunho" : "aguardando";
    lc.status.style.background = sent ? "#defa9a" : "#c9cbb5";
  }
  renderCard();

  // ---- Telefone formatado ----
  function fmtPhone(v) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d.length ? "(" + d : "";
    if (d.length <= 3) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 7) return "(" + d.slice(0, 2) + ") " + d.slice(2, 3) + " " + d.slice(3);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 3) + " " + d.slice(3, 7) + "-" + d.slice(7);
  }

  // ---- Alternar Conversar / Formulário ----
  const toChatBtn = document.getElementById("toChatBtn");
  const toFormBtn = document.getElementById("toFormBtn");
  const chatPanel = document.getElementById("chatPanel");
  const formPanel = document.getElementById("contact-form");
  let chatMode = true;

  function setMode(toChat) {
    chatMode = toChat;
    chatPanel.style.display = toChat ? "flex" : "none";
    formPanel.style.display = toChat ? "none" : "flex";
    toChatBtn.style.background = toChat ? "#defa9a" : "transparent";
    toChatBtn.style.color = toChat ? "#0e0f0b" : "#fffceb";
    toFormBtn.style.background = toChat ? "transparent" : "#defa9a";
    toFormBtn.style.color = toChat ? "#fffceb" : "#0e0f0b";
    // Sincroniza os campos do formulário com o que já foi dito na conversa.
    if (!toChat) {
      document.getElementById("cf-name").value = state.fName;
      document.getElementById("cf-email").value = state.fEmail;
      document.getElementById("cf-phone").value = state.fPhone;
      document.getElementById("cf-company").value = state.fCompany;
      document.getElementById("cf-message").value = state.msg;
    }
  }
  toChatBtn.addEventListener("click", () => setMode(true));
  toFormBtn.addEventListener("click", () => setMode(false));

  // ---- Conversa (bot) ----
  const chatLogEl = document.getElementById("chatLog");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const chatConfirm = document.getElementById("chatConfirm");
  const chatSendBtn = document.getElementById("chatSendBtn");
  const chatRestartBtn = document.getElementById("chatRestartBtn");
  const chatSkipBtn = document.getElementById("chatSkipBtn");

  const chatQ = [
    { key: "fName", foc: "name", ph: "Seu nome", type: "text" },
    { key: "msg", foc: "msg", ph: "Descreva com suas palavras", type: "text" },
    { key: "fPhone", foc: "phone", ph: "(00) 0 0000-0000", type: "tel" },
    { key: "fEmail", foc: "email", ph: "seu@email.com (opcional)", type: "email", optional: true },
  ];
  let chatStep = 0;
  let botTyping = false;
  let chatLog = [{ me: false, text: "Olá. Eu recebo os novos projetos da Lorena. Para começar, qual é o seu nome?" }];
  let botTimer = null;

  function addBubble(entry) {
    const row = document.createElement("div");
    row.style.cssText = `display:flex;flex-direction:column;align-items:${entry.me ? "flex-end" : "flex-start"};gap:6px;animation:modIn .45s cubic-bezier(.16,.84,.24,1) both`;
    const who = document.createElement("span");
    who.style.cssText = "font-family:'Lexend Exa',sans-serif;font-size:10px;color:#a3a693";
    who.textContent = entry.me ? "você" : "buov.ai";
    const bubble = document.createElement("div");
    bubble.style.cssText = `max-width:86%;padding:13px 16px;background:${entry.me ? "#defa9a" : "#1f4905"};color:${entry.me ? "#0e0f0b" : "#fffceb"};font-size:15px;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere`;
    bubble.textContent = entry.text;
    row.append(who, bubble);
    chatLogEl.appendChild(row);
    chatLogEl.scrollTop = chatLogEl.scrollHeight;
  }

  function renderChatInput() {
    const q = chatQ[chatStep];
    const askInput = !!q && !botTyping;
    const askConfirm = !q && !botTyping;
    chatForm.style.display = askInput ? "flex" : "none";
    chatConfirm.style.display = askConfirm ? "flex" : "none";
    chatSkipBtn.style.display = q && q.optional && !botTyping ? "block" : "none";
    if (q) {
      chatInput.placeholder = q.ph;
      chatInput.type = q.type;
      chatInput.value = state[q.key] || "";
      if (askInput) chatInput.focus({ preventScroll: true });
    }
  }

  function setTyping(on) {
    botTyping = on;
    let dots = chatLogEl.querySelector("#botTypingRow");
    if (on) {
      if (!dots) {
        dots = document.createElement("div");
        dots.id = "botTypingRow";
        dots.style.cssText = "display:flex;flex-direction:column;align-items:flex-start;gap:6px";
        dots.innerHTML = '<span style="font-family:\'Lexend Exa\',sans-serif;font-size:10px;color:#a3a693">buov.ai</span><div style="padding:13px 16px;background:#1f4905;color:#defa9a;font-family:\'Lexend Exa\',sans-serif;font-size:14px;letter-spacing:.2em">•••</div>';
        chatLogEl.appendChild(dots);
        chatLogEl.scrollTop = chatLogEl.scrollHeight;
      }
    } else if (dots) {
      dots.remove();
    }
    renderChatInput();
  }

  function botSay(text, after) {
    setTyping(true);
    clearTimeout(botTimer);
    const delay = 650 + Math.min(900, text.length * 12);
    botTimer = setTimeout(() => {
      setTyping(false);
      chatLog.push({ me: false, text });
      addBubble({ me: false, text });
      renderChatInput();
      if (after) after();
    }, delay);
  }

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = chatQ[chatStep];
    const v = (chatInput.value || "").trim();
    if (!q || !v || botTyping) return;

    if (q.key === "fEmail" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) {
      chatLog.push({ me: true, text: v });
      addBubble({ me: true, text: v });
      chatInput.value = "";
      botSay("Esse e-mail parece incompleto. Pode conferir?");
      return;
    }
    if (q.key === "fPhone" && v.replace(/\D/g, "").length < 10) {
      chatLog.push({ me: true, text: v });
      addBubble({ me: true, text: v });
      chatInput.value = "";
      botSay("Faltou algum número. Pode conferir com o DDD?");
      return;
    }

    chatLog.push({ me: true, text: v });
    addBubble({ me: true, text: v });
    state[q.key] = v;
    const first = (q.key === "fName" ? v : state.fName).split(" ")[0];
    chatStep++;
    chatInput.value = "";
    renderCard();
    renderChatInput();

    if (chatStep === 1) botSay("Prazer, " + first + ". Como essa tarefa é feita hoje, e onde ela trava? Pode escrever do seu jeito.");
    else if (chatStep === 2) botSay("Entendi. Qual telefone ou WhatsApp a Lorena pode usar para falar com você? Com DDD, por favor.");
    else if (chatStep === 3) botSay("Quer deixar um e-mail também? É opcional.");
    else botSay("Pronto. Montei o resumo do seu pedido ao lado. Posso enviar?");
  });

  chatSkipBtn.addEventListener("click", () => {
    const q = chatQ[chatStep];
    if (!q || !q.optional || botTyping) return;
    chatLog.push({ me: true, text: "Prefiro não informar" });
    addBubble({ me: true, text: "Prefiro não informar" });
    chatInput.value = "";
    state[q.key] = "";
    chatStep++;
    renderCard();
    renderChatInput();
    botSay("Sem problema. Montei o resumo do seu pedido ao lado. Posso enviar?");
  });

  chatInput.addEventListener("input", () => {
    const q = chatQ[chatStep];
    if (q && q.key === "fPhone") chatInput.value = fmtPhone(chatInput.value);
  });
  chatInput.addEventListener("focus", () => {
    const q = chatQ[chatStep];
    if (q) { state.focus = q.foc; renderCard(); }
  });
  chatInput.addEventListener("blur", () => { state.focus = ""; renderCard(); });

  chatRestartBtn.addEventListener("click", () => {
    clearTimeout(botTimer);
    chatStep = 0;
    botTyping = false;
    state.fName = ""; state.fEmail = ""; state.fPhone = ""; state.msg = "";
    chatLog = [{ me: false, text: "Sem problema, vamos de novo. Qual é o seu nome?" }];
    chatLogEl.innerHTML = "";
    addBubble(chatLog[0]);
    renderCard();
    renderChatInput();
  });

  addBubble(chatLog[0]);
  renderChatInput();

  // ---- Envio real (Supabase) ----
  async function saveContact() {
    const payload = {
      name: state.fName.trim(),
      email: state.fEmail.trim() || null,
      company: state.fCompany.trim() || null,
      budget: state.fBudget.trim() || null,
      message: state.msg.trim(),
      phone: state.fPhone.trim() || null,
    };
    try {
      const { error } = await window.buovaiClient.from("contact_messages").insert(payload);
      if (error) throw error;
    } catch (err) {
      console.error("[Buovai] Falha ao enviar contato:", err);
    }
  }

  // ---- Cartão "voando" até o botão Área do cliente, e confirmação ----
  const notSentWrap = document.getElementById("notSentWrap");
  const sentWrap = document.getElementById("sentWrap");
  const portalBtn = document.getElementById("portalBtn");
  let flying = false;

  function showSent() {
    liveCard.dataset.sent = "1";
    liveCard.dataset.flying = "0";
    renderCard();
    notSentWrap.style.display = "none";
    sentWrap.style.display = "flex";
  }

  function flyCard() {
    if (flying) return;
    flying = true;
    liveCard.dataset.flying = "1";
    renderCard();
    saveContact();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !liveCard.animate) {
      flying = false;
      showSent();
      return;
    }

    const r = liveCard.getBoundingClientRect();
    const tb = portalBtn && portalBtn.offsetParent !== null ? portalBtn.getBoundingClientRect() : { left: window.innerWidth - 60, top: 20, width: 40, height: 30 };
    const dx = tb.left + tb.width / 2 - (r.left + r.width / 2);
    const dy = tb.top + tb.height / 2 - (r.top + r.height / 2);
    liveCard.style.position = "relative";
    liveCard.style.zIndex = "50";
    const anim = liveCard.animate(
      [
        { transform: "none", opacity: 1 },
        { transform: "translateY(-14px) rotate(-1.5deg) scale(1.02)", opacity: 1, offset: 0.18 },
        { transform: `translate(${dx * 0.55}px,${dy * 0.55 - 60}px) rotate(4deg) scale(.45)`, opacity: 1, offset: 0.62 },
        { transform: `translate(${dx}px,${dy}px) rotate(8deg) scale(.04)`, opacity: 0 },
      ],
      { duration: 1300, easing: "cubic-bezier(.55,0,.25,1)", fill: "forwards" }
    );
    anim.onfinish = () => {
      if (portalBtn && portalBtn.animate) {
        portalBtn.animate(
          [{ background: "#defa9a", transform: "scale(1.12)" }, { background: "transparent", transform: "none" }],
          { duration: 700, easing: "ease-out" }
        );
      }
      flying = false;
      showSent();
      anim.cancel();
      liveCard.style.zIndex = "";
      liveCard.animate(
        [{ opacity: 0, transform: "translateY(18px)" }, { opacity: 1, transform: "none" }],
        { duration: 600, delay: 250, easing: "cubic-bezier(.16,.84,.24,1)", fill: "backwards" }
      );
    };
  }

  chatSendBtn.addEventListener("click", flyCard);

  document.getElementById("sendAnotherBtn").addEventListener("click", () => {
    liveCard.dataset.sent = "0";
    state.fName = ""; state.fEmail = ""; state.fPhone = ""; state.fCompany = ""; state.fBudget = ""; state.msg = "";
    chatStep = 0;
    chatLog = [{ me: false, text: "Olá de novo. Qual é o seu nome?" }];
    chatLogEl.innerHTML = "";
    addBubble(chatLog[0]);
    document.getElementById("contact-form").reset();
    document.getElementById("contact-status").style.display = "none";
    renderCard();
    renderChatInput();
    notSentWrap.style.display = "block";
    sentWrap.style.display = "none";
    setMode(true);
  });

  // ---- Formulário tradicional ----
  const form = document.getElementById("contact-form");
  const statusEl = document.getElementById("contact-status");
  const fieldSel = { name: "#cf-name", email: "#cf-email", tel: "#cf-phone", msg: "#cf-message" };
  const errMsg = { name: "Preencha o seu nome.", email: "Confira o e-mail.", tel: "Informe um telefone com DDD.", msg: "Conte o que precisa ser resolvido." };

  ["cf-name", "cf-email", "cf-phone", "cf-company", "cf-message", "cf-budget"].forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener("input", () => {
      if (id === "cf-phone") el.value = fmtPhone(el.value);
      state.fName = document.getElementById("cf-name").value;
      state.fEmail = document.getElementById("cf-email").value;
      state.fPhone = document.getElementById("cf-phone").value;
      state.fCompany = document.getElementById("cf-company").value;
      state.msg = document.getElementById("cf-message").value;
      state.fBudget = document.getElementById("cf-budget").value;
      renderCard();
    });
    el.addEventListener("focus", () => {
      const map = { "cf-name": "name", "cf-email": "email", "cf-phone": "phone", "cf-company": "company", "cf-message": "msg" };
      if (map[id]) { state.focus = map[id]; renderCard(); }
    });
    el.addEventListener("blur", () => { state.focus = ""; renderCard(); });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    if (formData.get("website")) { flyCard(); return; }

    const bad = [
      ["name", !state.fName.trim()],
      ["email", !!(state.fEmail || "").trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(state.fEmail || "")],
      ["tel", (state.fPhone || "").replace(/\D/g, "").length < 10],
      ["msg", !state.msg.trim()],
    ].find((x) => x[1]);

    if (bad) {
      statusEl.textContent = errMsg[bad[0]];
      statusEl.style.display = "block";
      const el = form.querySelector(fieldSel[bad[0]]);
      if (el) el.focus();
      return;
    }
    statusEl.style.display = "none";
    flyCard();
  });
})();
