# SYNÆSTHESIA — Surgical Fix Prompt

## AGENT RULES (NON-NEGOTIABLE)
1. **Atomic commits only.** One thing per commit.
2. **Safe + secure coding.** No eval, no innerHTML with user data, API keys in .env.local only.
3. **No broken states.** Every mode must visually prove the audio is connected and reacting.

---

## WHAT IS BROKEN — READ THIS FIRST

The current build has a **severed audio pipeline**. Every visualizer mode is running independently of audio data. The frequency data from `AnalyserNode` is either not being read, not being passed to renderers, or is being passed but never used meaningfully. The modes are decorative animations — they are not music visualizers. This must be rebuilt from scratch.

**Evidence of failure:**
- VOID mode = completely black canvas (render loop dead or audio data is all zeros)
- AURORA mode = flat static horizontal color bands (no sine wave computation, no frequency mapping)
- PRISM mode = static nested concentric circles that do not react to any audio parameter
- ECHO mode = a single static dot (ripple emission never fires)
- NEBULA mode = orange radial gradient blob (only partially implemented, still disconnected)

**The one job of this fix:** Every pixel of every mode must be provably driven by real-time frequency data. A viewer watching the visualizer should be able to tell — with their eyes closed to the music — what the kick drum is doing, what the melody is doing, and when a drop hits.

---

## STEP 1: FIX THE AUDIO PIPELINE FIRST

Before touching any visualizer mode, verify and fix `useAudioAnalyser.ts`.

### The hook must:

```typescript
// useAudioAnalyser.ts — complete rewrite

import { useRef, useState, useCallback } from 'react';

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
        audio: true,
        video: false,
      });

      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      // CRITICAL: Do NOT connect to ctx.destination — no double audio

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      streamRef.current = stream;

      // Resume context if browser suspended it
      if (ctx.state === 'suspended') await ctx.resume();

      freqBuf.current = new Uint8Array(analyser.frequencyBinCount);
      waveBuf.current = new Uint8Array(analyser.fftSize);

      setIsActive(true);
      setError(null);
    } catch (e) {
      setError('Audio connection failed or was denied.');
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
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close();
    setIsActive(false);
  }, []);

  return { connect, disconnect, getAudioData, isActive, error };
}

function avg(arr: Uint8Array, start: number, end: number): number {
  let sum = 0;
  for (let i = start; i < end && i < arr.length; i++) sum += arr[i];
  return sum / (end - start);
}

function rms(arr: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    const v = (arr[i] - 128) / 128;
    sum += v * v;
  }
  return Math.sqrt(sum / arr.length);
}
```

**Commit:** `fix: rewrite useAudioAnalyser with idle simulation and correct FFT wiring`

---

## STEP 2: FIX THE RENDER LOOP IN VisualizerCanvas.tsx

The render loop must call `getAudioData()` on every single animation frame and pass it to the active mode renderer. Currently it is not doing this.

```typescript
// Inside the useEffect render loop:

const loop = () => {
  const audio = getAudioData(); // CALLED EVERY FRAME
  const time = performance.now() - startTime;

  ctx.fillStyle = '#000005';
  ctx.fillRect(0, 0, width, height);

  activeRenderer(ctx, width, height, audio, time, frame);
  frame++;
  animationId = requestAnimationFrame(loop);
};
```

**Commit:** `fix: wire getAudioData into render loop every frame`

---

## STEP 3: REWRITE ALL 5 VISUALIZER MODES

### CRITICAL RULE FOR ALL MODES:
Every visual parameter — size, speed, color, opacity, position — must be a direct mathematical function of `audio.bass`, `audio.mid`, `audio.treble`, or `audio.frequencyData[i]`. If you can remove `audio` from a render function and the output is the same, the mode is wrong.

---

### MODE 1: VOID — *Particle Storm*

