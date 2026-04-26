"use client";

import { useRef, useState, useCallback } from "react";

export interface AudioData {
  frequencyData: Uint8Array;   // 1024 bins, 0-255
  waveformData: Uint8Array;    // 2048 samples, 0-255
  bass: number;                // 0.0–1.0, average of bins 0–10
  mid: number;                 // 0.0–1.0, average of bins 10–100
  treble: number;              // 0.0–1.0, average of bins 100–512
  amplitude: number;           // 0.0–1.0, RMS of waveform
  isActive: boolean;
}

export function useAudioAnalyser() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const freqBuf = useRef<Uint8Array>(new Uint8Array(1024));
  const waveBuf = useRef<Uint8Array>(new Uint8Array(2048));
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        } as any,
        video: true, // required for getDisplayMedia usually
      });

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      // CRITICAL: Do NOT connect to ctx.destination — no double audio

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      streamRef.current = stream;

      if (ctx.state === "suspended") await ctx.resume();

      freqBuf.current = new Uint8Array(analyser.frequencyBinCount);
      waveBuf.current = new Uint8Array(analyser.fftSize);

      setIsActive(true);
      setError(null);
    } catch (e) {
      setError("Audio connection failed or was denied.");
      console.error(e);
    }
  }, []);

  const getAudioData = useCallback((): AudioData => {
    if (!analyserRef.current || !isActive) {
      // Return idle sine-wave simulation — never return zeros
      const t = performance.now() / 1000;
      const idle = new Uint8Array(1024).fill(0).map((_, i) =>
        Math.floor(60 + 40 * Math.sin(t * 0.8 + i * 0.05) * Math.sin(t * 0.3))
      );
      const idleWave = new Uint8Array(2048).fill(128).map((_, i) =>
        Math.floor(128 + 30 * Math.sin(t * 2 + i * 0.01))
      );
      return {
        frequencyData: idle,
        waveformData: idleWave,
        bass: 0.3 + 0.2 * Math.sin(t * 1.2),
        mid: 0.2 + 0.15 * Math.sin(t * 0.7),
        treble: 0.1 + 0.1 * Math.sin(t * 2.1),
        amplitude: 0.25 + 0.15 * Math.sin(t * 1.0),
        isActive: false,
      };
    }

    analyserRef.current.getByteFrequencyData(freqBuf.current);
    analyserRef.current.getByteTimeDomainData(waveBuf.current);

    const bass = avg(freqBuf.current, 0, 10) / 255;
    const mid = avg(freqBuf.current, 10, 100) / 255;
    const treble = avg(freqBuf.current, 100, 512) / 255;
    const amplitude = rms(waveBuf.current);

    return {
      frequencyData: freqBuf.current,
      waveformData: waveBuf.current,
      bass,
      mid,
      treble,
      amplitude,
      isActive: true,
    };
  }, [isActive]);

  const disconnect = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();
    setIsActive(false);
  }, []);

  return { connect, disconnect, getAudioData, isActive, error };
}

function avg(arr: Uint8Array, start: number, end: number): number {
  let sum = 0;
  let count = 0;
  for (let i = start; i < end && i < arr.length; i++) {
    sum += arr[i];
    count++;
  }
  return count > 0 ? sum / count : 0;
}

function rms(arr: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    const v = (arr[i] - 128) / 128;
    sum += v * v;
  }
  return Math.sqrt(sum / arr.length);
}
