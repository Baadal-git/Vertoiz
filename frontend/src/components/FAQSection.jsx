import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { faqData } from "../data/mock";
import { Plus, Minus } from "lucide-react";

const EASE_CUBIC_OUT = [0.33, 1, 0.68, 1];

const headingVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE_CUBIC_OUT },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.08,
      ease: EASE_CUBIC_OUT,
    },
  }),
};

const AccordionItem = ({ question, answer, isOpen, onToggle, index }) => (
  <motion.div
    custom={index}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.1 }}
    variants={itemVariants}
    className="border-b border-[#eaeaea] last:border-b-0"
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-6 text-left group"
    >
      <span className="text-[#0a0a0a] font-medium text-[15px] sm:text-base pr-8 leading-snug">
        {question}
      </span>
      <span className="flex-shrink-0 w-8 h-8 rounded-full border border-[#e0e0e0] flex items-center justify-center group-hover:border-[#bbb] transition-colors duration-300">
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.35, ease: EASE_CUBIC_OUT }}
          className="flex items-center justify-center"
        >
          {isOpen ? (
            <Minus size={15} className="text-[#555]" strokeWidth={1.8} />
          ) : (
            <Plus size={15} className="text-[#555]" strokeWidth={1.8} />
          )}
        </motion.span>
      </span>
    </button>

    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{
            height: { duration: 0.4, ease: EASE_CUBIC_OUT },
            opacity: { duration: 0.3, delay: 0.05, ease: "easeOut" },
          }}
          className="overflow-hidden"
        >
          <p className="text-[#777] text-sm sm:text-[15px] leading-[1.75] pb-6 pr-12">
            {answer}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const FAQSection = () => {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId(openId === id ? null : id);

  return (
    <section className="bg-white py-28 sm:py-36 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={headingVariants}
          className="text-3xl sm:text-4xl md:text-[52px] font-bold text-[#0a0a0a] text-center mb-16 sm:mb-20 leading-[1.1] tracking-[-0.03em]"
        >
          Frequently asked
          <br />
          questions.
        </motion.h2>

        <div className="border-t border-[#eaeaea]">
          {faqData.map((item, index) => (
            <AccordionItem
              key={item.id}
              question={item.question}
              answer={item.answer}
              isOpen={openId === item.id}
              onToggle={() => toggle(item.id)}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
