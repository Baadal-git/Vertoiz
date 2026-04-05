import React, { useRef, useEffect } from "react";

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let width, height;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const blobs = [];
    const BLOB_COUNT = 5;

    for (let i = 0; i < BLOB_COUNT; i++) {
      blobs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 180 + Math.random() * 280,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        hue: 240 + Math.random() * 40,
        saturation: 12 + Math.random() * 12,
        lightness: 6 + Math.random() * 5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, width, height);

      blobs.forEach((blob) => {
        blob.x += blob.vx;
        blob.y += blob.vy;
        blob.phase += 0.004;

        if (blob.x < -blob.radius) blob.x = width + blob.radius;
        if (blob.x > width + blob.radius) blob.x = -blob.radius;
        if (blob.y < -blob.radius) blob.y = height + blob.radius;
        if (blob.y > height + blob.radius) blob.y = -blob.radius;

        const pulsedRadius = blob.radius + Math.sin(blob.phase) * 35;

        const gradient = ctx.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, pulsedRadius
        );
        gradient.addColorStop(0, `hsla(${blob.hue}, ${blob.saturation}%, ${blob.lightness + 3}%, 0.18)`);
        gradient.addColorStop(0.5, `hsla(${blob.hue}, ${blob.saturation}%, ${blob.lightness}%, 0.07)`);
        gradient.addColorStop(1, `hsla(${blob.hue}, ${blob.saturation}%, ${blob.lightness}%, 0)`);

        ctx.beginPath();
        ctx.arc(blob.x, blob.y, pulsedRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

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
