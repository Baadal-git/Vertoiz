import React, { useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL CONCEPT
//
//   A wireframe sphere mesh (latitude rings + longitude meridians) where every
//   line is deformed by TANGENTIAL displacement so the lines look like
//   ribbons flowing in wind rather than rigid geometric circles.
//
//   KEY TECHNIQUE — three-component surface displacement per point:
//
//     position = r·r̂  +  dPhi·R·φ̂  +  dTheta·R·θ̂
//
//   where r̂, φ̂, θ̂ are the three orthogonal surface basis vectors:
//     r̂     = (sinφ·cosθ,  cosφ,  sinφ·sinθ)   ← radial
//     φ̂     = (cosφ·cosθ, -sinφ,  cosφ·sinθ)   ← along meridian
//     θ̂     = (−sinθ,      0,     cosθ)          ← along latitude
//
//   dPhi  (φ̂ component) — moves dots up/down along the sphere surface.
//         For a lat ring (fixed φ, varying θ) this waves the ring up and down
//         → looks like a ribbon wrapping around the sphere.
//
//   dTheta (θ̂ component) — moves dots sideways along the sphere surface.
//          For a lon line (fixed θ, varying φ) this bends the line left/right
//          → looks like a ribbon hanging and swaying.
//
//   Multiple incommensurable wave frequencies make the motion organic and
//   non-repeating. The waves travel across the whole surface coherently.
// ═══════════════════════════════════════════════════════════════════════════════

const N_LAT        = 13;
const N_LON        = 20;
const DOTS_PER_LAT = 270;  // equatorial density (scales by sinφ at other rings)
const DOTS_PER_LON = 140;  // pole-to-pole

const RADIUS_FACTOR = 0.52;
const FOV           = 680;

// ─────────────────────────────────────────────────────────────────────────────
function buildMesh() {
  const pts = [];

  // Latitude rings
  for (let ri = 0; ri < N_LAT; ri++) {
    const phi   = (Math.PI * (ri + 0.5)) / N_LAT;
    const count = Math.max(10, Math.round(DOTS_PER_LAT * Math.sin(phi)));
    for (let di = 0; di < count; di++) {
      const theta = (2 * Math.PI * di) / count;
      pts.push({
        phi, theta,
        sz: 0.85 + Math.random() * 0.92,
        br: 0.70 + Math.random() * 0.30,
        pj: (Math.random() - 0.5) * 0.50,
      });
    }
  }

  // Longitude meridians
  for (let li = 0; li < N_LON; li++) {
    const tBase = (Math.PI * li) / N_LON;
    for (let di = 0; di < DOTS_PER_LON; di++) {
      const phi = (Math.PI * di) / (DOTS_PER_LON - 1);
      // front half
      pts.push({
        phi, theta: tBase,
        sz: 0.80 + Math.random() * 0.88,
        br: 0.66 + Math.random() * 0.34,
        pj: (Math.random() - 0.5) * 0.50,
      });
      // back half
      pts.push({
        phi, theta: tBase + Math.PI,
        sz: 0.80 + Math.random() * 0.88,
        br: 0.66 + Math.random() * 0.34,
        pj: (Math.random() - 0.5) * 0.50,
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

    const draw = (ms) => {
      const t = ms * 0.00032;  // slow time — full revolution ≈ 20 s

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const R  = Math.min(W, H) * RADIUS_FACTOR;

      // ── Tangential wave amplitude ──────────────────────────────────────────
      // This is the key number — larger = more ribbon deformation.
      // At 13% of R the lines visibly wave without becoming chaotic.
      const wT = R * 0.13;   // tangential amplitude
      const wR = R * 0.035;  // small radial "breathing" component

      // ── Very slow global rotation so wave is the dominant motion ──────────
      const rotY = t * 0.22;                       // ~28 s full spin
      const rotX = Math.sin(t * 0.15) * 0.10;      // gentle slow nod
      const cY = Math.cos(rotY), sY = Math.sin(rotY);
      const cX = Math.cos(rotX), sX = Math.sin(rotX);

      const proj = [];

      for (let i = 0; i < mesh.length; i++) {
        const p = mesh[i];

        // ────────────────────────────────────────────────────────────────────
        // TANGENTIAL DISPLACEMENT — breaks perfect circles into ribbons
        //
        // dPhi  → displacement along φ̂ (meridian direction, "up/down" on surface)
        //   Waves in θ → each lat ring undulates vertically as θ advances
        //   → ring looks like a sinusoidal ribbon wrapping the sphere
        //
        // dTheta → displacement along θ̂ (latitude direction, "sideways")
        //   Waves in φ → each lon line sways left/right as φ advances
        //   → meridian looks like a swinging ribbon from pole to pole
        // ────────────────────────────────────────────────────────────────────

        const dPhi =
          Math.sin(p.theta * 2.8  + t * 1.25 + p.pj)        * wT * 0.90 +
          Math.sin(p.theta * 1.55 - t * 0.78)                * wT * 0.48 +
          Math.sin(p.theta * 4.10 + p.phi * 0.9 + t * 0.62) * wT * 0.24;

        const dTheta =
          Math.sin(p.phi  * 3.40  + t * 1.15 + p.pj)        * wT * 0.85 +
          Math.sin(p.phi  * 2.05  - t * 0.82)                * wT * 0.44 +
          Math.sin(p.phi  * 4.70  + p.theta * 0.8 + t * 0.58)* wT * 0.22;

        // Small radial pulse (keeps some spherical breathing)
        const dRad =
          Math.sin(p.phi * 2.1 + p.theta * 1.3 + t * 0.70)  * wR;

        const r = R + dRad;

        // ── Three surface basis vectors at (φ, θ) ─────────────────────────
        const sp = Math.sin(p.phi),  cp = Math.cos(p.phi);
        const st = Math.sin(p.theta), ct = Math.cos(p.theta);

        // r̂     (radial)
        const rHatX =  sp * ct,  rHatY =  cp,  rHatZ =  sp * st;
        // φ̂     (along meridian — "upward" on surface)
        const pHatX =  cp * ct,  pHatY = -sp,  pHatZ =  cp * st;
        // θ̂     (along latitude — "sideways" on surface)
        const tHatX = -st,       tHatY =  0,   tHatZ =  ct;

        // ── Final displaced 3-D position ─────────────────────────────────
        const x = r * rHatX  +  dPhi * pHatX  +  dTheta * tHatX;
        const y = r * rHatY  +  dPhi * pHatY  +  dTheta * tHatY;
        const z = r * rHatZ  +  dPhi * pHatZ  +  dTheta * tHatZ;

        // ── Rotate Y ──────────────────────────────────────────────────────
        const rx  =  x * cY - z * sY;
        const rzA =  x * sY + z * cY;

        // ── Rotate X ──────────────────────────────────────────────────────
        const ry  =  y * cX - rzA * sX;
        const rz  =  y * sX + rzA * cX;

        // ── Perspective projection ────────────────────────────────────────
        const scale = FOV / (FOV + rz);
        const px = cx + rx * scale;
        const py = cy + ry * scale;

        // depth 0 (far) → 1 (close)
        const depthN = Math.max(0, Math.min(1,
          (rz + R * 1.10) / (R * 2.20)
        ));

        proj.push({ x: px, y: py, depth: rz, depthN, scale, sz: p.sz, br: p.br });
      }

      // Back → front painter's sort
      proj.sort((a, b) => a.depth - b.depth);

      for (let i = 0; i < proj.length; i++) {
        const p = proj[i];

        // Cubic depth curve: back near-invisible, front vivid
        const d3    = p.depthN * p.depthN * p.depthN;
        const alpha = Math.min(1, (0.038 + d3 * 0.90) * p.br);

        const dotR = Math.max(0.35, p.sz * p.scale * (0.50 + p.depthN * 1.22));

        // Soft luminous halo for front hemisphere
        if (p.depthN > 0.48) {
          const gf = (p.depthN - 0.48) / 0.52;
          const ga = gf * gf * 0.26 * p.br;
          const gr = dotR * 5.0;
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gr);
          grd.addColorStop(0, `rgba(195, 215, 255, ${ga})`);
          grd.addColorStop(1, "rgba(195, 215, 255, 0)");
          ctx.beginPath();
          ctx.arc(p.x, p.y, gr, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

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
