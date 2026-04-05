import React, { useState, useEffect } from "react";
import { navData } from "../data/mock";

const Navbar = ({ onJoinClick }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-500"
      style={{ width: "min(600px, 90vw)" }}
    >
      <div
        className={`flex items-center justify-between px-4 py-2.5 rounded-full border transition-all duration-500 ${
          scrolled
            ? "bg-[#111111]/95 border-white/10 backdrop-blur-xl shadow-2xl"
            : "bg-[#111111]/70 border-white/[0.06] backdrop-blur-md"
        }`}
      >
        {/* Animated Logo */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#c8a0e8] via-[#e8b4d0] to-[#d4a8e0] animate-logo-morph rounded-lg" />
            <div className="absolute inset-[3px] bg-[#111111]/30 rounded-md backdrop-blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-logo-shine" />
          </div>
          <span className="text-white/90 font-medium text-sm tracking-wide">
            {navData.logo}
          </span>
        </div>

        {/* CTA Button */}
        <button
          onClick={onJoinClick}
          className="px-5 py-2 bg-white text-[#0a0a0a] text-sm font-medium rounded-full hover:bg-white/90 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
        >
          {navData.ctaText}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
