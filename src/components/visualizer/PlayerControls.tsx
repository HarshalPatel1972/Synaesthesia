"use client";

import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PlayerControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  volume: number;
  onVolumeChange: (val: number) => void;
  title?: string;
  artist?: string;
}

export default function PlayerControls({
  isPlaying,
  onTogglePlay,
  volume,
  onVolumeChange,
  title = "Unknown Masterpiece",
  artist = "SYNÆSTHESIA",
}: PlayerControlsProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);

  const toggleMute = () => {
    if (isMuted) {
      onVolumeChange(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      onVolumeChange(0);
      setIsMuted(true);
    }
  };

  return (
    <div className="flex items-center gap-8 w-full max-w-4xl mx-auto">
      {/* Song Info */}
      <div className="hidden md:flex flex-col flex-1 min-w-0">
        <h3 className="text-text-primary text-sm font-medium truncate" dangerouslySetInnerHTML={{ __html: title }} />
        <p className="text-text-secondary text-[10px] uppercase tracking-widest font-ui mt-1">{artist}</p>
      </div>

      {/* Main Controls */}
      <div className="flex items-center gap-6">
        <button className="text-text-secondary hover:text-text-primary transition-colors">
          <SkipBack className="w-5 h-5" />
        </button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onTogglePlay}
          className="w-12 h-12 rounded-full bg-neon-violet flex items-center justify-center text-white shadow-[0_0_20px_rgba(123,47,255,0.4)] hover:shadow-[0_0_30px_rgba(123,47,255,0.6)] transition-all"
        >
          {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
        </motion.button>

        <button className="text-text-secondary hover:text-text-primary transition-colors">
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3 flex-1 justify-end group">
        <button onClick={toggleMute} className="text-text-secondary hover:text-text-primary transition-colors">
          {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="w-24 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-violet group-hover:w-32 transition-all"
        />
      </div>
    </div>
  );
}
