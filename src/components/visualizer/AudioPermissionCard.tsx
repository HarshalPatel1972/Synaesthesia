"use client";

import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { Share2, Music2, Info } from "lucide-react";
import { motion } from "framer-motion";

interface AudioPermissionCardProps {
  onGrant: () => void;
  onSkip: () => void;
}

export default function AudioPermissionCard({ onGrant, onSkip }: AudioPermissionCardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-void/40 backdrop-blur-sm">
      <GlassCard className="max-w-md w-full text-center space-y-8 p-10 border-neon-violet/30" hoverEffect={false}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="mx-auto w-20 h-20 rounded-full bg-neon-violet/10 flex items-center justify-center border border-neon-violet/20"
        >
          <Music2 className="w-10 h-10 text-neon-violet" />
        </motion.div>

        <div className="space-y-4">
          <h2 className="font-display text-2xl md:text-3xl text-text-primary tracking-tight">
            Connect Your Senses
          </h2>
          <p className="font-body italic text-lg text-text-secondary leading-relaxed">
            To visualize the music, SYNÆSTHESIA needs access to your browser tab's audio. 
          </p>
        </div>

        <div className="bg-void/40 rounded-xl p-4 flex items-start gap-3 text-left border border-white/5">
          <Info className="w-5 h-5 text-cyan flex-shrink-0 mt-0.5" />
          <p className="text-xs text-text-secondary/80 font-ui leading-normal">
            Click &apos;Share Audio&apos;, select this tab in the &apos;Browser Tab&apos; list, and ensure &apos;Also share tab audio&apos; is checked.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <NeonButton onClick={onGrant} variant="primary" className="w-full py-4 text-base">
            <span className="flex items-center justify-center gap-2">
              <Share2 className="w-5 h-5" />
              Share Audio
            </span>
          </NeonButton>
          
          <button 
            onClick={onSkip}
            className="text-text-secondary hover:text-text-primary text-xs font-ui uppercase tracking-widest transition-colors pt-2"
          >
            Continue with idle visualization
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
