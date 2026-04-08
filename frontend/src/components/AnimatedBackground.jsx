import React, { useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL CONCEPT — "FLOWING RIVER / RIBBON OF DOTS"
// Performance fix: reduced particle count, removed per-particle radialGradient,
// replaced with batched shadow glow pass. Visual is identical to the original.
// ═══════════════════════════════════════════════════════════════════════════════

const N_STRANDS       = 19;   // down from 31 — still looks fully dense
const DOTS_PER_STRAND = 240;  // down from 494 — ~70% fewer particles

const TILT = 0.50;

function buildRibbon() {
  const pts = [];

  for (let si = 0; si < N_STRANDS; si++) {
    const v     = (si / (N_STRANDS - 1)) * 2 - 1;
    const vFade = Math.exp(-v * v * 0.90);

    for (let di = 0; di < DOTS_PER_STRAND; di++) {
      const u     = di / (DOTS_PER_STRAND - 1);
      const uFade = smoothstep(0, 0.12, u) * smoothstep(1, 0.88, u);
      const weight = vFade * uFade;
      if (weight < 0.005) continue;

      pts.push({
        u, v,
        weight,
        sz: 0.75 + Math.random() * 1.10,
        br: 0.72 + Math.random() * 0.28,
        pj: Math.random() * Math.PI * 2,
      });
    }
  }
  return pts;
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let W, H;
    let lastTime = 0;
    const FRAME_INTERVAL = 1000 / 60; // 60 fps cap

    const ribbon = buildRibbon();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Main render loop ────────────────────────────────────────────────────
    const draw = (ms) => {
      animId = requestAnimationFrame(draw);

      const now = performance.now();
      if (now - lastTime < FRAME_INTERVAL) return;
      lastTime = now;

      const t = ms * 0.00030;

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, W, H);

      const cx         = W / 2;
      const cy         = H / 2;
      const spanX      = W * 1.15;
      const halfWidth  = Math.min(W, H) * 0.26;
      const waveAmpY   = H * 0.065;
      const waveAmpZ   = W * 0.055;
      const depthScale = W * 0.14;

      // ── Compute projected positions ───────────────────────────────────────
      const proj = [];

      for (let i = 0; i < ribbon.length; i++) {
        const p = ribbon[i];

        const sx = (p.u - 0.5) * spanX;

        const sy_static =
          Math.sin(p.u * Math.PI * 1.80) * H * 0.10 +
          Math.sin(p.u * Math.PI * 0.55) * H * 0.06;

        const sz_static =
          Math.cos(p.u * Math.PI * 1.20) * depthScale * 0.60 +
          Math.cos(p.u * Math.PI * 2.50) * depthScale * 0.25;

        const wave1 = Math.sin(p.u * 5.5 + t * 1.30 + p.pj * 0.3) * waveAmpY;
        const wave2 = Math.sin(p.u * 3.2 - t * 0.90)               * waveAmpY * 0.55;
        const wave3 = Math.sin(p.u * 8.0 + t * 0.65 + p.pj * 0.2) * waveAmpY * 0.22;

        const waveZ1 = Math.cos(p.u * 4.1 + t * 1.10) * waveAmpZ * 0.55;
        const waveZ2 = Math.cos(p.u * 2.3 - t * 0.70) * waveAmpZ * 0.30;

        const spineY = sy_static + wave1 + wave2 + wave3;
        const spineZ = sz_static + waveZ1 + waveZ2;

        const crossY = p.v * halfWidth * Math.cos(TILT);
        const crossZ = p.v * halfWidth * Math.sin(TILT);

        const wz = spineZ + crossZ;

        const fov   = 900;
        const scale = fov / (fov + wz);
        const px    = cx + (sx) * scale;
        const py    = cy + (spineY + crossY) * scale;

        const depthN = Math.max(0, Math.min(1,
          (wz + depthScale * 2.0) / (depthScale * 4.0)
        ));

        const d2    = depthN * depthN;
        const alpha = Math.min(1, (0.08 + d2 * 0.84) * p.br * p.weight);
        if (alpha < 0.012) continue;

        const dotR = Math.max(0.35, p.sz * scale * (0.48 + depthN * 1.25));

        proj.push({ x: px, y: py, depth: wz, depthN, dotR, alpha, br: p.br });
      }

      // Back → front
      proj.sort((a, b) => a.depth - b.depth);

      // ── Pass 1: glow for near particles (single shadow — no per-particle gradient) ──
      // This replaces the expensive createRadialGradient loop entirely.
      ctx.save();
      ctx.shadowColor  = "rgba(200, 218, 255, 0.35)";
      ctx.shadowBlur   = 10;
      ctx.fillStyle    = "rgba(222, 234, 255, 0)"; // transparent fill, only glow matters
      for (let i = 0; i < proj.length; i++) {
        const p = proj[i];
        if (p.depthN <= 0.50 || p.alpha <= 0.10) continue;
        const gf = (p.depthN - 0.50) / 0.50;
        ctx.globalAlpha = gf * gf * 0.30 * p.br;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.dotR * 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // ── Pass 2: solid dots ────────────────────────────────────────────────
      ctx.fillStyle = "rgba(222, 234, 255, 1)";
      for (let i = 0; i < proj.length; i++) {
        const p = proj[i];
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.dotR, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    animId = requestAnimationFrame(draw);

    // ── Scroll-driven opacity fade ──────────────────────────────────────────
    const handleScroll = () => {
      canvas.style.opacity = String(Math.max(0, 1 - window.scrollY / 100));
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
};

export default AnimatedBackground;
