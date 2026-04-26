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

  const { audioData, startCapture, isActive: isAudioActive } = useAudioAnalyser();
  const { activeMode, setMode } = useVisualizerMode();
  const [showPermission, setShowPermission] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(100);

  useEffect(() => {
    if (!videoId) {
      router.push("/");
    }
  }, [videoId, router]);

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
      <VisualizerCanvas activeMode={activeMode} audioData={audioData} />

      {/* Top Bar UI */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-40">
        <Link 
          href="/" 
          className="group flex items-center gap-3 text-text-secondary hover:text-white transition-all"
        >
          <div className="w-8 h-8 rounded-full border border-border-glass flex items-center justify-center group-hover:border-neon-violet transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-display text-lg tracking-widest">SYNÆSTHESIA</span>
        </Link>

        {!audioData.isActive && !showPermission && (
          <button
            onClick={handleGrantPermission}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-neon-violet/30 text-xs font-ui uppercase tracking-widest text-text-primary hover:bg-neon-violet/10 transition-all"
          >
            <Share2 className="w-3.5 h-3.5 text-neon-violet" />
            Connect Audio
          </button>
        )}
      </div>

      {/* Permission Overlay */}
      {showPermission && (
        <AudioPermissionCard 
          onGrant={handleGrantPermission} 
          onSkip={() => setShowPermission(false)} 
        />
      )}

      {/* Bottom Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-40 p-6 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Mode Selector */}
          <div className="flex justify-center">
            <ModeSelector activeModeId={activeMode.id} onModeChange={setMode} />
          </div>

          {/* Player Glass Bar */}
          <div className="glass-effect p-4 md:px-8 rounded-2xl shadow-3xl">
            <PlayerControls 
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              volume={volume}
              onVolumeChange={handleVolumeChange}
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
