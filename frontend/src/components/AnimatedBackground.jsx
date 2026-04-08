import React, { useRef, useEffect } from "react";

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let W = 0, H = 0;

    console.log("%c🎨 AnimatedBackground mounted & drawing", "color:#67e8f9; font-size:14px;");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      if (!W || !H) {
        animId = requestAnimationFrame(draw);
        return;
      }

      // TEST BACKGROUND (dark blue tint so we KNOW it's working)
      ctx.fillStyle = "rgba(10, 20, 40, 0.95)";
      ctx.fillRect(0, 0, W, H);

      // TEST DOTS - large and obvious
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#67e8f9";
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        const size = 8 + Math.random() * 12;
        ctx.globalAlpha = 0.8 + Math.random() * 0.2;
        ctx.fillStyle = "#67e8f9";
        ctx.fillRect(x, y, size, size);
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(draw);
    };

    draw();

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
