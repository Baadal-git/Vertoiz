import React from "react";
import { whySectionData } from "../data/mock";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const WhySection = () => {
  const [titleRef, titleVisible] = useScrollAnimation(0.15);
  const [contentRef, contentVisible] = useScrollAnimation(0.15);

  return (
    <section className="relative py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <h2
          ref={titleRef}
          className={`font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-20 leading-tight tracking-tight transition-all duration-700 ${
            titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          We help automate
          <br />
          what matters most.
        </h2>

        {/* Two Column Layout */}
        <div
          ref={contentRef}
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-start transition-all duration-700 ${
            contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Left - Dark Abstract Card */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-[#0f0f14] via-[#0d0d12] to-[#0a0a10] border border-white/[0.06]">
            {/* Abstract visual elements */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-white/[0.02] blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
              <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full bg-purple-500/[0.02] blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-blue-500/[0.03] blur-2xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
            </div>
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} />
            {/* Code-like floating text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-[0.08] font-mono text-xs text-white">
              <span>validateArchitecture()</span>
              <span>enforcePatterns()</span>
              <span>checkScalability()</span>
              <span>secureEndpoints()</span>
            </div>
          </div>

          {/* Right - Content */}
          <div className="flex flex-col justify-center py-4">
            <span className="inline-block text-xs font-medium text-white/40 uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full border border-white/[0.08] w-fit">
              Our Approach
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-8 leading-snug tracking-tight">
              {whySectionData.subheading}
            </h3>
            <div className="space-y-5">
              {whySectionData.paragraphs.map((paragraph, i) => (
                <p key={i} className="text-white/40 text-sm sm:text-base leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhySection;
