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
  title = "Waiting for music...",
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
    <div className="flex items-center gap-4 md:gap-12 w-full max-w-6xl mx-auto">
      {/* Song Info */}
      <div className="hidden lg:flex flex-col flex-1 min-w-0">
        <h3 
          className="text-text-primary text-lg font-display tracking-tight truncate leading-tight" 
          dangerouslySetInnerHTML={{ __html: title }} 
        />
        <p className="text-text-secondary text-[10px] uppercase tracking-[0.3em] font-ui mt-1.5 opacity-60">
          {artist}
        </p>
      </div>

      {/* Main Controls */}
      <div className="flex items-center gap-8 md:gap-10">
        <button className="text-text-secondary hover:text-white transition-colors duration-300">
          <SkipBack className="w-5 h-5 fill-current" />
        </button>
        
        <motion.button
          whileHover={{ scale: 1.05, shadow: "0 0 40px rgba(123,47,255,0.4)" }}
          whileTap={{ scale: 0.95 }}
          onClick={onTogglePlay}
          className="w-16 h-16 rounded-full bg-neon-violet flex items-center justify-center text-white shadow-[0_0_25px_rgba(123,47,255,0.3)] transition-all duration-500"
        >
          {isPlaying ? (
            <Pause className="w-7 h-7 fill-current" />
          ) : (
            <Play className="w-7 h-7 fill-current ml-1" />
          )}
        </motion.button>

        <button className="text-text-secondary hover:text-white transition-colors duration-300">
          <SkipForward className="w-5 h-5 fill-current" />
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-4 flex-1 justify-end group max-w-[200px]">
        <button onClick={toggleMute} className="text-text-secondary hover:text-white transition-colors duration-300">
          {isMuted || volume === 0 ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
        <div className="relative flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-neon-violet shadow-[0_0_10px_rgba(123,47,255,0.6)]" 
            style={{ width: `${volume}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
