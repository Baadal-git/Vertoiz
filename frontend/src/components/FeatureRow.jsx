import React from "react";
import { motion } from "framer-motion";
import { featureRowData } from "../data/mock";

// Cubic-out / Power3 easing
const EASE_CUBIC_OUT = [0.33, 1, 0.68, 1];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.85,
      ease: EASE_CUBIC_OUT,
    },
  },
};

const headingVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE_CUBIC_OUT },
  },
};

const FeatureCard = ({ label, description }) => (
  <motion.div
    variants={cardVariants}
    className="group p-8 sm:p-10 rounded-2xl bg-[#f8f8f8] border border-[#eee] hover:border-[#ddd] hover:shadow-lg transition-shadow duration-500"
  >
    <div className="w-2 h-2 rounded-full bg-black/20 mb-7" />
    <h3 className="text-[#0a0a0a] font-semibold text-lg mb-3 tracking-[-0.01em]">
      {label}
    </h3>
    <p className="text-[#888] text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const FeatureRow = () => (
  <section className="bg-white py-28 sm:py-36 px-6">
    <div className="max-w-6xl mx-auto">
      <motion.h2
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={headingVariants}
        className="text-3xl sm:text-4xl md:text-[52px] font-bold text-[#0a0a0a] text-center mb-16 sm:mb-20 leading-[1.1] tracking-[-0.03em]"
      >
        What Vertoiz finds in your codebase.
        <br />
      </motion.h2>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {featureRowData.map((feature) => (
          <FeatureCard
            key={feature.id}
            label={feature.label}
            description={feature.description}
          />
        ))}
      </motion.div>
    </div>
  </section>
);

export default FeatureRow;
