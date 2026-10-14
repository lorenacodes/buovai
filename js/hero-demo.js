/**
 * Hero "do caos ao sistema": peças soltas se organizam num painel, em loop
 * contínuo. Só anima transform/opacity; respeita prefers-reduced-motion.
 */
(function () {
  "use strict";

  const stage = document.getElementById("heroDemoStage");
  if (!stage) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CHAOS_MS = 1800;
  const RESOLVED_MS = 3400;

  if (reduceMotion) {
    stage.classList.add("is-resolved");
    return;
  }

  function loop() {
    stage.classList.remove("is-resolved");
    setTimeout(() => {
      stage.classList.add("is-resolved");
      setTimeout(loop, RESOLVED_MS);
    }, CHAOS_MS);
  }

  loop();
})();
