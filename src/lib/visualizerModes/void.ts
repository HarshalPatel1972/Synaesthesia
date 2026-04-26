import { RenderFn } from "@/types/visualizer";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

let particles: Particle[] = [];
const PARTICLE_COUNT = 400;

function initParticles(width: number, height: number) {
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 2 + 1,
      color: "#7B2FFF",
    });
  }
}

export const renderVoid: RenderFn = (ctx, width, height, audio, time, frame) => {
  if (particles.length === 0) initParticles(width, height);

  const { bass, mid, treble, amplitude } = audio;
  
  // Dynamic background with slight trail
  ctx.fillStyle = "rgba(0, 0, 5, 0.15)";
  ctx.fillRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height / 2;

  particles.forEach((p) => {
    // Gravitational pull to center
    const dx = centerX - p.x;
    const dy = centerY - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Bass pushes particles out
    const force = bass * 15;
    const angle = Math.atan2(dy, dx);
    
    p.vx += (Math.cos(angle) * dist * 0.0001) - (Math.cos(angle) * force * (100 / dist));
    p.vy += (Math.sin(angle) * dist * 0.0001) - (Math.sin(angle) * force * (100 / dist));
    
    // Treble creates jitter
    p.vx += (Math.random() - 0.5) * treble * 5;
    p.vy += (Math.random() - 0.5) * treble * 5;

    // Friction
    p.vx *= 0.98;
    p.vy *= 0.98;

    p.x += p.vx;
    p.y += p.vy;

    // Boundary check
    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;

    // Draw particle with trail
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
    
    const hue = 260 + mid * 60; // Violet to Cyan range
    ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${0.3 + amplitude * 0.7})`;
    ctx.lineWidth = p.size * (1 + amplitude);
    ctx.stroke();
  });

  // Peak amplitude flash
  if (bass > 0.8) {
    ctx.fillStyle = "rgba(123, 47, 255, 0.05)";
    ctx.fillRect(0, 0, width, height);
  }
};
