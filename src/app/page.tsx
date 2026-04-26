"use client";

import { motion } from "framer-motion";
import HeroTitle from "@/components/intro/HeroTitle";
import SearchBar from "@/components/intro/SearchBar";
import ParticleField from "@/components/intro/ParticleField";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-void">
      {/* Background Particles */}
      <ParticleField />

      {/* Content Overlay */}
      <div className="relative z-10 w-full max-w-5xl px-4 flex flex-col items-center text-center">
        {/* Wordmark */}
        <HeroTitle />

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 font-body italic text-xl md:text-2xl text-text-secondary tracking-wide"
        >
          If sound were visible, it would look like this.
        </motion.p>

        {/* Search Bar Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 w-full"
        >
          <SearchBar />
        </motion.div>
      </div>

      {/* Footer Credit */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-0 right-0 text-center"
      >
        <p className="font-ui text-[10px] uppercase tracking-[0.3em] text-text-secondary opacity-50">
          SYNÆSTHESIA © 2025 • A Bioluminescent Experience
        </p>
      </motion.footer>

      {/* Decorative center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-neon-violet/5 blur-[160px] rounded-full pointer-events-none" />
    </main>
  );
}
