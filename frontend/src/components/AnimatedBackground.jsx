import React, { useRef, useEffect } from "react";

// --- Simplex-style 3D noise (fast, self-contained) ---
const GRAD3 = [
  [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
  [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
  [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1],
];

function buildPermTable() {
  const p = [];
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  const perm = new Array(512);
  const permMod12 = new Array(512);
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
    permMod12[i] = perm[i] % 12;
  }
  return { perm, permMod12 };
}

function createNoise3D() {
  const { perm, permMod12 } = buildPermTable();
  const F3 = 1 / 3;
  const G3 = 1 / 6;

  return function noise3D(x, y, z) {
    const s = (x + y + z) * F3;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const k = Math.floor(z + s);
    const t = (i + j + k) * G3;
    const X0 = i - t, Y0 = j - t, Z0 = k - t;
    const x0 = x - X0, y0 = y - Y0, z0 = z - Z0;

    let i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0) { i1=1;j1=0;k1=0;i2=1;j2=1;k2=0; }
      else if (x0 >= z0) { i1=1;j1=0;k1=0;i2=1;j2=0;k2=1; }
      else { i1=0;j1=0;k1=1;i2=1;j2=0;k2=1; }
    } else {
      if (y0 < z0) { i1=0;j1=0;k1=1;i2=0;j2=1;k2=1; }
      else if (x0 < z0) { i1=0;j1=1;k1=0;i2=0;j2=1;k2=1; }
      else { i1=0;j1=1;k1=0;i2=1;j2=1;k2=0; }
    }

    const x1 = x0-i1+G3, y1 = y0-j1+G3, z1 = z0-k1+G3;
    const x2 = x0-i2+2*G3, y2 = y0-j2+2*G3, z2 = z0-k2+2*G3;
    const x3 = x0-1+3*G3, y3 = y0-1+3*G3, z3 = z0-1+3*G3;

    const ii = i & 255, jj = j & 255, kk = k & 255;

    const dot = (gi, dx, dy, dz) => {
      const g = GRAD3[gi];
      return g[0]*dx + g[1]*dy + g[2]*dz;
    };

    let n0 = 0, n1 = 0, n2 = 0, n3 = 0;
    let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
    if (t0 > 0) { t0 *= t0; n0 = t0*t0 * dot(permMod12[ii+perm[jj+perm[kk]]], x0, y0, z0); }
    let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
    if (t1 > 0) { t1 *= t1; n1 = t1*t1 * dot(permMod12[ii+i1+perm[jj+j1+perm[kk+k1]]], x1, y1, z1); }
    let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
    if (t2 > 0) { t2 *= t2; n2 = t2*t2 * dot(permMod12[ii+i2+perm[jj+j2+perm[kk+k2]]], x2, y2, z2); }
    let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
    if (t3 > 0) { t3 *= t3; n3 = t3*t3 * dot(permMod12[ii+1+perm[jj+1+perm[kk+1]]], x3, y3, z3); }

    return 32 * (n0 + n1 + n2 + n3);
  };
}

// --- Particle system ---
const PARTICLE_COUNT = 900;
const SPHERE_RADIUS_FACTOR = 0.28; // fraction of min(width, height)

function createParticles(count) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    // Distribute on sphere surface using fibonacci sphere
    const phi = Math.acos(1 - 2 * (i + 0.5) / count);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;

    particles.push({
      basePhi: phi,
      baseTheta: theta,
      // Slight randomisation for organic feel
      noiseOffsetX: Math.random() * 100,
      noiseOffsetY: Math.random() * 100,
      noiseOffsetZ: Math.random() * 100,
      // Per-particle variation
      sizeBase: 0.8 + Math.random() * 1.6,
      brightnessBase: 0.4 + Math.random() * 0.6,
    });
  }
  return particles;
}

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let width, height;

    const noise3D = createNoise3D();
    const particles = createParticles(PARTICLE_COUNT);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (time) => {
      const t = time * 0.0001; // slow time factor

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = Math.min(width, height) * SPHERE_RADIUS_FACTOR;

      // Slow global rotation
      const rotY = t * 0.6;
      const rotX = Math.sin(t * 0.3) * 0.15;
      const cosRY = Math.cos(rotY), sinRY = Math.sin(rotY);
      const cosRX = Math.cos(rotX), sinRX = Math.sin(rotX);

      // Sort particles by depth for correct layering
      const projected = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Noise-based displacement for organic wave
        const noiseVal = noise3D(
          p.noiseOffsetX + t * 0.8,
          p.noiseOffsetY + t * 0.6,
          p.noiseOffsetZ + t * 0.4
        );
        const radiusOffset = noiseVal * baseRadius * 0.18;
        const r = baseRadius + radiusOffset;

        // Spherical to cartesian
        let x = r * Math.sin(p.basePhi) * Math.cos(p.baseTheta + t * 0.2);
        let y = r * Math.sin(p.basePhi) * Math.sin(p.baseTheta + t * 0.2);
        let z = r * Math.cos(p.basePhi);

        // Apply wave distortion
        const wave = Math.sin(p.basePhi * 3 + t * 1.5) * baseRadius * 0.06;
        x += wave * Math.cos(p.baseTheta);
        y += wave * Math.sin(p.baseTheta);

        // Rotate Y
        const rx = x * cosRY - z * sinRY;
        const rz = x * sinRY + z * cosRY;
        // Rotate X
        const ry = y * cosRX - rz * sinRX;
        const rz2 = y * sinRX + rz * cosRX;

        // Perspective projection
        const perspective = 800;
        const scale = perspective / (perspective + rz2);
        const px = cx + rx * scale;
        const py = cy + ry * scale;

        // Depth 0..1 (0 = far, 1 = close)
        const depthNorm = (rz2 + baseRadius * 1.3) / (baseRadius * 2.6);
        const clampedDepth = Math.max(0, Math.min(1, depthNorm));

        projected.push({
          x: px,
          y: py,
          depth: rz2,
          depthNorm: clampedDepth,
          size: p.sizeBase * scale,
          brightness: p.brightnessBase,
        });
      }

      // Sort back-to-front
      projected.sort((a, b) => a.depth - b.depth);

      // Draw particles
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];

        // Depth-of-field: size, opacity, blur based on depth
        const depthOpacity = 0.08 + p.depthNorm * 0.72;
        const alpha = depthOpacity * p.brightness;
        const radius = Math.max(0.4, p.size * (0.6 + p.depthNorm * 0.8));

        // Glow effect for closer particles
        if (p.depthNorm > 0.6) {
          const glowAlpha = (p.depthNorm - 0.6) * 0.3 * p.brightness;
          const glowRadius = radius * 4;
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
          glow.addColorStop(0, `rgba(220, 225, 235, ${glowAlpha})`);
          glow.addColorStop(1, "rgba(220, 225, 235, 0)");
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 225, 235, ${alpha})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
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
