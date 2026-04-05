import React, { useRef, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN GOALS
//   • Sphere formed by VISIBLE latitude-ring lines of closely-spaced white dots
//   • Rings are spaced far enough apart that each ring is a distinct visual curve
//   • Multi-frequency wave ripples across the surface so it feels fluid & alive
//   • Perspective projection + depth shading gives genuine 3-D depth
// ─────────────────────────────────────────────────────────────────────────────

const N_RINGS        = 24;   // few enough that the gap between rings is legible
const DOTS_PER_UNIT  = 220;  // dots on the equatorial ring; others scale with sin(φ)
const RADIUS_FACTOR  = 0.46; // fraction of min(W, H) → fills viewport nicely

function createParticles() {
  const particles = [];
  for (let ri = 0; ri < N_RINGS; ri++) {
    // Spread evenly from just past the north pole to just past the south pole
    const phi = (Math.PI * (ri + 0.5)) / N_RINGS;
    const ringCircumference = Math.sin(phi); // 0 at poles, 1 at equator
    // Dense enough that dots look like a continuous curve; minimum 12
    const dotsInRing = Math.max(12, Math.round(DOTS_PER_UNIT * ringCircumference));

    for (let di = 0; di < dotsInRing; di++) {
      const theta = (2 * Math.PI * di) / dotsInRing;
      particles.push({
        phi,
        theta,
        // Small per-particle jitter keeps the animation textured
        sizeBase:       0.85 + Math.random() * 1.10,
        brightnessBase: 0.60 + Math.random() * 0.40,
        phaseJitter:    (Math.random() - 0.5) * 0.55,
      });
    }
  }
  return particles;
}

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let W, H;

    const particles = createParticles();

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

    const draw = (ms) => {
      // Very slow time axis — full Y-rotation every ~26 s
      const t = ms * 0.00036;

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const R  = Math.min(W, H) * RADIUS_FACTOR;
      const wA = R * 0.075; // wave amplitude = 7.5% of radius

      // ── Rotation matrices ──────────────────────────────────────────────
      const rotY = t * 0.36;                           // slow continuous spin
      const rotX = Math.sin(t * 0.21) * 0.14;          // gentle nod
      const cY = Math.cos(rotY), sY = Math.sin(rotY);
      const cX = Math.cos(rotX), sX = Math.sin(rotX);

      const proj = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // ── Multi-frequency wave displacement (incommensurable freqs) ──
        //    Creates organic, never-repeating ripple across the surface
        const w1 = Math.sin(p.phi * 5.1  + p.theta * 1.7  + t * 1.60 + p.phaseJitter) * wA;
        const w2 = Math.sin(p.phi * 3.3  - p.theta * 0.85 + t * 1.05) * wA * 0.50;
        const w3 = Math.sin(p.theta * 3.9 + t * 0.88)                   * wA * 0.26;
        const w4 = Math.sin(t * 0.52 + p.phi * 1.5)                     * wA * 0.17;

        const r = R + w1 + w2 + w3 + w4;

        // ── Spherical → Cartesian ─────────────────────────────────────
        const sp = Math.sin(p.phi), cp = Math.cos(p.phi);
        const st = Math.sin(p.theta), ct = Math.cos(p.theta);
        let x = r * sp * ct;
        let y = r * cp;
        let z = r * sp * st;

        // ── Rotate around Y ───────────────────────────────────────────
        const rx = x * cY - z * sY;
        const rz = x * sY + z * cY;

        // ── Rotate around X ───────────────────────────────────────────
        const ry  = y * cX - rz * sX;
        const rz2 = y * sX + rz * cX;

        // ── Perspective ───────────────────────────────────────────────
        const fov   = 1000;
        const scale = fov / (fov + rz2);
        const px = cx + rx * scale;
        const py = cy + ry * scale;

        // Depth 0 (far back) → 1 (right in front)
        const depthN = Math.max(0, Math.min(1,
          (rz2 + R * 1.5) / (R * 3.0)
        ));

        proj.push({ x: px, y: py, depth: rz2, depthN, scale, size: p.sizeBase, bri: p.brightnessBase });
      }

      // Back-to-front for correct occlusion
      proj.sort((a, b) => a.depth - b.depth);

      for (let i = 0; i < proj.length; i++) {
        const p = proj[i];

        // Depth → opacity with strong cubic falloff for dramatic 3-D depth
        // Front (depthN≈1): ~0.85 opacity  |  Back (depthN≈0): ~0.04 opacity
        const d3 = p.depthN * p.depthN * p.depthN;
        const opacity = (0.04 + d3 * 0.82) * p.bri;

        // Dot size: front dots are notably larger than back dots
        const dotR = Math.max(0.40, p.size * p.scale * (0.60 + p.depthN * 1.20));

        // Luminous halo for the front-facing hemisphere — gives 3-D glow
        if (p.depthN > 0.45) {
          const gf        = (p.depthN - 0.45) / 0.55;  // 0→1
          const glowAlpha = gf * gf * 0.32 * p.bri;
          const glowR     = dotR * 5.0;
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
          grd.addColorStop(0, `rgba(200, 218, 255, ${glowAlpha})`);
          grd.addColorStop(1, "rgba(200, 218, 255, 0)");
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        // Core dot — crisp cool-white tint
        ctx.beginPath();
        ctx.arc(p.x, p.y, dotR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 232, 255, ${Math.min(1, opacity)})`;
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
