import { AudioData, RenderFn } from "@/types/visualizer";

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinklePhase: number;
  twinkleSpeed: number;
  binIndex: number; // which treble bin drives this star's brightness
}

let stars: Star[] = [];
let starsInitialized = false;

export const renderNebula: RenderFn = (
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  audio: AudioData,
  time: number
) => {
  ctx.fillStyle = "rgba(0, 0, 5, 0.3)";
  ctx.fillRect(0, 0, W, H);

  if (!starsInitialized) {
    stars = Array.from({ length: 700 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      size: 0.5 + Math.random() * 2,
      brightness: 0.3 + Math.random() * 0.7,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.5 + Math.random() * 2,
      binIndex: 100 + Math.floor(Math.random() * 400), // treble range
    }));
    starsInitialized = true;
  }

  const cx = W / 2;
  const cy = H / 2;

  // Nebula cloud — radius driven by bass, hue driven by mid
  const nebulaRadius = Math.min(W, H) * 0.25 * (1 + audio.bass * 1.5);
  const hue = 250 + audio.mid * 100 + ((time * 0.01) % 360);

  // Outer glow
  const nebGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, nebulaRadius * 2);
  nebGlow.addColorStop(0, `hsla(${hue}, 80%, 50%, ${0.06 + audio.bass * 0.12})`);
  nebGlow.addColorStop(0.5, `hsla(${hue + 30}, 80%, 40%, ${0.03 + audio.bass * 0.06})`);
  nebGlow.addColorStop(1, "transparent");
  ctx.beginPath();
  ctx.arc(cx, cy, nebulaRadius * 2, 0, Math.PI * 2);
  ctx.fillStyle = nebGlow;
  ctx.fill();

  // Core
  const nebCore = ctx.createRadialGradient(cx, cy, 0, cx, cy, nebulaRadius);
  nebCore.addColorStop(0, `hsla(${hue}, 100%, 80%, ${0.15 + audio.amplitude * 0.3})`);
  nebCore.addColorStop(0.6, `hsla(${hue + 20}, 90%, 50%, ${0.08 + audio.bass * 0.1})`);
  nebCore.addColorStop(1, "transparent");
  ctx.beginPath();
  ctx.arc(cx, cy, nebulaRadius, 0, Math.PI * 2);
  ctx.fillStyle = nebCore;
  ctx.fill();

  // Stars — each star's brightness driven by its assigned treble bin
  stars.forEach((star) => {
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
    sg.addColorStop(0, "rgba(255,255,255,0)");
    sg.addColorStop(0.5, "rgba(255,255,255,0.8)");
    sg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + len, sy + len * 0.3);
    ctx.strokeStyle = sg;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
};
