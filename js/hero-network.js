/**
 * Hero: rede de pontos conectados em torno do robô da marca. Puramente
 * decorativa (canvas aria-hidden); respeita prefers-reduced-motion
 * desenhando um único frame estático, sem loop de animação.
 */
(function () {
  "use strict";

  const canvas = document.getElementById("heroNet");
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
  const demo = canvas.closest(".hero__demo");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const CREAM = "253, 249, 230";
  const LIME = "198, 229, 117";
  const LINK_DIST = 130;
  const POINT_COUNT_DESKTOP = 46;
  const POINT_COUNT_MOBILE = 26;

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let points = [];
  let rafId = null;

  function makePoints() {
    const count = width < 500 ? POINT_COUNT_MOBILE : POINT_COUNT_DESKTOP;
    points = [];
    for (let i = 0; i < count; i++) {
      const cx = width / 2;
      const cy = height / 2;
      const x = Math.random() * width;
      const y = Math.random() * height;
      // pontos mais perto do centro (robô) ganham um leve puxão extra, pra
      // a rede parecer orbitar a marca em vez de só flutuar solta
      const distFromCenter = Math.hypot(x - cx, y - cy);
      const pull = Math.max(0, 1 - distFromCenter / (width * 0.6)) * 0.15;
      points.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1.4 + Math.random() * 1.8,
        pull,
        color: Math.random() < 0.3 ? LIME : CREAM,
      });
    }
  }

  function resize() {
    const rect = demo.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makePoints();
  }

  function step() {
    const cx = width / 2;
    const cy = height / 2;

    points.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      // puxão suave em direção ao centro
      p.vx += (cx - p.x) * p.pull * 0.0006;
      p.vy += (cy - p.y) * p.pull * 0.0006;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      p.x = Math.max(0, Math.min(width, p.x));
      p.y = Math.max(0, Math.min(height, p.y));
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i];
        const b = points[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK_DIST) {
          const alpha = (1 - d / LINK_DIST) * 0.35;
          ctx.strokeStyle = `rgba(${CREAM}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    points.forEach((p) => {
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.color}, 0.85)`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function loop() {
    step();
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    resize();
    if (reduceMotion) {
      draw();
      return;
    }
    if (!rafId) loop();
  }

  let resizeTimer;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        start();
      }, 200);
    },
    { passive: true }
  );

  // Só liga a animação quando o hero entra na tela (ela já está no topo da
  // página, mas isso evita gastar ciclo antes do layout/fontes assentarem).
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) start();
      });
    },
    { threshold: 0.1 }
  );
  observer.observe(demo);
})();
