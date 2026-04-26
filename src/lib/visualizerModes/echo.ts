import { RenderFn } from "@/types/visualizer";

interface Ripple {
  x: number;
  y: number;
  radius: number;
  speed: number;
  color: string;
  opacity: number;
}

let ripples: Ripple[] = [];
const MAX_RIPPLES = 30;

export const renderEcho: RenderFn = (ctx, width, height, audio, time, frame) => {
  const { bass, mid, treble, amplitude } = audio;
  
  ctx.fillStyle = "rgba(0, 0, 5, 0.2)";
  ctx.fillRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height / 2;

  // Emit new ripple on bass peak
  if (bass > 0.7 && ripples.length < MAX_RIPPLES) {
    const colors = ["#00F5FF", "#FF2975", "#FF6B00", "#7B2FFF"];
    ripples.push({
      x: centerX,
      y: centerY,
      radius: 0,
      speed: 2 + bass * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 0.8,
    });
  }

  // Treble micro-ripples
  if (treble > 0.8 && frame % 10 === 0) {
    ripples.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0,
      speed: 1 + treble * 5,
      color: "#00F5FF",
      opacity: 0.4,
    });
  }

  // Update and draw ripples
  ripples = ripples.filter((r) => r.opacity > 0.01);
  ripples.forEach((r) => {
    r.radius += r.speed;
    r.opacity *= 0.98;

    ctx.beginPath();
    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
    ctx.strokeStyle = r.color + Math.floor(r.opacity * 255).toString(16).padStart(2, '0');
    ctx.lineWidth = 1 + amplitude * 10;
    ctx.stroke();
    
    // Glowing ring
    ctx.shadowBlur = 15;
    ctx.shadowColor = r.color;
  });

  // Central orb
  ctx.beginPath();
  ctx.arc(centerX, centerY, 20 + amplitude * 40, 0, Math.PI * 2);
  const orbGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 20 + amplitude * 40);
  orbGrad.addColorStop(0, "#7B2FFF");
  orbGrad.addColorStop(1, "rgba(123, 47, 255, 0)");
  ctx.fillStyle = orbGrad;
  ctx.fill();
  
  ctx.shadowBlur = 0;
};