```typescript
// void.ts

const PARTICLE_COUNT = 400;

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  baseRadius: number;
  angle: number;
  orbitRadius: number;
  orbitSpeed: number;
  hue: number;
}

let particles: Particle[] = [];
let initialized = false;

export function renderVoid(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  audio: AudioData,
  time: number,
  frame: number
) {
  if (!initialized || particles.length === 0) {
    particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: W / 2, y: H / 2,
      vx: 0, vy: 0,
      baseRadius: 1 + Math.random() * 2,
      angle: (i / PARTICLE_COUNT) * Math.PI * 2,
      orbitRadius: 20 + Math.random() * 200,
      orbitSpeed: 0.001 + Math.random() * 0.003,
      hue: 260 + Math.random() * 80,
    }));
    initialized = true;
  }

  // Persistent trail: don't clear fully — overlay semi-transparent black
  ctx.fillStyle = 'rgba(0, 0, 5, 0.15)';
  ctx.fillRect(0, 0, W, H);

  const cx = W / 2;
  const cy = H / 2;
  const bassForce = audio.bass * 8;        // bass = explosive force
  const trebleTrail = audio.treble;        // treble = trail length
  const midHue = audio.mid * 120;          // mid = color temperature

  particles.forEach((p, i) => {
    // Update orbit angle
    p.angle += p.orbitSpeed * (1 + audio.mid * 3);

    // Target position on orbit
    const targetX = cx + Math.cos(p.angle) * p.orbitRadius * (1 + audio.bass * 2);
    const targetY = cy + Math.sin(p.angle) * p.orbitRadius * (1 + audio.bass * 2);

    // Spring toward target
    p.vx += (targetX - p.x) * 0.05;
    p.vy += (targetY - p.y) * 0.05;

    // Bass explosion: push outward
    if (audio.bass > 0.6) {
      const dx = p.x - cx;
      const dy = p.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      p.vx += (dx / dist) * bassForce;
      p.vy += (dy / dist) * bassForce;
    }

    // Drag
    p.vx *= 0.88;
    p.vy *= 0.88;

    const prevX = p.x;
    const prevY = p.y;
    p.x += p.vx;
    p.y += p.vy;

    // Draw trail line
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    const alpha = Math.min(0.8, 0.2 + trebleTrail * 0.6);
    const hue = p.hue + midHue;
    const size = p.baseRadius * (1 + audio.amplitude * 3);

    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = `hsla(${hue}, 90%, 70%, ${alpha})`;
    ctx.lineWidth = size;
    ctx.stroke();

    // Dot at head
    ctx.beginPath();
    ctx.arc(p.x, p.y, size * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue}, 100%, 85%, ${alpha * 0.8})`;
    ctx.fill();
  });

  // Bass flash
  if (audio.bass > 0.75) {
    ctx.fillStyle = `rgba(123, 47, 255, ${(audio.bass - 0.75) * 0.15})`;
    ctx.fillRect(0, 0, W, H);
  }
}
```

**Commit:** `feat: rewrite VOID mode with orbit physics and bass explosion`

---

### MODE 2: AURORA — *Wave Landscape*

The current implementation draws flat horizontal color bands. This is wrong. It must draw animated sine waves whose amplitude and frequency are driven by audio data.

```typescript
// aurora.ts

