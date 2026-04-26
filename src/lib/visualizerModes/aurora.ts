import { AudioData, RenderFn } from "@/types/visualizer";

export const renderAurora: RenderFn = (
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  audio: AudioData,
  time: number
) => {
  // Semi-transparent overlay for trails
  ctx.fillStyle = "rgba(0, 0, 5, 0.25)";
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
        layer.yBase * H -
        waveHeight * Math.sin(x * layer.freq + t1) -
        waveHeight * 0.4 * Math.sin(x * layer.freq * 2.3 + t2) -
        waveHeight * 0.2 * Math.sin(x * layer.freq * 0.7 - t1 * 0.5) -
        audio.bass * 80 * Math.sin(x * 0.002 + t1 * 2); // bass = big push up

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
};
