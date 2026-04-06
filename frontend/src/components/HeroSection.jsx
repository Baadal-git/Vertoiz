import React, { useState } from "react";
import { motion } from "framer-motion";
import AnimatedBackground from "./AnimatedBackground";
import { heroData } from "../data/mock";
import { createClient } from "@supabase/supabase-js";


const HeroSection = ({ formRef }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (em) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);

 const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  if (!email.trim()) { setError("Please enter your email."); return; }
  if (!validateEmail(email)) { setError("Please enter a valid email address."); return; }
  
  const { error: sbError } = await supabase.from("waitlist").insert({ email });
  if (sbError) { setError("Something went wrong. Try again."); return; }
  
  setSubmitted(true);
  setEmail("");
};

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      <AnimatedBackground />

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6 pt-24">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold leading-[1.08] tracking-[-0.03em] text-white mb-6"
        >
          {heroData.heading}
          <br />
          <span className="inline-block">
            From idea to{" "}
            <em className="italic">production.</em>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="text-white/45 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
        >
          {heroData.subheading}
        </motion.p>

        <motion.div
          ref={formRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2.5 px-6 py-4 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-sm"
            >
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-white/80 text-sm sm:text-base">You're on the list. We'll be in touch.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
              <div className="relative w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder={heroData.inputPlaceholder}
                  className="hero-email-input w-full px-5 py-3.5 rounded-full text-sm text-white transition-all duration-300 focus:outline-none"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.30)",
                    color: "#ffffff",
                  }}
                  onFocus={e => {
                    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.60)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,255,255,0.08)";
                  }}
                  onBlur={e => {
                    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.30)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                {error && <p className="absolute -bottom-6 left-5 text-red-400/80 text-xs">{error}</p>}
              </div>
              <button type="submit" className="w-full sm:w-auto px-7 py-3.5 bg-white text-[#0a0a0a] text-sm font-semibold rounded-full hover:bg-white/90 active:scale-[0.97] transition-colors duration-300 whitespace-nowrap flex-shrink-0">
                {heroData.ctaText}
              </button>
            </form>
          )}
        </motion.div>
      </div>

    </section>
  );
};

export default HeroSection;
