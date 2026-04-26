"use client";

import { useEffect, useRef, useState } from "react";
import { AudioData, VisualizerMode } from "@/types/visualizer";

interface VisualizerCanvasProps {
  activeMode: VisualizerMode;
  getAudioData: () => AudioData;
}

export default function VisualizerCanvas({ activeMode, getAudioData }: VisualizerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Apply devicePixelRatio for sharpness
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = dimensions.width + "px";
    canvas.style.height = dimensions.height + "px";

    let animationId: number;
    let frame = 0;
    const startTime = performance.now();

    const loop = () => {
      const audio = getAudioData(); // CALLED EVERY FRAME
      const time = performance.now() - startTime;
      
      // Modes handle their own background clearing if they want trails
      // but we ensure a baseline clear if needed
      activeMode.render(ctx, dimensions.width, dimensions.height, audio, time, frame);
      
      frame++;
      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [activeMode, getAudioData, dimensions]);

  return (
    <div ref={containerRef} className="fixed inset-0 bg-[#000005]">
      <canvas
        ref={canvasRef}
        className="block"
      />
    </div>
  );
}
