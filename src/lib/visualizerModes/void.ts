import { AudioData, RenderFn } from "@/types/visualizer";

const PARTICLE_COUNT = 400;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  angle: number;
  orbitRadius: number;
  orbitSpeed: number;
  hue: number;
}

let particles: Particle[] = [];
let initialized = false;

export const renderVoid: RenderFn = (
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  audio: AudioData,
  time: number,
  frame: number
) => {
  if (!initialized || particles.length === 0) {
    particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: W / 2,
      y: H / 2,
      vx: 0,
      vy: 0,
      baseRadius: 1 + Math.random() * 2,
      angle: (i / PARTICLE_COUNT) * Math.PI * 2,
      orbitRadius: 20 + Math.random() * 200,
      orbitSpeed: 0.001 + Math.random() * 0.003,
      hue: 260 + Math.random() * 80,
    }));
    initialized = true;
  }

  // Persistent trail: don't clear fully — overlay semi-transparent black
  ctx.fillStyle = "rgba(0, 0, 5, 0.15)";
  ctx.fillRect(0, 0, W, H);

  const cx = W / 2;
  const cy = H / 2;
  const bassForce = audio.bass * 8; // bass = explosive force
  const trebleTrail = audio.treble; // treble = trail length
  const midHue = audio.mid * 120; // mid = color temperature

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
};
