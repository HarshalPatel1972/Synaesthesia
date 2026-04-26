import { RenderFn } from "@/types/visualizer";

export const renderPrism: RenderFn = (ctx, width, height, audio, time, frame) => {
  const { bass, mid, treble, amplitude } = audio;
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.fillStyle = "#000005";
  ctx.fillRect(0, 0, width, height);

  const sides = 6;
  const radius = 150 + amplitude * 100;
  const rotation = time * 0.0005 + mid * 2;

  // Draw 8-fold symmetry
  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((i * Math.PI) / 4);

    // Fractal geometry
    drawShape(ctx, 0, 0, radius, sides, rotation, audio);
    
    ctx.restore();
  }

  // Chromatic aberration on bass spike
  if (bass > 0.8) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.translate(Math.random() * 10 - 5, Math.random() * 10 - 5);
    drawShape(ctx, centerX, centerY, radius, sides, rotation, audio, "#FF2975");
    ctx.restore();
  }
};

function drawShape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  sides: number,
  rotation: number,
  audio: any,
  overrideColor?: string
) {
  const { treble, amplitude } = audio;
  
  ctx.beginPath();
  for (let i = 0; i <= sides; i++) {
    const angle = (i * 2 * Math.PI) / sides + rotation;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
    
    // Treble details
    if (treble > 0.5) {
      ctx.moveTo(px, py);
      ctx.lineTo(x + Math.cos(angle) * (radius + 50), y + Math.sin(angle) * (radius + 50));
    }
  }
  
  ctx.strokeStyle = overrideColor || `hsla(260, 100%, 70%, ${0.5 + amplitude * 0.5})`;
  ctx.lineWidth = 2 + amplitude * 5;
  ctx.stroke();

  // Recursive smaller shapes
  if (radius > 50) {
    drawShape(ctx, x, y, radius * 0.6, sides, -rotation * 1.5, audio, overrideColor);
  }
}
