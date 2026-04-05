import React, { useEffect, useRef, useState } from "react";

/**
 * ScrollColorTransition
 *
 * BEFORE: framer-motion useTransform linearly faded rgb(10,10,10) → rgb(255,255,255)
 *         as scrollYProgress advanced — created the muddy-gray middle ground.
 *
 * NOW: a zero-height sentinel div sits exactly at the Hero / content boundary.
 *      IntersectionObserver watches it. The moment it crosses above the viewport
 *      top (user has fully scrolled past the hero), a boolean flips and a 180ms
 *      CSS transition snaps the background to pure white.
 *      Scrolling back reverses the snap with the same 180ms.
 *      There is no interpolation — it is either #0a0a0a or #ffffff.
 */
const ScrollColorTransition = ({ children }) => {
  const sentinelRef = useRef(null);
  const [isWhite, setIsWhite] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // boundingClientRect.top < 0  →  sentinel scrolled above the viewport fold
        // boundingClientRect.top ≥ 0  →  sentinel is at or below the fold
        setIsWhite(entry.boundingClientRect.top < 0);
      },
      {
        // threshold: 0 → fires the instant any part of the sentinel crosses the edge
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Zero-height sentinel — placed exactly at the Hero/FeatureRow boundary */}
      <div ref={sentinelRef} aria-hidden="true" style={{ height: 0, overflow: "hidden" }} />

      {/* Snaps between #0a0a0a and #ffffff in 180ms — no gray in between */}
      <div
        style={{
          backgroundColor: isWhite ? "#ffffff" : "#0a0a0a",
          transition: "background-color 180ms ease",
        }}
      >
        {children}
      </div>
    </>
  );
};

export default ScrollColorTransition;
