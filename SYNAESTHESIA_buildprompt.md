# SYNÆSTHESIA — Full Agent Build Prompt

---

## AGENT RULES (NON-NEGOTIABLE — ALWAYS ENFORCE)

1. **Atomic commits only.** Every commit must do exactly one thing. Example: `feat: add aurora visualizer mode`, `fix: correct analyser FFT buffer size`, `style: apply void-black background to canvas`. Never bundle unrelated changes.
2. **Safe coding.** No `dangerouslySetInnerHTML`, no `eval()`, no `innerHTML` with user-supplied data, no raw DOM injection without sanitisation.
3. **Secure coding.** All API keys go in `.env.local` only. Never hardcode secrets. Never log sensitive values. Add `.env.local` to `.gitignore` immediately. Use `NEXT_PUBLIC_` prefix only for values that are genuinely safe to expose to the browser.
4. **No broken states.** Every feature must be wrapped with proper loading, error, and empty states. Never leave the UI in an undefined visual condition.
5. **TypeScript strict mode** is always on. No `any` types without a comment justifying why.

---

## PROJECT OVERVIEW

**Name:** SYNÆSTHESIA  
**Tagline:** *If sound were visible, it would look like this.*  
**Repo:** https://github.com/HarshalPatel1972/Synaesthesia  
**Deployment:** Vercel (free tier)  
**Core Idea:** A cinematic, full-screen music visualizer. User pastes a YouTube URL or searches a song. The video plays (hidden or minimal UI), and the audio is captured via the browser's `getDisplayMedia` API (user grants audio share permission). The Web Audio API's `AnalyserNode` reads real-time frequency/waveform data and drives extraordinary generative visuals on a `<canvas>` element.

---

## TECH STACK

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v3 + CSS custom properties |
| Animation (UI) | Framer Motion |
| Canvas Rendering | Native Canvas 2D API (no Three.js — keep it lean) |
| Audio Analysis | Web Audio API (`AudioContext`, `AnalyserNode`, `createMediaStreamSource`) |
| YouTube Playback | YouTube IFrame Player API (loaded via script tag) |
| YouTube Search | YouTube Data API v3 |
| Font Loading | `next/font` (Google Fonts) |
| Env Management | `.env.local` with `NEXT_PUBLIC_` prefix for browser-safe keys |
| Linting | ESLint + Prettier |
| Deployment | Vercel |

---

## ENVIRONMENT VARIABLES

Create `.env.local` at project root. Add it to `.gitignore` immediately.

```
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_data_api_v3_key_here
```

Never commit this file. Add a `.env.example` with placeholder values for documentation.

---

## DESIGN SYSTEM

### Philosophy
**Void Bioluminescence** — The universe before the Big Bang: absolute darkness punctuated by living light. Every visual element should feel like it is glowing from within, not lit from outside. The experience is cinematic, immersive, and deeply emotional. It should feel like standing inside the music.

### Color Palette (CSS Custom Properties)
```css
:root {
  --void:        #000005;   /* near-absolute black, the canvas bg */
  --deep-violet: #1A0533;   /* dark purple undertone */
  --neon-violet: #7B2FFF;   /* primary brand accent */
  --cyan:        #00F5FF;   /* electric highlight */
  --magenta:     #FF2975;   /* emotional peak color */
  --solar:       #FF6B00;   /* warm energy accent */
  --gold:        #FFD700;   /* rare, used only for peak amplitude moments */
  --smoke:       rgba(255,255,255,0.04); /* glassmorphism tint */
  --text-primary:   #E8E8F0;
  --text-secondary: rgba(232,232,240,0.5);
  --border-glass:   rgba(123,47,255,0.2);
}
```

### Typography (via `next/font`)
- **Display / Logo:** `Cinzel Decorative` — regal, timeless, cinematic. Used for the SYNÆSTHESIA wordmark and large headings only.
- **UI / Controls:** `DM Mono` — clean monospace, feels technical and precise.
- **Body / Descriptions:** `Cormorant Garamond` (Italic weight) — editorial, emotional.

Load all three via `next/font/google`. Apply globally in `layout.tsx` using CSS variables.

### Motion Principles
- All UI elements enter with a cinematic staggered fade-up (Framer Motion, 60ms stagger).
- The canvas visualizer itself never transitions — it is always alive, always running (even on idle, show ambient slow-pulse).
- Hover states use `scale(1.03)` + glow intensification, never color changes alone.
- Page transitions: full-screen void fade (opacity 0→1 over 800ms).
- No bounce easing anywhere. Use `easeOut` or custom cubic bezier `[0.16, 1, 0.3, 1]`.

