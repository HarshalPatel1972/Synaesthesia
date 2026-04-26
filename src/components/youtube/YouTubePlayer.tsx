"use client";

import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { useEffect, forwardRef, useImperativeHandle } from "react";

interface YouTubePlayerProps {
  videoId: string | null;
  onStateChange?: (state: number) => void;
  onReady?: () => void;
}

export const YouTubePlayer = forwardRef(({ videoId, onStateChange, onReady }: YouTubePlayerProps, ref) => {
  const { playerState, isReady, controls } = useYouTubePlayer(videoId);

  useImperativeHandle(ref, () => controls);

  useEffect(() => {
    if (onStateChange) onStateChange(playerState);
  }, [playerState, onStateChange]);

  useEffect(() => {
    if (isReady && onReady) onReady();
  }, [isReady, onReady]);

  return (
    <div 
      className="fixed -left-[9999px] top-0 opacity-0 pointer-events-none"
      id="youtube-player-element" 
    />
  );
});

YouTubePlayer.displayName = "YouTubePlayer";
