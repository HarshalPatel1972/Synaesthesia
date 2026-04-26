import { RenderFn } from "@/types/visualizer";

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  opacity: number;
}

let stars: Star[] = [];
const STAR_COUNT = 600;

function initStars(width: number, height: number) {
  stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * width,
      size: Math.random() * 2 + 0.1,
      opacity: Math.random(),
    });
  }
}

export const renderNebula: RenderFn = (ctx, width, height, audio, time, frame) => {
  if (stars.length === 0) initStars(width, height);

  const { bass, mid, treble, amplitude } = audio;

  ctx.fillStyle = "#000005";
  ctx.fillRect(0, 0, width, height);

  // Central Nebula
  const nebulaRadius = (width * 0.3) + (bass * 100);
  const hue = (time * 0.01) % 360;
  const nebulaGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, nebulaRadius);
  nebulaGrad.addColorStop(0, `hsla(${hue}, 80%, 40%, ${0.2 + amplitude * 0.3})`);
  nebulaGrad.addColorStop(1, "rgba(0, 0, 5, 0)");
  
  ctx.fillStyle = nebulaGrad;
  ctx.globalCompositeOperation = "screen";
  ctx.fillRect(0, 0, width, height);

  // Stars
  ctx.globalCompositeOperation = "source-over";
  stars.forEach((s) => {
    // Parallax motion
    s.x -= (0.1 + mid * 0.5) * (s.size / 2);
    if (s.x < 0) s.x = width;

    const twinkle = Math.sin(time * 0.005 + s.x) * 0.5 + 0.5;
    const finalOpacity = s.opacity * twinkle * (0.5 + treble * 0.5);
    
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
    ctx.fill();
    
    if (treble > 0.9) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = "white";
    }
  });

  // Shooting star
  if (amplitude > 0.85 && frame % 100 === 0) {
    // Logic for shooting star could be added here
  }

  ctx.shadowBlur = 0;
};