---

## FILE STRUCTURE

```
synaesthesia/
├── .env.local                  (gitignored)
├── .env.example
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── public/
│   └── favicon.ico             (custom — simple glowing dot SVG converted)
├── src/
│   ├── app/
│   │   ├── layout.tsx          (global fonts, metadata, providers)
│   │   ├── page.tsx            (landing / intro page)
│   │   ├── globals.css         (CSS vars, resets, scrollbar style)
│   │   └── visualizer/
│   │       └── page.tsx        (main visualizer experience)
│   ├── components/
│   │   ├── intro/
│   │   │   ├── HeroTitle.tsx       (animated SYNÆSTHESIA wordmark)
│   │   │   ├── SearchBar.tsx       (YouTube search input)
│   │   │   └── ParticleField.tsx   (ambient background particles on landing)
│   │   ├── visualizer/
│   │   │   ├── VisualizerCanvas.tsx    (main canvas, receives analyser data)
│   │   │   ├── ModeSelector.tsx        (pill tabs for switching viz modes)
│   │   │   ├── AudioPermissionCard.tsx (getDisplayMedia permission UI)
│   │   │   └── PlayerControls.tsx      (minimal play/pause/volume UI overlay)
│   │   ├── youtube/
│   │   │   ├── YouTubePlayer.tsx    (hidden iframe wrapper, exposes player API)
│   │   │   └── SearchResults.tsx    (search result cards)
│   │   └── ui/
│   │       ├── GlassCard.tsx       (reusable glassmorphism card)
│   │       ├── NeonButton.tsx      (reusable glow button)
│   │       └── LoadingPulse.tsx    (ambient loading indicator)
│   ├── hooks/
│   │   ├── useAudioAnalyser.ts    (Web Audio API setup and frame loop)
│   │   ├── useYouTubePlayer.ts    (IFrame API hook)
│   │   └── useVisualizerMode.ts   (active mode state)
│   ├── lib/
│   │   ├── youtube.ts             (YouTube Data API v3 fetch helpers)
│   │   ├── audioUtils.ts          (FFT smoothing, frequency band helpers)
│   │   └── visualizerModes/
│   │       ├── index.ts           (mode registry and types)
│   │       ├── aurora.ts          (Aurora mode renderer)
│   │       ├── void.ts            (Void Particles mode renderer)
│   │       ├── prism.ts           (Prism Geometry mode renderer)
│   │       ├── echo.ts            (Echo Ripples mode renderer)
│   │       └── nebula.ts          (Nebula mode renderer)
│   └── types/
│       ├── youtube.d.ts           (YouTube IFrame API type declarations)
│       └── visualizer.d.ts        (VisualizerMode interface, AudioData type)
```

---

## PAGES

### 1. Landing Page — `/` (`app/page.tsx`)

**Experience:**
- Full viewport, void black background.
- Ambient floating particle field (40–60 particles, slow drift, subtle violet glow — canvas or CSS).
- Center: The SYNÆSTHESIA wordmark animates in letter by letter, each letter arriving from random Y offsets, settling with a flicker effect (like a neon sign powering on). Use `Cinzel Decorative` font. White text with a soft violet text-shadow glow.
- Below the title: Tagline fades in — *"If sound were visible, it would look like this."* — in `Cormorant Garamond Italic`, text-secondary color.
- Below tagline: A search bar with glass background, subtle violet border, placeholder text `Search a song or paste a YouTube URL...`. On submit, show search results below. On result click, navigate to `/visualizer?v=VIDEO_ID`.
- Optional: A "Try with a random masterpiece" button that pre-loads a curated video ID.
- Bottom: A tiny `DM Mono` credit line — `SYNÆSTHESIA © 2025` — in text-secondary.

**Animations:**
- Wordmark: Staggered letter entrance, 40ms per letter, `easeOut`.
- Tagline: 800ms delay, fade up.
- Search bar: 1200ms delay, fade up + slight scale from 0.96.
- Particle field: starts at page load, runs indefinitely.

---

### 2. Visualizer Page — `/visualizer` (`app/visualizer/page.tsx`)

