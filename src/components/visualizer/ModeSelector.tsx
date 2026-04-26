"use client";

import { motion } from "framer-motion";
import { VISUALIZER_MODES } from "@/lib/visualizerModes";
import { VisualizerModeId } from "@/types/visualizer";
import { cn } from "@/lib/utils";

interface ModeSelectorProps {
  activeModeId: VisualizerModeId;
  onModeChange: (id: VisualizerModeId) => void;
}

export default function ModeSelector({ activeModeId, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-void/40 backdrop-blur-xl p-1 rounded-full border border-border-glass shadow-2xl">
      {VISUALIZER_MODES.map((mode) => {
        const isActive = activeModeId === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={cn(
              "relative px-5 py-2 rounded-full text-[9px] font-ui uppercase tracking-[0.15em] transition-all duration-500 outline-none",
              isActive ? "text-white" : "text-text-secondary hover:text-text-primary"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-neon-violet rounded-full shadow-[0_0_20px_rgba(123,47,255,0.5)]"
                transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
