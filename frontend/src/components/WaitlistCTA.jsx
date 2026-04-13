import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import { waitlistCTAData } from "../data/mock";

const EASE_CUBIC_OUT = [0.33, 1, 0.68, 1];

const slideUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 55 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, delay, ease: EASE_CUBIC_OUT },
  },
});

const WaitlistCTA = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (em) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);

  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return null;
    }

    return createClient(supabaseUrl, supabaseAnonKey);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!validateEmail(email)) { setError("Please enter a valid email address."); return; }
    if (!supabase) { setError("Something went wrong. Try again."); return; }

    setIsSubmitting(true);

    try {
      const { error: sbError } = await supabase.from("waitlist").insert({
        email: email.trim().toLowerCase(),
      });

      if (sbError) {
        console.log("Supabase waitlist insert error:", sbError);
        setError("Something went wrong. Try again.");
        return;
      }

      setSubmitted(true);
      setEmail("");
    } catch (submitError) {
      console.log("Waitlist request failed:", submitError);
      setError("Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white py-32 sm:py-40 px-6 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-[#e0e0e0] to-transparent" />

      <div className="max-w-2xl mx-auto text-center">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={slideUp()}
          className="text-3xl sm:text-4xl md:text-[52px] font-bold text-[#0a0a0a] mb-10 leading-[1.1] tracking-[-0.03em]"
        >
          {waitlistCTAData.heading}
        </motion.h2>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE_CUBIC_OUT }}
            className="inline-flex items-center gap-2.5 px-6 py-4 rounded-full bg-[#f5f5f5] border border-[#e5e5e5]"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-[#333] text-sm sm:text-base">
              You're on the list. We'll be in touch.
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp(0.12)}
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
          >
            <div className="relative w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder={waitlistCTAData.inputPlaceholder}
                className="w-full px-5 py-3.5 bg-[#f5f5f5] border border-[#e0e0e0] rounded-full text-[#0a0a0a] text-sm placeholder:text-[#aaa] focus:outline-none focus:border-[#bbb] focus:bg-[#f0f0f0] transition-all duration-300"
              />
              {error && (
                <p className="absolute -bottom-6 left-5 text-red-500/80 text-xs">
                  {error}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#0a0a0a] text-white text-sm font-semibold rounded-full hover:bg-[#1a1a1a] active:scale-[0.97] transition-colors duration-300 whitespace-nowrap flex-shrink-0 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Joining..." : waitlistCTAData.ctaText}
            </button>
          </motion.form>
        )}
      </div>
    </section>
  );
};

export default WaitlistCTA;
