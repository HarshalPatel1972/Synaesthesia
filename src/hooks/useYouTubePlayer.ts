"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export function useYouTubePlayer(videoId: string | null) {
  const [player, setPlayer] = useState<any>(null);
  const [playerState, setPlayerState] = useState<number>(-1);
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!videoId) return;

    // Load API script
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        createPlayer();
      };
    } else {
      createPlayer();
    }

    function createPlayer() {
      const newPlayer = new window.YT.Player("youtube-player-element", {
        height: "1",
        width: "1",
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
        },
        events: {
          onReady: (event: any) => {
            setIsReady(true);
            event.target.playVideo();
          },
          onStateChange: (event: any) => {
            setPlayerState(event.data);
          },
        },
      });
      setPlayer(newPlayer);
    }

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [videoId]);

  const controls = {
    play: () => player?.playVideo(),
    pause: () => player?.pauseVideo(),
    setVolume: (level: number) => player?.setVolume(level),
    getDuration: () => player?.getDuration() || 0,
    getCurrentTime: () => player?.getCurrentTime() || 0,
    seekTo: (seconds: number) => player?.seekTo(seconds, true),
  };

  return { playerRef, playerState, isReady, controls };
}
