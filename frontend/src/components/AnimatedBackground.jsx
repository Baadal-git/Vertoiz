import React, { useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL CONCEPT
//   A wireframe sphere MESH built from two sets of lines:
//     • Latitude rings   – horizontal circles (N_LAT of them)
//     • Longitude lines  – vertical great-circles through the poles (N_LON of them)
//   Together they form a visible dot-grid on a sphere surface.
//
//   Viewed with perspective projection the structure reads as a TUNNEL / PORTAL:
//     – front hemisphere fans out to the viewport edges (wrapping the heading)
//     – back hemisphere converges to a vanishing point behind the text
//
//   A COHERENT wave travels across the mesh: every point is displaced by the
//   same function of its grid address (φ, θ) + time, so the whole surface
//   ripples together like a veil of fabric — not independent random dots.
// ═══════════════════════════════════════════════════════════════════════════════

const N_LAT        = 13;   // horizontal rings
const N_LON        = 20;   // vertical meridian great-circles
const DOTS_PER_LAT = 270;  // equatorial-ring dot count (scales with sin φ at other latitudes)
const DOTS_PER_LON = 140;  // dots per meridian (pole to pole)

// Large radius so the front hemisphere clearly wraps beyond the heading
const RADIUS_FACTOR = 0.52;
// Tight FOV → stronger perspective depth / tunnel illusion
const FOV           = 680;

// ─────────────────────────────────────────────────────────────────────────────
// Build the mesh ONCE. Returns an array of { phi, theta, sz, br, pj } objects.
// ─────────────────────────────────────────────────────────────────────────────
function buildMesh() {
  const pts = [];

  // ── Latitude rings ──────────────────────────────────────────────────────────
  for (let ri = 0; ri < N_LAT; ri++) {
    const phi    = (Math.PI * (ri + 0.5)) / N_LAT;   // 0 < phi < PI
    const sinPhi = Math.sin(phi);
    // More dots near the equator, fewer toward the poles
    const count  = Math.max(10, Math.round(DOTS_PER_LAT * sinPhi));

    for (let di = 0; di < count; di++) {
      const theta = (2 * Math.PI * di) / count;
      pts.push({
        phi, theta,
        sz: 0.88 + Math.random() * 0.90,
        br: 0.72 + Math.random() * 0.28,
        pj: (Math.random() - 0.5) * 0.36,    // subtle phase jitter
      });
    }
  }

  // ── Longitude meridians (great circles through both poles) ─────────────────
  // Each meridian lives in two half-circles: theta = θ_i and theta = θ_i + PI
  for (let li = 0; li < N_LON; li++) {
    const tBase = (Math.PI * li) / N_LON;     // spans 0…PI (N_LON unique planes)

    for (let di = 0; di < DOTS_PER_LON; di++) {
      // phi goes from 0 (north pole) to PI (south pole)
      const phi = (Math.PI * di) / (DOTS_PER_LON - 1);

      // front-facing half
      pts.push({
        phi, theta: tBase,
        sz: 0.82 + Math.random() * 0.85,
        br: 0.68 + Math.random() * 0.32,
        pj: (Math.random() - 0.5) * 0.36,
      });
      // back-facing half (completes the great circle)
      pts.push({
        phi, theta: tBase + Math.PI,
        sz: 0.82 + Math.random() * 0.85,
        br: 0.68 + Math.random() * 0.32,
        pj: (Math.random() - 0.5) * 0.36,
      });
    }
  }

  return pts;
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

    // Build mesh once — positions are (phi, theta) only; displacement applied each frame
    const mesh = buildMesh();

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
      // t advances by 1 per ~2.9 s  (full revolution ≈ 17.5 s at rotY speed)
      const t = ms * 0.00034;

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const R  = Math.min(W, H) * RADIUS_FACTOR;

      // Wave amplitude: 6.5 % of radius for visible-but-not-chaotic ripples
      const wA = R * 0.065;

      // ── Slow global rotation ─────────────────────────────────────────────
      const rotY = t * 0.30;                        // ~21 s per revolution
      const rotX = Math.sin(t * 0.18) * 0.12;       // gentle nodding tilt
      const cY = Math.cos(rotY), sY = Math.sin(rotY);
      const cX = Math.cos(rotX), sX = Math.sin(rotX);

      const proj = [];

      for (let i = 0; i < mesh.length; i++) {
        const p = mesh[i];

        // ──────────────────────────────────────────────────────────────────
        // COHERENT MESH WAVE
        // Every point is displaced by a FUNCTION OF ITS GRID ADDRESS (φ, θ)
        // plus time — so the entire mesh deforms as one continuous surface.
        //
        // Four incommensurable wave terms create organic complexity:
        //   w1 – primary band wave traveling along latitude
        //   w2 – longitudinal wave traveling along meridians
        //   w3 – diagonal wave (interference pattern)
        //   w4 – slow global "breathing" pulse
        // ──────────────────────────────────────────────────────────────────
        const w1 = Math.sin(p.phi  * 4.8 + t * 1.55 + p.pj)          * wA;
        const w2 = Math.sin(p.theta * 2.2 + t * 1.08)                 * wA * 0.55;
        const w3 = Math.sin(p.phi  * 3.1 - p.theta * 1.15 + t * 0.85)* wA * 0.38;
        const w4 = Math.sin(t * 0.46 + p.phi * 1.7)                   * wA * 0.17;

        const r = R + w1 + w2 + w3 + w4;

        // ── Spherical → Cartesian ─────────────────────────────────────────
        const sp = Math.sin(p.phi),  cp = Math.cos(p.phi);
        const st = Math.sin(p.theta), ct = Math.cos(p.theta);
        const x  = r * sp * ct;
        const y  = r * cp;
        const z  = r * sp * st;

        // ── Rotate around Y axis (main spin) ─────────────────────────────
        const rx  =  x * cY - z * sY;
        const rzA =  x * sY + z * cY;

        // ── Rotate around X axis (nod) ───────────────────────────────────
        const ry  =  y * cX - rzA * sX;
        const rz  =  y * sX + rzA * cX;

        // ── Perspective projection ────────────────────────────────────────
        const scale = FOV / (FOV + rz);
        const px = cx + rx * scale;
        const py = cy + ry * scale;

        // Normalised depth: 0 = farthest back  →  1 = closest to viewer
        // Calibrated so the nearest point of the sphere maps to depthN ≈ 0.98
        const depthN = Math.max(0, Math.min(1,
          (rz + R * 1.08) / (R * 2.16)
        ));

        proj.push({ x: px, y: py, depth: rz, depthN, scale, sz: p.sz, br: p.br });
      }

      // ── Painter's sort: back → front (correct occlusion) ─────────────────
      proj.sort((a, b) => a.depth - b.depth);

      // ── Draw ──────────────────────────────────────────────────────────────
      for (let i = 0; i < proj.length; i++) {
        const p = proj[i];

        // Cubic falloff: front vivid, back nearly invisible
        //   front (depthN≈0.98) → d3≈0.94 → alpha ≈ 0.84 × br
        //   back  (depthN≈0.02) → d3≈0.00 → alpha ≈ 0.04 × br
        const d3    = p.depthN * p.depthN * p.depthN;
        const alpha = Math.min(1, (0.040 + d3 * 0.92) * p.br);

        // Dot size — front dots are noticeably larger than back dots
        const dotR = Math.max(0.35, p.sz * p.scale * (0.50 + p.depthN * 1.25));

        // Soft luminous halo on the front hemisphere — creates 3-D volume
        if (p.depthN > 0.45) {
          const gf = (p.depthN - 0.45) / 0.55;   // 0 → 1
          const ga = gf * gf * 0.28 * p.br;
          const gr = dotR * 5.2;
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gr);
          grd.addColorStop(0, `rgba(195, 215, 255, ${ga})`);
          grd.addColorStop(1, "rgba(195, 215, 255, 0)");
          ctx.beginPath();
          ctx.arc(p.x, p.y, gr, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        // Core dot — cool white-blue
        ctx.beginPath();
        ctx.arc(p.x, p.y, dotR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(222, 234, 255, ${alpha})`;
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
