import React from "react";
import { motion } from "framer-motion";
import { whySectionData } from "../data/mock";
import BrokenArchDiagram from './BrokenArchDiagram';

const EASE_CUBIC_OUT = [0.33, 1, 0.68, 1];

const slideUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 55 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, delay, ease: EASE_CUBIC_OUT },
  },
});

const WhySection = () => (
  <section className="bg-white py-28 sm:py-36 px-6">
    <div className="max-w-6xl mx-auto">
      <motion.h2
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={slideUp()}
        className="text-3xl sm:text-4xl md:text-[52px] font-bold text-[#0a0a0a] text-center mb-20 sm:mb-24 leading-[1.1] tracking-[-0.03em]"
      >
        We help automate
        <br />
        what matters most.
      </motion.h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Left — Image Card */}
        <motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
  variants={slideUp(0)}
  className="w-full rounded-2xl overflow-hidden"
>
  <BrokenArchDiagram />
</motion.div>

        {/* Right — Content */}
        <div className="flex flex-col justify-center py-4">
          <motion.span
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp(0.05)}
            className="inline-block text-xs font-medium text-[#666] uppercase tracking-[0.15em] mb-5 px-3 py-1.5 rounded-full border border-[#e0e0e0] bg-[#f8f8f8] w-fit"
          >
            Our Approach
          </motion.span>

          <motion.h3
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp(0.12)}
            className="text-2xl sm:text-3xl md:text-[36px] font-bold text-[#0a0a0a] mb-8 leading-[1.2] tracking-[-0.02em]"
          >
            {whySectionData.subheading}
          </motion.h3>

          <div className="space-y-5">
            {whySectionData.paragraphs.map((paragraph, i) => (
              <motion.p
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={slideUp(0.18 + i * 0.1)}
                className="text-[#777] text-sm sm:text-[15px] leading-[1.7]"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default WhySection;
