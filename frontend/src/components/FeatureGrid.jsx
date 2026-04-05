import React from "react";
import { motion } from "framer-motion";
import { featureGridData } from "../data/mock";
import {
  GitBranch,
  Radio,
  ShieldCheck,
  Zap,
  TrendingUp,
  Lock,
} from "lucide-react";

const iconMap = { GitBranch, Radio, ShieldCheck, Zap, TrendingUp, Lock };

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.1,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const GridCard = ({ icon, title, description, index }) => {
  const IconComponent = iconMap[icon];
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={cardVariants}
      className="group p-7 sm:p-8 rounded-2xl bg-[#f8f8f8] border border-[#eee] hover:border-[#ddd] hover:shadow-lg transition-shadow duration-500"
    >
      <div className="w-11 h-11 rounded-xl bg-white border border-[#e5e5e5] flex items-center justify-center mb-6 group-hover:border-[#ccc] transition-colors duration-300">
        {IconComponent && <IconComponent className="text-[#555]" size={18} strokeWidth={1.8} />}
      </div>
      <h3 className="text-[#0a0a0a] font-semibold text-base mb-2.5 tracking-[-0.01em]">
        {title}
      </h3>
      <p className="text-[#888] text-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};

const FeatureGrid = () => (
  <section className="bg-white py-28 sm:py-36 px-6">
    <div className="max-w-6xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-3xl sm:text-4xl md:text-[52px] font-bold text-[#0a0a0a] text-center mb-16 sm:mb-20 leading-[1.1] tracking-[-0.03em]"
      >
        What we help teams
        <br />
        build and scale.
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {featureGridData.map((feature, index) => (
          <GridCard
            key={feature.id}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            index={index}
          />
        ))}
      </div>
    </div>
  </section>
);

export default FeatureGrid;
