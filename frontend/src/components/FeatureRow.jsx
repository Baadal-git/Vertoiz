import React from "react";
import { motion } from "framer-motion";
import { featureRowData } from "../data/mock";

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.15,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const FeatureCard = ({ label, description, index }) => (
  <motion.div
    custom={index}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.2 }}
    variants={cardVariants}
    className="group p-8 sm:p-10 rounded-2xl bg-[#f8f8f8] border border-[#eee] hover:border-[#ddd] hover:shadow-lg transition-shadow duration-500"
  >
    <div className="w-2 h-2 rounded-full bg-black/20 mb-7" />
    <h3 className="text-[#0a0a0a] font-semibold text-lg mb-3 tracking-[-0.01em]">
      {label}
    </h3>
    <p className="text-[#888] text-sm leading-relaxed">
      {description}
    </p>
  </motion.div>
);

const FeatureRow = () => (
  <section className="bg-white py-28 sm:py-36 px-6">
    <div className="max-w-6xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-3xl sm:text-4xl md:text-[52px] font-bold text-[#0a0a0a] text-center mb-16 sm:mb-20 leading-[1.1] tracking-[-0.03em]"
      >
        Designing products people
        <br />
        want to use.
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {featureRowData.map((feature, index) => (
          <FeatureCard
            key={feature.id}
            label={feature.label}
            description={feature.description}
            index={index}
          />
        ))}
      </div>
    </div>
  </section>
);

export default FeatureRow;
