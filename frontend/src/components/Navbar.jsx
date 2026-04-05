import React, { useState, useEffect, useCallback } from "react";
import { navData } from "../data/mock";

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

const Navbar = ({ onJoinClick }) => {
  const [progress, setProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    // Map scroll 0–200px to progress 0–1
    const t = clamp(scrollY / 200, 0, 1);
    setProgress(t);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Interpolated values — wide & relaxed at top, compact when scrolled
  const maxWidth = lerp(600, 420, progress);
  const paddingX = lerp(20, 14, progress);
  const paddingY = lerp(10, 7, progress);
  const logoSize = lerp(36, 28, progress);
  const fontSize = lerp(14, 12.5, progress);
  const btnPaddingX = lerp(20, 16, progress);
  const btnPaddingY = lerp(8, 6, progress);
  const blurAmount = lerp(12, 20, progress);
  const bgOpacity = lerp(0.75, 0.95, progress);
  const borderOpacity = lerp(0.06, 0.12, progress);

  return (
    <nav
      className="fixed top-5 left-1/2 z-50"
      style={{
        transform: "translateX(-50%)",
        width: `min(${maxWidth}px, 90vw)`,
        transition: "width 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div
        className="flex items-center justify-between rounded-full"
        style={{
          padding: `${paddingY}px ${paddingX}px`,
          backgroundColor: `rgba(14, 14, 14, ${bgOpacity})`,
          border: `1px solid rgba(255, 255, 255, ${borderOpacity})`,
          backdropFilter: `blur(${blurAmount}px)`,
          WebkitBackdropFilter: `blur(${blurAmount}px)`,
          boxShadow: progress > 0.3
            ? `0 8px 32px rgba(0, 0, 0, ${lerp(0, 0.25, progress)})`
            : "none",
          transition:
            "padding 0.35s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.35s ease, border-color 0.35s ease, box-shadow 0.4s ease, backdrop-filter 0.35s ease",
        }}
      >
        {/* Animated Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="relative rounded-lg overflow-hidden flex-shrink-0"
            style={{
              width: `${logoSize}px`,
              height: `${logoSize}px`,
              transition: "width 0.35s cubic-bezier(0.22, 1, 0.36, 1), height 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#c8a0e8] via-[#e8b4d0] to-[#d4a8e0] animate-logo-morph rounded-lg" />
            <div className="absolute inset-[3px] bg-[#111111]/30 rounded-md backdrop-blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-logo-shine" />
          </div>
          <span
            className="text-white/90 font-medium tracking-wide"
            style={{
              fontSize: `${fontSize}px`,
              transition: "font-size 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {navData.logo}
          </span>
        </div>

        {/* CTA Button */}
        <button
          onClick={onJoinClick}
          className="bg-white text-[#0a0a0a] font-medium rounded-full hover:bg-white/90 active:scale-[0.97] whitespace-nowrap flex-shrink-0"
          style={{
            padding: `${btnPaddingY}px ${btnPaddingX}px`,
            fontSize: `${fontSize}px`,
            transition:
              "padding 0.35s cubic-bezier(0.22, 1, 0.36, 1), font-size 0.35s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.2s ease",
          }}
        >
          {navData.ctaText}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