export function renderAurora(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  audio: AudioData,
  time: number
) {
  // Semi-transparent overlay for trails
  ctx.fillStyle = 'rgba(0, 0, 5, 0.25)';
  ctx.fillRect(0, 0, W, H);

  const layers = [
    { freq: 0.003, speed: 0.4, yBase: 0.85, color: [123, 47, 255], binStart: 0 },
    { freq: 0.005, speed: 0.6, yBase: 0.75, color: [0, 245, 255], binStart: 20 },
    { freq: 0.007, speed: 0.8, yBase: 0.65, color: [255, 41, 117], binStart: 50 },
    { freq: 0.004, speed: 0.5, yBase: 0.55, color: [255, 107, 0], binStart: 80 },
    { freq: 0.006, speed: 0.7, yBase: 0.45, color: [180, 0, 255], binStart: 120 },
  ];

  layers.forEach((layer, idx) => {
    // Amplitude driven by frequency bin at this layer's range
    const binAmp = audio.frequencyData[layer.binStart] / 255;
    const waveHeight = (0.05 + binAmp * 0.35) * H;

    ctx.beginPath();
    ctx.moveTo(0, H);

    for (let x = 0; x <= W; x += 4) {
      const t1 = time * 0.001 * layer.speed;
      const t2 = time * 0.0007 * layer.speed;
      // Multiple sine waves combined — this is what makes it organic
      const y =
        layer.yBase * H
        - waveHeight * Math.sin(x * layer.freq + t1)
        - waveHeight * 0.4 * Math.sin(x * layer.freq * 2.3 + t2)
        - waveHeight * 0.2 * Math.sin(x * layer.freq * 0.7 - t1 * 0.5)
        - audio.bass * 80 * Math.sin(x * 0.002 + t1 * 2); // bass = big push up

      ctx.lineTo(x, y);
    }

    ctx.lineTo(W, H);
    ctx.closePath();

    const alpha = 0.12 + binAmp * 0.25;
    const [r, g, b] = layer.color;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    ctx.fill();

    // Glow edge
    const gradient = ctx.createLinearGradient(0, layer.yBase * H - waveHeight, 0, layer.yBase * H);
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 1.5})`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.fillStyle = gradient;
    ctx.fill();
  });
}
```

**Commit:** `feat: rewrite AURORA mode with layered frequency-driven sine waves`

---

### MODE 3: PRISM — *Reactive Mandala*

Currently draws static concentric circles. Must draw a kaleidoscopic mandala that reacts explosively to bass and breathes with mid frequencies.

```typescript
// prism.ts

export function renderPrism(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  audio: AudioData,
  time: number
) {
  ctx.fillStyle = 'rgba(0, 0, 5, 0.2)';
  ctx.fillRect(0, 0, W, H);

  const cx = W / 2;
  const cy = H / 2;
  const SYMMETRY = 8;  // 8-fold mirror
  const sliceAngle = (Math.PI * 2) / SYMMETRY;

  // Base radius driven by amplitude
  const baseR = (Math.min(W, H) * 0.12) * (1 + audio.amplitude * 2);

  ctx.save();
  ctx.translate(cx, cy);

  // Draw SYMMETRY mirrored slices
  for (let s = 0; s < SYMMETRY; s++) {
    ctx.save();
    ctx.rotate(s * sliceAngle + time * 0.0003 * (1 + audio.mid * 3));

    // Draw frequency-responsive radial lines
    const binCount = 60;
    for (let i = 0; i < binCount; i++) {
      const binVal = audio.frequencyData[i * 8] / 255;
      const angle = (i / binCount) * sliceAngle;
      const r1 = baseR;
      const r2 = baseR + binVal * (Math.min(W, H) * 0.3) * (1 + audio.bass * 1.5);

      const hue = 260 + (i / binCount) * 120 + audio.mid * 60;
      const alpha = 0.4 + binVal * 0.5;

      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
      ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
      ctx.strokeStyle = `hsla(${hue}, 90%, 70%, ${alpha})`;
      ctx.lineWidth = 1 + binVal * 2;
      ctx.stroke();
    }

    // Bass: outer polygon ring
    const sides = 6 + Math.floor(audio.bass * 6);
    const outerR = baseR + (Math.min(W, H) * 0.2) * (1 + audio.bass);
    ctx.beginPath();
    for (let v = 0; v <= sides; v++) {
      const a = (v / sides) * Math.PI * 2;
      const r = outerR * (1 + 0.2 * Math.sin(time * 0.002 + v));
      if (v === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.strokeStyle = `hsla(${280 + audio.bass * 60}, 100%, 80%, ${0.3 + audio.bass * 0.5})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  // Center orb
  const orbRadius = baseR * 0.4;
  const orbGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, orbRadius);
  orbGrad.addColorStop(0, `hsla(${270 + audio.mid * 60}, 100%, 90%, 0.9)`);
  orbGrad.addColorStop(1, `hsla(${270 + audio.mid * 60}, 100%, 50%, 0)`);
  ctx.beginPath();
  ctx.arc(0, 0, orbRadius, 0, Math.PI * 2);
  ctx.fillStyle = orbGrad;
  ctx.fill();

  ctx.restore();

  // Chromatic aberration on bass spike
  if (audio.bass > 0.65) {
    const offset = (audio.bass - 0.65) * 20;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.15;
    ctx.translate(-offset, 0);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(0, 0, W, H);
    ctx.translate(offset * 2, 0);
    ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}
