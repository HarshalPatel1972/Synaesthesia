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
    <div className="flex items-center gap-2 bg-void/50 backdrop-blur-md p-1.5 rounded-full border border-border-glass">
      {VISUALIZER_MODES.map((mode) => {
        const isActive = activeModeId === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={cn(
              "relative px-4 py-1.5 rounded-full text-[10px] font-ui uppercase tracking-widest transition-colors duration-300",
              isActive ? "text-white" : "text-text-secondary hover:text-text-primary"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeMode"
                className="absolute inset-0 bg-neon-violet rounded-full shadow-[0_0_15px_rgba(123,47,255,0.6)]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
