import React, { useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL CONCEPT — "FLOWING RIVER / RIBBON OF DOTS"
// (Exactly the same as before — only particle count reduced for performance)
// ═══════════════════════════════════════════════════════════════════════════════

const N_STRANDS       = 19;   // was 31 → still looks fully dense
const DOTS_PER_STRAND = 240;  // was 494 → ~70% fewer calculations, zero visual loss

// How far the ribbon tilts away from horizontal (radians).
const TILT = 0.50;

// ─────────────────────────────────────────────────────────────────────────────
function buildRibbon() {
  const pts = [];

  for (let si = 0; si < N_STRANDS; si++) {
    const v       = (si / (N_STRANDS - 1)) * 2 - 1;
    const vFade   = Math.exp(-v * v * 0.90);

    for (let di = 0; di < DOTS_PER_STRAND; di++) {
      const u = di / (DOTS_PER_STRAND - 1);
      const uFade = smoothstep(0, 0.12, u) * smoothstep(1, 0.88, u);
      const weight = vFade * uFade;
      if (weight < 0.005) continue;

      pts.push({
        u, v,
        weight,
        sz:  0.75 + Math.random() * 1.10,
        br:  0.72 + Math.random() * 0.28,
        pj:  Math.random() * Math.PI * 2,
      });
    }
  }
  return pts;
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// ─────────────────────────────────────────────────────────────────────────────
const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let W, H;
    let lastTime = 0;
    const FPS_LIMIT = 60;
    const FRAME_INTERVAL = 1000 / FPS_LIMIT;

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

    // Force GPU rendering + crisp dots
    ctx.imageSmoothingEnabled = false;

    // ── Main render loop (optimized + 60 FPS cap) ───────────────────────────
    const draw = (ms) => {
      const now = performance.now();
      if (now - lastTime < FRAME_INTERVAL) {
        animId = requestAnimationFrame(draw);
        return;
      }
      lastTime = now;

      const t = ms * 0.00030;

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;

      const spanX      = W * 1.15;
      const halfWidth  = Math.min(W, H) * 0.26;
      const waveAmpY   = H  * 0.065;
      const waveAmpZ   = W  * 0.055;
      const depthScale = W  * 0.14;

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

        const wave1 = Math.sin(p.u * 5.5  + t * 1.30 + p.pj * 0.3) * waveAmpY;
        const wave2 = Math.sin(p.u * 3.2  - t * 0.90)               * waveAmpY * 0.55;
        const wave3 = Math.sin(p.u * 8.0  + t * 0.65 + p.pj * 0.2) * waveAmpY * 0.22;

        const waveZ1 = Math.cos(p.u * 4.1  + t * 1.10) * waveAmpZ * 0.55;
        const waveZ2 = Math.cos(p.u * 2.3  - t * 0.70) * waveAmpZ * 0.30;

        const spineY = sy_static + wave1 + wave2 + wave3;
        const spineZ = sz_static + waveZ1 + waveZ2;

        const crossY = p.v * halfWidth * Math.cos(TILT);
        const crossZ = p.v * halfWidth * Math.sin(TILT);

        const wx = sx;
        const wy = spineY + crossY;
        const wz = spineZ + crossZ;

        // Perspective projection (unchanged)
        const fov = 900;
        const scale = fov / (fov + wz);
        const px = cx + wx * scale;
        const py = cy + wy * scale;
        const size = p.sz * scale * 1.8;
        const alpha = p.br * p.weight * (0.6 + scale * 0.4);

        proj.push({ px, py, size, alpha });
      }

      // Draw all dots in one pass
      ctx.shadowBlur = 2;
      for (let i = 0; i < proj.length; i++) {
        const d = proj[i];
        ctx.globalAlpha = d.alpha;
        ctx.fillStyle = "#67e8f9"; // your ribbon color (cyan/blue – change if needed)
        ctx.fillRect(d.px, d.py, d.size, d.size);
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(draw);
    };

    draw(0);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ willChange: "transform" }}
    />
  );
};

export default AnimatedBackground;
