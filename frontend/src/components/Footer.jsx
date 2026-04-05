import React from "react";
import { footerData } from "../data/mock";

const Footer = () => {
  return (
    <footer className="relative py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-7 h-7 rounded-md overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-[#c8a0e8] via-[#e8b4d0] to-[#d4a8e0] animate-logo-morph rounded-md" />
              <div className="absolute inset-[2px] bg-[#0a0a0a]/40 rounded-sm backdrop-blur-sm" />
            </div>
            <span className="text-white/60 font-medium text-sm tracking-wide">
              {footerData.logo}
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            {footerData.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-white/30 text-xs hover:text-white/50 transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-white/20 text-xs">
            {footerData.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
