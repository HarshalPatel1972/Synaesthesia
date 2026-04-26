"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const title = "SYNÆSTHESIA";

export default function HeroTitle() {
  const [flickerIndices, setFlickerIndices] = useState<number[]>([]);

  useEffect(() => {
    // Neon flicker effect
    const interval = setInterval(() => {
      const count = Math.floor(Math.random() * 2);
      const indices = Array.from({ length: count }, () => Math.floor(Math.random() * title.length));
      setFlickerIndices(indices);
      
      setTimeout(() => setFlickerIndices([]), 100);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <h1 className="relative flex flex-wrap justify-center items-center pointer-events-none select-none">
      {title.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ y: 40, opacity: 0, filter: "blur(8px)" }}
          animate={{ 
            y: 0, 
            opacity: flickerIndices.includes(i) ? 0.6 : 1, 
            filter: "blur(0px)",
            textShadow: char === "Æ" 
              ? "0 0 60px rgba(123, 47, 255, 0.9), 0 0 100px rgba(123, 47, 255, 0.4)" 
              : "0 0 40px rgba(123, 47, 255, 0.6)"
          }}
          transition={{
            y: { duration: 1.2, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 1.2, delay: i * 0.05 },
            filter: { duration: 1.2, delay: i * 0.05 },
            textShadow: { duration: 0.1 }
          }}
          className={cn(
            "font-display text-6xl md:text-8xl lg:text-9xl text-text-primary tracking-tighter",
            char === "Æ" && "text-white"
          )}
        >
          {char}
        </motion.span>
      ))}
      
      {/* Absolute glow under the whole wordmark */}
      <div className="absolute inset-0 bg-neon-violet/10 blur-[120px] rounded-full pointer-events-none" />
    </h1>
  );
}
