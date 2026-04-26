"use client";

import { useEffect, useRef, useState } from "react";
import { AudioData, VisualizerMode } from "@/types/visualizer";

interface VisualizerCanvasProps {
  activeMode: VisualizerMode;
  audioData: AudioData;
}

export default function VisualizerCanvas({ activeMode, audioData }: VisualizerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
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

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    let animationId: number;
    let frame = 0;
    const startTime = performance.now();

    const loop = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      
      // We don't clear the whole canvas every time to allow for trails in some modes
      // The modes themselves handle background clearing if needed
      
      activeMode.render(ctx, dimensions.width, dimensions.height, audioData, elapsed, frame);
      
      frame++;
      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [activeMode, audioData, dimensions]);

  return (
    <div ref={containerRef} className="fixed inset-0 bg-void">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: dimensions.width, height: dimensions.height }}
      />
    </div>
  );
}
