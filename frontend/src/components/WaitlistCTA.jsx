import React, { useState } from "react";
import { waitlistCTAData } from "../data/mock";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const WaitlistCTA = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [ref, isVisible] = useScrollAnimation(0.15);

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
    <section className="relative py-32 px-6">
      {/* Subtle top/bottom borders */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      <div
        ref={ref}
        className={`max-w-2xl mx-auto text-center transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-10 leading-tight tracking-tight">
          {waitlistCTAData.heading}
        </h2>

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
                placeholder={waitlistCTAData.inputPlaceholder}
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
              {waitlistCTAData.ctaText}
            </button>
          </form>
        )}
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
    </section>
  );
};

export default WaitlistCTA;
