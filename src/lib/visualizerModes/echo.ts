import { AudioData, RenderFn } from "@/types/visualizer";

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
const COLORS = ["#7B2FFF", "#00F5FF", "#FF2975", "#FF6B00", "#FFD700"];
let colorIdx = 0;

export const renderEcho: RenderFn = (
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  audio: AudioData,
  time: number
) => {
  ctx.fillStyle = "rgba(0, 0, 5, 0.18)";
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
    ctx.strokeStyle = ring.color + Math.floor(alpha * 255).toString(16).padStart(2, "0");
    ctx.lineWidth = ring.lineWidth * (1 - progress * 0.5);
    ctx.stroke();

    // Glow duplicate
    ctx.beginPath();
    ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2);
    ctx.strokeStyle = ring.color + Math.floor(alpha * 100).toString(16).padStart(2, "0");
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
  orb.addColorStop(1, "rgba(123, 47, 255, 0)");
  ctx.beginPath();
  ctx.arc(cx, cy, waveRadius * 0.6, 0, Math.PI * 2);
  ctx.fillStyle = orb;
  ctx.fill();
};
