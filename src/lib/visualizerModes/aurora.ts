import { RenderFn } from "@/types/visualizer";

export const renderAurora: RenderFn = (ctx, width, height, audio, time, frame) => {
  const { bass, mid, treble, amplitude } = audio;

  // Background gradient shift
  const bgGrad = ctx.createRadialGradient(width / 2, height, 0, width / 2, height, width);
  bgGrad.addColorStop(0, `rgba(26, 5, 51, ${0.1 + mid * 0.2})`);
  bgGrad.addColorStop(1, "#000005");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const layers = 6;
  const colors = ["#7B2FFF", "#00F5FF", "#FF2975", "#7B2FFF", "#00F5FF", "#FFD700"];

  for (let i = 0; i < layers; i++) {
    ctx.beginPath();
    ctx.moveTo(0, height);

    const layerAmp = (i < 3 ? bass : treble) * 150 * (1 - i / layers);
    const layerFreq = 0.001 + (i * 0.001);
    const yOffset = height * 0.7 + (i * 20) - (amplitude * 100);

    for (let x = 0; x <= width; x += 10) {
      const y = Math.sin(x * layerFreq + time * 0.001 + i) * layerAmp + yOffset;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(width, height);
    ctx.closePath();

    const opacity = 0.15 + (amplitude * 0.2);
    ctx.fillStyle = colors[i % colors.length] + Math.floor(opacity * 255).toString(16).padStart(2, '0');
    ctx.globalCompositeOperation = "screen";
    ctx.fill();
  }
  
  ctx.globalCompositeOperation = "source-over";
};
