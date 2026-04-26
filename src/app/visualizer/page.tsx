"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Share2, ArrowLeft } from "lucide-react";
import { YouTubePlayer } from "@/components/youtube/YouTubePlayer";
import VisualizerCanvas from "@/components/visualizer/VisualizerCanvas";
import AudioPermissionCard from "@/components/visualizer/AudioPermissionCard";
import ModeSelector from "@/components/visualizer/ModeSelector";
import PlayerControls from "@/components/visualizer/PlayerControls";
import { useAudioAnalyser } from "@/hooks/useAudioAnalyser";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { useVisualizerMode } from "@/hooks/useVisualizerMode";

function VisualizerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoId = searchParams.get("v");
  const playerRef = useRef<any>(null);

  const { getAudioData, connect: startCapture, isActive: isAudioActive } = useAudioAnalyser();
  const { activeMode, setMode } = useVisualizerMode();
  const [showPermission, setShowPermission] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(100);

  useEffect(() => {
    if (!videoId) {
      router.push("/");
      return;
    }
    
    // Show permission card after delay
    const timer = setTimeout(() => {
      if (!isAudioActive) setShowPermission(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [videoId, router, isAudioActive]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      playerRef.current?.pause();
    } else {
      playerRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    playerRef.current?.setVolume(val);
  };

  const handleGrantPermission = async () => {
    await startCapture();
    setShowPermission(false);
  };

  return (
    <main className="relative h-screen w-full bg-void overflow-hidden">
      {/* Hidden YouTube Player */}
      <YouTubePlayer 
        ref={playerRef} 
        videoId={videoId} 
        onStateChange={(state) => setIsPlaying(state === 1)}
      />

      {/* Main Visualizer Canvas */}
      <VisualizerCanvas activeMode={activeMode} getAudioData={getAudioData} />

      {/* Top Bar UI */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-[60]">
        <Link 
          href="/" 
          className="group flex items-center gap-4 text-text-secondary hover:text-white transition-all"
        >
          <div className="w-10 h-10 rounded-full border border-border-glass flex items-center justify-center group-hover:border-neon-violet group-hover:shadow-[0_0_15px_rgba(123,47,255,0.3)] transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl tracking-[0.2em] leading-none">SYNÆSTHESIA</span>
            <span className="font-ui text-[8px] uppercase tracking-[0.4em] opacity-50 mt-1">Bioluminescent Visualizer</span>
          </div>
        </Link>

        {/* Connection Indicator */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-void/40 backdrop-blur-md border border-border-glass">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isAudioActive ? "bg-cyan animate-pulse shadow-[0_0_8px_#00F5FF]" : "bg-white/20"
            )} />
            <span className="font-ui text-[9px] uppercase tracking-widest text-text-secondary">
              {isAudioActive ? "Audio Connected" : "Ambient Mode"}
            </span>
          </div>
          
          {!isAudioActive && (
            <button
              onClick={() => setShowPermission(true)}
              className="font-ui text-[8px] uppercase tracking-[0.3em] text-neon-violet hover:text-white transition-colors pr-2"
            >
              [ Reconnect Audio ]
            </button>
          )}
        </div>
      </div>

      {/* Permission Overlay */}
      <AnimatePresence>
        {showPermission && (
          <AudioPermissionCard 
            onGrant={handleGrantPermission} 
            onSkip={() => setShowPermission(false)} 
          />
        )}
      </AnimatePresence>

      {/* Bottom Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-40 p-6 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Mode Selector */}
          <div className="flex justify-center">
            <ModeSelector activeModeId={activeMode.id} onModeChange={setMode} />
          </div>

          {/* Player Glass Bar */}
          <div className="bg-void/30 backdrop-blur-2xl border border-border-glass p-6 md:px-12 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <PlayerControls 
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              volume={volume}
              onVolumeChange={handleVolumeChange}
              title={playerRef.current?.videoData?.title}
              artist={playerRef.current?.videoData?.author}
            />
          </div>
        </div>
      </div>
      
      {/* Cinematic Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]" />
    </main>
  );
}

export default function VisualizerPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-void flex items-center justify-center">
      <div className="w-20 h-20 rounded-full border-2 border-neon-violet/20 border-t-neon-violet animate-spin" />
    </div>}>
      <VisualizerContent />
    </Suspense>
  );
}