**Experience:**
- Full viewport, void black.
- The YouTube player is **hidden** (positioned absolutely off-screen or rendered at 1px × 1px to satisfy IFrame API requirements). It still plays audio.
- Full-screen `<canvas>` renders the active visualization mode.
- Bottom overlay (glassmorphism bar, 80px height, blur backdrop): song title, artist, playback time, play/pause button, volume slider, mode selector pills.
- Top-left: SYNÆSTHESIA logo in small text, links back to `/`.
- Top-right: "Share Screen Audio" button — triggers `getDisplayMedia`. Shows status (connected / not connected).
- If audio not yet captured: canvas shows a beautiful idle animation (slow aurora drift, pulsing at ~60bpm as default).
- If audio captured: canvas reacts to real frequency data in real time.

**Audio Permission Flow:**
1. User arrives at `/visualizer?v=VIDEO_ID`.
2. YouTube player loads and begins playing.
3. A centered `AudioPermissionCard` overlays the canvas — elegant glass card: *"To visualize the music, share your browser tab's audio."* + a glowing "Share Audio" button.
4. On click: call `navigator.mediaDevices.getDisplayMedia({ audio: true, video: false })`.
5. On success: dismiss the card, connect stream to `AudioContext` → `AnalyserNode`, start the render loop.
6. On error or denial: show a friendly fallback message + offer to continue with idle visualizer.

---

## AUDIO ENGINE (`hooks/useAudioAnalyser.ts`)

```typescript
// Pseudocode — agent writes full implementation
const stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: false });
const audioCtx = new AudioContext();
const source = audioCtx.createMediaStreamSource(stream);
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;          // 1024 frequency bins
analyser.smoothingTimeConstant = 0.82;
source.connect(analyser);
// Do NOT connect to audioCtx.destination — we don't want double audio

// Each animation frame:
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
analyser.getByteFrequencyData(dataArray);  // frequency spectrum
analyser.getByteTimeDomainData(waveArray); // waveform

// Expose: dataArray, waveArray, bass, mid, treble (derived band averages), overallAmplitude
```

Derive frequency bands:
- **Bass:** bins 0–10 (20–250 Hz)
- **Mid:** bins 10–100 (250Hz–2kHz)  
- **Treble:** bins 100–512 (2kHz–20kHz)
- **Amplitude:** RMS of waveform data

Hook returns: `{ frequencyData, waveformData, bass, mid, treble, amplitude, isActive }`.

---

## VISUALIZER MODES

Each mode is a pure render function with signature:
```typescript
type RenderFn = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  audio: AudioData,
  time: number,       // ms since start
  frame: number
) => void;
```

---

### Mode 1: VOID — *Particle Storm*
**Concept:** Hundreds of particles orbit a central attractor. Bass pushes them outward in explosive bursts. Treble creates trails. Mid controls color temperature.

- 300–500 particles, each with position, velocity, mass.
- At rest: slow circular drift, violet glow.
- Bass spike: gravitational repulsion pulse — particles burst outward then are pulled back.
- Color: lerp from `--neon-violet` → `--cyan` based on mid frequency.
- Each particle draws a line to its previous position (motion trail), length proportional to speed.
- On extreme bass: brief full-canvas flash (opacity 0.03 white overlay).

---

### Mode 2: AURORA — *Wave Landscape*
**Concept:** Multiple layered sine waves drawn as filled paths. The waves breathe and morph in real time. It looks like the Northern Lights condensed into a 2D plane.

- 5–7 wave layers, each with different frequency, phase, amplitude, and color.
- Wave amplitude driven by: overall amplitude (height), bass (layer 0–2 intensity), treble (layer 4–6 ripple frequency).
- Colors: violet → cyan → magenta, layered with `globalAlpha` 0.15–0.4.
- Background: slow gradient shift between `--void` and `--deep-violet` based on mid.
- Vertical offset: layers stacked in bottom 40% of canvas, rippling upward.
- On peak amplitude: layers briefly overshoot and create a cascade effect.

---

### Mode 3: PRISM — *Sacred Geometry*
**Concept:** A central geometric mandala that rotates, fractures, and rebuilds based on frequency data. Looks like a kaleidoscope made of light.

- Central polygon (6–12 sides, morphs over time), radius driven by amplitude.
- Bass: triggers a "shatter" — polygon breaks into N triangle fragments, each flying outward, then snapping back.
- Mid: controls rotation speed of outer ring of smaller shapes.
- Treble: creates micro-line details — thin radial lines extending from vertices.
- Color: monochromatic violet normally. On bass spike: full RGB split (red/green/blue offset drawn separately for chromatic aberration effect).
- Mirror mode: draw 8-fold symmetry.

---

### Mode 4: ECHO — *Ripple Field*
**Concept:** Concentric rings expand from the center like dropping a stone in water. Each ring's size, speed, and opacity are frequency-driven.

