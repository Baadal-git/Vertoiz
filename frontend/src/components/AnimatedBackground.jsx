import React, { useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL CONCEPT — "FLOWING RIVER / RIBBON OF DOTS"
//
//   NO SPHERE. This is a parametric open ribbon in 3-D space.
//
//   Architecture:
//     • A SPINE curve sweeps across the viewport (u = 0 → 1).
//       The spine is a gentle sinusoidal arc — NOT a closed loop.
//     • N_STRANDS strands fan out perpendicular to the spine,
//       forming the ribbon's thickness.
//     • Each strand has a Gaussian brightness falloff from the
//       ribbon centre → edge so the ribbon looks dense in the
//       core and dissolves at its borders.
//     • End-caps fade to zero so the ribbon tapers at both tips.
//     • Wave animation is applied ALONG the ribbon (u-direction)
//       so the whole ribbon ripples coherently like a river / veil.
//     • A shallow perspective projection (Z-depth) makes strands at
//       different depths appear larger/brighter, adding 3-D solidity.
// ═══════════════════════════════════════════════════════════════════════════════

const N_STRANDS       = 31;   // strands across ribbon cross-section (+30%)
const DOTS_PER_STRAND = 494;  // dots along each strand's length (+30%)

// How far the ribbon tilts away from horizontal (radians).
const TILT = 0.50;

// ─────────────────────────────────────────────────────────────────────────────
// Build particle list.  Stores (u, v) grid address + per-particle constants.
// All world-space calculations happen in the draw loop so they scale with
// the canvas size on every frame.
// ─────────────────────────────────────────────────────────────────────────────
function buildRibbon() {
  const pts = [];

  for (let si = 0; si < N_STRANDS; si++) {
    // v ∈ [-1, 1] — position across the ribbon width
    const v       = (si / (N_STRANDS - 1)) * 2 - 1;
    // Flat falloff: low exponent = even brightness across the full ribbon width
    // (was 2.8 which created a bright core + dim edges — now near-uniform)
    const vFade   = Math.exp(-v * v * 0.90);

    for (let di = 0; di < DOTS_PER_STRAND; di++) {
      // u ∈ [0, 1] — position along the ribbon length
      const u = di / (DOTS_PER_STRAND - 1);

      // Smooth fade-in/out at both tips (avoids hard cut-off)
      const uFade = smoothstep(0, 0.12, u) * smoothstep(1, 0.88, u);

      // Combined brightness weight
      const weight = vFade * uFade;
      if (weight < 0.005) continue; // lower cutoff keeps edge strands visible

      pts.push({
        u, v,
        weight,
        sz:  0.75 + Math.random() * 1.10,
        br:  0.72 + Math.random() * 0.28,
        // Per-particle phase jitter — keeps the ripple textured, not glassy
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
      const t = ms * 0.00030;   // slow time axis

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, W, H);

      // ── Ribbon dimensional constants (recomputed each frame so they
      //    respond instantly to window resize) ───────────────────────────────
      const cx = W / 2;
      const cy = H / 2;

      // Ribbon spans ~115 % of viewport width (bleeds off both edges)
      const spanX      = W * 1.15;
      // Half-width of ribbon cross-section (how "thick" the band is)
      const halfWidth  = Math.min(W, H) * 0.26;
      // Wave amplitudes — larger Y waves make the ribbon sweep up/down boldly
      const waveAmpY   = H  * 0.065;
      const waveAmpZ   = W  * 0.055;   // moderate Z so ribbon stays visible
      // Depth used for perspective (smaller = less extreme depth variation)
      const depthScale = W  * 0.14;

      const proj = [];

      for (let i = 0; i < ribbon.length; i++) {
        const p = ribbon[i];

        // ── SPINE POSITION (u-parameterised) ─────────────────────────────
        // x: linear sweep from left to right (centred on viewport)
        const sx = (p.u - 0.5) * spanX;

        // y: static gentle S-curve so the ribbon isn't perfectly horizontal
        const sy_static =
          Math.sin(p.u * Math.PI * 1.80) * H * 0.10 +
          Math.sin(p.u * Math.PI * 0.55) * H * 0.06;

        // z: static depth wave so the ribbon folds toward/away from viewer
        const sz_static =
          Math.cos(p.u * Math.PI * 1.20) * depthScale * 0.60 +
          Math.cos(p.u * Math.PI * 2.50) * depthScale * 0.25;

        // ── ANIMATED WAVE (travels along the ribbon length) ───────────────
        // All strands at the same u share the same wave — coherent ripple.
        const wave1 = Math.sin(p.u * 5.5  + t * 1.30 + p.pj * 0.3) * waveAmpY;
        const wave2 = Math.sin(p.u * 3.2  - t * 0.90)               * waveAmpY * 0.55;
        const wave3 = Math.sin(p.u * 8.0  + t * 0.65 + p.pj * 0.2) * waveAmpY * 0.22;

        const waveZ1 = Math.cos(p.u * 4.1  + t * 1.10)              * waveAmpZ * 0.55;
        const waveZ2 = Math.cos(p.u * 2.3  - t * 0.70)              * waveAmpZ * 0.30;

        const spineY = sy_static + wave1 + wave2 + wave3;
        const spineZ = sz_static + waveZ1 + waveZ2;

        // ── CROSS-SECTION — fan strands out perpendicular to the viewing
        //    plane, tilted by TILT so you see depth in the ribbon ───────────
        const crossY = p.v * halfWidth * Math.cos(TILT);
        const crossZ = p.v * halfWidth * Math.sin(TILT);

        // ── FINAL 3-D WORLD POSITION ─────────────────────────────────────
        const wx = sx;
        const wy = spineY + crossY;
        const wz = spineZ + crossZ;

        // ── PERSPECTIVE PROJECTION ───────────────────────────────────────
        const fov   = 900;
        const scale = fov / (fov + wz);
        const px = cx + wx * scale;
        const py = cy + wy * scale;

        // Depth normalised: 0 = far, 1 = close
        const depthN = Math.max(0, Math.min(1,
          (wz + depthScale * 2.0) / (depthScale * 4.0)
        ));

        // Combine depth + ribbon-weight for final opacity — boosted base
        const d2 = depthN * depthN;
        const alpha = Math.min(1, (0.08 + d2 * 0.84) * p.br * p.weight);

        if (alpha < 0.012) continue;

        proj.push({ x: px, y: py, depth: wz, depthN, scale, sz: p.sz, br: p.br, alpha });
      }

      // Back → front
      proj.sort((a, b) => a.depth - b.depth);

      for (let i = 0; i < proj.length; i++) {
        const p = proj[i];

        const dotR = Math.max(0.35, p.sz * p.scale * (0.48 + p.depthN * 1.25));

        // Glow halo for near particles
        if (p.depthN > 0.50 && p.alpha > 0.10) {
          const gf = (p.depthN - 0.50) / 0.50;
          const ga = gf * gf * 0.24 * p.br * p.alpha;
          const gr = dotR * 5.2;
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gr);
          grd.addColorStop(0, `rgba(200, 218, 255, ${ga})`);
          grd.addColorStop(1, "rgba(200, 218, 255, 0)");
          ctx.beginPath();
          ctx.arc(p.x, p.y, gr, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, dotR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(222, 234, 255, ${p.alpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
};

export default AnimatedBackground;
