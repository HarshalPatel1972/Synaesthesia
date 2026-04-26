"use client";

import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { Share2, Music2, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AudioPermissionCardProps {
  onGrant: () => void;
  onSkip: () => void;
}

export default function AudioPermissionCard({ onGrant, onSkip }: AudioPermissionCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-void/60 backdrop-blur-md"
    >
      <GlassCard 
        className="max-w-md w-full text-center space-y-8 p-10 border-neon-violet/40 shadow-[0_0_100px_rgba(123,47,255,0.2)]" 
        hoverEffect={false}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15, delay: 0.2 }}
          className="mx-auto w-24 h-24 rounded-full bg-neon-violet/10 flex items-center justify-center border border-neon-violet/30"
        >
          <Music2 className="w-12 h-12 text-neon-violet animate-pulse" />
        </motion.div>

        <div className="space-y-4">
          <h2 className="font-display text-3xl md:text-4xl text-text-primary tracking-tight">
            See the Music
          </h2>
          <p className="font-body italic text-xl text-text-secondary leading-relaxed">
            &ldquo;To see the music, share your browser tab&apos;s audio.&rdquo;
          </p>
        </div>

        <div className="bg-void/40 rounded-xl p-5 flex items-start gap-4 text-left border border-white/5">
          <Info className="w-6 h-6 text-cyan flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[10px] text-cyan uppercase tracking-widest font-ui font-bold">Instructions</p>
            <p className="text-xs text-text-secondary font-ui leading-relaxed">
              Click <span className="text-text-primary">&apos;Share Audio&apos;</span> &rarr; select this browser tab &rarr; check <span className="text-text-primary">&apos;Also share tab audio&apos;</span>.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-4">
          <NeonButton onClick={onGrant} variant="primary" className="w-full py-5 text-base shadow-[0_0_30px_rgba(123,47,255,0.3)]">
            <span className="flex items-center justify-center gap-3">
              <Share2 className="w-5 h-5" />
              Share Audio
            </span>
          </NeonButton>
          
          <button 
            onClick={onSkip}
            className="group flex items-center justify-center gap-2 text-text-secondary hover:text-text-primary text-[10px] font-ui uppercase tracking-[0.2em] transition-all"
          >
            Continue in ambient mode
            <X className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