- On each beat/bass spike: emit a new ring with radius=0 from center.
- Rings expand at a rate proportional to `bass` at birth.
- Ring color: cycle through `--cyan`, `--magenta`, `--solar` on each new emission.
- Ring opacity decays as it grows (0.8 → 0).
- Multiple rings coexist (up to 20 active rings).
- Secondary micro-rings from treble: tiny high-frequency rings appear at random edge positions.
- Center: a small pulsing orb, glowing at `amplitude` intensity.

---

### Mode 5: NEBULA — *Deep Space*
**Concept:** A starfield with a volumetric nebula cloud in the center. Stars twinkle to treble, nebula breathes to bass, and the whole scene shifts to mid frequency colors.

- 600+ stars (dots of varying opacity and size), twinkling based on treble bin values.
- Central nebula: a large radial gradient blob, radius and opacity driven by bass + amplitude.
- Nebula color: slow hue rotation over time, biased by mid (warm → cool → warm).
- Shooting stars: on very high amplitude (threshold 0.85+), a streak animation crosses the screen.
- Parallax: stars at different depth layers scroll at different rates on idle.
- On bass: nebula expands and pulses outward, leaving an afterglow.

---

## YOUTUBE INTEGRATION

### Search (`lib/youtube.ts`)
```typescript
// GET https://www.googleapis.com/youtube/v3/search
// params: part=snippet, type=video, q=userQuery, key=NEXT_PUBLIC_YOUTUBE_API_KEY, maxResults=8, videoCategoryId=10 (music)
// Returns: array of { videoId, title, channelTitle, thumbnailUrl }
```

- Debounce search input by 400ms.
- Show skeleton loading cards while fetching.
- Show result cards: thumbnail, title, channel name. Card hover: neon border glow.
- On card click: route to `/visualizer?v=VIDEO_ID`.

### Player (`components/youtube/YouTubePlayer.tsx`)
- Load YouTube IFrame API via `<Script src="https://www.youtube.com/iframe_api" strategy="afterInteractive" />`.
- Create player with `playerVars: { autoplay: 1, controls: 0, modestbranding: 1, rel: 0 }`.
- Player div is positioned `position: absolute; left: -9999px; width: 1px; height: 1px;` — off screen but alive.
- Expose `{ play, pause, setVolume, getDuration, getCurrentTime, playerState }` via ref/callback.
- Handle `onReady`, `onStateChange`, `onError` events.

---

## COMPONENT SPECIFICATIONS

### `GlassCard.tsx`
```css
background: var(--smoke);
border: 1px solid var(--border-glass);
backdrop-filter: blur(20px);
border-radius: 16px;
box-shadow: 0 0 40px rgba(123, 47, 255, 0.08), inset 0 1px 0 rgba(255,255,255,0.05);
```

### `NeonButton.tsx`
- Base: transparent bg, 1px solid `--neon-violet`, text in `--text-primary`.
- Hover: bg becomes `rgba(123,47,255,0.15)`, box-shadow `0 0 24px rgba(123,47,255,0.4)`.
- Active: scale(0.97), glow intensifies.
- Variants: `primary` (violet), `danger` (magenta), `accent` (cyan).

### `ModeSelector.tsx`
- Horizontal pill group. Active pill: filled with `--neon-violet` background, glow. Inactive: glass, no fill.
- Mode labels: VOID / AURORA / PRISM / ECHO / NEBULA — in `DM Mono`, uppercase, small size.
- Animated sliding indicator underline (Framer Motion `layoutId`).

### `HeroTitle.tsx`
- Each character of "SYNÆSTHESIA" is a separate `<span>`.
- Entrance animation: `y: [40, 0]`, `opacity: [0, 1]`, `filter: ["blur(8px)", "blur(0px)"]`.
- Post-entrance: random characters occasionally "flicker" (opacity 0.4 → 1 over 80ms) — neon sign effect.
- The Æ ligature is styled with extra glow — it's the soul of the brand.
- Text: `Cinzel Decorative`, large (clamp 3rem → 8rem), white with `text-shadow: 0 0 40px rgba(123,47,255,0.6)`.

---

## RENDER LOOP ARCHITECTURE

