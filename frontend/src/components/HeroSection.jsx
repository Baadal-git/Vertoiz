import React, { useState } from "react";
import AnimatedBackground from "./AnimatedBackground";
import { heroData } from "../data/mock";

const HeroSection = ({ formRef }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setSubmitted(true);
    setEmail("");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <AnimatedBackground />

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6 pt-24">
        <h1
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold leading-[1.08] tracking-tight text-white mb-6 animate-fade-up"
        >
          {heroData.heading}
          <br />
          <span className="inline-block">
            From idea to{" "}
            <em className="font-display italic">production.</em>
          </span>
        </h1>

        <p
          className="text-white/50 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up"
          style={{ animationDelay: "0.15s" }}
        >
          {heroData.subheading}
        </p>

        {/* Email Form */}
        <div
          ref={formRef}
          className="animate-fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          {submitted ? (
            <div className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-white/80 text-sm sm:text-base">
                You're on the list. We'll be in touch.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
            >
              <div className="relative w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder={heroData.inputPlaceholder}
                  className="w-full px-5 py-3.5 bg-white/[0.06] border border-white/10 rounded-full text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/25 focus:bg-white/[0.08] transition-all duration-300"
                />
                {error && (
                  <p className="absolute -bottom-6 left-5 text-red-400/80 text-xs">
                    {error}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3.5 bg-white text-[#0a0a0a] text-sm font-semibold rounded-full hover:bg-white/90 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] whitespace-nowrap flex-shrink-0"
              >
                {heroData.ctaText}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10" />
    </section>
  );
};

export default HeroSection;
