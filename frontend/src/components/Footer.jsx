import React from "react";
import { footerData } from "../data/mock";
import logo_white from "../Assets/logo_white.png";

const Footer = () => (
  <footer className="bg-[#0a0a0a] py-12 px-6">
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <img src={logo_white} alt="Vertoiz" className="h-7 w-auto" />
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
        <p className="text-white/20 text-xs">{footerData.copyright}</p>
      </div>
    </div>
  </footer>
);

export default Footer;
