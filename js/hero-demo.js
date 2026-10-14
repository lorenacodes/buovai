/**
 * Hero "do caos ao sistema": peças soltas se organizam num painel.
 * Só anima transform/opacity; respeita prefers-reduced-motion.
 */
(function () {
  "use strict";

  const stage = document.getElementById("heroDemoStage");
  const replayBtn = document.getElementById("heroDemoReplay");
  if (!stage) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CHAOS_DURATION = 1800;

  let timer = null;

  function resolve() {
    stage.classList.add("is-resolved");
  }

  function playOnce() {
    stage.classList.remove("is-resolved");
    clearTimeout(timer);
    timer = setTimeout(resolve, CHAOS_DURATION);
  }

  if (reduceMotion) {
    resolve();
    if (replayBtn) replayBtn.hidden = true;
  } else {
    playOnce();
    if (replayBtn) {
      replayBtn.addEventListener("click", () => {
        // força reflow pra reiniciar a animação de flutuação das peças
        stage.classList.remove("is-resolved");
        void stage.offsetWidth;
        playOnce();
      });
    }
  }
})();