```

**Commit:** `feat: rewrite PRISM mode with 8-fold symmetry mandala and chromatic aberration`

---

### MODE 4: ECHO — *Ripple Field*

Currently renders a single static dot. Must emit concentric rings on every bass hit.

```typescript
// echo.ts

interface Ring {
  radius: number;
  maxRadius: number;
  color: string;
  speed: number;
  birth: number;
  lineWidth: number;
}

const rings: Ring[] = [];
let lastBassTime = 0;
const COLORS = ['#7B2FFF', '#00F5FF', '#FF2975', '#FF6B00', '#FFD700'];
let colorIdx = 0;

export function renderEcho(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  audio: AudioData,
  time: number
) {
  ctx.fillStyle = 'rgba(0, 0, 5, 0.18)';
  ctx.fillRect(0, 0, W, H);

  const cx = W / 2;
  const cy = H / 2;

  // Emit new ring on bass spike (minimum 80ms between emissions)
  const threshold = audio.isActive ? 0.55 : 0.45;
  if (audio.bass > threshold && time - lastBassTime > 80) {
    rings.push({
      radius: 0,
      maxRadius: Math.min(W, H) * (0.4 + audio.bass * 0.4),
      color: COLORS[colorIdx % COLORS.length],
      speed: 2 + audio.bass * 6,
      birth: time,
      lineWidth: 1 + audio.bass * 4,
    });
    colorIdx++;
    lastBassTime = time;
  }

  // Always emit slow ambient rings in idle
  if (!audio.isActive && time - lastBassTime > 1200) {
    rings.push({
      radius: 0,
      maxRadius: Math.min(W, H) * 0.35,
      color: COLORS[colorIdx % COLORS.length],
      speed: 1.5,
      birth: time,
      lineWidth: 1,
    });
    colorIdx++;
    lastBassTime = time;
  }

  // Draw and age rings
  for (let i = rings.length - 1; i >= 0; i--) {
    const ring = rings[i];
    ring.radius += ring.speed;

    const progress = ring.radius / ring.maxRadius;
    const alpha = (1 - progress) * 0.8;

    if (alpha <= 0 || ring.radius > ring.maxRadius) {
      rings.splice(i, 1);
      continue;
    }

    // Main ring
    ctx.beginPath();
    ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2);
    ctx.strokeStyle = ring.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
    ctx.lineWidth = ring.lineWidth * (1 - progress * 0.5);
    ctx.stroke();

    // Glow duplicate
    ctx.beginPath();
    ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2);
    ctx.strokeStyle = ring.color + Math.floor(alpha * 100).toString(16).padStart(2, '0');
    ctx.lineWidth = ring.lineWidth * 4 * (1 - progress);
    ctx.stroke();
  }

  // Waveform circle in center
  const waveRadius = 40 + audio.amplitude * 60;
  const wavePoints = audio.waveformData.length;
  ctx.beginPath();
  for (let i = 0; i < wavePoints; i++) {
    const angle = (i / wavePoints) * Math.PI * 2;
    const v = (audio.waveformData[i] - 128) / 128;
    const r = waveRadius + v * waveRadius * 0.8;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = `rgba(0, 245, 255, ${0.3 + audio.amplitude * 0.5})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Center orb
  const orb = ctx.createRadialGradient(cx, cy, 0, cx, cy, waveRadius * 0.6);
  orb.addColorStop(0, `rgba(123, 47, 255, ${0.6 + audio.amplitude * 0.4})`);
  orb.addColorStop(1, 'rgba(123, 47, 255, 0)');
  ctx.beginPath();
  ctx.arc(cx, cy, waveRadius * 0.6, 0, Math.PI * 2);
  ctx.fillStyle = orb;
  ctx.fill();
}
```

**Commit:** `feat: rewrite ECHO mode with bass-triggered rings and waveform circle`

---

### MODE 5: NEBULA — *Deep Space*

Currently somewhat implemented but disconnected from audio. Rebuild with full audio reactivity.

```typescript
// nebula.ts

interface Star {
  x: number; y: number;
  size: number;
  brightness: number;
  twinklePhase: number;
  twinkleSpeed: number;
  binIndex: number;  // which treble bin drives this star's brightness
}

let stars: Star[] = [];
let starsInitialized = false;

export function renderNebula(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  audio: AudioData,
  time: number
) {
  ctx.fillStyle = 'rgba(0, 0, 5, 0.3)';
  ctx.fillRect(0, 0, W, H);

  if (!starsInitialized) {
    stars = Array.from({ length: 700 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      size: 0.5 + Math.random() * 2,
      brightness: 0.3 + Math.random() * 0.7,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.5 + Math.random() * 2,
      binIndex: 100 + Math.floor(Math.random() * 400),  // treble range
    }));
    starsInitialized = true;
  }

  const cx = W / 2;
  const cy = H / 2;

  // Nebula cloud — radius driven by bass, hue driven by mid
  const nebulaRadius = (Math.min(W, H) * 0.25) * (1 + audio.bass * 1.5);
  const hue = 250 + audio.mid * 100 + (time * 0.01 % 360);

  // Outer glow
  const nebGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, nebulaRadius * 2);
  nebGlow.addColorStop(0, `hsla(${hue}, 80%, 50%, ${0.06 + audio.bass * 0.12})`);
  nebGlow.addColorStop(0.5, `hsla(${hue + 30}, 80%, 40%, ${0.03 + audio.bass * 0.06})`);
  nebGlow.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.arc(cx, cy, nebulaRadius * 2, 0, Math.PI * 2);
  ctx.fillStyle = nebGlow;
  ctx.fill();

  // Core
  const nebCore = ctx.createRadialGradient(cx, cy, 0, cx, cy, nebulaRadius);
  nebCore.addColorStop(0, `hsla(${hue}, 100%, 80%, ${0.15 + audio.amplitude * 0.3})`);
  nebCore.addColorStop(0.6, `hsla(${hue + 20}, 90%, 50%, ${0.08 + audio.bass * 0.1})`);
  nebCore.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.arc(cx, cy, nebulaRadius, 0, Math.PI * 2);
  ctx.fillStyle = nebCore;
  ctx.fill();

  // Stars — each star's brightness driven by its assigned treble bin
  stars.forEach(star => {
    const binBrightness = audio.frequencyData[star.binIndex] / 255;
    const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed * 0.001 + star.twinklePhase);
    const finalBrightness = star.brightness * (0.3 + binBrightness * 0.7) * twinkle;

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size * (1 + binBrightness), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${finalBrightness})`;
    ctx.fill();

    // Bright stars get a cross-flare
    if (binBrightness > 0.6) {
      const flen = star.size * 6 * binBrightness;
      ctx.strokeStyle = `rgba(255, 255, 255, ${finalBrightness * 0.4})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(star.x - flen, star.y);
      ctx.lineTo(star.x + flen, star.y);
      ctx.moveTo(star.x, star.y - flen);
      ctx.lineTo(star.x, star.y + flen);
      ctx.stroke();
    }
  });

  // Shooting star on amplitude peak
  if (audio.amplitude > 0.8) {
    const sx = Math.random() * W;
    const sy = Math.random() * H * 0.5;
    const len = 80 + audio.amplitude * 200;
    const sg = ctx.createLinearGradient(sx, sy, sx + len, sy + len * 0.3);
    sg.addColorStop(0, 'rgba(255,255,255,0)');
    sg.addColorStop(0.5, 'rgba(255,255,255,0.8)');
    sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + len, sy + len * 0.3);
    ctx.strokeStyle = sg;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}
```

**Commit:** `feat: rewrite NEBULA mode with audio-reactive stars, nebula, and shooting star`

---

## STEP 4: FIX AUDIO PERMISSION UX

The current "CONNECT AUDIO" button in the top right corner is the worst possible UX for this. The user has no idea what clicking it does or why.

Replace it with this flow:
1. When the visualizer page loads, after 1.5 seconds, a centered `AudioPermissionCard` appears OVER the canvas.
2. Card text (Cormorant Garamond Italic, large): *"To see the music, share your browser tab's audio."*
3. Sub-text (DM Mono, small): *"Click 'Share Audio' → select your browser tab → check 'Share audio'"*
4. One large glowing button: **SHARE AUDIO** 
5. If user clicks and denies: card remains with message *"Audio not connected. Visuals will run in ambient mode."* + a dimmer dismiss button.
6. If connected: card dissolves with a cinematic opacity fade.
7. Keep a small indicator in the top-right: either a pulsing green dot (connected) or a subtle "SHARE AUDIO" ghost text (not connected). Not a full button.

**Commit:** `fix: redesign audio permission flow with centered card and connection indicator`

---

## STEP 5: FIX SONG TITLE

Currently shows "Unknown Masterpiece". This happens because the YouTube player is not receiving the video title from the IFrame API.

Fix in `useYouTubePlayer.ts`:
```typescript
player.addEventListener('onReady', (event) => {
  const videoData = event.target.getVideoData();
  setTitle(videoData.title || 'Unknown');
  setArtist(videoData.author || 'SYNÆSTHESIA');
});
```

**Commit:** `fix: fetch video title and author from YouTube IFrame API onReady`

---

## STEP 6: VISUAL POLISH — NON-NEGOTIABLE

These are not optional. These are what separate a 0/10 from a 9/10.

### Canvas must use `devicePixelRatio`:
```typescript
const dpr = window.devicePixelRatio || 1;
canvas.width = width * dpr;
canvas.height = height * dpr;
ctx.scale(dpr, dpr);
canvas.style.width = width + 'px';
canvas.style.height = height + 'px';
```
Without this, everything looks blurry on retina screens. Non-negotiable.

**Commit:** `fix: apply devicePixelRatio scaling to canvas for retina sharpness`

### Mode selector:
- The mode pills must show the currently active mode with a violet fill + glow.
- Inactive pills: transparent, text-secondary.
- Use Framer Motion `layoutId="active-pill"` for a sliding indicator.
- Font: DM Mono, uppercase, letter-spacing 0.1em.

**Commit:** `style: fix mode selector active state with Framer Motion sliding indicator`

### Controls bar:
- Must have a `backdrop-filter: blur(20px)` glass background.
- Song title in Cormorant Garamond, artist name in DM Mono text-secondary.
- Play/pause button: large circle, violet fill, white icon.
- Volume slider: custom styled, violet accent.
- Never show "Unknown Masterpiece" — fix Step 5 first.

**Commit:** `style: rebuild controls bar with glassmorphism and proper layout`

---

## STEP 7: LANDING PAGE FIXES

The landing page is actually the least broken thing, but these are required:

1. The wordmark `SYNÆSTHESIA` must use `Cinzel Decorative` font (currently appears to be using a sans-serif). Verify `next/font/google` is loading it correctly.
2. The Æ ligature must have a noticeably stronger `text-shadow` glow than other letters.
3. The search bar must have a visible, styled focus state (violet border glow, no default browser outline).
4. Search results must render as proper cards with thumbnail, title, and channel name — not plain text.

**Commit:** `fix: apply Cinzel Decorative to wordmark, fix Æ glow, style search results`

---

## FINAL VALIDATION CHECKLIST

Before any commit is pushed, verify:

- [ ] Landing page: SYNÆSTHESIA wordmark uses Cinzel Decorative, letters animate in one by one, Æ glows brighter
- [ ] Landing page: Search returns real YouTube results as thumbnail cards
- [ ] Visualizer: All 5 modes render at 60fps with NO frozen/static frames
- [ ] Visualizer: In idle (no audio), all modes still animate beautifully (not black screens)
- [ ] Visualizer: After sharing audio, visuals demonstrably change with the music's beat
- [ ] Visualizer: ECHO mode emits rings on every bass hit, not a single dot
- [ ] Visualizer: AURORA mode shows animated sine waves, not flat horizontal bands
- [ ] Visualizer: PRISM mode shows a rotating mandala that reacts to frequency data
- [ ] Visualizer: VOID mode has 300+ particles that explode on bass
- [ ] Visualizer: NEBULA mode has a starfield where stars twinkle to treble frequencies
- [ ] Canvas: Sharp on retina screens (devicePixelRatio applied)
- [ ] Controls: Song title shows real track name, not "Unknown Masterpiece"
- [ ] Controls: Mode selector has animated sliding active indicator
- [ ] No TypeScript errors in strict mode
- [ ] No console errors or warnings in production build

---

*This is not a redesign. This is a repair of what was built. Every item above is a correction to something that was built wrong or not built at all. Execute in the exact order listed. Atomic commits. No exceptions.*
