"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getBass, getMid, getTreble, getRMS } from "@/lib/audioUtils";

export interface AudioData {
  frequencyData: Uint8Array;
  waveformData: Uint8Array;
  bass: number;
  mid: number;
  treble: number;
  amplitude: number;
  isActive: boolean;
}

export function useAudioAnalyser() {
  const [audioData, setAudioData] = useState<AudioData>({
    frequencyData: new Uint8Array(0),
    waveformData: new Uint8Array(0),
    bass: 0,
    mid: 0,
    treble: 0,
    amplitude: 0,
    isActive: false,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        } as any,
        video: true, // video is often required for getDisplayMedia even if we only want audio
      });

      streamRef.current = stream;
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.82;
      
      source.connect(analyser);
      // Do NOT connect to audioContext.destination to avoid feedback loop
      
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const frequencyData = new Uint8Array(bufferLength);
      const waveformData = new Uint8Array(bufferLength);

      const update = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(frequencyData);
        analyserRef.current.getByteTimeDomainData(waveformData);

        setAudioData({
          frequencyData: new Uint8Array(frequencyData),
          waveformData: new Uint8Array(waveformData),
          bass: getBass(frequencyData),
          mid: getMid(frequencyData),
          treble: getTreble(frequencyData),
          amplitude: getRMS(waveformData),
          isActive: true,
        });

        animationFrameRef.current = requestAnimationFrame(update);
      };

      update();
    } catch (err) {
      console.error("Error capturing audio:", err);
      setAudioData(prev => ({ ...prev, isActive: false }));
    }
  }, []);

  const stopCapture = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setAudioData(prev => ({ ...prev, isActive: false }));
  }, []);

  useEffect(() => {
    return () => stopCapture();
  }, [stopCapture]);

  return { audioData, startCapture, stopCapture };
}
