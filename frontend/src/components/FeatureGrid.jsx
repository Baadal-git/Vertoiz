import React from "react";
import { featureGridData } from "../data/mock";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import {
  GitBranch,
  Radio,
  ShieldCheck,
  Zap,
  TrendingUp,
  Lock,
} from "lucide-react";

const iconMap = {
  GitBranch,
  Radio,
  ShieldCheck,
  Zap,
  TrendingUp,
  Lock,
};

const GridCard = ({ icon, title, description, index }) => {
  const [ref, isVisible] = useScrollAnimation(0.1);
  const IconComponent = iconMap[icon];

  return (
    <div
      ref={ref}
      className={`group p-7 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{
        transitionDelay: `${index * 100}ms`,
      }}
    >
      <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mb-5 group-hover:bg-white/[0.08] transition-colors duration-300">
        {IconComponent && (
          <IconComponent className="w-4.5 h-4.5 text-white/50" size={18} />
        )}
      </div>
      <h3 className="text-white font-semibold text-base mb-2.5 tracking-tight">
        {title}
      </h3>
      <p className="text-white/35 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
};

const FeatureGrid = () => {
  const [ref, isVisible] = useScrollAnimation(0.1);

  return (
    <section className="relative py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <h2
          ref={ref}
          className={`font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-16 leading-tight tracking-tight transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          What we help teams
          <br />
          build and scale.
        </h2>

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
};

export default FeatureGrid;
