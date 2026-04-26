"use client";

import { motion } from "framer-motion";

export default function HeroTitle() {
  const letters = "SYNÆSTHESIA".split("");

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      <div className="flex overflow-hidden">
        {letters.map((char, i) => (
          <motion.span
            key={i}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 1,
              delay: i * 0.08,
              ease: [0.2, 0.65, 0.3, 0.9],
            }}
            className={`
              text-6xl md:text-8xl lg:text-9xl font-display tracking-tight
              ${char === "Æ" 
                ? "text-white drop-shadow-[0_0_30px_rgba(123,47,255,0.8)] px-1" 
                : "text-text-primary/90 drop-shadow-[0_0_15px_rgba(123,47,255,0.3)]"}
            `}
          >
            {char}
          </motion.span>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 1.5 }}
        className="font-ui text-xs md:text-sm uppercase tracking-[0.6em] text-text-secondary opacity-60"
      >
        If sound were visible, it would look like this.
      </motion.p>
    </div>
  );
}
