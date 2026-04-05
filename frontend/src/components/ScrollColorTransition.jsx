import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const ScrollColorTransition = ({ children }) => {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Interpolate background from near-black to white across this section
  const r = useTransform(scrollYProgress, [0, 0.4], [10, 255]);
  const g = useTransform(scrollYProgress, [0, 0.4], [10, 255]);
  const b = useTransform(scrollYProgress, [0, 0.4], [10, 255]);

  return (
    <motion.div
      ref={ref}
      style={{
        backgroundColor: useTransform(
          [r, g, b],
          ([rv, gv, bv]) => `rgb(${Math.round(rv)}, ${Math.round(gv)}, ${Math.round(bv)})`
        ),
      }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollColorTransition;
