import React from "react";
import { featureRowData } from "../data/mock";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const FeatureCard = ({ label, description, index }) => {
  const [ref, isVisible] = useScrollAnimation(0.15);

  return (
    <div
      ref={ref}
      className={`group p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{
        transitionDelay: `${index * 120}ms`,
      }}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-white/40 mb-6" />
      <h3 className="text-white font-semibold text-lg mb-3 tracking-tight">
        {label}
      </h3>
      <p className="text-white/40 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
};

const FeatureRow = () => {
  const [ref, isVisible] = useScrollAnimation(0.1);

  return (
    <section className="relative py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <h2
          ref={ref}
          className={`font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-16 leading-tight tracking-tight transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Designing products people
          <br />
          want to use.
        </h2>

        {/* Cards Grid */}
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
};

export default FeatureRow;