```typescript
// In VisualizerCanvas.tsx
useEffect(() => {
  let animationId: number;
  let frame = 0;
  const startTime = performance.now();

  const loop = () => {
    const time = performance.now() - startTime;
    ctx.clearRect(0, 0, width, height);
    
    // Fill void background
    ctx.fillStyle = '#000005';
    ctx.fillRect(0, 0, width, height);
    
    // Run active mode renderer
    activeModeRenderer(ctx, width, height, audioData, time, frame);
    
    frame++;
    animationId = requestAnimationFrame(loop);
  };

  animationId = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(animationId);
}, [activeMode, audioData]);
```

- Canvas must resize on `window.resize` (debounced 100ms).
- Use `devicePixelRatio` for retina sharpness: `canvas.width = width * dpr`.
- Target 60fps. If frame takes >16ms, skip optional effects (reduce particle count).

---

## PERFORMANCE RULES

1. **Never** allocate new arrays inside the render loop. Pre-allocate `Float32Array` / `Uint8Array` buffers.
2. **Never** call `analyser.getByteFrequencyData` more than once per frame.
3. Mode renderers must complete in under 8ms on average.
4. Canvas `willReadFrequently: false` (we never read back pixel data).
5. Particle arrays are pre-allocated at mode init, not per-frame.
6. Use `ctx.save()` / `ctx.restore()` correctly — never leak canvas state.

---

## ACCESSIBILITY

- All interactive elements have `aria-label`.
- Focus states use a visible violet outline (not hidden).
- `prefers-reduced-motion`: if set, disable canvas animations and show a static frequency bar fallback.
- Color is never the sole differentiator for mode selection.

---

## BUILD SEQUENCE (ATOMIC COMMITS IN THIS ORDER)

1. `chore: init Next.js 14 project with TypeScript and Tailwind`
2. `chore: add .env.example and configure .gitignore`
3. `style: define CSS custom properties and global typography`
4. `feat: implement GlassCard and NeonButton UI primitives`
5. `feat: build HeroTitle animated wordmark component`
6. `feat: build ParticleField ambient background for landing`
7. `feat: implement YouTube Data API search in lib/youtube.ts`
8. `feat: build SearchBar with debounce and YouTube search results`
9. `feat: complete landing page layout and routing`
10. `feat: implement YouTubePlayer hidden IFrame wrapper hook`
11. `feat: build useAudioAnalyser hook with getDisplayMedia and AnalyserNode`
12. `feat: build AudioPermissionCard component with permission flow`
13. `feat: implement VOID particle storm visualizer mode`
14. `feat: implement AURORA wave landscape visualizer mode`
15. `feat: implement PRISM sacred geometry visualizer mode`
16. `feat: implement ECHO ripple field visualizer mode`
17. `feat: implement NEBULA deep space visualizer mode`
18. `feat: build VisualizerCanvas with render loop and mode switching`
19. `feat: build ModeSelector pill tabs with Framer Motion indicator`
20. `feat: build PlayerControls overlay with play/pause/volume`
21. `feat: assemble complete visualizer page`
22. `feat: implement canvas resize handler with devicePixelRatio`
23. `feat: add prefers-reduced-motion accessibility fallback`
24. `chore: configure next.config.js for Vercel deployment`
25. `chore: add Vercel deployment config and environment variable docs`

---

## VERCEL DEPLOYMENT

- Add `NEXT_PUBLIC_YOUTUBE_API_KEY` to Vercel project environment variables (Settings → Environment Variables).
- Restrict YouTube API key in Google Cloud Console to your Vercel domain and `localhost` for development.
- Enable YouTube Data API v3 in Google Cloud Console.
- `next.config.js`: add `images.domains: ['i.ytimg.com']` for YouTube thumbnails.

---

## WHAT MAKES THIS A MASTERPIECE

- **The Æ**: The ligature in SYNÆSTHESIA is not just a character — it is the soul of the brand. It flickers more than other letters. In the PRISM mode, the central polygon has 6 sides (Æ has 6 strokes). This is the kind of hidden craft that separates art from product.
- **Sound-to-color mapping is emotional, not mechanical.** Bass is always warm (violet/magenta). Treble is always cool (cyan). This mirrors how humans actually feel low vs high frequencies.
- **Idle state is not boring.** Even with no audio input, the visualizer breathes — a slow 60bpm aurora drift. The website is never static.
- **The permission flow is not a popup.** It's a beautiful glass card mid-canvas with elegant copy. The "permission ask" moment is designed, not default.
- **The canvas fills the entire world.** No whitespace. No padding. The visualization bleeds to every pixel of the viewport.

---

*Build this with the same obsession you'd bring to a generational work. Every pixel is intentional. Every animation has a reason. This is SYNÆSTHESIA.*
