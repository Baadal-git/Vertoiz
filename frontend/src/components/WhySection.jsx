import React from "react";
import { motion } from "framer-motion";
import { whySectionData } from "../data/mock";

const WhySection = () => (
  <section className="bg-white py-28 sm:py-36 px-6">
    <div className="max-w-6xl mx-auto">
      {/* Section Title */}
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-3xl sm:text-4xl md:text-[52px] font-bold text-[#0a0a0a] text-center mb-20 sm:mb-24 leading-[1.1] tracking-[-0.03em]"
      >
        We help automate
        <br />
        what matters most.
      </motion.h2>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Left — Image / Visual Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-[#f0eef5] via-[#ece8f1] to-[#e8e4ed] border border-[#e5e5e5]"
        >
          {/* Abstract pattern overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-[0.06]">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="flex gap-1">
                {[...Array(30)].map((_, j) => (
                  <div
                    key={j}
                    className="rounded-full bg-black"
                    style={{
                      width: `${3 + Math.sin((i + j) * 0.3) * 2}px`,
                      height: `${3 + Math.sin((i + j) * 0.3) * 2}px`,
                      opacity: Math.max(0.2, Math.sin((i * 0.5 + j * 0.3)) * 0.8 + 0.4),
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          {/* Floating code lines */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-[0.07] font-mono text-xs text-black">
            <span>validateArchitecture()</span>
            <span>enforcePatterns()</span>
            <span>checkScalability()</span>
            <span>secureEndpoints()</span>
          </div>
        </motion.div>

        {/* Right — Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col justify-center py-4"
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block text-xs font-medium text-[#666] uppercase tracking-[0.15em] mb-5 px-3 py-1.5 rounded-full border border-[#e0e0e0] bg-[#f8f8f8] w-fit"
          >
            Our Approach
          </motion.span>

          <motion.h3
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-2xl sm:text-3xl md:text-[36px] font-bold text-[#0a0a0a] mb-8 leading-[1.2] tracking-[-0.02em]"
          >
            {whySectionData.subheading}
          </motion.h3>

          <div className="space-y-5">
            {whySectionData.paragraphs.map((paragraph, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                className="text-[#777] text-sm sm:text-[15px] leading-[1.7]"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default WhySection;
